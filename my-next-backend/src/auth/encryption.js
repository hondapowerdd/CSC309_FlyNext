// import bcrypt from "bcrypt";
const bcrypt = require("bcrypt");

function encrypt(object) {
    // Hash the password
    return bcrypt.hashSync(object, parseInt(process.env.BCRYPT_ROUNDS));
}

function verifyEncrypted(object, encrypted) {
    // Compare the password
    return bcrypt.compareSync(object, encrypted);
}

module.exports = { encrypt, verifyEncrypted };