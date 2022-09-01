import axios from 'axios';
import { BigNumber } from 'ethers';
import VoteDTO from '../dtos/vote.dto';
import CandidateContractService from './candidate.contract.service';
import isOnline from 'is-online';
import CacheService from './cache.service';
import { encrypt, decrypt } from '../utils/crypto.util';

export default class CandidateService {

    candidateContractService = new CandidateContractService();
    cacheService = new CacheService('cacheVote', this.proccessCache);

    public constructor() {
        this.setCacheInterval();
    }

    public async getCandidatesList(): Promise<CanidateResponse> {
        const url = 'https://wakanda-task.3327.io/list';
        return (await axios.get<CanidateResponse>(url)).data;
    }

    public async getLeaderboard() {
        const canidates: Canidate[] = await this.candidateContractService.getCandidates();
        let result = canidates.map(candidate => {
            return {
                name: candidate.name,
                cult: candidate.cult,
                hash: candidate.hash,
                age: candidate.age.toNumber(),
                count: candidate.count.toNumber()
            }
        });
        result = result.sort((a, b) => (a.count - b.count)).reverse();
        return result;
    }

    public async vote(voteDto: VoteDTO) {
        if ((await isOnline()))
            return await this.candidateContractService.vote(voteDto);

        await this.cacheService.pauseQueue();
        await this.cacheService.cacheData(encrypt(voteDto));

        return 'Vote is queued';
    }

    private async proccessCache(job: any, done: any) {
        try {
            const candidateContractService = new CandidateContractService();
            const decryptedData: VoteDTO = JSON.parse(decrypt(job.data) as string) as VoteDTO;
            await candidateContractService.vote(decryptedData);
            done();
        }
        catch (error: any) {
            console.error(error.message);
            done(error);
        }
    }

    public async sign(message: string) {
        return this.candidateContractService.generateSignature(message);
    }

    private setCacheInterval() {
        const _this = this;
        setInterval(async function () {
            if ((await isOnline()))
                await _this.cacheService.resumeQueue();
        }, 3000);
    }
}


interface CanidateResponse {
    candidates: [
        name: string,
        age: number,
        cult: string
    ]
}


interface Canidate {
    name: string,
    cult: string,
    age: BigNumber,
    hash: string,
    count: BigNumber
}