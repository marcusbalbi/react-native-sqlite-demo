import { sqliteDatabase } from "../../../database/Database";
import { ListItem } from "../../../types/ListItem";
import { List } from "../../../types/List";

export interface ListItemDBInterface {
  addListItem(text: string, list: List): Promise<void>;
  getListItems(list: List, doneItemsLast: boolean): Promise<ListItem[]>;
  updateListItem(listItem: ListItem): Promise<void>;
}

export const ListItemDB: ListItemDBInterface = {
  async addListItem(text: string, list: List): Promise<void> {
    if (list === undefined) {
      return Promise.reject(Error(`Could not add item to undefined list.`));
    }
    return sqliteDatabase
      .getDatabase()
      .then((db) => db.executeSql("INSERT INTO ListItem (text, list_id) VALUES (?, ?);", [text, list.id]))
      .then(([results]) => {
        console.log(`[db] ListItem with "${text}" created successfully with id: ${results.insertId}`);
      });
  },
  async getListItems(list: List, orderByDone = false): Promise<ListItem[]> {
    if (list === undefined) {
      return Promise.resolve([]);
    }
    return sqliteDatabase
      .getDatabase()
      .then((db) =>
        db.executeSql(
          `SELECT item_id as id, text, done FROM ListItem WHERE list_id = ? ${orderByDone ? "ORDER BY done" : ""};`,
          [list.id],
        ),
      )
      .then(([results]) => {
        if (results === undefined) {
          return [];
        }
        const count = results.rows.length;
        const listItems: ListItem[] = [];
        for (let i = 0; i < count; i++) {
          const row = results.rows.item(i);
          const { text, done: doneNumber, id } = row;
          const done = doneNumber === 1 ? true : false;

          console.log(`[db] List item text: ${text}, done? ${done} id: ${id}`);
          listItems.push({ id, text, done });
        }
        console.log(`[db] List items for list "${list.title}":`, listItems);
        return listItems;
      });
  },
  async updateListItem(listItem: ListItem): Promise<void> {
    const doneNumber = listItem.done ? 1 : 0;
    return sqliteDatabase
      .getDatabase()
      .then((db) =>
        db.executeSql("UPDATE ListItem SET text = ?, done = ? WHERE item_id = ?;", [
          listItem.text,
          doneNumber,
          listItem.id,
        ]),
      )
      .then(([results]) => {
        console.log(`[db] List item with id: ${listItem.id} updated.`);
      });
  },
};
