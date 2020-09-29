import { LobbyData } from "@common/apiModels";
import { getChatLogForLobby } from "@data/chatLog";
import { getLobbyFromDatabaseById } from "@data/lobby";
import Router from "@koa/router";
import { LobbyInstance } from "@lib/lobby";
import { ContextWithWebsocket, makeWebsocketMiddleware } from "@middleware/websocket";
import { Lobby } from "@models/lobby";

export const lobbyRouter = new Router();

lobbyRouter.use(makeWebsocketMiddleware());

const lobbyInstances = new Map<string, LobbyInstance>();

const getOrCreateLobby = async (lobbyData: Lobby) => {
    let lobby = lobbyInstances.get(lobbyData.id);
    if (!lobby) {
        lobby = new LobbyInstance(lobbyData);
        await lobby.loadQueue();
        lobbyInstances.set(lobbyData.id, lobby);
    }
    return lobby;
};

lobbyRouter.get("/:id", async (ctx: ContextWithWebsocket, next) => {
    const lobbyData = await getLobbyFromDatabaseById(ctx.params.id);
    if (!lobbyData) {
        ctx.status = 404;
        return;
    }

    const lobby = await getOrCreateLobby(lobbyData);

    if (ctx.ws) {
        const socket = await ctx.ws();
        lobby.attachListeners(socket);

        socket.on("close", (code) => {
            console.log(`Client disconnected with code ${code}`);

            lobby.removeMember(socket);
            if (lobby.members.length === 0) {
                if (lobby.data.persist) {
                    lobby.pause(undefined);
                    lobby.save();
                } else {
                    lobby.delete();
                }

                lobbyInstances.delete(lobby.data.id);
            }
        });
        ctx.status = 200;
    } else {
        const response: LobbyData = {
            host: lobby.host && lobby.memberMetadata.get(lobby.host)?.name,
            chatLog: await getChatLogForLobby(lobbyData.id),
            members: lobby.members.map((member) => lobby.memberMetadata.get(member)!.name),
            title: lobby.data.title || lobby.data.id,
            persist: lobby.data.persist,
            queue: lobby.queue,
            paused: lobby.paused,
            playback_position: lobby.getPlaybackPosition(),
        };

        ctx.body = response;
    }
});
