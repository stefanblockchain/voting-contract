import type { NextPage } from "next";
import Head from "next/head";
import { VStack, Heading } from "@chakra-ui/layout";

import Register from "../components/register";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Wakanda Ballot</title>
      </Head>

      <Heading as="h3" my={4}>
        Welcome to Wakanda Ballot
      </Heading>
      <VStack>
        <Register />
      </VStack>
    </>
  );
};

export default Home;
