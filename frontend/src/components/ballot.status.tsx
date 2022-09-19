import { Flex, Text, VStack, Heading } from "@chakra-ui/react";
import wakandaBallotAbi from "../abis/WakandaBallot.json";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { VotingStateEnum } from "enums/voting.state.enum";

declare let window: any;

const desiredNetworkId = process.env.NETWORK_ID || "";
const networkName = process.env.NETWORK_NAME || "";

export default function BallotStatus() {
  const [electionState, setElectionState] = useState<string | undefined>();

  useEffect(() => {
    getBallotStatus().then((ballotStatus) => setElectionState(ballotStatus));
  }, []);

  const getBallotStatus = async () => {
    if (!window.ethereum) return;

    const network = { name: networkName, chainId: Number(desiredNetworkId) };
    const provider = ethers.providers.getDefaultProvider(network);
    const wkndBallotAddress = process.env.WAKANDA_BALLOT || "";
    const wakandaBallotContract = new ethers.Contract(
      wkndBallotAddress,
      wakandaBallotAbi,
      provider
    );
    return VotingStateEnum[await wakandaBallotContract.getElectionState()];
  };

  return (
    <Flex as="header" p={4} alignItems="center">
      <VStack>
        <Heading as="h3" my={4}>
          {electionState ? <Text>Ballot is {electionState}</Text> : <></>}
        </Heading>
      </VStack>
    </Flex>
  );
}
