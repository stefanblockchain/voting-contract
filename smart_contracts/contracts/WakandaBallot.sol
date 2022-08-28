// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IWKND.sol";

contract WakandaBallot is Ownable{

    struct Candidate{
        string name;
        string cult;
        uint age;
        bytes32 hash;
        uint256 count;
    }

    struct Voter {
        address voterAddress;
        uint256 voteCount;
        bytes32 candidate;
    }

    enum VotingState {NOT_STARTED, STARTED, FINISHED}

    mapping(bytes32 => bool) registeredCandidates;

    mapping(address => bool) public voted;

    Candidate[] public candidates;

    Candidate[] public winners;

    Voter[] public voters;

    uint256 public startTime;

    uint256 public endTime;

    uint256 totalVotes;

    IWKND public wknd;

    event NewChallenger(string indexed name, string indexed cult, uint age);

    event Voted(address indexed voter, uint256 voteCount, string name, string cult);

    constructor (uint256 _startTime, uint256 _endTime, address _wknd) {
        require(_startTime > block.timestamp, 'Start time can not be in the past');
        require(_endTime > _startTime, 'End time must come after start time');
        require(_wknd != address(0), 'WKND token address cant be zero');

        startTime =  _startTime;
        endTime = _endTime;

        wknd = IWKND(_wknd);
    }

    modifier inState(VotingState state){
        require(getElectionState() == state, 'Voting is not in correct state');
        _;
    }

    function addCandidate(string memory name, string memory cult, uint age) public onlyOwner inState(VotingState.NOT_STARTED){
        bytes32 _hash = keccak256(abi.encodePacked(name, cult, age));
        require(!registeredCandidates[_hash],'Candidate already added');
        candidates.push(Candidate(name, cult, age, _hash, uint(0)));
        registeredCandidates[_hash] = true;
    }

    function vote(bytes32 _candidate, address voter, uint256 _voteNumber) public onlyOwner inState(VotingState.STARTED) {
        require(voter != address(0), "0 address can't vote");
        require(!voted[voter], 'Already voted');
        require(registeredCandidates[_candidate],'Not a registered candidate');
        require(_voteNumber > uint256(0),'Wrong vote count number');
        require(wknd.balanceOfAt(voter, wknd.getCurrentSnapshotId()) >= _voteNumber, 'Vote number is bigger then ammount of WKND tokens owned for given address');

        voted[voter] = true;
        uint256 _index = findCandidate(_candidate);

        candidates[_index].count += _voteNumber;
        voters.push(Voter(voter, _voteNumber, _candidate));
        totalVotes += _voteNumber;

        _setUpWinner(candidates[_index]);

        emit Voted(voter,_voteNumber, candidates[_index].name, candidates[_index].cult);
    }

    function winningCandidates () public view returns (Candidate[] memory _winners) {
        _winners = winners;
    }

    function getCandidates () public view returns (Candidate[] memory _candidates) {
        _candidates = candidates;
    }

    function _setUpWinner(Candidate storage winn) private {
        if(_containsWinner(winn)) {
            winners[findCandidate(winn.hash)] = winn;
           _sortWinners();
            emit NewChallenger(winn.name, winn.cult, winn.age); 
            return;
        }

        if(winners.length < 3){
            winners.push(winn);
            _sortWinners();
            emit NewChallenger(winn.name, winn.cult, winn.age);
            return;
        }

        if(_shouldInsert(winn.count)){
            winners.push(winn);
            _sortWinners();
            winners.pop();
            emit NewChallenger(winn.name, winn.cult, winn.age);
        }
    }

    function _containsWinner(Candidate storage winn) private view returns (bool){
        for(uint index = 0; index < winners.length; index++) 
            if(winners[index].hash == winn.hash) return true;
        
        return false;
    }

    function _sortWinners() private{
        Candidate memory _candidate;
        for(uint i = 0; i < winners.length; i ++)
            for(uint j = 0; j < winners.length -1; j ++)
                if(winners[j].count < winners[j+1].count){
                    _candidate = winners[j];
                    winners[j] = winners[j+1];
                    winners[j+1] = _candidate;
                }
    }

    function _shouldInsert(uint256 count) private view returns (bool insertFlag){
        for(uint i =0; i< winners.length; i++)
            if(winners[i].count < count)
                insertFlag = true;
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