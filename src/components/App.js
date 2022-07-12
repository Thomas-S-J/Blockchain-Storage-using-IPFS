import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import image from '../assets/file_upload.jpg'
import Meme from '../abis/Meme.json'
//import { create } from 'ipfs-http-client'

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({host: 'ipfs.infura.io', port: 5001, protocol: 'https'})

class App extends Component {
  
async componentWillMount(){
  await this.loadWeb3()
  await this.loadBlockChainData()
}

//Get the account
//Get the network
//Get the smart Contract
// ----> ABI
// ----> Address
//Get Meme Hash
async loadBlockChainData(){
  const web3 = window.web3
  const accounts = await web3.eth.getAccounts()
  this.setState({account: accounts[0]})
  const networkId = await web3.eth.net.getId()
  const networkData = Meme.networks[networkId]
  if(networkData){
    //Fetch contract
    const abi = Meme.abi
    const address = networkData.address
    const contract = new web3.eth.Contract(abi, address)
    this.setState({contract})
    const memeHash = await contract.methods.get().call()
    this.setState({memeHash})
  }else{
    window.alert('Smart Contract not deployed to detected network!')
  }
  console.log(networkId)
}
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      buffer: null,
      contract: null,
      memeHash: 'QmPAXmygc4PqrWEWeXheVVU3ntzhfefxYvk34trvPnymFt'
    };
  }

async loadWeb3(){
  if(window.ethereum){
    window.web3 = new Web3(window.ethereum)
    await window.ethereum.enable()
  }if(window.web3){
    window.web3 = new Web3(window.web3.currentProvider)
  }else{
    window.alert('Please use metamask')
  }
}

  captureFile = (event) => {
    event.preventDefault()
    console.log('file captured !!')
    //process file for IPFS
    const file = event.target.files[0]
    const reader = new window.FileReader()
    //allows to asynchronously read file objects
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
    }
  }

  onSubmit = async(event) => {
    event.preventDefault()
    console.log("Submitting the form...")
    await ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      const memeHash = result[0].hash
      this.setState({memeHash})
      if(error){
        console.error(error)
        return
      }
      //do stuff here
      this.state.contract.methods.set(memeHash).send({from: this.state.account}).then((r)=>{
        this.setState({memeHash})
      })
    })
  }
  
  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
            File Manager using Blockchain
            <ul className="navbar-nav px-3">
              <li className='nav-item text-nowrap d-none d-sm-none d-sm-block'>
                <small className='text-white'>{this.state.account}</small>
              </li>
            </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                  <img src={`https://ipfs.infura.io/ipfs/${this.state.memeHash}`} />
                <p>&nbsp;</p>
                <h2>Add File</h2>
                <form onSubmit={this.onSubmit} >
                  <input type='file' onChange={this.captureFile} />
                  <input type='submit' />  
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;