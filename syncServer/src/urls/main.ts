import { request, Router } from "express";
import { DATABASE } from "../config";
import { createSession, deleteSession, sessionRequired } from "../sessions";
import { BODY_JSON } from "../utils";

const MAINRouter = Router();
export default MAINRouter;

MAINRouter.get('/', sessionRequired, (req, res) => {
    res.send(`Hello ${res.locals.user.name} !`);
});

/**
 * Login the user
 */
MAINRouter.post('/login', BODY_JSON, async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    if (username && password) {
        var user = await DATABASE.verifyUserPassword(username, password);
        if (user) {
            await createSession(req, res, user);
            res.sendStatus(204);
            return;
        }
        res.sendStatus(401);
    } else {
        res.sendStatus(400);
    }
})

/**
 * Logout the user
 */
MAINRouter.get('/logout', async (req, res) => {
    if (req.cookies.session)
        await deleteSession(res, req.cookies.session);
    res.sendStatus(204);
})

/**
 * Get informations about the current user
 */
MAINRouter.get('/user', sessionRequired, (_, res) => {
    res.json({'username': res.locals.user.username, 'name': res.locals.user.name})
});

/**
 * Get informations about a specific user
 */
MAINRouter.get('/user/:id', async (req, res) => {
    var user = await DATABASE.getUser(req.params.id);
    if (user) {
        res.json({'username': user.username, 'name': user.name})
    } else {
        res.sendStatus(404);
    }
});

/**
 * Get groups of the current user
 */
 MAINRouter.get('/group', sessionRequired, async (_, res) => {
    var groups = await DATABASE.getGroups(res.locals.user.user_id);
    var data = [];
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        data.push({name: group.name, long_name: group.long_name});
    }
    
    res.json(data);
});

/**
 * Get informations about a specific group
 */
 MAINRouter.get('/group/:id',  async (req, res) => {
    if (req.params.id === 'none') {
        res.sendStatus(404);
        return;
    }
    
    var group = await DATABASE.getGroup(req.params.id);
    if (group) {
        var usersPromise = DATABASE.getGroupUsers(group.group_id);
        var data = {name: group.name, long_name: group.long_name, users: []};
        var users = await usersPromise;
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            data.users.push({username: user.username, name: user.name});
        }
        
        res.json(data);
    } else {
        res.sendStatus(404);
    }
});