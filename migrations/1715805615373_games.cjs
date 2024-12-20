/* eslint-disable camelcase */

const GamesTable = "games";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(GamesTable, {
    id: "id", // Primary Key

    game_socket_id: {
      type: "varchar",
      notNull: true,
    },

    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },

    game_status: {
      type: "varchar",
      //notNull: true, // Disabled because this value is not yet set anywhere
    },

    players_allowed: {
      type: "int",
      //notNull: true, // Disabled because this value is not yet set anywhere
    },

    updated_at: {
      type: "timestamp",
      default: pgm.func("current_timestamp"),
    },

    started_at: {
      type: "timestamp",
      default: pgm.func("current_timestamp"),
    },

    ended_at: {
      type: "timestamp",
      default: pgm.func("current_timestamp"),
    },

    password: {
      type: "varchar",
    },

    which_player_turn:{ // To be used by the game to keep track of whose turn it is
      type: "integer",
      default: 1,
    },

    game_pile_value:{ // To be used by the game to keep track of the value players are trying to beat
      type: "integer",
      default: 0,
    }
  });
};


/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable(GamesTable);
};
