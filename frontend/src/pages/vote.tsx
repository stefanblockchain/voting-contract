import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { VStack } from "@chakra-ui/layout";
import { Button, Text, Radio, RadioGroup, Input } from "@chakra-ui/react";
import axios from "axios";
import wakandaBallotAbi from "../abis/WakandaBallot.json";

declare let window: any;
const wakandaAddress = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";

export default function vote() {
  const [balance, setBalance] = useState<string | undefined>();
  const [currentAccount, setCurrentAccount] = useState<string | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();
  const [chainname, setChainName] = useState<string | undefined>();
  const [candidateList, setCandidateList] = useState<any | undefined>();
  const [voteValue, setVoteValue] = useState<string | "">();
  const [winners, setWinners] = useState<[] | undefined>();

  const inputRef = useRef(null);

  useEffect(() => {
    if (!currentAccount || !ethers.utils.isAddress(currentAccount)) return;
    //client side code
    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    provider.getBalance(currentAccount).then((result) => {
      setBalance(ethers.utils.formatEther(result));
    });
    provider.getNetwork().then((result) => {
      setChainId(result.chainId);
      setChainName(result.name);
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
      .catch((e) => console.log(e));
  };

  const fetchCandidates = async () => {
    const result = await axios.get(
      "http://localhost:3000/api/candidate/leaderboard"
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
    console.log(JSON.stringify(result));
    await fetchCandidates();
  };

  const getWinningCandidates = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const wakandaBallot = new ethers.Contract(
      wakandaAddress,
      wakandaBallotAbi,
      provider
    );

    const result = await wakandaBallot.winningCandidates();
    setWinners(result);
    for (let i = 0; i < result.length; i++) console.log(result[i]);
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

        <Button onClick={getWinningCandidates}>Get Winning candidates</Button>
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
