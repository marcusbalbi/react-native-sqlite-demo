import { sqliteDatabase } from "../../../database/Database";
import { List } from "../../../types/List";

export interface ListDBInterface {
  createList(newListTitle: string): Promise<void>;
  // Read
  getAllLists(): Promise<List[]>;
  // Delete
  deleteList(list: List): Promise<void>;

  searchByTitlte(title: String): Promise<List[]>;
}


export const ListDB: ListDBInterface = {
  async searchByTitlte(title: String): Promise<List[]> {
    return sqliteDatabase
      .getDatabase()
      .then((db) =>
        db.executeSql("SELECT list_id as id, title FROM List WHERE title LIKE ? ORDER BY id DESC;", [`%${title}%`]),
      )
      .then(([results]) => {
        if (results === undefined) {
          return [];
        }
        const count = results.rows.length;
        const lists: List[] = [];
        for (let i = 0; i < count; i++) {
          const row = results.rows.item(i);
          const { title, id } = row;
          console.log(`[db] List title: ${title}, id: ${id}`);
          lists.push({ id, title });
        }
        return lists;
      });
  },
  async createList(newListTitle: string): Promise<void> {
    console.log("BALBI HOOK");
    return sqliteDatabase
      .getDatabase()
      .then((db) => db.executeSql("INSERT INTO List (title) VALUES (?);", [newListTitle]))
      .then(([results]) => {
        const { insertId } = results;
        console.log(`[db] Added list with title: "${newListTitle}"! InsertId: ${insertId}`);
      });
  },

  // Get an array of all the lists in the database
  async getAllLists(): Promise<List[]> {
    console.log("[db] Fetching lists from the db...");
    return sqliteDatabase
      .getDatabase()
      .then((db) =>
        // Get all the lists, ordered by newest lists first
        db.executeSql("SELECT list_id as id, title FROM List ORDER BY id DESC;"),
      )
      .then(([results]) => {
        if (results === undefined) {
          return [];
        }
        const count = results.rows.length;
        const lists: List[] = [];
        for (let i = 0; i < count; i++) {
          const row = results.rows.item(i);
          const { title, id } = row;
          console.log(`[db] List title: ${title}, id: ${id}`);
          lists.push({ id, title });
        }
        console.log("----------------------------------------", lists)
        return lists;
      });
  },

  async deleteList(list: List): Promise<void> {
    console.log(`[db]----------------------------------- Deleting list titled: "${list.title}" with id: ${list.id}`);
    return sqliteDatabase
      .getDatabase()
      .then((db) => {
        // Delete list items first, then delete the list itself
        return db.executeSql("DELETE FROM ListItem WHERE list_id = ?;", [list.id]).then(() => db);
      })
      .then((db) => db.executeSql("DELETE FROM List WHERE list_id = ?;", [list.id]))
      .then(() => {
        console.log(`[db] Deleted list titled: "${list.title}"!`);
      });
  }
}
