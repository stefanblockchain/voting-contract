import Queue from "bull";
import VoteEncryptDTO from "../dtos/vote.encrypt.dto";
import CandidateContractService from "./candidate.contract.service";

export default class CacheService {
    queue = new Queue("myQueue");
    key = '';
    candidateContractService = new CandidateContractService();

    public constructor(key: string, callback: any) {
        this.key = key;
        this.queue.process(key, (job, done) => callback(job, done));
    }

    public async cacheData(element: VoteEncryptDTO) {
        await this.queue.add(this.key, element);
    }

    public async pauseQueue() {
        await this.queue.pause();
    }

    public async resumeQueue() {
        await this.queue.resume();
    }
}