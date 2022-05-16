/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("post", (table) => {
        table.increments("id");
        table.boolean("global").notNullable();
        table.string("message");
        table.integer("user_id").unsigned().notNullable();
        table.datetime('date', { precision: 6 }).defaultTo(knex.fn.now(6)).notNullable();
        table.string('image_url');
        table
        .foreign("user_id")
        .references("id")
        .inTable("user")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable("post");
};
