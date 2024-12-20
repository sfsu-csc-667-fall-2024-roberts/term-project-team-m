/* eslint-disable camelcase */

const GameUsersTable = "game_users";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(GameUsersTable, {
    user_id: {// Primary Key
      type: "int",
    },

    game_id: {
      type: "int",
    },

    seat: {
      type: "int",
    },

    turn_number: {
      type: "int",
    },

    started_at: {
      type: "timestamp",
      // notNull: true,
      default: pgm.func("current_timestamp"),
    },
    
    ended_at: {
      type: "timestamp",
      // notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable(GameUsersTable);
};
