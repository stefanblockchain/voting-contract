// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WKND is ERC20{

mapping(address => bool) public minted;

constructor() ERC20("WKND", "WKND"){}

function mintToken() public {
    require(!minted[msg.sender], 'Already minted token for this wallet address');

    minted[msg.sender] = true;

    _mint(msg.sender, 1);
    
}
}