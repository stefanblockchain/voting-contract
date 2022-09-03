import type { NextPage } from "next";
import Head from "next/head";
import { VStack, Heading } from "@chakra-ui/layout";
import BallotStatus from "../components/ballot.status";

import Register from "../components/register";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Wakanda Ballot</title>
      </Head>
      <BallotStatus />
      <VStack>
        <Register />
      </VStack>
    </>
  );
};

export default Home;
