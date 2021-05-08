import bodyParser from "body-parser";
import express from "express";
import { API_URL, PORT } from "./config";
import router from "./router";
import cors from "cors"

var cookieParser = require("cookie-parser");


var app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
    maxAge: 60*60*24*30 // 1 month
}));
app.use(cookieParser());
app.use(API_URL, router);
app.use((_, res) => {
    res.sendStatus(404);
});

app.disable('x-powered-by');

app.listen(PORT, () => console.log("Server started."))
