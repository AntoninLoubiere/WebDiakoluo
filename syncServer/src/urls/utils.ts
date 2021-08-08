// import { Response } from "../types";

// /**
//  * Send a 404 error.
//  * @param response the response to send
//  */
// export async function file_not_found(response: Response) {
//     response.statusCode = 404;
//     response.setHeader('Content-Type', 'text/plain');
//     response.end('404, page not found!\n');
// }

// /**
//  * Send a 204 result code.
//  * @param response the response to send
//  */
// export async function no_content(response: Response) {
//     response.statusCode = 204;
//     response.end();
// }

// /**
//  * Send a hello world
//  * @param response the response to send
//  */
// export async function hello_world(response: Response) {
//     response.statusCode = 200;
//     response.setHeader('Content-Type', 'text/plain');
//     response.end('Hello world !');
// }