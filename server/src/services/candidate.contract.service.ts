import { ethers } from 'ethers';
import * as dotenv from "dotenv";
import wakandaBallotAbi from '../abis/WakandaBallot.json';
import verifyUtil from '../middlewares/verify.middleware';
import VoteDTO from '../dtos/vote.dto';

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC);
const wakandaAddress = process.env.WAKANDA_BALLOT || '';
const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY || '';

const wakandaBallot = new ethers.Contract(wakandaAddress, wakandaBallotAbi, provider);
const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);

export default class CandidateContractService{
    public async getCandidates(){
        return await wakandaBallot.getCandidates();
    }

    public async vote(voteDto: VoteDTO){
        const verifiedSignature = await verifyUtil(voteDto);
        if(!verifiedSignature)
            return 'Verification failed';
        
        const {candidateHash, voteCount, address} = voteDto;
        return await wakandaBallot.connect(ownerWallet).vote(candidateHash, address, voteCount);
        
    }
}