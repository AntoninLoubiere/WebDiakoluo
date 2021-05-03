import http from 'http';
import {DATABASE} from "./config.mjs";

http.createServer((req, res) => {
   res.code = 200;
   res.setHeader('Content-Type', 'text/plain');
   res.end('Hello World!\n');
}).listen(1234);