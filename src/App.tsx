import React, { useState } from "react";
import { TezosToolkit } from "@taquito/taquito";
import "./App.css";
import ConnectButton from "./components/ConnectWallet";
import DisconnectButton from "./components/DisconnectWallet";
import qrcode from "qrcode-generator";
import Votes from "./components/Transfers";
import Results from "./components/UpdateContract";

enum BeaconConnection {
  NONE = "",
  LISTENING = "Listening to P2P channel",
  CONNECTED = "Channel connected",
  PERMISSION_REQUEST_SENT = "Permission request sent, waiting for response",
  PERMISSION_REQUEST_SUCCESS = "Wallet is connected"
}

const App = () => {
  const [Tezos, setTezos] = useState<TezosToolkit>(
    new TezosToolkit("https://hangzhounet.api.tez.ie")
    );
    const [contract, setContract] = useState<any>(undefined);
    const [publicToken, setPublicToken] = useState<string | null>("");
    const [wallet, setWallet] = useState<any>(null);
    const [userAddress, setUserAddress] = useState<string>("");
    const [userBalance, setUserBalance] = useState<number>(0);
    const [storage, setStorage] = useState<number>(0);
    const [copiedPublicToken, setCopiedPublicToken] = useState<boolean>(false);
    const [beaconConnection, setBeaconConnection] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>("vote");
    
    // Hangzhounet Increment/Decrement contract
    const contractAddress: string = "KT1AQGUvyioqPeoJsez6Vm78Bybe2pA6Jaib";
    
    const generateQrCode = (): { __html: string } => {
      const qr = qrcode(0, "L");
      qr.addData(publicToken || "");
      qr.make();
      
      return { __html: qr.createImgTag(4) };
    };
    
    if (publicToken && (!userAddress || isNaN(userBalance))) {
      return (
        <div className="main-box">
        <h1>Wallet connection</h1>
        <div id="dialog">
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
            <div id="footer">
            <img src="built-with-taquito.png" alt="Built with Taquito" />
            </div>
            </div>
            );
          }
          else if (userAddress && !isNaN(userBalance)) {
            return (
              <div className="main-box">
              <h1>Welcome</h1>
              <div id="tabs">
              <div
              id="vote"
              className={activeTab === "vote" ? "active" : ""}
              onClick={() => setActiveTab("vote")}
              >
              Make a vote
              </div>
              <div
              id="result"
              className={activeTab === "result" ? "active" : ""}
              onClick={() => setActiveTab("result")}
              >
              See results
              </div>
              </div>
              <div id="dialog">
              <div id="content">
              {activeTab === "vote" ? (
                <div id="votes">
                <h3 className="text-align-center">Make a vote</h3>
                <Votes
                Tezos={Tezos}
                setUserBalance={setUserBalance}
                userAddress={userAddress}
                />
                </div>
                ) : (
                  <div id="increment-decrement">
                  <h3 className="text-align-center">
                  Current counter: <span>{storage}</span>
                  </h3>
                  <Results
                  contract={contract}
                  setUserBalance={setUserBalance}
                  Tezos={Tezos}
                  userAddress={userAddress}
                  setStorage={setStorage}
                  />
                  </div>
                  )}
                  <p>
                  <i className="far fa-file-code"></i>&nbsp;
                  <a
                  href={`https://better-call.dev/hangzhounet/${contractAddress}/operations`}
                  target="_blank"
                  rel="noopener noreferrer"
                  >
                  {contractAddress}
                  </a>
                  </p>
                  <p>
                  <i className="far fa-address-card"></i>&nbsp; {userAddress}
                  </p>
                  <p>
                  <i className="fas fa-piggy-bank"></i>&nbsp;
                  {(userBalance / 1000000).toLocaleString("en-US")} ꜩ
                  </p>
                  </div>
                  <DisconnectButton
                  wallet={wallet}
                  setPublicToken={setPublicToken}
                  setUserAddress={setUserAddress}
                  setUserBalance={setUserBalance}
                  setWallet={setWallet}
                  setTezos={setTezos}
                  setBeaconConnection={setBeaconConnection}
                  />
                  </div>
                  <div id="footer">
                  <img src="built-with-taquito.png" alt="Built with Taquito" />
                  </div>
                  </div>
                  );
                } 
                else if (!publicToken && !userAddress && !userBalance) {
                  return (
                    <div className="main-box">
                    <div className="title">
                    <h1>Delegator Votes</h1>
                    <a href="https://www.marigold.dev/">
                    <img
                    height={50}
                    src="https://uploads-ssl.webflow.com/616ab4741d375d1642c19027/61793ee65c891c190fcaa1d0_Vector(1).png"
                    alt="marigold-button"
                    />
                    </a>
                    </div>
                    <div id="dialog">
                    <header>Welcome to Marigold Delegator Votes App!</header>
                    <div id="content">
                    <p>Dapp for delegators to vote on Tezos governance</p>
                    <p><b>NB : Baker = Delegate</b></p>
                    <div>
                    Goal is for delegates to understand what delegators want and avoid just choosing "Pass" or vote against the crowd. It is also a lack of trust on the other direction, many delegators don't find easily if a delegate votes on same alignment.
                    <br/>
                    This app :
                    <ul>
                    <li>registers delegator votes for a specific Amendment process. There are 3 votes phases :</li>
                    <ul>
                    <li>Proposal</li>
                    <li>Exploratory</li>
                    <li>Promotion</li>
                    </ul> 
                    <li>aggregates vote per delegate and display chart. Goal : Fast choice selection</li>
                    <li>keeps rating score per delegates (history of aligned votes delegates vs delegators). Goal : For delegators to choose a delegate of same affinity</li>
                    </ul>
                    <br/>
                    Delegator votes are only visible and updated by itself.
                    Only delegate, can see an aggregate view of its own delegator votes.
                    Votes can be updated only during the vote phases
                    </div>
                    
                    <p>First of all, identify yourself with your wallet : </p>
                    </div>
                    <ConnectButton
                    Tezos={Tezos}
                    setContract={setContract}
                    setPublicToken={setPublicToken}
                    setWallet={setWallet}
                    setUserAddress={setUserAddress}
                    setUserBalance={setUserBalance}
                    setStorage={setStorage}
                    contractAddress={contractAddress}
                    setBeaconConnection={setBeaconConnection}
                    wallet={wallet}
                    />
                    </div>
                    <div id="footer">
                    <img src="built-with-taquito.png" alt="Built with Taquito" />
                    </div>
                    </div>
                    );
                  }
                  else {
                    return <div>An error has occurred</div>;
                  }
                };
                
                export default App;
                