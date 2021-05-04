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
