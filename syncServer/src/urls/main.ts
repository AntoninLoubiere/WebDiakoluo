import { request, Router } from "express";
import { DATABASE } from "../config";
import { createSession, deleteSession, sessionRequired } from "../sessions";
import { BODY_ENCODED } from "../utils";

const MAINRouter = Router();
export default MAINRouter;

MAINRouter.get('/', sessionRequired, (req, res) => {
    res.send(`Hello ${res.locals.user.name} !`);
});

// TODO TEMPORARY
MAINRouter.get('/login', (_, res) => {
    res.send('<form action="/login" method="POST"><input type="text" name="username" placeholder="Username"><br><input type="password" name="password" placeholder="Password"><br><input type="submit"></form>')
})

MAINRouter.post('/login', BODY_ENCODED, async (req, res) => {
    var username = req.body.username ?? '';
    var password = req.body.password ?? '';
    var user = await DATABASE.verifyUserPassword(username, password);
    if (user) {
        await createSession(req, res, user);
        res.sendStatus(204);
        return;
    }
    res.sendStatus(401);
})

MAINRouter.get('/logout', async (req, res) => {
    if (req.cookies.session)
        await deleteSession(res, req.cookies.session);
    res.sendStatus(204);
})