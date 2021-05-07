import { Request, Response } from "express";
import { DATABASE, SECURE_SESSION, SESSION_MAX_AGE } from "./config"
import { generateHash } from "./password-hasher"

/**
 * The middleware that make sure that there is a valid session
 * @param request the request
 * @param response the response to send
 * @param next: go to the next middleware
 */
export async function sessionRequired(request: Request, response: Response, next) {
    if (await setupSession(request, response)) {
        next();
    } else {
        response.sendStatus(401)
    }
}


/**
 * The middleware that auth the user if it exist
 * @param request the request
 * @param response the response to send
 * @param next: go to the next middleware
 */
export async function useSession(request: Request, response: Response, next) {
    await setupSession(request, response);
    next();
}

/**
 * Setup the session by setting the response with the user field
 * @param request the request
 * @param response the response
 * @returns if there is a session
 */
export async function setupSession(request: Request, response: Response): Promise<boolean> {
    var session = await DATABASE.getSession(request.cookies.session);
    if (session) {
        if (session.expire_date > Date.now()) {
            response.locals.user = await DATABASE.getUserFromId(session.user);
            response.locals.authenticated = true;
            return true;
        } else
            DATABASE.deleteSession(request.cookies.session);
    }
    if (request.cookies.session) {
        response.clearCookie('session');
    }
    response.locals.authenticated = false;
    return false;
}

/**
 * Create a session for an user
 * @param response the response
 * @param userId the user id
 */
 export async function createSession(request: Request, response: Response, userId: number) {
    var sessionId = generateHash(64);

    DATABASE.cleanupSession();
    var e = DATABASE.addSession(sessionId, userId, SESSION_MAX_AGE);
    if (request.cookies.session) DATABASE.deleteSession(request.cookies.session);
    if (await e === null) response.cookie('session', sessionId, {
        sameSite: SECURE_SESSION ? 'strict' : 'lax', 
        httpOnly: true, 
        maxAge: SESSION_MAX_AGE, 
        secure: SECURE_SESSION
    });
}

/**
 * Delete a and remove for the user
 * @param response the response
 * @param id the id of the session
 */
 export async function deleteSession(response: Response, id: string) {
    DATABASE.deleteSession(id);
    var e = await DATABASE.deleteSession(id);
    if (e === null) response.clearCookie('session');
}