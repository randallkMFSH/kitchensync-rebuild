import "dotenv/config";
import { register } from "tsconfig-paths";

register({
    baseUrl: __dirname,
    paths: {
        "@*": ["*"],
    },
});
