import express from "express";
import { ALLOWED_ORIGIN, API_URL, PORT, SOCK_PERMS } from "./config";
import router from "./router";
import cors from "cors"
import { chmod } from "fs"

var cookieParser = require("cookie-parser");


var app = express();

app.use(cors({
    origin: ALLOWED_ORIGIN,
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
    maxAge: 86400 // 1 day
}));
app.use(cookieParser());
app.use(API_URL, router);
app.use((_, res) => {
    res.sendStatus(404);
});

app.disable('x-powered-by');

app.listen(PORT, () => {
    if (SOCK_PERMS) {
        chmod(PORT, SOCK_PERMS, () => null);
    }
    console.log("Server started.");
})
