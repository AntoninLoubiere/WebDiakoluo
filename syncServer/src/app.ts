import bodyParser from "body-parser";
import express from "express";
import { API_URL, PORT } from "./config";
import router from "./router";
var cookieParser = require("cookie-parser");


var app = express();

app.use(cookieParser());
app.use(API_URL, router);

app.disable('x-powered-by');

app.listen(PORT, () => console.log("Server started."))
