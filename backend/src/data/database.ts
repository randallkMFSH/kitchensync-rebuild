import Knex from "knex";
import path from "path";

export const knex = Knex({
    client: "sqlite3",
    connection: {
        filename: path.join(__dirname, "../../database.sqlite3"),
    },
    useNullAsDefault: true,
});
