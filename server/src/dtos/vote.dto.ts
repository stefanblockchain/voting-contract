export default interface VoteDTO {
    candidateHash: string,
    voteCount: number,
    address: string,
    message: string,
    signedMessage: string
}