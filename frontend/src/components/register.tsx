import {
  Flex,
  Button,
  Text,
  Input,
  HStack,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useRef } from "react";
import axios from "axios";

export default function Register() {
  const inputRef = useRef(null);
  const toast = useToast();

  const handleClick = async () => {
    const walletAddress = inputRef.current.value;
    if (walletAddress === "") return;
    inputRef.current.value = "";

    const result = await axios.post(`${process.env.SERVER_URL}token/claim`, {
      address: walletAddress,
    });

    toast({
      title: "Message",
      description: result.data.message,
      status: "success",
      duration: 9000,
      isClosable: true,
    });
  };

  return (
    <Flex as="header" p={4} alignItems="center">
      <VStack>
        <Text>
          Plese enter your etherum wallet address to claim your WAKANDA token
        </Text>
        <HStack spacing="24px">
          <Input placeholder="enter address" ref={inputRef} />
          <Button onClick={handleClick}>Claim token</Button>
        </HStack>
      </VStack>
    </Flex>
  );
}
