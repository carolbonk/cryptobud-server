/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.table('post', table => { 
        table.date('start_date');
        table.date('end_date');
        table.string('coin');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
 return knex.schema.table('post', table => { 
   table.dropColumn('start_date');
   table.dropColumn('end_date');
   table.dropColumn('coin');
});
};
