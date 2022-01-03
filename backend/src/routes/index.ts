import { createLobby, getLobbyFromDatabaseById } from "@data/lobby";
import Router from "@koa/router";
import send from "koa-send";
import { apiRouter } from "./api";

export const rootRouter = new Router();

rootRouter.use("/api", apiRouter.routes(), apiRouter.allowedMethods());

rootRouter.get(["/create", "/"], async (ctx) => {
    const lobby = await createLobby();
    ctx.redirect(lobby.id);
});

rootRouter.get("/:id", async (ctx, next) => {
    const lobby = await getLobbyFromDatabaseById(ctx.params.id);
    if (!lobby) {
        ctx.status = 404;
        return;
    }

    return send(ctx, "static/build/lobby.html");
});
