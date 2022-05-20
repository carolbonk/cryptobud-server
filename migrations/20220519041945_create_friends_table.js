/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {

    return knex.schema.createTable("friend", (table) => {
    table.increments("id");
    table.integer("primary_user_id").unsigned().notNullable();
    table.integer("secondary_user_id").unsigned().notNullable();
    table
        .foreign("primary_user_id")
        .references("id")
        .inTable("user")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
    table
        .foreign("secondary_user_id")
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
