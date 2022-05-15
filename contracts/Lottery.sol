pragma solidity ^0.4.17;

contract Lottery{

    address public manager;
    address public lastLotteryWinner;
    address[] public players;
    uint public minAmountToEnterLottery = .01 ether;


    modifier restricted(){
        require(manager == msg.sender);
        _;
    }

    function Lottery() public {
        manager = msg.sender;
    }

    function enterLottery() public payable{
        require(msg.value >= minAmountToEnterLottery);
        players.push(msg.sender);
    }

    function getLotteryPlayer() public view returns (address[]){
        return players;
    }


    function random() private view returns (uint){
        return uint(keccak256(block.difficulty, now, players));
    }

    function pickWinner() public restricted{
        uint winnerIndex = 0;
        lastLotteryWinner = players[winnerIndex];
        lastLotteryWinner.transfer(this.balance);
        players = new address[](0);

    }

    function getWinnerFromPrevLottery() public view returns(address){
      return lastLotteryWinner;
    }

}
