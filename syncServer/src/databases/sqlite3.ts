import sqlite3 from "sqlite3";
import { hashPass, verifyPass } from "../password-hasher"
import { User, Session } from "../types";

export declare type SQLCallback = (this: sqlite3.Statement, err: Error | null, row: any) => void 

export class DatabaseManager extends sqlite3.Database {
    /**
     * Start the connexion with the database.
     * @param databasePath the path to the database
     */
    constructor(databasePath: string) {
        super(databasePath, error => {
            if (error) {
                console.error("An error occur while opening the database", error);
            } else {
                console.info("Connected to the database.");
                this.cleanupSession();
            }
        });
    }

    /**
     * Initialise the database.
     */
    initialise() {
        this.serialize(() => {
            this.run(`CREATE TABLE "users" (
                "user_id"	INTEGER NOT NULL,
                "username"	varchar(20) NOT NULL UNIQUE,
                "password"	varchar(90) NOT NULL,
                "name"	varchar(50) NOT NULL,
                "flags"	INTEGER NOT NULL DEFAULT 0,
                "permissions"	INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY("user_id" AUTOINCREMENT)
            )`)
            this.run(`CREATE INDEX "users_name" ON "users" (
                "name"
            )`)
            this.run(`CREATE INDEX "users_username" ON "users" (
                "username"
            )`)
            this.run(`CREATE TABLE "groups" (
                "group_id"	INTEGER NOT NULL,
                "name"	varchar(50) NOT NULL UNIQUE,
                PRIMARY KEY("group_id" AUTOINCREMENT)
            )`)
            this.run(`CREATE INDEX "groups_name" ON "groups" (
                "name"
            )`)
            this.run(`CREATE TABLE "users_groups_link" (
                "user"	INTEGER NOT NULL,
                "group"	INTEGER NOT NULL,
                FOREIGN KEY("user") REFERENCES "users"("user_id") ON DELETE CASCADE,
                FOREIGN KEY("group") REFERENCES "groups"("group_id") ON DELETE CASCADE
            )`)
            this.run(`CREATE INDEX "users_groups_link_user" ON "users_groups_link" (
                "user",
                "group"
            )`)
            this.run(`CREATE INDEX "users_groups_link_group" ON "users_groups_link" (
                "group",
                "user"
            )`)
            this.run(`CREATE TABLE "tests" (
                "test_id"	INTEGER NOT NULL,
                "id"	varchar(32) NOT NULL UNIQUE,
                "owner"	INTEGER NOT NULL,
                "share_link"	INTEGER NOT NULL,
                PRIMARY KEY("test_id" AUTOINCREMENT),
                FOREIGN KEY("owner") REFERENCES "users"("user_id") ON DELETE RESTRICT
            )`)
            this.run(`CREATE INDEX "tests_id" ON "tests" (
                "id"
            )`)
            this.run(`CREATE INDEX "tests_owner" ON "tests" (
                "owner"
            )`)
            this.run(`CREATE TABLE "shares" (
                "test"	INTEGER NOT NULL,
                "user"	INTEGER NOT NULL,
                "group"	INTEGER,
                "perms"	INTEGER NOT NULL,
                FOREIGN KEY("test") REFERENCES "tests"("test_id") ON DELETE CASCADE,
                FOREIGN KEY("group") REFERENCES "groups"("group_id") ON DELETE CASCADE,
                FOREIGN KEY("user") REFERENCES "users"("user_id") ON DELETE CASCADE
            )`)
            this.run(`CREATE UNIQUE INDEX "shares_user" ON "shares" (
                "user",
                "test",
                "group"	ASC
            )`)
            this.run(`CREATE UNIQUE INDEX "shares_test_user" ON "shares" (
                "test",
                "user",
                "group"	ASC
            )`)
            this.run(`CREATE UNIQUE INDEX "shares_group" ON "shares" (
                "group",
                "test",
                "user"
            )`)
            this.run(`CREATE UNIQUE INDEX "share_test_group" ON "shares" (
                "test",
                "group",
                "user"
            )`)
            this.run(`CREATE TABLE "sessions" (
                "id"	varchar(64) NOT NULL,
                "user"	INTEGER NOT NULL,
                "expire_date"	DATETIME NOT NULL,
                FOREIGN KEY("user") REFERENCES "users"("user_id") ON DELETE CASCADE,
                PRIMARY KEY("id")
            )`)
            this.run(`CREATE INDEX "sessions_user" ON "sessions" (
                "user"
            )`);
            this.run(`CREATE INDEX "sessions_expire_date" ON "sessions" (
                "expire_date"
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
    async addUser(username: string, password: string, name: string) {
        return this.aRun('INSERT INTO users("username","password","name") VALUES (?,?,?)', 
            [username, hashPass(password), name]);
    }

    /**
     * Get an user from the username.
     * @param {string} username the username of the user to get
     * @return the user object
     */
     async getUser(username: string): Promise<User> {
        var [error, row] = await this.aGet('SELECT username, name, flags, permissions FROM users WHERE username=?', username);
        if (error) {
            return;
        } else {
            return row;
        }
    }
    
    /**
     * Get the user id from the username if the password is correct.
     * @param {string} username the username of the user to get
     * @return the user id
     */
     async verifyUserPassword(username: string, password: string): Promise<number> {
        var [error, row] = await this.aGet('SELECT user_id, password FROM users WHERE username=?', username);
        if (error) {
            verifyPass('test', 'sha256$2ed42951a2f3$1000$6a9ff10c032e89fa37f1978ec78da55e4a1f6a426d33ed74cb424b14d6115014');
            // delay so it take the same time, it is the hash of the password: 'test2'
            return;
        } else {
            if (verifyPass(password, row?.password)) {
                return row.user_id;
            } else {
                return;
            }
        }
    }

    /**
     * Get an user from the id.
     * @param {string} id the id of the user to get
     * @return the user object
     */
     async getUserFromId(id: number): Promise<User> {
        var [error, row] = await this.aGet('SELECT user_id, username, name, flags, permissions FROM users WHERE user_id=?', id);
        if (error) {
            return;
        } else {
            return row;
        }
    }

    /**
     * Add session.
     * @param {string} id the session id to add
     * @return if there is an error
     */
     async addSession(id: string, user_id: number, maxTime: number) {
        return this.aRun('INSERT INTO sessions("id", "user", "expire_date") VALUES (?,?,?)', [id, user_id, Date.now() + maxTime]);
    }

    /**
     * Get session.
     * @param {string} id the session to get
     * @return the session
     */
     async getSession(id: string): Promise<Session> {
        var [error, row] = await this.aGet('SELECT id, user, expire_date FROM sessions WHERE id=?', id);
        if (error) {
            return;
        } else {
            return row;
        }
    }

    /**
     * Delete session.
     * @param {string} id the session to delete
     * @return if there is an error
     */
     async deleteSession(id: string) {
        return this.aRun('DELETE FROM sessions WHERE id=? OR expire_date<?', [id, Date.now()]);
    }

    /**
     * Delete expired session.
     * @return if there is an error
     */
     async cleanupSession() {
        return this.aRun('DELETE FROM sessions WHERE expire_date<?', Date.now());
    }

    /**
     * Make a SQL query and return the result
     * @param query the query to do
     * @param params params to escape
     * @returns a promise that resolve with an error or null if it is a success and the row.
     */
    async aGet(query: string, params?: any): Promise<[Error, any]> {
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
    async aRun(query: string, params?: any): Promise<Error> {
        return new Promise(resolve => {
            super.get(query, params, error => {
                resolve(error);
            });
        });
    }
}