// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract WakandaBallot is Ownable{

    struct Candidate{
        string name;
        string cult;
        uint age;
        bytes32 hash;
        uint256 count;
    }

    enum VotingState {NOT_STARTED, STARTED, FINISHED}

    mapping(bytes32 => bool) registeredCandidates;

    mapping(address => uint256) public voters;

    Candidate[] public candidates;

    Candidate[] public winners;

    uint256 public startTime;

    uint256 public endTime;

    IERC20 public wknd;

    event NewChallenger(string indexed name, string indexed cult, uint age);

    constructor (uint256 _startTime, uint256 _endTime, address _wknd) {
        require(_endTime > _startTime, 'End time must come after start time');
        require(_wknd != address(0), 'WKND token address cant be zero');

        startTime = _startTime;
        endTime = _endTime;

        wknd = IERC20(_wknd);
    }

    modifier isNotStarted(){
        require(getElectionState() == VotingState.NOT_STARTED, 'Voting is not in correct state');
        _;
    }

    modifier isStarted(){
        require(getElectionState() == VotingState.STARTED, 'Voting is not started.');
        _;
    }

    modifier isFinished(){
        require(getElectionState() == VotingState.FINISHED, 'Voting is not finished.');
        _;
    }

    function addCandidate(string memory name, string memory cult, uint age) public onlyOwner isNotStarted{
        bytes32 _hash = keccak256(abi.encodePacked(name, cult, age));
        require(registeredCandidates[_hash],'Candidate already added');
        candidates.push(Candidate(name, cult, age, _hash, uint(0)));
    }

    function vote(bytes32 _candidate, uint256 _voteNumber) public isStarted {
        address sender = msg.sender;
        require(voters[sender] == uint256(0), 'Already voted');
        require(registeredCandidates[_candidate],'Not a registered candidate');
        require(_voteNumber > uint256(0),'Wrong vote count number');
        require(wknd.balanceOf(sender) >= _voteNumber, 'Vote number is bigger then ammount of WKND tokens owned for given address');

        voters[sender] = _voteNumber;
        wknd.transferFrom(sender, address(this), _voteNumber);
        uint256 _index = findCandidate(_candidate);

        candidates[_index].count += 1;

        _setUpWinner(candidates[_index]);
    }

    function unstake() public isFinished {
        require(voters[msg.sender] > 0, 'Voter didnt stake any tokens');
        address sender = msg.sender;
        uint256 _balance = voters[sender];
        voters[sender] = 0;

        wknd.transferFrom(address(this), sender, _balance);
    }

    function winningCandidates () public view returns (Candidate[] memory _winners) {
        _winners = winners;
    }

    function _setUpWinner(Candidate storage winn) private {
        if(_containsWinner(winn)) return;
        
        if(winners.length < 3){
            winners.push(winn);
            emit NewChallenger(winn.name, winn.cult, winn.age);
            return;
        }

        uint index;
        bool elementFound;

        for(uint i = 0; i< winners.length; i++){
            if(winn.count > winners[i].count){
                index = i;
                elementFound = true;
                break;
            }
        }

        if(!elementFound) return;

        for(uint i = index; i < winners.length;i++)
            winners[i] = winners[i+1];
        
        winners[index] = winn;
        winners.pop();

        emit NewChallenger(winn.name, winn.cult, winn.age);
    }

    function _containsWinner(Candidate storage winn) private view returns (bool){
        for(uint index = 0; index < winners.length; index++) {
            if(winners[index].hash == winn.hash) return true;
        }

        return false;
    }

    function getElectionState() public view returns (VotingState state) { 
        if(block.timestamp < startTime) 
            state = VotingState.NOT_STARTED;

        else if (block.timestamp >= startTime && block.timestamp <= endTime)
            state = VotingState.STARTED;

        else
            state = VotingState.FINISHED;
    }

    function findCandidate(bytes32 candidateHash) private view returns (uint256 index){
        for(uint256 i =0; i< candidates.length; i++){
            if(candidates[i].hash == candidateHash)
                index = i;
        }
    }
}