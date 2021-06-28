import { Tabs, Tab } from 'react-bootstrap'
import dBank from './dBank.json'
import React, { Component } from 'react';
import Token from './Token.json';

// import Web3 from 'web3';
import { ethers, Contract } from 'ethers';
import './App.css';

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {

    //check if MetaMask exists
    // console.log('window.ethereum: ', window.ethereum);
    if(typeof window.ethereum !== 'undefined'){

      await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      const dbank = new Contract(
        dBank.address,
        dBank.abi,
        signer
      );
      const token = new Contract(
        Token.address,
        Token.abi,
        signer
      );

        this.setState({token, dbank})


// // ethers
// // pass a provider when initiating a contract for read only queries
// const contract = new ethers.Contract(contractAddress, abi, provider);
// const value = await contract.getValue();


// // pass a signer to create a contract instance for state changing operations
// const contract = new ethers.Contract(contractAddress, abi, signer);
// const tx = await contract.changeValue(33);

// // wait for the transaction to be mined
// const receipt = await tx.wait();


    } else {
      window.alert('Please install Metamask');
    }

      //check if account is detected, then load balance&setStates, elsepush alert

      //in try block load contracts

    //if MetaMask not exists push alert
  }

  async deposit(amount) {
    //check if this.state.dbank is ok
    if(this.state.dbank!=='undefined') {
      try {
        //in try block call dBank deposit();
        // let res = await this.state.dbank.methods.deposit().send({value: amount.toString(), from: this.state.account})        

        console.log(amount.toString())
        let overrides = {
          // To convert Ether to Wei:
          // value: ethers.utils.parseEther(amount.toString())     // ether in this case MUST be a string
          value: ethers.utils.parseEther(amount.toString()),
          // value: ethers.utils.parseEther("0.0011"), //sending one ether  
          // gasLimit: 3000000 //optional          // value: 1234   // Note that using JavaScript numbers requires they are less than Number.MAX_SAFE_INTEGER
          // nonce:  
          // value: "1234567890"
          // value: "0x1234"
      
          // Or, promises are also supported:
          // value: provider.getBalance(addr)
      };
        const tx = await this.state.dbank.deposit(overrides);

        // // wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log(receipt);

        // console.log(res);
      } catch(e) {
        console.log(e);
      }

    }
  }

  async withdraw(e) {
    //prevent button from default click
    e.preventDefault()
    //check if this.state.dbank is ok
    if(this.state.dbank!=='undefined') {
      try {
        //in try block call dBank deposit();
        // let res = await this.state.dbank.methods.withdraw().send({from: this.state.account})

        const tx = await this.state.dbank.withdraw();
        const receipt = await tx.wait();
        console.log(receipt);
        // console.log(res);
      } catch(e) {
        console.log(e);
      }

    } else {
      window.alert("Error dbank undefined")
    }

    //in try block call dBank withdraw();
  }

  async borrow(amount) {
    if(this.state.dbank!=='undefined'){
      try{
        let res = await this.state.dbank.methods.borrow().send({value: amount.toString(), from: this.state.account});
        console.log(res);
      } catch (e) {
        console.log('Error, borrow: ', e)
      }
    }
  }

  async payOff(e) {
    e.preventDefault()
    if(this.state.dbank!=='undefined'){
      try{
        const collateralEther = await this.state.dbank.methods.collateralEther(this.state.account).call({from: this.state.account})
        const tokenBorrowed = collateralEther/2
        let approve = await this.state.token.methods.approve(this.state.dBankAddress, tokenBorrowed.toString()).send({from: this.state.account})
        console.log('approve', approve);
        let payoff = await this.state.dbank.methods.payOff().send({from: this.state.account});
        console.log('payoff', payoff);
      } catch(e) {
        console.log('Error, pay off: ', e)
      }
    }
  }


  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      networkId: null,
      dbank: null,
      balance: 0,
      dBankAddress: null,
      signerAddress: null
    }
  }

  render() {
    console.log("state: ", this.state);
    return (
      <div className='text-monospace'>
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1>Welcome to dBank</h1>
          <h2>{this.state.account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                {/*add Tab deposit*/}
                <Tab eventKey="deposit" title="Deposit">
                  <div>
                    <br />
                    How much do you want to deposit ?
                    <br />
                    (min amount is 0.1 ETH)
                    <br />
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      let amount = this.depositAmount.value;
                      this.deposit(amount);
                    }}>
                      <div className="form-group mr-sm-2">
                        <br />
                        <input
                          id="depositAmount"
                          type="number"
                          step="0.001" 
                          placeholder="amount..."
                          required
                          ref={(input) => {this.depositAmount = input}}
                        />                        
                      </div>
                      <button type="submit" className="btn btn-primary">DEPOSIT</button>
                    </form>
                  </div>
                </Tab>
                {/*add Tab withdraw*/}
                <Tab eventKey="withdraw" title="Withdraw">
                  <div>
                    <br />
                    Do you want to withdraw and take interests ?
                    <br />
                    <br />
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      onClick={
                        (e) => this.withdraw(e)
                      }
                    >
                      WITHDRAW
                    </button>
                  </div>
                </Tab>
                <Tab eventKey="borrow" title="Borrow">
                  <div>

                  <br></br>
                    Do you want to borrow tokens?
                    <br></br>
                    (You'll get 50% of collateral, in Tokens)
                    <br></br>
                    Type collateral amount (in ETH)
                    <br></br>
                    <br></br>
                    <form onSubmit={(e) => {

                      e.preventDefault()
                      let amount = this.borrowAmount.value
                      amount = amount * 10 **18 //convert to wei
                      this.borrow(amount)
                    }}>
                      <div className='form-group mr-sm-2'>
                        <input
                          id='borrowAmount'
                          step="0.01"
                          type='number'
                          ref={(input) => { this.borrowAmount = input }}
                          className="form-control form-control-md"
                          placeholder='amount...'
                          required />
                      </div>
                      <button type='submit' className='btn btn-primary'>BORROW</button>
                    </form>
                  </div>
                </Tab>
                <Tab eventKey="payOff" title="Payoff">
                  <div>

                  <br></br>
                    Do you want to payoff the loan?
                    <br></br>
                    (You'll receive your collateral - fee)
                    <br></br>
                    <br></br>
                    <button type='submit' className='btn btn-primary' onClick={(e) => this.payOff(e)}>PAYOFF</button>
                  </div>
                </Tab>                
              </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;