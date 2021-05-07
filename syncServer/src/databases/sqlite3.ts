import sqlite3 from "sqlite3";
import { hashPass, verifyPass } from "../password-hasher"
import { FLAG_DISABLE, userHasFlag } from "../permissions";
import { User, Session, Group, Test, SharePerms, ShareUserPerms, ShareGroupPerms } from "../types";

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
                this.run('PRAGMA foreign_keys = ON;');
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
                "name"	varchar(32) NOT NULL UNIQUE,
                "long_name" varchar(50) NOT NULL,
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
            this.run(`CREATE INDEX "shares_group_user" ON "shares" (
                "group",
                "user",
                "test"
            )`);
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
            this.run(`CREATE TABLE "shares_groups" (
                "test"	INTEGER NOT NULL,
                "group"	INTEGER NOT NULL,
                "perms"	INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY("group") REFERENCES "groups"("group_id") ON DELETE CASCADE,
                FOREIGN KEY("test") REFERENCES "tests"("test_id") ON DELETE CASCADE
            )`)
            this.run(`CREATE INDEX "shares_groups_group" ON "shares_groups" (
                "group",
                "test"
            )`);
            this.run(`CREATE UNIQUE INDEX "shares_groups_test" ON "shares_groups" (
                "test",
                "group"
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
        return (await this.aGet('SELECT username, name, flags, permissions FROM users WHERE username=?', username))[1];
    }
    
    /**
     * Get the user id from the username if the password is correct.
     * @param {string} username the username of the user to get
     * @return the user id
     */
    async verifyUserPassword(username: string, password: string): Promise<number> {
        var [error, row] = await this.aGet('SELECT user_id, password, flags FROM users WHERE username=?', username);
        if (error) {
            verifyPass('test', 'sha256$2ed42951a2f3$1000$6a9ff10c032e89fa37f1978ec78da55e4a1f6a426d33ed74cb424b14d6115014');
            // delay so it take the same time, it is the hash of the password: 'test2'
            return;
        } else if (!userHasFlag(row, FLAG_DISABLE) && verifyPass(password, row?.password)) {
            return row.user_id;
        } else {
            return;
        }
    }

    /**
     * Get an user from the id.
     * @param {string} id the id of the user to get
     * @return the user object
     */
    async getUserFromId(id: number): Promise<User> {
        return (await this.aGet('SELECT user_id, username, name, flags, permissions FROM users WHERE user_id=?', id))[1];
    }

    /**
     * Add session.
     * @param {string} id the session id to add
     * @return if there is an error
     */
    async addSession(id: string, user_id: number, maxTime: number) {
        return this.aRun(
            'INSERT INTO sessions("id", "user", "expire_date") VALUES (?,?,?)', 
            [id, user_id, Date.now() + maxTime]
        );
    }

    /**
     * Get session.
     * @param {string} id the session to get
     * @return the session
     */
    async getSession(id: string): Promise<Session> {
        return (await this.aGet('SELECT id, user, expire_date FROM sessions WHERE id=?', id))[1];
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
     * Get groups of an user
     * @param user_id the user id of the user 
     */
    async getGroups(user_id: number): Promise<Group[]> {
        return (await this.aAll(`SELECT groups.group_id, groups.name, groups.long_name FROM users_groups_link
            INNER JOIN groups ON users_groups_link."group"=groups.group_id 
            WHERE users_groups_link.user=?;
        `, [user_id]))[1];
    }

    /**
     * Get a group from the name
     * @param name The name of the group
     */
    async getGroup(name: string): Promise<Group> {
        return (await this.aGet('SELECT group_id, name, long_name FROM groups WHERE name=?', [name]))[1];
    }

    /**
     * Get users name and username that are in the group.
     * @param id the id of the groups
     */
    async getGroupUsers(id: number): Promise<User[]> {
        return (await this.aAll(`SELECT users.username, users.name FROM users_groups_link 
            INNER JOIN users ON users_groups_link.user=users.user_id 
            WHERE users_groups_link."group"=?`, 
        [id]))[1];
    }

    /**
     * Get a test.
     * @param id the id of the test
     */
    async getTest(id: string): Promise<Test> {
        return (await this.aGet(`SELECT test_id, id, owner, share_link, last_modification FROM tests WHERE id=?`, [id]))[1];
    }

    /**
     * Get a test and th owner.
     * @param id the id of the test
     */
    async getTestWithOwner(id: string): Promise<Test & User> {
        return (await this.aGet(
            `SELECT tests.test_id, tests.id, tests.last_modification, tests.owner, tests.share_link, users.username, users.name FROM tests 
            INNER JOIN users ON tests.owner=users.user_id WHERE id=?`
            , [id]))[1];
    }

    /**
     * Get the permission of a share for a specific user
     * @param test_id the test
     * @param user_id the user
     * @returns the perms
     */
    async getTestUserPerms(test_id: number, user_id: number): Promise<SharePerms[]> {
        return (await this.aAll(`SELECT perms, "group" FROM shares WHERE test=? AND user=?`, [test_id, user_id]))[1]
    }

    /**
     * Get the users of a test (shared)
     * @param test_id the test
     * @returns the perms
     */
    async getTestUsers(test_id: number): Promise<ShareUserPerms[]> {
        return (await this.aAll(`SELECT shares.perms, users.username, users.name FROM shares 
        INNER JOIN users ON shares.user=users.user_id
        WHERE shares.test=? AND shares."group" IS NULL`, [test_id]))[1]
    }

    /**
     * Get the groups of a test (shared)
     * @param test_id the test
     * @returns the perms
     */
    async getTestGroups(test_id: number): Promise<ShareGroupPerms[]> {
        return (await this.aAll(`SELECT shares_groups.perms, groups.name, groups.long_name FROM shares_groups
        INNER JOIN groups ON shares_groups."group"=groups.group_id
        WHERE shares_groups.test=?`, [test_id]))[1]
    }
    
    /**
     * Update the date of modification of a test.
     * @param id the id of the test
     * @param modificationDate the date of modification
     */
    async updateTestModificationDate(id: string, modificationDate: number) {
        return (await this.aRun(`UPDATE tests SET last_modification=? WHERE id=?`, [modificationDate, id]));
    }

    /**
     * Create a new test
     * @param id the id of the test to add
     * @param user the owner of the test
     * @returns the object created
     */
    async createNewTest(id: string, user: User): Promise<Test> {
        return (await this.aGet(`INSERT INTO tests (id, owner, share_link, last_modification) VALUES (?,?,0,?)`, 
            [id, user.user_id, Date.now()]))[1];
    }

    
    /**
     * Delete a test.
     * @param id the id of the test to delete
     * @returns id there is an error
     */
    async deleteTest(id: string) {
        return await this.aRun(`DELETE FROM tests WHERE id=?`, [id]);
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
     * Make a SQL query and return the result
     * @param query the query to do
     * @param params params to escape
     * @returns a promise that resolve with an error or null if it is a success and the row.
     */
    async aAll(query: string, params?: any): Promise<[Error, any[]]> {
        return new Promise(resolve => {
            super.all(query, params, (error, row) => {
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