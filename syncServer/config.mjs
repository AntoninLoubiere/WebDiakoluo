import { DatabaseManager } from "./databases/sqlite3.mjs";
export const DATABASE = new DatabaseManager('./db.sqlite3');