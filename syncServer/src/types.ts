export interface User {
    user_id: number,
    username: string,
    name: string,
    flags: number,
    permissions: number
}

export interface Session {
    id: string,
    user: number,
    expire_date: number
}

export interface Group {
    group_id: number,
    name: string,
    long_name: string,
}

export interface Test {
    test_id: number,
    id: string,
    owner: number,
    share_link: number,
    last_modification: number
}

export interface SharePerms {
    perms: number,
    group: number | null
}

export interface ShareUserPerms {
    perms: number,
    username: string,
    name: string
}

export interface ShareGroupPerms {
    perms: number,
    name: string,
    long_name: string
}
