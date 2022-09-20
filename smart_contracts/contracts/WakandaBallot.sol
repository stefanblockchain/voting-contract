// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IWKND.sol";

contract WakandaBallot is Ownable {
    struct Candidate {
        string name;
        string cult;
        uint256 age;
        bytes32 hash;
        uint256 count;
    }

    struct Voter {
        address voterAddress;
        uint256 voteCount;
        bytes32 candidate;
    }

    struct WinnerScore {
        uint256 count;
        uint256 minimumVotes;
    }

    enum VotingState {
        NOT_STARTED,
        STARTED,
        FINISHED
    }

    mapping(bytes32 => bool) registeredCandidates;

    mapping(address => bool) public voted;

    Candidate[] public candidates;

    WinnerScore private winnerScore;

    Voter[] public voters;

    uint256 public startTime;

    uint256 public endTime;

    uint256 totalVotes;

    IWKND public wknd;

    event NewChallenger(string indexed name, string indexed cult, uint256 age);

    event Voted(
        address indexed voter,
        uint256 voteCount,
        string name,
        string cult
    );

    constructor(
        uint256 _startTime,
        uint256 _endTime,
        address _wknd
    ) {
        require(
            _startTime > block.timestamp,
            "Start time can not be in the past"
        );
        require(_endTime > _startTime, "End time must come after start time");
        require(_wknd != address(0), "WKND token address cant be zero");

        startTime = _startTime;
        endTime = _endTime;

        wknd = IWKND(_wknd);
    }

    modifier inState(VotingState state) {
        require(getElectionState() == state, "Voting is not in correct state");
        _;
    }

    function addCandidate(
        string memory name,
        string memory cult,
        uint256 age
    ) public onlyOwner inState(VotingState.NOT_STARTED) {
        bytes32 _hash = keccak256(abi.encodePacked(name, cult, age));
        require(!registeredCandidates[_hash], "Candidate already added");
        candidates.push(Candidate(name, cult, age, _hash, uint256(0)));
        registeredCandidates[_hash] = true;
    }

    function vote(
        bytes32 _candidate,
        address voter,
        uint256 _voteNumber
    ) public onlyOwner inState(VotingState.STARTED) {
        require(voter != address(0), "0 address can't vote");
        require(!voted[voter], "Already voted");
        require(registeredCandidates[_candidate], "Not a registered candidate");
        require(_voteNumber > uint256(0), "Wrong vote count number");
        require(
            wknd.balanceOfAt(voter, wknd.getCurrentSnapshotId()) >= _voteNumber,
            "Vote number is bigger then ammount of WKND tokens owned for given address"
        );

        voted[voter] = true;
        uint256 _index = findCandidate(_candidate);

        candidates[_index].count += _voteNumber;
        voters.push(Voter(voter, _voteNumber, _candidate));
        totalVotes += _voteNumber;

        _setUpWinn(candidates[_index], _voteNumber);

        emit Voted(
            voter,
            _voteNumber,
            candidates[_index].name,
            candidates[_index].cult
        );
    }

    function winningCandidates() public view returns (Candidate[] memory) {
        WinnerScore memory _winnerScore = winnerScore;
        Candidate[] memory _winners = new Candidate[](_winnerScore.count);

        Candidate[] memory _sortedWinners = _sortWinners();
        for (uint256 i = 0; i < _winnerScore.count; i++)
            _winners[i] = _sortedWinners[i];
        return _winners;
    }

    function getCandidates()
        public
        view
        returns (Candidate[] memory _candidates)
    {
        _candidates = candidates;
    }

    function _setUpWinn(Candidate memory winn, uint256 voteNumber) private {
        WinnerScore memory _winnerScore = winnerScore;

        if (_winnerScore.count == 0) {
            _winnerScore.count += 1;
            _updateWinnerScore(winn, _winnerScore);
        } else if (
            _winnerScore.count < 3 &&
            _winnerScore.minimumVotes > winn.count - voteNumber
        ) {
            _winnerScore.count += 1;
            _updateWinnerScore(winn, _winnerScore);
        } else if (winn.count > _winnerScore.minimumVotes)
            _updateWinnerScore(winn, _winnerScore);
    }

    function _updateWinnerScore(
        Candidate memory winn,
        WinnerScore memory _winnerScore
    ) private {
        _winnerScore.minimumVotes = winn.count;
        winnerScore = _winnerScore;
        emit NewChallenger(winn.name, winn.cult, winn.age);
    }

    function _sortWinners() private view returns (Candidate[] memory) {
        Candidate[] memory _candidates = candidates;
        Candidate memory _candidate;

        for (uint256 i = 0; i < _candidates.length; i++)
            for (uint256 j = 0; j < _candidates.length - 1; j++)
                if (_candidates[j].count < _candidates[j + 1].count) {
                    _candidate = _candidates[j];
                    _candidates[j] = _candidates[j + 1];
                    _candidates[j + 1] = _candidate;
                }

        return _candidates;
    }

    function getElectionState() public view returns (VotingState state) {
        if (block.timestamp < startTime) state = VotingState.NOT_STARTED;
        else if (block.timestamp >= startTime && block.timestamp <= endTime)
            state = VotingState.STARTED;
        else state = VotingState.FINISHED;
    }

    function findCandidate(bytes32 candidateHash)
        private
        view
        returns (uint256 index)
    {
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].hash == candidateHash) index = i;
        }
    }
}
