/* eslint-disable camelcase */

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.addColumn("games", {
    creator_id: {
      type: "int",
      //notNull: true, // Temporarily disabled because this value is not yet set anywhere, or the thing that sets it is not working on this version.
    },
  });
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropColumn("games", "creator_id");
};
