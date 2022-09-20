/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    SERVER_URL: 'http://localhost:3000/api/',

    WAKANDA_BALLOT: '0x766342ed8057f44a0554F72D00c666d3cB6E5B06',

    WAKANDA_TOKEN: '0xFAB4557849D8eb1e08571c4B55F5b5da26ee5b37',

    NETWORK_ID: '4',

    NETWORK_NAME: 'rinkeby'
  },
}

module.exports = nextConfig
