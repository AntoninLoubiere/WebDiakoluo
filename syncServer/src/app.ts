import express from "express";
import { ALLOWED_ORIGIN, API_URL, PORT } from "./config";
import router from "./router";
import cors from "cors"

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

app.listen(PORT, () => console.log("Server started."))
