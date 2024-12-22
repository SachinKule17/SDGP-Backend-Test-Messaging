const crypto = require('crypto');

const ENCRYPTION_KEY = crypto.randomBytes(32); // Shared key for AES-256
const IV_LENGTH = 16; // Initialization vector length

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

function decrypt(text) {
    const [iv, encryptedText] = text.split(':');
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        ENCRYPTION_KEY,
        Buffer.from(iv, 'hex')
    );
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = { encrypt, decrypt };
