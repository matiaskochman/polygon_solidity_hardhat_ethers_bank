/**
 * @type import('hardhat/config').HardhatUserConfig
 */
//  require("@nomiclabs/hardhat-truffle5");
// require('@nomiclabs/hardhat-waffle');
// module.exports = {
//   solidity: "0.8.4",
// };

require('dotenv').config();
const PRIVATE_KEY_MUMBAI = process.env.PRIVATE_KEY_MUMBAI;
const PRIVATE_KEY_TEST = process.env.PRIVATE_KEY_TEST;

require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-waffle");
// require("@nomiclabs/hardhat-truffle5"); // test with truffle

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

// module.exports = {
//   solidity: "0.8.4",
// };

module.exports = {
  // defaultNetwork: "matic",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {            
    }
    ,
    matic: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [PRIVATE_KEY_MUMBAI]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  }
}
// npx hardhat node
// npx hardhat run scripts/deploy.js
// npx hardhat run --network <your-network> scripts/deploy.js