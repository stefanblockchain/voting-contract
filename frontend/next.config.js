/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    SERVER_URL: 'http://localhost:3000/api/',

    WAKANDA_BALLOT: '0x36C02dA8a0983159322a80FFE9F24b1acfF8B570', //should be raplaced with wakanda_ballot contract address

    WAKANDA_TOKEN: '0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00' // should be raplaced with wakanda_ballot contract address
  },
}

module.exports = nextConfig
