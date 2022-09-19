import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { VStack } from "@chakra-ui/layout";
import {
  Button,
  Text,
  Radio,
  RadioGroup,
  Input,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import wakandaBallotAbi from "../abis/WakandaBallot.json";
import BallotStatus from "components/ballot.status";

declare let window: any;

const wakandaAddress = process.env.WAKANDA_BALLOT || "";
const desiredNetworkId = process.env.NETWORK_ID || "4";
const networkName = process.env.NETWORK_NAME || "";

export default function Vote() {
  const [currentAccount, setCurrentAccount] = useState<string | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();
  const [candidateList, setCandidateList] = useState<any | undefined>();
  const [voteValue, setVoteValue] = useState<string | "">();
  const [winners, setWinners] = useState<[] | undefined>();

  const inputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (!currentAccount || !ethers.utils.isAddress(currentAccount)) return;

    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    provider.getNetwork().then((result) => {
      setChainId(result.chainId);

      if (desiredNetworkId !== result.chainId.toString())
        showTost(
          "Wrong network chosen",
          `It should be ${networkName} network`,
          "error"
        );
    });

    window.ethereum.on("accountsChanged", function (accounts: any) {
      if (accounts.length === 0 || !ethers.utils.isAddress(accounts[0])) return;
      setCurrentAccount(accounts[0]);
    });

    window.ethereum.on("networkChanged", function (networkId: any) {
      setChainId(networkId);
      if (networkId.toString() !== desiredNetworkId)
        showTost(
          "Wrong network chosen",
          `It should be ${networkName} network`,
          "error"
        );
    });
  }, [currentAccount]);

  const onClickConnect = async () => {
    if (!window.ethereum) {
      console.log("please install MetaMask");
      return;
    }

    await fetchCandidates();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    provider
      .send("eth_requestAccounts", [])
      .then((accounts) => {
        if (accounts.length > 0) setCurrentAccount(accounts[0]);
      })
      .catch((e) => console.error(e));
  };

  const fetchCandidates = async () => {
    const result = await axios.get(
      `${process.env.SERVER_URL}candidate/leaderboard`
    );
    setCandidateList(result.data.leaderboard);
    setVoteValue(result.data.leaderboard[0]?.hash);
  };

  const voteAction = async () => {
    const saltValue = (Math.random() + 1).toString(36).substring(2);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signedMessage = await signer.signMessage(saltValue);

    const result = await axios.post(
      `http://localhost:3000/api/candidate/vote`,
      {
        candidateHash: voteValue,
        voteCount: inputRef.current.value,
        address: currentAccount,
        message: saltValue,
        signedMessage,
      }
    );
    inputRef.current.value = "";

    showTost("message", result.data.message, "success");

    await fetchCandidates();
  };

  const getWinningCandidates = async () => {
    const network = { name: networkName, chainId: Number(desiredNetworkId) };
    const provider = ethers.providers.getDefaultProvider(network);
    const wakandaBallot = new ethers.Contract(
      wakandaAddress,
      wakandaBallotAbi,
      provider
    );

    const result = await wakandaBallot.winningCandidates();
    setWinners(result);
  };

  const showTost = (title: string, message: string, type: any) => {
    toast({
      title: title,
      description: message,
      status: type,
      duration: 9000,
      isClosable: true,
    });
  };

  return (
    <>
      <VStack>
        {currentAccount ? (
          <Text w="100%">Account:{currentAccount}</Text>
        ) : (
          <Button type="button" w="100%" onClick={onClickConnect}>
            Connect Wallet
          </Button>
        )}
        {currentAccount ? <BallotStatus /> : <></>}
        <RadioGroup onChange={setVoteValue} value={voteValue}>
          {candidateList ? (
            candidateList.map((item: any) => (
              <Radio value={item.hash} key={item.hash}>
                <b>Name</b>: {item.name} &nbsp;
                <b>Cult</b>: {item.cult} &nbsp;
                <b>Age</b>: {item.age} &nbsp;
                <b>Count</b>: {item.count} &nbsp;
              </Radio>
            ))
          ) : (
            <></>
          )}
        </RadioGroup>
        {candidateList ? (
          <Input placeholder="number of votes to cast" ref={inputRef} />
        ) : (
          <></>
        )}
        {candidateList ? <Button onClick={voteAction}>Vote</Button> : <></>}

        {currentAccount ? (
          <Button onClick={getWinningCandidates}>Get Winning candidates</Button>
        ) : (
          <></>
        )}
        <ul>
          {winners ? (
            winners.map((winner: any) => (
              <li key={winner.hash}>
                <b>Name</b>: {winner.name} &nbsp;
                <b>Cult</b>: {winner.cult} &nbsp;
                <b>Age</b>: {winner.age.toNumber()} &nbsp;
                <b>Count</b>: {winner.count.toNumber()} &nbsp;
              </li>
            ))
          ) : (
            <></>
          )}
        </ul>
      </VStack>
    </>
  );
}
