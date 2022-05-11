const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { interface, bytecode } = require('../compile');


const web3 = new Web3(ganache.provider());
let accounts;
let lottery;
let manager;


beforeEach(async ()=>{
  //Get list of all accounts
  accounts = await web3.eth.getAccounts();
  manager = accounts[0];

  // Deploy contract with one of the created accounts
  lottery = await new web3.eth.Contract(JSON.parse(interface))
  .deploy({data: bytecode})
  .send({from: manager, gas: '1000000'});
});

describe('Lottery', () => {
  it('deploys a contract', () => {

    assert.ok(lottery.options.address);

  });

  it('manager address is set as deployment account address', async() => {
    let contractManager = await lottery.methods.manager().call();

    assert.equal(contractManager, manager);

  });

  it('one player can enter lottery', async() => {
    player = accounts[1];
    await lottery.methods.enterLottery().send({
        from: player,
        value: web3.utils.toWei("0.02", "ether")
      });

    let lotteryPlayers = await lottery.methods.getLotteryPlayer().call();

    assert.equal(lotteryPlayers[0], player);
    assert.equal(1, lotteryPlayers.length);

  });

  it('multiple players can enter lottery', async() => {
    player1 = accounts[1];
    player2 = accounts[2];
    player3 = accounts[3];

    await lottery.methods.enterLottery().send({
        from: player1,
        value: web3.utils.toWei("0.02", "ether")
      });

    await lottery.methods.enterLottery().send({
      from: player2,
      value: web3.utils.toWei("0.02", "ether")
    });

    await lottery.methods.enterLottery().send({
      from: player3,
      value: web3.utils.toWei("0.02", "ether")
    });

    let lotteryPlayers = await lottery.methods.getLotteryPlayer().call();

    assert.equal(lotteryPlayers[0], player1);
    assert.equal(lotteryPlayers[1], player2);
    assert.equal(lotteryPlayers[2], player3);
    assert.equal(3, lotteryPlayers.length);

  });


  it('amount paid by players to enter lottery must not be less than min amount', async() => {
      player1 = accounts[1];

      try{
         await lottery.methods.enterLottery().send({
            from: player1,
            value: web3.utils.toWei("0.001", "ether")
          });
          assert(false);
      }catch (err){
        assert(err);
      }

    let lotteryPlayers = await lottery.methods.getLotteryPlayer().call();

    assert.equal(0, lotteryPlayers.length);

  });


  it('only manager can call pick winner', async() => {
      player1 = accounts[1];
      try{
         await lottery.methods.pickWinner().send({
            from: player1
          });
          assert(false);
      }catch (err){
        assert(err);
      }
  });

  it('pick winner reset lottery', async() => {
    player1 = accounts[1];
    const player1_balance_before_entering_lottery = await web3.eth.getBalance(player1);

    await lottery.methods.enterLottery().send({
       from: player1,
       value: web3.utils.toWei("2", "ether")
     });

     const player1_balance_after_entering_lottery = await web3.eth.getBalance(player1);

    await lottery.methods.pickWinner().send({
      from: manager
    });

    const player1_balance_at_the_end_of_lottery = await web3.eth.getBalance(player1);

    let difference = player1_balance_after_entering_lottery - player1_balance_at_the_end_of_lottery;


    let lotteryPlayers = await lottery.methods.getLotteryPlayer().call();

    assert.equal(0, lotteryPlayers.length);

    assert(player1_balance_before_entering_lottery >= player1_balance_at_the_end_of_lottery);

    assert(difference < web3.utils.toWei('1.8', 'ether'));

  });



});
