import axios from 'axios';
import { BigNumber } from 'ethers';
import VoteDTO from '../dtos/vote.dto';
import CandidateContractService from './candidate.contract.service';

export default class CandidateService{

    candidateContractService  = new CandidateContractService();

    public async getCandidatesList(): Promise<CanidateResponse>{
        const url = 'https://wakanda-task.3327.io/list';
        return (await axios.get<CanidateResponse>(url)).data;
    }

    public async getLeaderboard(){
        const canidates: Canidate[] = await  this.candidateContractService.getCandidates();
        let result = canidates.map(candidate => {return {
            name: candidate.name,
            cult: candidate.cult,
            hash: candidate.hash,
            age: candidate.age.toNumber(),
            count: candidate.count.toNumber()
            }});
        result = result.sort((a,b) => (a.count - b.count)).reverse();
        return canidates;
    }

    public async vote(voteDto:VoteDTO){
        return await this.candidateContractService.vote(voteDto);
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