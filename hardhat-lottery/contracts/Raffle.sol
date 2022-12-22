// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

error Raffle__InsufficientStake(uint256 required, uint256 retrieved);
error Raffle__TransferFailed();
error Raffle__NotOpen();
error Raffle__UpkeepNotNeeded();

contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
    enum RaffleState {
        OPEN,
        CALCULATING
    }

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;

    uint256 private immutable i_entranceFee;
    address payable[] private s_participants;
    address payable private s_lastWinner;
    RaffleState private s_raffleState;
    uint256 private immutable i_interval;
    uint256 private s_lastTimeStamp;

    uint32 private constant NUM_WORDS = 1;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;

    modifier SufficientStake() {
        if (msg.value < i_entranceFee) {
            revert Raffle__InsufficientStake({
                required: i_entranceFee,
                retrieved: msg.value
            });
        }
        _;
    }

    modifier RuffleStateOpen() {
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__NotOpen();
        }
        _;
    }

    event RaffleEnter(address indexed participant);
    event RequestRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed participant);

    constructor(
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 entranceFee,
        address vrfCoordinatorAddress,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorAddress) {
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;

        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorAddress);
        s_raffleState = RaffleState.OPEN;
        i_interval = interval;
        s_lastTimeStamp = block.timestamp;
    }

    /**
     * @dev This function is needed for ChainLink to work properly
     * `upkeepNeeded` need to be true to succeed, meet the following criteria:
     *    1. Time interval should have passed
     *    2. The lottery should be played with at least 1 player
     *    3. Subscripton is funded with LINK
     *    4. The lottery should be in "open" state
     */
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        returns (
            bool upKeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = RaffleState.OPEN == s_raffleState;
        bool ifTimePassed = ((block.timestamp - s_lastTimeStamp) >= i_interval);
        bool ifEnoughParticipants = s_participants.length >= 1;
        bool ifEnoughBalance = address(this).balance > 0;
        upKeepNeeded = (isOpen &&
            ifTimePassed &&
            ifEnoughParticipants &&
            ifEnoughBalance);
    }

    function performUpkeep(bytes calldata) external {
        (bool upkeepNeeded, ) = checkUpkeep("");

        if (!upkeepNeeded) {
            revert Raffle__UpkeepNotNeeded();
        }

        s_raffleState = RaffleState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        emit RequestRaffleWinner(requestId);
    }

    function enterRaffle() public payable SufficientStake RuffleStateOpen {
        s_participants.push(payable(msg.sender));

        emit RaffleEnter(msg.sender);
    }

    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % s_participants.length;
        s_lastWinner = s_participants[indexOfWinner];

        (bool success, ) = s_lastWinner.call{value: address(this).balance}("");

        if (!success) {
            revert Raffle__TransferFailed();
        }

        s_raffleState = RaffleState.OPEN;
        s_participants = new address payable[](0);
        s_lastTimeStamp = block.timestamp;

        emit WinnerPicked(s_lastWinner);
    }

    function getEntranceFee() external view returns (uint256) {
        return i_entranceFee;
    }

    function getParticipants()
        external
        view
        returns (address payable[] memory)
    {
        return s_participants;
    }

    function getLastWinner() external view returns (address payable) {
        return s_lastWinner;
    }

    function getRaffleState() external view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumberOfParticipants() external view returns (uint256) {
        return s_participants.length;
    }

    function getLatestTimeStamp() external view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getInterval() external view returns (uint256) {
        return i_interval;
    }

    function getSubscriptionId() external view returns (uint64) {
        return i_subscriptionId;
    }
}
