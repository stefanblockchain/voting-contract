import { ethers } from 'ethers';
import VoteDTO from "../dtos/vote.dto";

const verifyUtil = async (voteDto: VoteDTO) => {
    const signedAddress = await ethers.utils.verifyMessage(voteDto.message, voteDto.signedMessage);
    return signedAddress.toLowerCase() === voteDto.address;
}

export default verifyUtil;