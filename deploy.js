require('dotenv').config({path: __dirname + '/.env'});

const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const mnemonic = process.env['ACC_MNEMONIC'];
const rinkeby_network = process.env['RINKEBY_NETWORK'];

const provider = new HDWalletProvider(mnemonic, rinkeby_network);
const web3 = new Web3(provider);



const deploy = async () => {

  accounts = await web3.eth.getAccounts();

  const lottery = await new web3.eth.Contract(JSON.parse(interface))
  .deploy({data: bytecode})
  .send({from: accounts[0], gas: '1000000'});

  console.log("interface ABI", interface);
  console.log("Contract address", lottery.options.address);

  provider.engine.stop();
}

deploy();
