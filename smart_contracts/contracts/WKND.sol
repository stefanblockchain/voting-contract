// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";

contract WKND is ERC20, ERC20Snapshot, Ownable {
    mapping(address => bool) public minted;

    uint256 maxAmount = (6 * 10) ^ 6;

    constructor() ERC20("WKND", "WKND") ERC20Snapshot() {}

    function claimToken(address claimer) public onlyOwner {
        require(
            !minted[claimer],
            "Already minted token for this wallet address"
        );
        require(claimer != address(0), "Address cant be 0");
        require(
            super.totalSupply() < maxAmount,
            "All voting tokens are collected"
        );

        minted[claimer] = true;

        _mint(claimer, 1);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Snapshot) {
        super._beforeTokenTransfer(from, to, amount);
    }

    function snapshot() public onlyOwner returns (uint256) {
        uint256 currentId = _snapshot();
        return currentId;
    }

    function getCurrentSnapshotId() public view returns (uint256) {
        return _getCurrentSnapshotId();
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }
}
