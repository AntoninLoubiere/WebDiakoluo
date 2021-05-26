import { Response } from "express";
import { promises } from "fs";
import { DATABASE } from "./config";
import { PERMS_ADMIN, userHasPerm } from "./permissions";
import { Test, User } from "./types";

export const PERMS_VIEW = 1
export const PERMS_EDIT = 2
export const PERMS_SHARE = 3
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
 * Get the tests of a user
 * @param user_id the user id
 * @returns the data
 */
export async function getUserTests(user_id: number) {
    var data = {you: [], users: [], groups: []};
    
    const sharesPromise = DATABASE.getTestShares(user_id);
    const ownerPromise = DATABASE.getTestsOwner(user_id);
    
    var shares = await sharesPromise;
    var groups: number[][] = [];
    var users: number[] = [];
    var skippedTest = -1;
    for (var i = 0; i < shares.length; i++) {
        const share = shares[i];
        if (share.test === skippedTest) continue;

        if (share.group === 0) {
            if (share.perms > 0) {
                users.push(share.test);
            } else {
                skippedTest = share.test;
            }
        } else if (share.perms > 0) {
            groups.push([share.test, share.group]);
        }
    }

    const usersTestPromise = DATABASE.getTestsOwnersFromList(users);
    const groupsTestPromise = groups.length <= 0 ? [] : DATABASE.getTestsGroupsFromList(user_id, groups);
    data.you = await ownerPromise;
    data.users = await usersTestPromise;
    data.groups = await groupsTestPromise;
    return data;
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

/**
 * Delete a test.
 * @param id the id of the test to delete
 * @returns If there is an error
 */
export async function deleteTest(id: string) {
    var err = await DATABASE.deleteTest(id);
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
 * Delete a test file.
 * @param id the id of the file to delete
 */
export async function unlinkFile(id: string) {
    await promises.unlink(getTestFilePath(id));
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
        if (!perms[0].group) {
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

        case PERMS_SHARE:
            return 'share';

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
        case 'none':
            return 0;
        
        case 'view':
            return PERMS_VIEW;

        case 'edit':
            return PERMS_EDIT;

        case 'share':
            return PERMS_SHARE;

        case 'owner':
            return PERMS_OWNER;

        default:
            return -1;
    }
}