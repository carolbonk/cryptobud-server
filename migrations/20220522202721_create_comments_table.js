/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("comment", (table) => {
        table.increments("id");
        table.string("message");
        table.integer("post_id").unsigned().notNullable();;
        table.integer("user_id").unsigned().notNullable();
        table.datetime('date', { precision: 6 }).defaultTo(knex.fn.now(6)).notNullable();
        table
        .foreign("user_id")
        .references("id")
        .inTable("user")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
        table
        .foreign("post_id")
        .references("id")
        .inTable("post")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable("comment");
};
