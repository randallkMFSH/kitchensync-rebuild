import Router from "@koa/router";
import { lobbyRouter } from "./lobby";

export const apiRouter = new Router();

apiRouter.use("/lobby", lobbyRouter.routes(), lobbyRouter.allowedMethods());
