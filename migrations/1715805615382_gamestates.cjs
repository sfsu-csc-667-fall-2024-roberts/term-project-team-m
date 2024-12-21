/* eslint-disable camelcase */

const GamestatesTable = "gamestates";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(GamestatesTable, {
    game_id: {
      type: "int",
      //notNull: true,
    },

    active: {
      type: "boolean",
      //notNull: true,
    },

    turn_user_id: {
      type: "int",
    },

    turn_number: {
      type: "int",
    },

    round_number: {
        type: "int",
    },
    
    created_at: {
        type: "timestamp",
        //notNull: true,
        default: pgm.func("current_timestamp"),
      },
  });
};
//primary key is gameID


/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable(GamestatesTable);
};
