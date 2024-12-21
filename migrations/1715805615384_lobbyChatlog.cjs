/* eslint-disable camelcase */

const LobbyChatlogTable = "lobby_chatlog";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(LobbyChatlogTable, {
    id: {
      type: "serial",
      primaryKey: true,
    },

    username: {
      type: "varchar(100)",
      notNull: true,
    },

    message: {
      type: "text",
      notNull: true,
    },

    timestamp: {
      type: "timestamptz",
      default: pgm.func("current_timestamp"),
    },
  });
};


/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable(LobbyChatlogTable);
};
