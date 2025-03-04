import jwt from "jsonwebtoken";

const _generateToken = (object, secret, expiration) => {
    // Generate a token given a secret and the specified expiration period
    return jwt.sign(object, secret, { expiresIn: expiration });
}

export function generateAccessToken(object) {
    return _generateToken({...object, tokenType: "access"}, process.env.JWT_SECRET_ACCESS, process.env.JWT_EXPIRY_TIME_ACCESS);
}

export function generateRefreshToken(object) {
    return _generateToken({...object, tokenType: "refresh"}, process.env.JWT_SECRET_REFRESH, process.env.JWT_EXPIRY_TIME_REFRESH);
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
    } catch { return null; }
}

export function verifyACCESSToken(token) {
    return _verfiyToken(token, process.env.JWT_SECRET_access);
}

export function verifyRefreshToken(token) {
    return _verfiyToken(token, process.env.JWT_SECRET_refresh);
}

export function verify(request) {
    // Verify the tokens. If a valid access token exist, return its paylod; Otherwise try to resolve a refresh token.
    // If no valid token exist, return null
    const authorization = request.headers.get("authorization");

    if (authorization) {
        const payload = verifyACCESSToken(authorization.replace("Bearer ", ""));
        
        if (payload) return {"accessToken": payload};
    }

    return { "refreshToken": verifyRefreshToken(request.cookies.refreshToken) };
}
