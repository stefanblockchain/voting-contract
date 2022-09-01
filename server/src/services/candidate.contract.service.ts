import { ethers } from 'ethers';
import * as dotenv from "dotenv";
import wakandaBallotAbi from '../abis/WakandaBallot.json';
import verifyUtil from '../utils/verify.util';
import VoteDTO from '../dtos/vote.dto';
import WKNDContractService from './wknd.contract.service';
import { VotingStateEnum } from '../enums/voting.state.enum';

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC);
const wakandaAddress = process.env.WAKANDA_BALLOT || '';
const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY || '';

const wakandaBallot = new ethers.Contract(wakandaAddress, wakandaBallotAbi, provider);
const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);

export default class CandidateContractService {

    wkndContractService = new WKNDContractService();

    public async getCandidates() {
        return await wakandaBallot.getCandidates();
    }

    public async vote(voteDto: VoteDTO) {
        const { candidateHash, voteCount, address } = voteDto;

        if (!(await verifyUtil(voteDto))) throw new Error('Verification failed');

        if ((await wakandaBallot.getElectionState()) != VotingStateEnum.STARTED) throw new Error('You cant vote right now');

        await this.wkndContractService.createSnapshotIfNotExists();

        if((await this.isUserVoted(address))) throw new Error('User already voted');

        return await wakandaBallot.connect(ownerWallet).vote(candidateHash, address, voteCount);
    }

    public async isUserVoted(userAddress: string) {
        return await wakandaBallot.voted(userAddress);
    }

    public async generateSignature(message: string): Promise<string> {
        return await ownerWallet.signMessage(message);
    }
}