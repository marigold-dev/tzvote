import React, { useState } from "react";
import { TezosToolkit } from "@taquito/taquito";
import "./App.css";
import ConnectButton from "./components/ConnectWallet";
import DisconnectButton from "./components/DisconnectWallet";
import qrcode from "qrcode-generator";
import Search from "./components/Search";
import Create from "./components/Create";
import Popup from 'reactjs-popup';

enum BeaconConnection {
  NONE = "",
  LISTENING = "Listening to P2P channel",
  CONNECTED = "Channel connected",
  PERMISSION_REQUEST_SENT = "Permission request sent, waiting for response",
  PERMISSION_REQUEST_SUCCESS = "Wallet is connected"
}

const votingTemplateAddress : string = "KT1AYExp5VgnG1kQdkTa7mZmqHnj8cwVnZ7v";
const votingPeriodOracle : string = "KT1GLuqbSEoaRb3GE4UtUgGkDukVS766V53A";

const App = () => {
  const [Tezos, setTezos] = useState<TezosToolkit>(
    new TezosToolkit("https://hangzhounet.api.tez.ie")
    );
    const [publicToken, setPublicToken] = useState<string | null>("");
    const [wallet, setWallet] = useState<any>(null);
    const [userAddress, setUserAddress] = useState<string>("");
    const [userBalance, setUserBalance] = useState<number>(0);
    const [userRolls, setUserRolls] = useState<number>(0);
    const [copiedPublicToken, setCopiedPublicToken] = useState<boolean>(false);
    const [beaconConnection, setBeaconConnection] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>("search");
    
    
    const generateQrCode = (): { __html: string } => {
      const qr = qrcode(0, "L");
      qr.addData(publicToken || "");
      qr.make();
      
      return { __html: qr.createImgTag(4) };
    };
    
    if (publicToken && (!userAddress || isNaN(userBalance))) {
      return (
        <div className="main-box-login">
        <div className="title"><h1>Wallet connection</h1></div>
        <div id="dialog-login">
        <header>Please connect</header>
        <div id="content">
        <p className="text-align-center">
        <i className="fas fa-broadcast-tower"></i>&nbsp; Connecting to
        your wallet
        </p>
        <div
        dangerouslySetInnerHTML={generateQrCode()}
        className="text-align-center"
        ></div>
        <p id="public-token">
        {copiedPublicToken ? (
          <span id="public-token-copy__copied">
          <i className="far fa-thumbs-up"></i>
          </span>
          ) : (
            <span
            id="public-token-copy"
            onClick={() => {
              if (publicToken) {
                navigator.clipboard.writeText(publicToken);
                setCopiedPublicToken(true);
                setTimeout(() => setCopiedPublicToken(false), 2000);
              }
            }}
            >
            <i className="far fa-copy"></i>
            </span>
            )}
            
            <span>
            Public token: <span>{publicToken}</span>
            </span>
            </p>
            <p className="text-align-center">
            Status: {beaconConnection ? "Connected" : "Disconnected"}
            </p>
            </div>
            </div>
            <div id="footer-login">
            <img src="built-with-taquito.png" alt="Built with Taquito" />
            </div>
            </div>
            );
          }
          else if (userAddress && !isNaN(userBalance)) {
            return (
              
              
              <div className="main-box">
              <div id="header"> 
              <div className="column">Marigold Voting app</div> 
              
              <div id="tabs" className="column">
              <div
              id="search"
              className={activeTab === "search" ? "active" : ""}
              onClick={() => setActiveTab("search")}
              >
              Search
              </div>
              <div
              id="create"
              className={activeTab === "create" ? "active" : ""}
              onClick={() => setActiveTab("create")}
              >
              Create
              </div>
              </div>
              
              <div className="column-right"> 
              <Popup trigger={<i className="far fa-user"></i>} position="bottom right">
              <p>
              <i className="far fa-address-card"></i>&nbsp; {userAddress}
              </p>
              <p>
              <i className="fas fa-piggy-bank"></i>&nbsp;
              {(userBalance / 1000000).toLocaleString("en-US")} ꜩ
              </p>
              <p>
              <i className="fas fa-bolt"></i>&nbsp;
              {userRolls} rolls
              </p>
              <hr></hr>
              <DisconnectButton
              wallet={wallet}
              setPublicToken={setPublicToken}
              setUserAddress={setUserAddress}
              setUserBalance={setUserBalance}
              setUserRolls={setUserRolls}
              setWallet={setWallet}
              setTezos={setTezos}
              setBeaconConnection={setBeaconConnection}
              />
              </Popup>
              
              </div>
              
              </div>
              <div id="dialog">
              <div id="content">
              {activeTab === "search" ? (
                <div id="search">
                <h3 className="text-align-center">Search voting sessions</h3>
                <Search
                Tezos={Tezos}
                userAddress={userAddress}
                votingTemplateAddress={votingTemplateAddress}
                />
                </div>
                ) : (
                  <div id="increment-decrement">
                  <h3 className="text-align-center">
                  Create new voting session
                  </h3>
                  <Create
                  Tezos={Tezos}
                  userAddress={userAddress}
                  votingPeriodOracle={votingPeriodOracle}
                  wallet={wallet}
                  setActiveTab={setActiveTab}
                  />
                  </div>
                  )}
                  </div>
                  
                  </div>
                  <div id="footer">
                  </div>
                  </div>
                  
                  );
                } 
                else if (!publicToken && !userAddress && !userBalance) {
                  return (
                    <div className="main-box-login">
                    <div className="title">
                    <h1> Marigold Voting App</h1>
                    <a href="https://www.marigold.dev/">
                    <img
                    height={50}
                    src="https://uploads-ssl.webflow.com/616ab4741d375d1642c19027/61793ee65c891c190fcaa1d0_Vector(1).png"
                    alt="marigold-button"
                    />
                    </a>
                    
                    
                    </div>
                    
                    <div id="dialog-login">
                    <header>Welcome</header>
                    <div id="content">
                    <p>This DApp allows Tz owners to create, edit and remove voting sessions.</p>
                    
                    <div>
                    Voting session journey :
                    <ol>
                    <li>Login : use below button to connect to your wallet</li>
                    <li>On Search page and select your voting session. Vote on it. See Result to display the chart and details</li>
                    <li>On Create page, create a new voting session : </li>
                    <ol>
                    <li>Choose your vote template (as of today only 1 template available : 1 Question, n Choices, 1 Answer)</li>
                    <li>Enter basic settings : title, dates,etc ...</li>
                    <li>Click on Create button to deploy the smartcontract on Tezos</li>
                    </ol>
                    </ol>
                    
                    </div>
                    
                    </div>
                    <ConnectButton
                    Tezos={Tezos}
                    setPublicToken={setPublicToken}
                    setWallet={setWallet}
                    setUserAddress={setUserAddress}
                    setUserBalance={setUserBalance}
                    setUserRolls={setUserRolls}
                    setBeaconConnection={setBeaconConnection}
                    wallet={wallet}
                    />
                    </div>
                    <div id="footer-login">
                    Copyright Marigold 2022
                    </div>
                    </div>
                    );
                  }
                  else {
                    return <div>An error has occurred</div>;
                  }
                };
                
                export default App;
                