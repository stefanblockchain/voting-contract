import { ethers } from 'ethers';
import VoteDTO from "../dtos/vote.dto";
//https://www.youtube.com/watch?v=vhUjCLYlnMM
//https://www.youtube.com/watch?v=yk7nVp5HTCk
const verifyUtil = async (voteDto: VoteDTO) => {
    const signedAddress = await ethers.utils.verifyMessage(voteDto.message, voteDto.signedMessage);
    return signedAddress === voteDto.address;
}

export default verifyUtil;