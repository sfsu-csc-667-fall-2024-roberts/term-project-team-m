/* eslint-disable camelcase */

const cardDeckTable = "standard_deck_cards";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(cardDeckTable, {
    id: { type: "serial", primaryKey: true }, // Alternative method of "Serial" primary key
    
    suit: {
      type: "int",
    },

    value: {
      type: "int",
    },

    card_name: {
      type: "varchar",
    },

    special_card: {
      type: "boolean",
    },
  });

  // Generate values for the standard deck of cards, modified to have Ace be a 14 instead of 1
  // Also mark 2, 8, 9, 10 as special cards
  const sql = `INSERT INTO ${cardDeckTable} (suit, value, card_name, special_card) VALUES`;
  const values = [];

  for (let suit = 0; suit < 4; suit++) {
    for (let value = 2; value <= 14; value++) {
      let cardName = value.toString();
      let specialCard = false;

      if (value === 2 || value === 8 || value === 9 || value === 10) {
        specialCard = true;
      } else if (value === 11) {
        cardName = "Jack";
      } else if (value === 12) {
        cardName = "Queen";
      } else if (value === 13) {
        cardName = "King";
      } else if (value === 14) {
        cardName = "Ace";
      }

      values.push(`(${suit}, ${value}, '${cardName}', ${specialCard})`);
    }
  }

  const query = `${sql} ${values.join(",")}`;

  pgm.sql(query);
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable(cardDeckTable);
};
