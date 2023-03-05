import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import './App.css'
import { Navbar } from './components/layout/navbar/Navbar'
import Footer from './components/layout/footer/Footer'
import HomeGallery from './components/home-container/gallery/HomeGallery'
import Profile from './components/home-container/profile/Profile'
import CreateProfile from './components/create-profile/CreateProfile'
import DonateNFT from './components/donate-nft copy/DonateNFT'
import CreateLinks from './components/create-links/CreateLinks'
import MyProfile from './components/home-container/myprofile/MyProfile'
import Notifications from './components/notifications/Notifications'
import Web3Modal from 'web3modal'
import UAuth from '@uauth/js'
import ABI from './artifacts/contracts/CommunityPets.sol/CommunityPets.json'
import ABIHyperSpaceDeployed from './artifacts/contracts/CommunityPets.sol/CommunityPetsHyperSpaceDeployed.json'
import ABIMantleDeployed from './artifacts/contracts/CommunityPets.sol/CommunityPetsMantleDeployed.json'
import { Auth, useAuth } from '@arcana/auth-react'

const { ethers } = require('ethers')

function App() {
  const [currentAccount, setCurrentAccount] = useState('')
  const [contract, setContract] = useState(null)
  const [donateNfts, setDonateNfts] = useState(false)
  const [hasProfile, setHasProfile] = useState('')
  const [allProfiles, setAllProfiles] = useState([])
  const [selectedProfile, setSelectedProfile] = useState('')
  const [image, setImage] = useState('')
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [coverPhoto, setCoverPhoto] = useState('')
  const [userUD, setUserUD] = useState('')
  const [signer, setSigner] = useState(null)
  const [provider, setProvider] = useState(null)
  const [donateStream, setDonateStream] = useState(false)
  const [theme, setTheme] = useState('light')
  const [externalWallet, showExternalWallet] = useState(false)
  const auth = useAuth()

  const unstoppableInstance = new UAuth({
    clientID: '7848be70-c075-4f7f-af07-67e4e5eab717',
    redirectUri: 'https://pets-found-me.netlify.app/my-profile',
    scope: 'openid wallet',
  })

  const unstoppableLogin = async () => {
    const user = await unstoppableInstance.loginWithPopup()
    const ud = user.idToken.sub
    const walletAdd = user.idToken.wallet_address
    if (walletAdd) {
      setCurrentAccount(walletAdd)
      setUserUD(ud)
    }
  }

  const userLogOut = () => {
    localStorage.removeItem('user')
    setUserUD('')
  }

  const connectWallet = async () => {
    console.log('connectWallet')
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const address = await signer.getAddress()
    setProvider(provider)
    setSigner(signer)
    setCurrentAccount(address)

    // localStorage.setItem('currentAccountLocalStorage', address)

    // '0x16d7be29ebc6db2e9c92E0Bf1dE5c1cfe6b1AD2a',
    let contract = new ethers.Contract(
      '0x1aae17D2C4B5ea1b6cf4eeFC0D2f54bc5cD464cf',
      ABI.abi,
      signer,
    )
    setContract(contract)

    // hyperspace  0x71f5338032576962c55c31ED4cF4688D1a1c6b1A
    // Mantle  0x5AAf92530aCA44A63C06a7c014d7610BC7D2D9c7

    // const resHasPhase = await hasPhase(address)
    // setHasProfile(resHasPhase)
  }

  const disconnectWallet = async () => {
    localStorage.removeItem('currentAccountLocalStorage')
    setCurrentAccount('')
  }

  useEffect(() => {
    // const getAddress = localStorage.getItem('currentAccountLocalStorage')
    // setCurrentAccount(getAddress)
    // const getAllProfiles = displayAll()
    // setAllProfiles(getAllProfiles)
  }, [])

  //   category: "Medical"
  // creationDate: "Sep-09-2022"
  // fundraiserId: "0"

  const onLogin = () => {
    // Route to authenticated page
    console.log('auth', auth)
  }
  const quickNodeBalance = async () => {
    console.log('🚀 ~ file: App.js:103 ~ quickNodeBalance ~ quickNodeBalance')
    const provider = new ethers.providers.JsonRpcProvider(
      'https://methodical-magical-fog.matic-testnet.discover.quiknode.pro/8efb7f4c90d22891a8b6fb650c7307a01570e293/',
    )
    const balance = await provider.getBalance(
      '0x5Df598c222C4A7e8e4AB9f347dcBd924B6458382',
      'latest',
    )
    console.log('🚀 ~ file: App.js:111 ~ quickNodeBalance ~ balance', balance)

    const res = balance.toString() / 10 ** 18
    console.log('🚀 ~ file: App.js:114 ~ quickNodeBalance ~ res', res)
  }

  const getTransactions = async () => {
    console.log('🚀 ~ file: App.js:118 ~ getTransactions ~ getTransactions')
    const provider = new ethers.providers.JsonRpcProvider(
      'https://methodical-magical-fog.matic-testnet.discover.quiknode.pro/8efb7f4c90d22891a8b6fb650c7307a01570e293/',
    )
    const txCount = await provider.getTransactionCount(
      '0x1aae17D2C4B5ea1b6cf4eeFC0D2f54bc5cD464cf',
      'latest',
    )
    console.log('txCount', txCount)
  }

  return (
    <Router>
      <div className="cl">
        <Navbar
          unstoppableLogin={unstoppableLogin}
          userUD={userUD}
          connectWallet={connectWallet}
          currentAccount={currentAccount}
          disconnectWallet={disconnectWallet}
          hasProfile={hasProfile}
          quickNodeBalance={quickNodeBalance}
          getTransactions={getTransactions}
          auth={auth}
        />
        <div>
          {auth.loading ? (
            'Loading'
          ) : auth.isLoggedIn ? (
            ''
          ) : (
            <div>
              <Auth externalWallet={true} theme={'light'} onLogin={onLogin} />
            </div>
          )}
        </div>

        <Route exact path="/">
          <HomeGallery
            allProfiles={allProfiles}
            setSelectedProfile={setSelectedProfile}
            contract={contract}
            connectWallet={connectWallet}
          />
        </Route>

        <Route exact path="/donate">
          <DonateNFT
            selectedProfile={selectedProfile}
            contract={contract}
            currentAccount={currentAccount}
            donateNfts={donateNfts}
            provider={provider}
            signer={signer}
            donateStream={donateStream}
          />
        </Route>

        <Switch>
          <Route exact path="/notifications" component={Notifications} />

          <Route path="/create">
            <CreateProfile
              currentAccount={currentAccount}
              contract={contract}
            />
          </Route>

          <Route path="/create-links">
            <CreateLinks
              currentAccount={currentAccount}
              image={image}
              title={title}
              bio={bio}
              coverPhoto={coverPhoto}
            />
          </Route>

          <Route path="/profile/details/:userAddress">
            <Profile
              selectedProfile={selectedProfile}
              currentAccount={currentAccount}
              setDonateNfts={setDonateNfts}
              provider={provider}
              signer={signer}
              setDonateStream={setDonateStream}
            />
          </Route>
          <Route path="/my-profile">
            <MyProfile
              selectedProfile={selectedProfile}
              currentAccount={currentAccount}
            />
          </Route>
        </Switch>
        <Footer />
      </div>
    </Router>
  )
}

export default App
