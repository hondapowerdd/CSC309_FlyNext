import bcrypt from "bcrypt";

export function encrypt(object) {
    // Hash the password
    return bcrypt.hashSync(object, parseInt(process.env.BCRYPT_ROUNDS));
}

export function verifyEncrypted(object, encrypted) {
    // Compare the password
    return bcrypt.compareSync(object, encrypted);
}
