import { promises } from "node:fs";
import { DATABASE } from "../config";
import { BASE64_CHARS } from "../password-hasher";

DATABASE.initialise();
DATABASE.close();

for (let index = 0; index < BASE64_CHARS.length; index++) {
    const char = BASE64_CHARS[index];
    promises.mkdir('./tests/' + char, {recursive: true});
}