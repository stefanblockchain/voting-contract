// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IWKND {
    function getCurrentSnapshotId() external view returns (uint256);

    function balanceOfAt(address account, uint256 snapshotId) external view returns (uint256);
}
