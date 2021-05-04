import { DatabaseManager } from "./databases/sqlite3";
export const DATABASE = new DatabaseManager('./db.sqlite3');

export const SESSION_MAX_AGE = 60 * 60 *24 * 7 * 1000; // 1 week

export const API_URL = "/";

export const PORT = 8888;