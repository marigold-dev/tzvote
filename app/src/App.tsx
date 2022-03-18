import React, { useEffect, useState } from "react";
import { TezosToolkit } from "@taquito/taquito";
import "./App.css";
import ConnectButton from "./components/ConnectWallet";
import DisconnectButton from "./components/DisconnectWallet";
import qrcode from "qrcode-generator";
import Search from "./components/Search";
import Create from "./components/Create";
import Popup from 'reactjs-popup';
import { NetworkType} from "@airgap/beacon-sdk";
import { VOTING_TEMPLATE } from "./contractutils/TezosContractUtils";
import { Button, ButtonGroup, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from "@mui/material";
import { ArrowDropDownCircleRounded } from "@mui/icons-material";


let votingTemplateAddresses : Map<VOTING_TEMPLATE,string> = new Map();
if(process.env["REACT_APP_TEMPLATE_ADDRESS_TEZOSTEMPLATE"])votingTemplateAddresses.set(VOTING_TEMPLATE.TEZOSTEMPLATE, ""+process.env["REACT_APP_TEMPLATE_ADDRESS_TEZOSTEMPLATE"]);else new Error('Env var REACT_APP_TEMPLATE_ADDRESS_TEZOSTEMPLATE is mandatory'); 
if(process.env["REACT_APP_TEMPLATE_ADDRESS_PERMISSIONEDSIMPLEPOLL"])votingTemplateAddresses.set(VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL, ""+process.env["REACT_APP_TEMPLATE_ADDRESS_PERMISSIONEDSIMPLEPOLL"]);else new Error('Env var REACT_APP_TEMPLATE_ADDRESS_PERMISSIONEDSIMPLEPOLL is mandatory'); 

const votingPeriodOracle : string = process.env["REACT_APP_ORACLE_ADDRESS"] || "KT1GLuqbSEoaRb3GE4UtUgGkDukVS766V53A";

const App = () => {
  const [Tezos, setTezos] = useState<TezosToolkit>(
    new TezosToolkit(process.env["REACT_APP_TEZOS_NODE"] ||"https://hangzhounet.tezos.marigold.dev")
    );
    const [publicToken, setPublicToken] = useState<string | null>("");
    const [wallet, setWallet] = useState<any>(null);
    const [userAddress, setUserAddress] = useState<string>("");
    const [userBalance, setUserBalance] = useState<number>(0);
    const [userRolls, setUserRolls] = useState<number>(0);
    const [copiedPublicToken, setCopiedPublicToken] = useState<boolean>(false);
    const [beaconConnection, setBeaconConnection] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>("search");
    const [firstTime, setFirstTime] = useState<boolean>(true);
    
    
    const generateQrCode = (): { __html: string } => {
      const qr = qrcode(0, "L");
      qr.addData(publicToken || "");
      qr.make();
      
      return { __html: qr.createImgTag(4) };
    };
    
    /**CREATE BUTTON SECTION */
    const createOptions = [VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL.name,VOTING_TEMPLATE.TEZOSTEMPLATE.name];
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = React.useState(1);
    
    const handleMenuItemClick = (index : number) => {
      setSelectedIndex(index);
      setOpen(false);
    };
    
    const handleToggle = () => {
      setOpen((prevOpen) => !prevOpen);
    };
    
    const handleClose = (event : MouseEvent | TouchEvent) => {
      if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
        return;
      }
      
      setOpen(false);
    };
    /** END OF CREATE BUTTON SECTION */
    
    
    
    /**
    * LANDING PAGE FIRST TIME
    *  */  
    //console.log("firstTime",firstTime,"publicToken",publicToken,"userAddress",userAddress,"userBalance",userBalance);
    let network = process.env["REACT_APP_NETWORK"]? NetworkType[process.env["REACT_APP_NETWORK"].toUpperCase() as keyof typeof NetworkType] : NetworkType.HANGZHOUNET;
    
    if (firstTime && (!publicToken || publicToken==null))
    return (
      <div className="main-box-login">
      {(network != NetworkType.MAINNET)?<div className="banner">WARNING: TEST ONLY {network}</div>:<span />}
      <div className="title">
      <div id="title">TzVote</div>
      </div>
      
      <div id="dialog-login">
      <header>Free voting Dapp</header>
      <div id="content-login">
      <div>
      Voting session journey :
      <div>
      <p>Login : connect to your wallet, or just skip and continue read only</p>
      <p>On Search page and select your voting session. Vote on it. Click on status icon to display the chart and details</p>
      <p>On Create page, create a new voting session from one of the templates : title, tezos voting period or dates, options</p>
      </div>
      
      </div>
      
      </div>
      
      <div className="buttons">
      <ConnectButton
      Tezos={Tezos}
      setPublicToken={setPublicToken}
      setWallet={setWallet}
      setUserAddress={setUserAddress}
      setUserBalance={setUserBalance}
      setUserRolls={setUserRolls}
      setBeaconConnection={setBeaconConnection}
      wallet={wallet}
      setFirstTime={setFirstTime}
      />
      </div>
      
      <div className="buttons">
      <Button sx={{marginTop:1}} variant="contained" onClick={()=>setFirstTime(false)}>
      Continue without wallet
      </Button>
      </div>
      
      </div>
      
      <div id="footer-login">
      Copyright Marigold 2022
      </div>
      </div>
      );
      /**
      * CONNECTION PAGE
      *  */      
      else if (firstTime && publicToken && (!userAddress || isNaN(userBalance))) {
        return (
          <div className="main-box-login">
          {(network != NetworkType.MAINNET)?<div className="banner">WARNING: TEST ONLY {network}</div>:<span />}
          <div className="title"><div id="title">Wallet connection</div></div>
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
            
            /**
            * HOME MAIN PAGE
            *  */       
            else if(!firstTime){
              
              return (
                <div className="main-box">
                {(network != NetworkType.MAINNET)?<div className="banner">WARNING: TEST ONLY {network}</div>:<span />}
                <div id="header"> 
                <div className="column-left"><img id="logo"
                src="https://uploads-ssl.webflow.com/616ab4741d375d1642c19027/61793ee65c891c190fcaa1d0_Vector(1).png"
                alt="marigold-button"
                /></div> 
                <div id="tabs" className="column">
                <Button  variant="contained" sx={{marginRight:2}}
                id="search"
                onClick={() => setActiveTab("search")}
                >
                Search
                </Button>
                
                {userAddress?
                  <React.Fragment>
                  <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
                  <Button className={activeTab === "create" ? "active" : ""} onClick={() => setActiveTab("create")}>{createOptions[selectedIndex]}</Button>
                  <Button
                  size="small"
                  aria-controls={open ? 'split-button-menu' : undefined}
                  aria-expanded={open ? 'true' : undefined}
                  aria-label="select merge strategy"
                  aria-haspopup="menu"
                  onClick={handleToggle}
                  >
                  <ArrowDropDownCircleRounded />
                  </Button>
                  </ButtonGroup>
                  <Popper
                  open={open}
                  anchorEl={anchorRef.current}
                  role={undefined}
                  transition
                  disablePortal
                  >
                  {({ TransitionProps, placement }) => (
                    <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin:
                      placement === 'bottom' ? 'center top' : 'center bottom',
                    }}
                    >
                    <Paper>
                    <ClickAwayListener  onClickAway={handleClose}>
                    <MenuList id="split-button-menu">
                    {createOptions.map((option, index) => (
                      <MenuItem
                      key={option}
                      disabled={index === 2}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(index)}
                      >
                      Create {option} voting template
                      </MenuItem>
                      ))}
                      </MenuList>
                      </ClickAwayListener>
                      </Paper>
                      </Grow>
                      )}
                      </Popper>
                      </React.Fragment>
                      : ""
                    }
                    
                    </div>
                    
                    <div className="column-right"> 
                    
                    { userAddress ? <Popup trigger={<i className="far fa-user"></i>} position="bottom right">
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
                    setActiveTab={setActiveTab}
                    />
                    </Popup>
                    :
                    <ConnectButton
                    Tezos={Tezos}
                    setPublicToken={setPublicToken}
                    setWallet={setWallet}
                    setUserAddress={setUserAddress}
                    setUserBalance={setUserBalance}
                    setUserRolls={setUserRolls}
                    setBeaconConnection={setBeaconConnection}
                    wallet={wallet}
                    setFirstTime={setFirstTime}
                    />
                  }
                  
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
                    userRolls={userRolls}
                    votingTemplateAddresses={votingTemplateAddresses}
                    beaconConnection={beaconConnection}
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
                      </div>
                      
                      );
                    } 
                    
                    else {
                      console.log("firstTime",firstTime,"publicToken",publicToken,"userAddress",userAddress,"userBalance",userBalance);
                      return "An error occured !"
                    }
                    
                  };
                  
                  export default App;
                  