/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import SQLite from "react-native-sqlite-storage";
import { DatabaseInitialization } from "./DatabaseInitialization";
import { List } from "../types/List";
import { ListItem } from "../types/ListItem";
import { DATABASE } from "./Constants";
import { DropboxDatabaseSync } from "../sync/dropbox/DropboxDatabaseSync";
import { AppState, AppStateStatus } from "react-native";

export interface Database {
  getDatabase(): Promise<SQLite.SQLiteDatabase>;
  getDatabaseSync(): Promise<DropboxDatabaseSync>;
}

let databaseInstance: SQLite.SQLiteDatabase | undefined;
const databaseSync: DropboxDatabaseSync = new DropboxDatabaseSync();
// "Private" helpers

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (databaseInstance !== undefined) {
    return Promise.resolve(databaseInstance);
  }
  // otherwise: open the database first
  return open();
}

async function getDatabaseSync(): Promise<DropboxDatabaseSync> {
  return Promise.resolve(databaseSync);
}

// Open a connection to the database
async function open(): Promise<SQLite.SQLiteDatabase> {
  SQLite.DEBUG(true);
  SQLite.enablePromise(true);

  if (databaseInstance) {
    console.log("[db] Database is already open: returning the existing instance");
    return databaseInstance;
  }

  // Otherwise, create a new instance
  const db = await SQLite.openDatabase({
    name: DATABASE.FILE_NAME,
    location: "Library",
    createFromLocation: "~/AppDatabase.db",
  });
  console.log("[db] Database open!");

  // Perform any database initialization or updates, if needed
  const databaseInitialization = new DatabaseInitialization();
  await databaseInitialization.updateDatabaseTables(db);

  databaseInstance = db;
  return db;
}

// Close the connection to the database
async function close(): Promise<void> {
  if (databaseInstance === undefined) {
    console.log("[db] No need to close DB again - it's already closed");
    return;
  }
  const status = await databaseInstance.close();
  console.log("[db] Database closed.");
  databaseInstance = undefined;
}

// Listen to app state changes. Close the database when the app is put into the background (or enters the "inactive" state)
let appState = "active";
console.log("[db] Adding listener to handle app state changes");
AppState.addEventListener("change", handleAppStateChange);

// Handle the app going from foreground to background, and vice versa.
function handleAppStateChange(nextAppState: AppStateStatus) {
  if (appState === "active" && nextAppState.match(/inactive|background/)) {
    // App has moved from the foreground into the background (or become inactive)
    console.log("[db] App has gone to the background - closing DB connection.");
    close();
  }
  appState = nextAppState;
}

// Export the functions which fulfill the Database interface contract
export const sqliteDatabase: Database = {
  getDatabase,
  getDatabaseSync,
};
