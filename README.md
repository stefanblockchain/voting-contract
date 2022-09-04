# voting-contract

For runing this app you will need to have Node.js v16.6.1.

You also will need docker installed so we can run database.

# Redis
Type command below to start redis server
```javascript
docker run -d --name smart-contract-redis -p 127.0.0.1:6379:6379 redis
```

# Node.js 
As stated already this was tested on Node  v16.6.1 (so we can install nvm to use it for this version)

Open terminal inside server folder and type
```javascript
npm install
```
Rename .env.example  to .env
Inside .env files update values with addresses of deployed contracts and private key of owner account (account who deployed contracts).

Type command to start the server
```javascript
npm run start
```

# Frontend
Open terminal inside server folder and type
```javascript
yarn install
```
Update next.config.js with correct values of deployed contracts.
Run
```javascript
yarn dev
```
To launch frontend.

# Hardhat
Open terminal inside smart_contracts folder and type

```javascript
npm install
```

You can compile and test smart contracts by running those commands:
```javascript
npx hardhat compile
npx hardhat test
```
If you want to upload to local network in additional terminal run command:
```javascript
npx hardhat node
```
Then in another terminal run this command:
```javascript
npx hardhat run --network localhost .\scripts\deploy.ts
```
This command will deploy contracts and print their addresses for later use in server and frontend part.
