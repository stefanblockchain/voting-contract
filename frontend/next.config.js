/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    SERVER_URL: 'http://localhost:3000/api/',

    WAKANDA_BALLOT: '0x12818AE2dBc11F94543A4EA79d52E4dDF5F1eC90',

    WAKANDA_TOKEN: '0xC146E1aB66cda6d949FdAAb23E45AEC0e16EfAd7',

    NETWORK_ID: '4',

    NETWORK_NAME: 'rinkeby'
  },
}

module.exports = nextConfig
