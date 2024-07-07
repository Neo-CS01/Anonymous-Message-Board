const { scrypt, randomBytes } = require("crypto");

// Function to generate a hashed password
exports.generateHashPassword = async (password) => {
    return new Promise((resolve, reject) => {
        // Generate a random salt
        const salt = randomBytes(16).toString("hex");

        // Hash the password with the salt using scrypt
        scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) {
                // Reject promise if an error occurs during hashing
                return reject(`Error generating hash: ${err.message}`);
            }

            // Resolve promise with the derived key and salt concatenated
            resolve(`${derivedKey.toString("hex")}.${salt}`);
        });
    });
}

// Function to compare a password with a hash
exports.compareHashPassword = async (password, hash) => {
    return new Promise((resolve, reject) => {
        // Split the hash to get the derived key and salt
        const [key, salt] = hash.split(".");

        // Hash the provided password with the same salt
        scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) {
                // Reject promise if an error occurs during hashing
                return reject(`Error comparing hash: ${err.message}`);
            }

            // Resolve promise with the comparison result
            resolve(key === derivedKey.toString("hex"));
        });
    });
}
