import { Knex } from 'knex';

// This migration file will create a `users` table
exports.up = async function(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();  // Auto-incrementing primary key
    table.string('name').notNullable();  // Name column (required)
    table.string('email').unique().notNullable();  // Email column (required, unique)
    //table.timestamp('created_at').defaultTo(knex.fn.now());  // Timestamp for creation
    //table.timestamp('updated_at').defaultTo(knex.fn.now()).alter();  // Timestamp for last update
  });
};

exports.down = async function(knex: Knex): Promise<void> {
  // This function is used to revert the changes made in the `up` function.
  await knex.schema.dropTableIfExists('users');
};