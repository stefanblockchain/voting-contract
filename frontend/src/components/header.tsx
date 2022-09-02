import NextLink from "next/link";
import {
  Flex,
  useColorModeValue,
  Spacer,
  Heading,
  LinkBox,
  LinkOverlay,
  HStack,
} from "@chakra-ui/react";

const siteTitle = "WakandaBallot";
const voteTitle = "Vote";

export default function Header() {
  return (
    <Flex
      as="header"
      bg={useColorModeValue("gray.100", "gray.900")}
      p={4}
      alignItems="center"
    >
      <HStack spacing="24px">
        <LinkBox>
          <NextLink href={"/"} passHref>
            <LinkOverlay>
              <Heading size="md">{siteTitle}</Heading>
            </LinkOverlay>
          </NextLink>
        </LinkBox>
        <LinkBox>
          <NextLink href={"/vote"} passHref>
            <LinkOverlay>
              <Heading size="md">{voteTitle}</Heading>
            </LinkOverlay>
          </NextLink>
        </LinkBox>
      </HStack>

      <Spacer />
    </Flex>
  );
}
