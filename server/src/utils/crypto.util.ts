import crypto from 'crypto';
import VoteEncryptDTO from '../dtos/vote.encrypt.dto';
import * as dotenv from "dotenv";

dotenv.config();

const key = crypto.createHash('sha256').update(String(process.env.KEY)).digest('base64').substr(0, 32);
const iv = crypto.randomBytes(16);

const encrypt = (element: any): VoteEncryptDTO => {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(JSON.stringify(element));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

const decrypt = (text: any): Object => {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

export {encrypt,decrypt};