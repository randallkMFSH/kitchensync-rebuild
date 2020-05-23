import { IdentityMessage, LobbyMessage, MessageType } from "@common/messages";
import { isLobbyMessage, validateMessage, validateNickname } from "@common/validation";
import { saveChatLog } from "@data/chatLog";
import { saveLobby } from "@data/lobby";
import { Lobby } from "@models/lobby";
import WebSocket from "ws";

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

    constructor(base: Lobby) {
        this.data = base;
    }

    addMember(member: WebSocket) {
        this.members.push(member);
        if (!this.host) {
            this.host = member;
            this.broadcast({ type: MessageType.PROMOTION, newHost: this.memberMetadata.get(this.host)!.name });
        }
    }
    removeMember(member: WebSocket) {
        const index = this.members.indexOf(member);
        if (index !== -1) {
            this.members.splice(index, 1);
        }
        if (member === this.host) {
            if (this.members.length > 0) {
                this.host = this.members[0];
                this.broadcast({ type: MessageType.PROMOTION, newHost: this.memberMetadata.get(this.host)!.name });
            }
        }
    }

    validateNickname(name: string, sender: WebSocket) {
        try {
            const isValid = validateNickname(name);
            if (isValid) {
                return true;
            }
        } catch (e) {
            this.send(sender, { type: MessageType.BAD_NICKNAME, message: e.message });
            return false;
        }

        return true;
    }

    handlePrivledgedMessages(sender: WebSocket, message: LobbyMessage) {}

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

                saveChatLog(this.data.id, chatMessage!, this.memberMetadata.get(sender)?.name);
                this.broadcast(
                    {
                        type: MessageType.CHAT,
                        chatMessage: {
                            message: chatMessage,
                            sender: this.memberMetadata.get(sender)?.name,
                            timestamp: Date.now(),
                        },
                    },
                    sender
                );
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

        this.memberMetadata.set(sender, { name });
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

    save() {
        saveLobby(this.data);
    }
}
