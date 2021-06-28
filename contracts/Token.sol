// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
  //add minter variable
  address public minter;

  //add minter changed event
  event MinterChanged(address indexed from, address to);

  constructor() public payable ERC20("Descentralized Bank Currency", "DBC") {
    //asign initial minter
    minter = msg.sender;  
  }

  //Add pass minter role function

  function passMinterRole(address dBank) public returns(bool) {
    require(msg.sender == minter, "not allowed to mint tokens");
    minter = dBank;

    emit MinterChanged(msg.sender, dBank);
    return true;
  }

  function mint(address account, uint256 amount) public {
    //check if msg.sender have minter role
    // require(msg.sender == minter, "not allowed to mint tokens");
		_mint(account, amount);
	}
}