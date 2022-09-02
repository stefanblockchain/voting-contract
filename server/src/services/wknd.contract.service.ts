import { ethers } from 'ethers';
import * as dotenv from "dotenv";
import wkndAbi from '../abis/WKND.json';

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC);
const wakandaAddress = process.env.WKND || '';
const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY || '';

const wknd = new ethers.Contract(wakandaAddress, wkndAbi, provider);
const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);

export default class WKNDContractService {

    public async createSnapshot() {
        return await wknd.connect(ownerWallet).snapshot();
    }

    public async getCurrentSnapshot() {
        return await wknd.getCurrentSnapshotId();
    }

    public async createSnapshotIfNotExists() {
        const currentSnap = await this.getCurrentSnapshot();
        if (currentSnap.toNumber() === 0)
            return await this.createSnapshot();
    }

    public async claimToken(address: string) {
        if (await wknd.minted(address)) throw new Error(`Token already minted for address: ${address}`);

        await wknd.connect(ownerWallet).claimToken(address);
    }
}