/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("likes", (table) => {
        table.increments("id");
        table.string("type");
        table.integer("post_id").unsigned().notNullable();;
        table.integer("user_id").unsigned().notNullable();
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
    return knex.schema.dropTable("likes");
};
