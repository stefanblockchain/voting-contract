/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    SERVER_URL: 'http://localhost:3000/api/',

    WAKANDA_BALLOT: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',

    WAKANDA_TOKEN: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  },
}

module.exports = nextConfig
