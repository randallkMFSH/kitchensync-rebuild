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

const getOrCreateLobby = (lobbyData: Lobby) => {
    let lobby = lobbyInstances.get(lobbyData.id);
    if (!lobby) {
        lobby = new LobbyInstance(lobbyData);
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

    const lobby = getOrCreateLobby(lobbyData);

    if (ctx.ws) {
        const socket = await ctx.ws();
        lobby.attachListeners(socket);

        socket.on("close", (code, reason) => {
            console.log(`Client disconnected with code ${code}`);

            lobby.removeMember(socket);
            if (lobby.members.length === 0) {
                if (lobby.data.persist) {
                    lobby.save();
                }

                lobbyInstances.delete(lobby.data.id);
            }
        });
    } else {
        const response: LobbyData = {
            host: lobby.host && lobby.memberMetadata.get(lobby.host)?.name,
            chatLog: await getChatLogForLobby(lobbyData.id),
            members: lobby.members.map((member) => lobby.memberMetadata.get(member)!.name),
        };

        ctx.body = response;
    }
});
