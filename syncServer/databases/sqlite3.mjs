import sqlite3 from "sqlite3";
import { hashPass, verifyPass } from "../password-hasher.mjs"

export class DatabaseManager extends sqlite3.Database {
    /**
     * Start the connexion with the database.
     * @param databasePath the path to the database
     */
    constructor(databasePath) {
        super(databasePath, error => {
            if (error) {
                console.error("An error occur while opening the database", error);
            } else {
                console.info("Connected to the database.");
            }
        });
    }

    /**
     * Initialise the database.
     */
    initialise() {
        this.serialize(() => {
            super.run(`CREATE TABLE "users" (
                "user_id"	INTEGER NOT NULL,
                "username"	varchar(20) NOT NULL UNIQUE,
                "password"	varchar(90) NOT NULL,
                "name"	varchar(50) NOT NULL,
                "flags"	INTEGER NOT NULL DEFAULT 0,
                "permissions"	INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY("user_id" AUTOINCREMENT)
            )`).run(`CREATE INDEX "users_name" ON "users" (
                "name"
            )`).run(`CREATE INDEX "users_username" ON "users" (
                "username"
            )`).run(`CREATE TABLE "groups" (
                "group_id"	INTEGER NOT NULL,
                "name"	varchar(50) NOT NULL UNIQUE,
                PRIMARY KEY("group_id" AUTOINCREMENT)
            )`).run(`CREATE INDEX "groups_name" ON "groups" (
                "name"
            )`).run(`CREATE TABLE "users_groups_link" (
                "user"	INTEGER NOT NULL,
                "group"	INTEGER NOT NULL,
                FOREIGN KEY("user") REFERENCES "users"("user_id") ON DELETE CASCADE,
                FOREIGN KEY("group") REFERENCES "groups"("group_id") ON DELETE CASCADE
            )`).run(`CREATE INDEX "users_groups_link_user" ON "users_groups_link" (
                "user",
                "group"
            )`).run(`CREATE INDEX "users_groups_link_group" ON "users_groups_link" (
                "group",
                "user"
            )`).run(`CREATE TABLE "tests" (
                "test_id"	INTEGER NOT NULL,
                "id"	varchar(32) NOT NULL UNIQUE,
                "owner"	INTEGER NOT NULL,
                "share_link"	INTEGER NOT NULL,
                PRIMARY KEY("test_id" AUTOINCREMENT),
                FOREIGN KEY("owner") REFERENCES "users"("user_id") ON DELETE RESTRICT
            )`).run(`CREATE INDEX "tests_id" ON "tests" (
                "id"
            )`).run(`CREATE INDEX "tests_owner" ON "tests" (
                "owner"
            )`).run(`CREATE TABLE "shares" (
                "test"	INTEGER NOT NULL,
                "user"	INTEGER NOT NULL,
                "group"	INTEGER,
                "perms"	INTEGER NOT NULL,
                FOREIGN KEY("test") REFERENCES "tests"("test_id") ON DELETE CASCADE,
                FOREIGN KEY("group") REFERENCES "groups"("group_id") ON DELETE CASCADE,
                FOREIGN KEY("user") REFERENCES "users"("user_id") ON DELETE CASCADE
            )`).run(`CREATE UNIQUE INDEX "shares_user" ON "shares" (
                "user",
                "test",
                "group"	ASC
            )`).run(`CREATE UNIQUE INDEX "shares_test_user" ON "shares" (
                "test",
                "user",
                "group"	ASC
            )`).run(`CREATE UNIQUE INDEX "shares_group" ON "shares" (
                "group",
                "test",
                "user"
            )`).run(`CREATE UNIQUE INDEX "share_test_group" ON "shares" (
                "test",
                "group",
                "user"
            )`).run(`CREATE TABLE "sessions" (
                "id"	varchar(64) NOT NULL,
                "user"	INTEGER NOT NULL UNIQUE,
                "expireDate"	DATETIME NOT NULL,
                FOREIGN KEY("user") REFERENCES "users"("user_id") ON DELETE CASCADE,
                PRIMARY KEY("id")
            )`).run(`CREATE INDEX "sessions_user" ON "sessions" (
                "user"
            )`);
        });
    }

    /**
     * Add an user.
     * @param username the username of the user to add
     * @param password the password (clear) of the user to add
     * @param name the name of the user to add
     * @returns if there is an error
     */
    async addUser(username, password, name) {
        return this.run('INSERT INTO "main"."users"("username","password","name") VALUES (?,?,?)', 
            [username, hashPass(password), name]);
    }

    /**
     * Get an user from the username.
     * @param {string} username the username of the user to get
     * @return the user object
     */
     async getUser(username) {
        var [error, row] = await this.get('SELECT username, name, flags, permissions FROM users WHERE username=?', username);
        if (error) {
            return;
        } else {
            return row;
        }
    }

    /**
     * Get an user from the username if the password is correct.
     * @param {string} username the username of the user to get
     * @return the user object
     */
     async verifyUserPassword(username, password) {
        var [error, row] = await this.get('SELECT password FROM users WHERE username=?', username);
        if (error) {
            verifyPass('test', 'sha256$2ed42951a2f3$1000$6a9ff10c032e89fa37f1978ec78da55e4a1f6a426d33ed74cb424b14d6115014');
            // delay so it take the same time, it is the hash of the password: 'test2'
            return false;
        } else {
            return verifyPass(password, row.password);
        }
    }

    /**
     * Make a SQL query and return the result
     * @param query the query to do
     * @param params params to escape
     * @returns a promise that resolve with an error or null if it is a success and the row.
     */
    async get(query, params) {
        return new Promise(resolve => {
            super.get(query, params, (error, row) => {
                resolve([error, row]);
            });
        });
    }

    /**
     * Make a SQL query.
     * @param query the query to do
     * @param params params to escape
     * @returns a promise that resolve with an error object or null if it is a success.
     */
    async run(query, params) {
        return new Promise(resolve => {
            super.get(query, params, error => {
                resolve(error);
            });
        });
    }
}