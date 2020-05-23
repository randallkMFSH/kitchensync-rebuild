import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
    await knex.schema.createTable("lobbies", (table) => {
        table.string("id").notNullable().primary();
        table.string("title", 2048).nullable();
        table.float("playback_position").notNullable();
        table.boolean("persist");
    });
    await knex.schema.createTable("media_objects", (table) => {
        table.string("lobby_id").notNullable();
        table.string("url").notNullable();
        table.integer("list_position").notNullable();
        table.string("faucet_type").notNullable();

        table.foreign("lobby_id").references("id").inTable("lobbies");
    });
    await knex.schema.createTable("chat_logs", (table) => {
        table.string("lobby_id").notNullable();
        table.string("sender");
        table.string("message").notNullable();
        table.dateTime("timestamp").notNullable();

        table.foreign("lobby_id").references("id").inTable("lobbies");
    });
}

export async function down(knex: Knex): Promise<any> {
    await knex.schema.dropTable("lobbies");
    await knex.schema.dropTable("media_objects");
    await knex.schema.dropTable("chat_logs");
}
