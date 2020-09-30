import { logMiddleware } from "@middleware/logging";
import { rootRouter } from "@routes";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import staticMiddleware from "koa-static";

const app = new Koa();

app.use(logMiddleware);

app.use(
    bodyParser({
        enableTypes: ["json", "form"],
    })
);

app.use(staticMiddleware("static/build/", { extensions: ["html"] }));
app.use(staticMiddleware("static/", { extensions: ["html"] }));

app.use(rootRouter.routes());

console.log("Starting server on http://127.0.0.1:8080");
app.listen(8080);
