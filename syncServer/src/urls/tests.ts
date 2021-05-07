import { Request, RequestHandler, Response, Router } from "express";
import { DATABASE } from "../config";
import { generateHash } from "../password-hasher";
import { PERMS_CREATE_TEST as PERMS_CREATE_TEST, userHasFlag, userHasPerm } from "../permissions";
import { sessionRequired, useSession } from "../sessions";
import { deleteTest, getTestPermission, haveTestPermission, Permission, PERMS_EDIT, PERMS_OWNER, PERMS_VIEW, respondTest, setTest, stringifyPerm } from "../test-manager";
import { Test } from "../types";
import { BODY_JSON } from "../utils";

const TESTRouter = Router();
export default TESTRouter;

/**
 * A wrapper to get a middleware that verify if the user have the permissions
 * @param perms the perms to have
 * @returns the middleware
 */
function getTestWithPerms(perms: Permission): RequestHandler {
    async function callback(req: Request, res:Response, next: Function) {
        if (req.params.id?.length < 2) {
            res.sendStatus(404);
            return;
        }
    
        var test = await DATABASE.getTest(req.params.id);
        if (test) {
            const user = res.locals.user;
            if (await haveTestPermission(perms, test, user)) {
                res.locals.test = test;
                next();
            } else if (user)
                res.sendStatus(403)
            else
                res.sendStatus(401);
        } else {
            res.sendStatus(404);
        }
    }
    return callback;
}

TESTRouter.post('/new', sessionRequired, BODY_JSON, async (req, res) => {
    if (userHasPerm(res.locals.user, PERMS_CREATE_TEST)) {
        var id = generateHash(10);
        await DATABASE.createNewTest(id, res.locals.user);
        res.locals.test = await DATABASE.getTest(id);
        req.params.id = id;
        await editTestHandler(req, res); // move the request to the handler of test edit.
    } else {
        res.sendStatus(403);
    }
});

TESTRouter.get('/:id', useSession, getTestWithPerms(PERMS_VIEW), async (req, res) => {
    if (Number(req.query.last_modification) || 0 < res.locals.test.last_modification) {
        respondTest(req.params.id, res);
    } else {
        res.sendStatus(304)
    }
});

TESTRouter.post('/:id', useSession, getTestWithPerms(PERMS_EDIT), BODY_JSON, editTestHandler);
async function editTestHandler(req, res) {
    const last_modification = Number(req.body["last-modification"]);
    const modified = req.body["modified"];
    const override = req.body.override;
    const testData = req.body.test;
    const test: Test = res.locals.test;
    if (last_modification && modified && testData) {
        if (last_modification >= test.last_modification || override) {
            if (await setTest(req.params.id, modified, testData)) {
                res.send(test.id);
            } else {
                res.sendStatus(500);
            }
        } else {
            res.status(200).send('CONFLICTS');
        }
    } else {
        res.sendStatus(400);
    }
}

TESTRouter.delete('/:id', useSession, getTestWithPerms(PERMS_OWNER), BODY_JSON, async (req, res) => {
    res.sendStatus(await deleteTest(req.params.id) ? 500 : 204);
});

TESTRouter.get('/:id/info', useSession, async (req, res) => {
    const test = await DATABASE.getTestWithOwner(req.params.id);
    if (test) {
        const user = res.locals.user;
        const perm = await getTestPermission(test, user);
        if (perm >= PERMS_VIEW)
            res.json({
                owner: {username: test.username, name: test.name}, 
                share: stringifyPerm(perm), 
                last_modification: test.last_modification
            });
        else if (user)
            res.sendStatus(403)
        else
            res.sendStatus(401);
    } else {
        res.sendStatus(404);
    }
});

TESTRouter.get('/:id/share', useSession, getTestWithPerms(PERMS_VIEW), async (req, res) => {
    const test = res.locals.test;
    const usersPromise = DATABASE.getTestUsers(test.test_id);
    const groupPromise = DATABASE.getTestGroups(test.test_id);
    const users = await usersPromise;
    const groups = await groupPromise;

    let data = {"links-perms": stringifyPerm(test.share_link), users: [], groups: []};

    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        data.users.push({username: user.username, name: user.name, perms: stringifyPerm(user.perms)});
    }
    
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        data.groups.push({name: group.name, long_name: group.long_name, perms: stringifyPerm(group.perms)});
    }

    res.json(data);
});
