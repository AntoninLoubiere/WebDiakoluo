import { Response } from "express";
import { writeFile, promises } from "node:fs";
import { DATABASE } from "./config";
import { PERMS_ADMIN, userHasPerm } from "./permissions";
import { Test, User } from "./types";

export const PERMS_VIEW = 1
export const PERMS_EDIT = 2
export const PERMS_ALL = 3
export const PERMS_OWNER = 4

export type Permission = 0 | 1 | 2 | 3 | 4

/**
 * Get the path of a test from his id.
 * @param id the id of the test
 * @returns the path of the test file
 */
function getTestFilePath(id: string) {
    return `tests/${id[0]}/${id.substring(1)}.json`;
}

/**
 * Respond with a test.
 * @param id the id of the test
 * @param response the response to set
 */
export function respondTest(id: string, response: Response) {
    response.sendFile(getTestFilePath(id), {root: './'}, (err: any) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.error('Get test, test not found', id);
            } else {
                console.error(err);
            }
            if (!response.headersSent) response.sendStatus(404);
        }
    });
}

/**
 * Write a file asynchronously.
 * @param path the path to the file
 * @param data the data to write
 * @returns a promise that return the error or null
 */
async function asyncWriteTest(path: string, data: string): Promise<NodeJS.ErrnoException> {
    try {
        await promises.writeFile(path, data);
        return;
    } catch (e) {
        return e;
    }
}

/**
 * Set a test
 * @param id the id of the test
 * @param modificationDate the last modification date
 * @param testData the data of the test
 */
export async function setTest(id: string, modificationDate: number, testData: any) {
    var err = await asyncWriteTest(getTestFilePath(id), JSON.stringify(testData));
    if (err) {
        console.error(err);
        return false
    } else {
        await DATABASE.updateTestModificationDate(id, modificationDate);
        return true;
    }
}

export async function deleteTest(id: string) {
    var err = await DATABASE.deleteTest(id);
    console.log(err);
    if (!err) {
        try {
            await promises.unlink(getTestFilePath(id));
        } catch (e) {
            console.warn("Can't remove file: ", e.path);
        }
        return false;
    }
    return true;
}

/**
 * Get if a user have specific permission about a test
 * @param permission the permission to have
 * @param test the test object
 * @param user the user
 */
export async function haveTestPermission(permission: Permission, test: Test, user: User): Promise<boolean> {
    if (test.share_link >= permission) 
        return true;
    
    if (user) {
        if (user.user_id === test.owner || userHasPerm(user, PERMS_ADMIN)) return true;
        var perms = await DATABASE.getTestUserPerms(test.test_id, user.user_id);
        if (perms[0]?.group == null) {
            return perms[0]?.perms >= permission;
        } else {
            for (let i = 0; i < perms.length; i++) {
                if (perms[i].perms >= permission)
                    return true;
            }
        }
    }
    return false;
}

/**
 * Get permission for the user and the test
 * @param test the test object
 * @param user the user
 */
export async function getTestPermission(test: Test, user: User): Promise<number> {
    var perm = test.share_link;

    if (user) {
        if (user.user_id === test.owner || userHasPerm(user, PERMS_ADMIN)) return PERMS_OWNER;
        var perms = await DATABASE.getTestUserPerms(test.test_id, user.user_id);
        if (perms[0]?.group == null) {
            const currentPerm = perms[0]?.perms ?? 0;
            if (currentPerm > perm)
                perm = currentPerm;
        } else {
            for (let i = 0; i < perms.length; i++) {
                const currentPerm = perms[i].perms;
                if (currentPerm > perm)
                    perm = currentPerm;
            }
        }
    }
    return perm;
}

/**
 * Stringify a perm and get the « human » representation.
 * @param perm the permission
 * @returns the permission stringified
 */
 export function stringifyPerm(perm: number): string {
    switch (perm) {
        case PERMS_VIEW:
            return 'view';

        case PERMS_EDIT:
            return 'edit';

        case PERMS_ALL:
            return 'all';

        case PERMS_OWNER:
            return 'owner';

        default:
            return 'none';
    }
}

/**
 * Parse a perm
 * @param perm the permission
 * @returns the permission stringified
 */
export function parsePerm(perm: string): number {
    switch (perm) {
        case 'view':
            return PERMS_VIEW;

        case 'write':
            return PERMS_EDIT;

        case 'all':
            return PERMS_ALL;

        case 'owner':
            return PERMS_OWNER;

        default:
            return 0;
    }
}