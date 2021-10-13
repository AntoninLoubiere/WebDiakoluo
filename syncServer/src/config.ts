import { DatabaseManager } from "./databases/sqlite3";
export const DATABASE = new DatabaseManager('./db.sqlite3');

export const ALLOWED_ORIGIN = 'http://127.0.0.1:8000';

export const SESSION_MAX_AGE = 60 * 60 *24 * 7 * 1000; // 1 week
export const SECURE_SESSION = true; // if the cookies should be secured

export const API_URL = "/";

export const PORT: any = 8888;
export const SOCK_PERMS = '';