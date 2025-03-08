import jwt from "jsonwebtoken";
import { cookies } from 'next/headers';

const _generateToken = (object, secret, expiration) => {
    console.log(object);
    // Generate a token given a secret and the specified expiration period
    return jwt.sign(object, secret, { expiresIn: expiration });
}

export function generateAccessToken(object) {
    return _generateToken(object, process.env.JWT_SECRET_ACCESS, process.env.JWT_EXPIRY_TIME_ACCESS);
}

export function generateRefreshToken(object) {
    return _generateToken(object, process.env.JWT_SECRET_REFRESH, process.env.JWT_EXPIRY_TIME_REFRESH);
}

export function generateTokenPack(object) {
    // Generate an access token and a refresh token
    return {
        "refreshToken": generateRefreshToken(object),
        "accessToken": generateAccessToken(object)
    };
}

const _verfiyToken = (token, secret) => {
    // Verify a token given a secret
    if (!token) return null;

    try {
        return jwt.verify(token, secret);
    } catch (e) { return null; }
}

export function verifyAccessToken(token) {
    return _verfiyToken(token, process.env.JWT_SECRET_ACCESS);
}

export function verifyRefreshToken(token) {
    return _verfiyToken(token, process.env.JWT_SECRET_REFRESH);
}

export async function verify(request) {
    // Verify the tokens. If a valid access token exist, return its paylod in an object;
    // Otherwise try to resolve a refresh token.
    // If no valid token exist, return object with null payloads
    const authorization = request.headers.get("authorization");

    if (authorization) {
        const payload = verifyAccessToken(authorization.replace("Bearer ", ""));

        if (payload) return {"accessToken": payload};
    }

    return { "refreshToken": verifyRefreshToken((await cookies()).get("refreshToken")?.value) };
}

export function updateTokens(uid) {
    // Return a new token pack if the refreshToken contains a valid uid, else null
    return uid? generateTokenPack({ uid: uid }):null;
}

export async function resolveTokens(request) {
    const { accessToken, refreshToken } = await verify(request);

    if (accessToken) return { uid: accessToken["uid"], tokenType: "access" };
    if (refreshToken) return { uid: refreshToken["uid"], tokenType: "refresh" };

    return {};
}