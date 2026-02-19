/**
 * Credential Encryption/Decryption
 * 
 * Uses AES-256-GCM for authenticated encryption of user credentials at rest.
 * Requires CREDENTIALS_ENCRYPTION_KEY env var (32-byte hex string = 64 hex chars).
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128-bit IV
const KEY_LENGTH = 32; // 256-bit key

export interface EncryptedData {
    encrypted: string;  // hex-encoded ciphertext
    iv: string;         // hex-encoded IV
    authTag: string;    // hex-encoded authentication tag
}

function getEncryptionKey(): Buffer {
    const keyHex = process.env.CREDENTIALS_ENCRYPTION_KEY;
    if (!keyHex) {
        throw new Error(
            "Missing CREDENTIALS_ENCRYPTION_KEY. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
        );
    }
    if (keyHex.length !== KEY_LENGTH * 2) {
        throw new Error(
            `CREDENTIALS_ENCRYPTION_KEY must be ${KEY_LENGTH * 2} hex characters (${KEY_LENGTH} bytes)`
        );
    }
    return Buffer.from(keyHex, "hex");
}

/**
 * Encrypt a credentials object (e.g. { token: "ghp_..." })
 */
export function encryptCredentials(data: Record<string, string>): EncryptedData {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const plaintext = JSON.stringify(data);
    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return {
        encrypted,
        iv: iv.toString("hex"),
        authTag: authTag.toString("hex"),
    };
}

/**
 * Decrypt a credentials object back to its original shape.
 * Throws an error if decryption fails (e.g. wrong key or corrupted data).
 */
export function decryptCredentials(encryptedData: EncryptedData): Record<string, string> {
    try {
        const key = getEncryptionKey();
        const iv = Buffer.from(encryptedData.iv, "hex");
        const authTag = Buffer.from(encryptedData.authTag, "hex");

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        const decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8") + decipher.final("utf8");
        return JSON.parse(decrypted);
    } catch (error: any) {
        const keyHex = process.env.CREDENTIALS_ENCRYPTION_KEY || "";
        console.error(`[Decryption ERROR] Key prefix: ${keyHex.substring(0, 8)}, IV: ${encryptedData.iv.substring(0, 8)}, Error: ${error.message}`);
        throw new Error("Invalid encryption key or corrupted data. Please reconnect your integration.");
    }
}
