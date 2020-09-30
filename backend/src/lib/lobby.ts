import { MediaObject } from "@common/apiModels";
import { IdentityMessage, LobbyMessage, MessageType } from "@common/messages";
import { isLobbyMessage, validateMessage, validateNickname } from "@common/validation";
import { saveChatLog } from "@data/chatLog";
import { deleteLobby, saveLobby } from "@data/lobby";
import { getQueueForLobby, saveQueue } from "@data/mediaObjects";
import { Lobby } from "@models/lobby";
import fs from "fs";
import WebSocket from "ws";
import { RootFaucet } from "./faucet";

interface MemberData {
    name: string;
}

/**
 * In-memory instance of a lobby. Contains the transient stuff, like who's in the lobby
 * or who is the current host.
 */
export class LobbyInstance {
    data: Lobby;

    members: WebSocket[] = [];
    host: WebSocket | undefined;
    memberMetadata = new WeakMap<WebSocket, MemberData>();
    queue: MediaObject[] = [];
    paused: boolean = true;
    lastPositionUpdateTimestamp = Date.now();

    constructor(base: Lobby) {
        this.data = base;
    }

    async loadQueue() {
        this.queue = await getQueueForLobby(this.data.id);
    }

    addMember(member: WebSocket) {
        const name = this.memberMetadata.get(member)!.name;
        this.members.push(member);
        if (!this.host) {
            this.host = member;
            this.broadcast({ type: MessageType.PROMOTION, newHost: name });
        }
        this.updateUserlist();
        this.send(member, { type: MessageType.WELCOME });

        this.chat(`${name} has joined the sync`);
    }
    removeMember(member: WebSocket) {
        const index = this.members.indexOf(member);
        if (index !== -1) {
            this.members.splice(index, 1);
        }
        const name = this.memberMetadata.get(member)!.name;
        this.chat(`${name} has left the sync`);
        if (member === this.host) {
            if (this.members.length > 0) {
                this.host = this.members[0];
                this.broadcast({ type: MessageType.PROMOTION, newHost: this.memberMetadata.get(this.host)!.name });
            }
        }
        this.broadcast({
            type: MessageType.UPDATE_USER_LIST,
            userList: this.members.map((socket) => this.memberMetadata.get(socket)!.name),
        });
    }

    validateNickname(name: string, sender: WebSocket) {
        try {
            validateNickname(name);
        } catch (e) {
            this.send(sender, { type: MessageType.BAD_NICKNAME, message: e.message });
            return false;
        }

        return true;
    }

    async handlePrivledgedMessages(sender: WebSocket, message: LobbyMessage) {
        switch (message.type) {
            case MessageType.UPDATE_TITLE: {
                this.chat(`Title changed to ${message.title}`);
                this.data.title = message.title;
                this.broadcast({ type: MessageType.UPDATE_TITLE, title: message.title }, sender);
                this.save();
                return;
            }
            case MessageType.UPDATE_PERSIST: {
                this.data.persist = message.persist;
                this.broadcast({ type: MessageType.UPDATE_PERSIST, persist: message.persist }, sender);
                this.save();
                return;
            }
            case MessageType.PROMOTION: {
                const newHost = this.members.find(
                    (member) => this.memberMetadata.get(member)?.name === message.newHost
                );
                if (!newHost) {
                    this.send(sender, { type: MessageType.BAD_MESSAGE, message: "Couldn't find user to promote" });
                    return;
                }
                this.broadcast({ type: MessageType.PROMOTION, newHost: message.newHost }, sender);
                this.host = newHost;
                return;
            }

            case MessageType.ADD_TO_QUEUE: {
                const url = message.url;

                let mediaObjects: MediaObject[] | undefined;
                let errorMessage: string | undefined;
                let threw = false;
                // try {
                mediaObjects = await RootFaucet.attemptToCreateMediaObjectFromUrl(url);
                // } catch (e) {
                //     threw = true;
                //     if (typeof e === "string") {
                //         errorMessage = e;
                //     } else if (e instanceof Error) {
                //         errorMessage = e.message;
                //     }
                // }
                if (mediaObjects) {
                    this.setQueue([...this.queue, ...mediaObjects]);
                } else {
                    if (!errorMessage && !threw) {
                        errorMessage = "Couldn't identify a faucet for this URL.";
                    }
                    this.send(sender, { type: MessageType.MEDIA_FAILURE, message: errorMessage });
                }
                return;
            }

            case MessageType.CHANGE_MEDIA: {
                const url = message.url;

                let mediaObjects: MediaObject[] | undefined;
                let errorMessage: string | undefined;
                let threw = false;
                try {
                    mediaObjects = await RootFaucet.attemptToCreateMediaObjectFromUrl(url);
                } catch (e) {
                    threw = true;
                    if (typeof e === "string") {
                        errorMessage = e;
                    } else if (e instanceof Error) {
                        errorMessage = e.message;
                    }
                }

                if (mediaObjects) {
                    this.setQueue([...mediaObjects, ...this.queue.slice(1)]);
                } else {
                    if (!errorMessage && !threw) {
                        errorMessage = "Couldn't identify a faucet for this URL.";
                    }
                    this.send(sender, { type: MessageType.MEDIA_FAILURE, message: errorMessage });
                }
                return;
            }
            case MessageType.REMOVE_ITEM_FROM_QUEUE: {
                const guid = message.guid;
                const index = this.queue.findIndex((media) => media.guid === guid);
                if (index !== -1) {
                    const newQueue = [...this.queue.slice(0, index), ...this.queue.slice(index + 1)];
                    this.setQueue(newQueue);
                }
                return;
            }
            case MessageType.SKIP_TO_ITEM: {
                const guid = message.guid;
                const index = this.queue.findIndex((media) => media.guid === guid);
                if (index !== -1) {
                    const newQueue = [...this.queue.slice(index)];
                    this.setQueue(newQueue);
                }
                return;
            }
            case MessageType.SET_MEDIA_DURATION: {
                const guid = message.guid;
                const index = this.queue.findIndex((media) => media.guid === guid);
                if (index !== -1) {
                    const mediaToModify = this.queue[index];
                    const newMedia = { ...mediaToModify, duration: message.duration };
                    const newQueue = [...this.queue.slice(0, index), newMedia, ...this.queue.slice(index + 1)];
                    this.setQueue(newQueue);
                }
                return;
            }

            case MessageType.PLAY: {
                this.play(message.seconds);
                return;
            }
            case MessageType.PAUSE: {
                this.pause(message.seconds);
                return;
            }
            case MessageType.SEEK: {
                this.seek(message.seconds);
                return;
            }
            case MessageType.ENDED: {
                if (this.queue.length > 1) {
                    const newQueue = [...this.queue.slice(1)];
                    this.setQueue(newQueue);
                    this.play(undefined);
                    if (this.host) {
                        this.send(this.host, { type: MessageType.PLAY, seconds: undefined });
                    }
                } else {
                    this.pause(undefined);
                }
            }
        }
    }

    handleMessage(sender: WebSocket, message: LobbyMessage) {
        if (sender === this.host) {
            this.handlePrivledgedMessages(sender, message);
        }
        switch (message.type) {
            case MessageType.CHAT:
                const chatMessage = message.chatMessage.message;
                try {
                    validateMessage(chatMessage);
                } catch (e) {
                    this.send(sender, { type: MessageType.BAD_MESSAGE, message: e.message });
                    return;
                }

                this.chat(chatMessage!, sender, sender);
                return;
            case MessageType.IDENTITY:
                this.handleIdentity(sender, message);
                return;
        }
    }

    handleIdentity(sender: WebSocket, message: IdentityMessage) {
        let name = message.name;

        const isValidNickname = this.validateNickname(name, sender);
        if (!isValidNickname) {
            return false;
        }

        const memberUsingSameNickname = this.members.find((member) => this.memberMetadata.get(member)?.name === name);
        if (memberUsingSameNickname && memberUsingSameNickname !== sender) {
            name += Math.round(Math.random() * 10000);
            this.send(sender, { type: MessageType.IDENTITY, name });
        }

        const oldName = this.memberMetadata.get(sender)?.name;

        this.memberMetadata.set(sender, { name });
        if (oldName) {
            this.chat(`${oldName} is now known as ${name}`);
        }
        this.updateUserlist();
        if (this.host === sender) {
            this.broadcast({ type: MessageType.PROMOTION, newHost: this.memberMetadata.get(this.host)!.name });
        }
        return true;
    }

    attachListeners(member: WebSocket) {
        member.once("message", (messageString) => {
            let message: LobbyMessage;
            try {
                message = JSON.parse(messageString.toString());
            } catch (e) {
                this.send(member, { type: MessageType.BAD_MESSAGE, message: "Failed to parse JSON" });
                this.removeMember(member);
                return;
            }
            if (message.type !== MessageType.IDENTITY) {
                this.send(member, { type: MessageType.BAD_MESSAGE, message: "Must identity first" });
                return;
            }
            if (!this.handleIdentity(member, message)) {
                return;
            }

            this.addMember(member);

            member.on("message", (messageString) => {
                let message: LobbyMessage;
                try {
                    message = JSON.parse(messageString.toString());
                } catch (e) {
                    this.send(member, { type: MessageType.BAD_MESSAGE, message: "Failed to parse JSON" });
                    return;
                }
                if (!isLobbyMessage(message)) {
                    this.send(member, { type: MessageType.BAD_MESSAGE, message: "Unknown or missing message type" });
                    return;
                }
                this.handleMessage(member, message);
            });
        });
    }

    send(member: WebSocket, message: LobbyMessage) {
        member.send(JSON.stringify(message));
    }

    broadcast(message: LobbyMessage, except?: WebSocket) {
        this.members.forEach((member) => {
            if (member !== except) {
                this.send(member, message);
            }
        });
    }

    chat(message: string, senderSocket?: WebSocket, except?: WebSocket) {
        const sender = senderSocket ? this.memberMetadata.get(senderSocket)?.name : undefined;

        this.broadcast(
            {
                type: MessageType.CHAT,
                chatMessage: {
                    message,
                    sender,
                    timestamp: Date.now(),
                },
            },
            senderSocket
        );
        saveChatLog(this.data.id, message, sender);
    }

    async save() {
        return Promise.all([saveLobby(this.data), saveQueue(this.data.id, this.queue)]);
    }

    async delete() {
        await deleteLobby(this.data.id);
        for (const media of this.queue) {
            try {
                await fs.promises.unlink(`static/thumbnails/${media.guid}.png`);
            } catch {
                // We don't care about exceptions here; they're probably that the file doesn't exist.
            }
        }
    }

    updateUserlist() {
        this.broadcast({
            type: MessageType.UPDATE_USER_LIST,
            userList: this.members.map((socket) => this.memberMetadata.get(socket)!.name),
        });
    }

    play(seconds: number | undefined) {
        if (seconds !== undefined) {
            this.lastPositionUpdateTimestamp = Date.now();
            this.data.playback_position = seconds;
        }
        this.paused = false;
        this.broadcast({ type: MessageType.PLAY, seconds }, this.host);
        this.save();
    }
    pause(seconds: number | undefined) {
        if (seconds !== undefined) {
            this.lastPositionUpdateTimestamp = Date.now();
            this.data.playback_position = seconds;
        }
        this.paused = true;
        this.broadcast({ type: MessageType.PAUSE, seconds }, this.host);
        this.save();
    }
    seek(seconds: number) {
        this.lastPositionUpdateTimestamp = Date.now();
        this.data.playback_position = seconds;
        this.broadcast({ type: MessageType.SEEK, seconds }, this.host);
        this.save();
    }
    getPlaybackPosition(): number {
        const secondsSinceLastPositionUpdate = this.paused ? 0 : (Date.now() - this.lastPositionUpdateTimestamp) / 1000;
        return this.data.playback_position + secondsSinceLastPositionUpdate;
    }
    setQueue(newQueue: MediaObject[]) {
        const oldFirst = this.queue[0];
        this.queue = newQueue;
        if (oldFirst?.guid !== this.queue[0]?.guid) {
            if (oldFirst?.image_url) {
                // We don't care about exceptions here; they're probably that the file doesn't exist.
                fs.promises.unlink(`static/thumbnails/${oldFirst.guid}.png`).catch(() => {});
            }
            const newTime = this.queue[0]?.start_time || 0;
            this.seek(newTime);
            if (this.host) {
                this.send(this.host, { type: MessageType.SEEK, seconds: newTime });
            }
        }
        this.broadcast({ type: MessageType.SET_QUEUE, queue: this.queue });

        this.save();
    }
}
