import { User } from "./types";

export const PERMS_ADMIN = 1; // 1 << 1
export const PERMS_CREATE_TEST = 2; // 1 << 2;

export const FLAG_DISABLE = 1; // 1 << 1;

export function userHasPerm(user: User, perms: number) {
    return (user.permissions & perms) == perms;
}

export function userHasFlag(user: User, flag: number) {
    return (user.flags & flag) == flag;
}
