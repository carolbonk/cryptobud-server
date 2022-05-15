/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("user", (table) => {
        table.increments("id");
        table.string("first_name").notNullable();
        table.string("last_name").notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('city').notNullable();
        table.string('country').notNullable();
        table.string('avatar_url').notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable("user");
};
