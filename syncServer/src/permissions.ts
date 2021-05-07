import { User } from "./types";

export const PERMS_ADMIN = 1;

export const FLAG_DISABLE = 1;

export function userHasPerm(user: User, perms: number) {
    return (user.permissions & perms) == perms;
}

export function userHasFlag(user: User, flag: number) {
    return (user.flags & flag) == flag;
}
