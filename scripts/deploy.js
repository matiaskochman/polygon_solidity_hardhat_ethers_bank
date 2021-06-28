const { ethers } = require("hardhat");
const fs = require('fs');

async function main(){
  // const [deployer] = await ethers.getSigners();
  // console.log(`deploying contracts with the account: ${deployer}`);

  // const balance = await deployer.getBalance();
  // console.log(`Account balance: ${balance.toString()}`);

  const Token = await ethers.getContractFactory('Token');
  const dBank = await ethers.getContractFactory('dBank');
  const token = await Token.deploy();
  const dbank = await dBank.deploy(token.address);
  console.log(`Token address: ${token.address}`)
  console.log(`dBank address: ${dbank.address}`)

  
  const data = {
    address: token.address,
    abi: JSON.parse(token.interface.format('json'))
  };
  fs.writeFileSync('src/Token.json', JSON.stringify(data));   

  const data2 = {
    address: dbank.address,
    abi: JSON.parse(dbank.interface.format('json'))
  };
  fs.writeFileSync('src/dBank.json', JSON.stringify(data2));   

}

main().then(()=> {
  process.exit(0);
}).catch((e)=>{
  console.error(e);
  process.exit(1);
})