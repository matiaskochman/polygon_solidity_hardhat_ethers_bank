// import { tokens, ether, ETHER_ADDRESS, EVM_REVERT, wait } from '../helpers'

const ETHER_ADDRESS = require('../helpers').ETHER_ADDRESS;
const EVM_REVERT = require('../helpers').EVM_REVERT;
const ether = require('../helpers').ether;
const wait = require('../helpers').wait;
const tokens = require('../helpers').tokens;

// const Token = artifacts.require('./Token')
// const DecentralizedBank = artifacts.require('./dBank')
const Token = artifacts.require('./Token')
const DecentralizedBank = artifacts.require('./dBank')


require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('dBank', ([deployer, user]) => {
  let dbank, token
  // const interestPerSecond = 31668017 //(10% APY) for min. deposit (0.01 ETH)
  const interestPerSecond = 31688087800; //(10% APY) for min. deposit (0.01 ETH)

  beforeEach(async () => {
    token = await Token.new()
    dbank = await DecentralizedBank.new(token.address)
    await token.passMinterRole(dbank.address, {from: deployer})
  })

  describe('testing token contract...', () => {
    describe('success', () => {
      it('checking token name', async () => {
        expect(await token.name()).to.be.eq('Descentralized Bank Currency')
      })

      it('checking token symbol', async () => {
        expect(await token.symbol()).to.be.eq('DBC')
      })

      it('checking token initial total supply', async () => {
        expect(Number(await token.totalSupply())).to.eq(0)
      })

      it('dBank should have Token minter role', async () => {
        expect(await token.minter()).to.eq(dbank.address)
      })
    })

    describe('failure', () => {
      it('passing minter role should be rejected', async () => {
        await token.passMinterRole(user, {from: deployer}).should.be.rejectedWith(EVM_REVERT)
      })

      it('tokens minting should be rejected', async () => {
        await token.mint(user, '1', {from: deployer}).should.be.rejectedWith(EVM_REVERT) //unauthorized minter
      })
    })
  })

  describe('testing deposit...', () => {
    let balance

    describe('success', () => {
      beforeEach(async () => {
        await dbank.deposit({value: 10**16, from: user}) //0.01 ETH
      })

      it('balance should increase', async () => {
        expect(Number(await dbank.etherBalanceOf(user))).to.eq(10**16)
      })

      it('deposit time should > 0', async () => {
        expect(Number(await dbank.depositStart(user))).to.be.above(0)
      })

      it('deposit status should eq true', async () => {
        expect(await dbank.isDeposited(user)).to.eq(true)
      })
    })

    describe('failure', () => {
      it('depositing should be rejected', async () => {
        await dbank.deposit({value: 10**15, from: user}).should.be.rejectedWith(EVM_REVERT) //to small amount
      })
    })
  })

  describe('testing withdraw...', () => {
    let balance
    let balance1
    describe('success', () => {

      beforeEach(async () => {
        await dbank.deposit({value: 10**16, from: user}) //0.01 ETH

        await wait(2) //accruing interest

        balance = await web3.eth.getBalance(user)

        // balance1 = Number(await token.balanceOf(user))
        // console.log('balance1: ', balance1);
        // console.log('balance2: ', balance1);

        await dbank.withdraw({from: user})
      })

      it('balances should decrease', async () => {
        expect(Number(await web3.eth.getBalance(dbank.address))).to.eq(0)
        expect(Number(await dbank.etherBalanceOf(user))).to.eq(0)
      })

      it('user should receive ether back', async () => {
        expect(Number(await web3.eth.getBalance(user))).to.be.above(Number(balance))
      })

      it('user should receive proper amount of interest', async () => {
        //time synchronization problem make us check the 1-3s range for 2s deposit time
        balance = Number(await token.balanceOf(user))
        console.log('balance: ', balance);
        expect(balance).to.be.above(0)
        // const res = balance % interestPerSecond;
        // console.log('balance_interestPerSecond: ', res)
        // expect(balance%interestPerSecond).to.eq(0)
        expect(balance).to.be.below(interestPerSecond*4)
      })

      it('depositer data should be reseted', async () => {
        expect(Number(await dbank.depositStart(user))).to.eq(0)
        expect(Number(await dbank.etherBalanceOf(user))).to.eq(0)
        expect(await dbank.isDeposited(user)).to.eq(false)
      })
    })

    describe('failure', () => {
      it('withdrawing should be rejected', async () =>{
        await dbank.deposit({value: 10**16, from: user}) //0.01 ETH
        await wait(2) //accruing interest
        await dbank.withdraw({from: deployer}).should.be.rejectedWith(EVM_REVERT) //wrong user
      })
    })
  })
})