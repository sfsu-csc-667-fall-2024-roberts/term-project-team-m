import { Knex } from 'knex';

// This migration file will create a `users` table
exports.up = async function(knex: Knex): Promise<void> {
  await knex.schema.createTable('standard_deck', (table) => {
    table.increments('id').primary();  // Auto-incrementing primary key
    table.integer('suit');
    table.integer('value');  
    table.integer('card name');     
  });
};

exports.down = async function(knex: Knex): Promise<void> {
  // This function is used to revert the changes made in the `up` function.
  await knex.schema.dropTableIfExists('standard_deck');
};