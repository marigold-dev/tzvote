import React, { useState } from "react";
import { TezosToolkit } from "@taquito/taquito";
import "./App.css";
import ConnectButton from "./components/ConnectWallet";
import DisconnectButton from "./components/DisconnectWallet";
import qrcode from "qrcode-generator";
import Search from "./components/Search";
import CreateTezosTemplate from "./components/CreateTezosTemplate";
import Popup from 'reactjs-popup';
import { NetworkType} from "@airgap/beacon-sdk";
import { VOTING_TEMPLATE } from "./contractutils/TezosContractUtils";
import { Box , Button, ButtonGroup, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from "@mui/material";
import { AccountCircle, ArrowDropDownCircleRounded } from "@mui/icons-material";
import CreatePermissionedSimplePoll from "./components/CreatePermissionedSimplePoll";


let votingTemplateAddresses : Map<VOTING_TEMPLATE,string> = new Map();
if(process.env["REACT_APP_TEMPLATE_ADDRESS_TEZOSTEMPLATE"])votingTemplateAddresses.set(VOTING_TEMPLATE.TEZOSTEMPLATE, ""+process.env["REACT_APP_TEMPLATE_ADDRESS_TEZOSTEMPLATE"]);else new Error('Env var REACT_APP_TEMPLATE_ADDRESS_TEZOSTEMPLATE is mandatory'); 
if(process.env["REACT_APP_TEMPLATE_ADDRESS_PERMISSIONEDSIMPLEPOLL"])votingTemplateAddresses.set(VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL, ""+process.env["REACT_APP_TEMPLATE_ADDRESS_PERMISSIONEDSIMPLEPOLL"]);else new Error('Env var REACT_APP_TEMPLATE_ADDRESS_PERMISSIONEDSIMPLEPOLL is mandatory'); 

const votingPeriodOracle : string = process.env["REACT_APP_ORACLE_ADDRESS"] || "KT1GLuqbSEoaRb3GE4UtUgGkDukVS766V53A";

const App = () => {
  const [Tezos, setTezos] = useState<TezosToolkit>(
    new TezosToolkit(process.env["REACT_APP_TEZOS_NODE"]!)
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
    
    /**CREATE BUTTON SECTION */
    const votingTemplateOptions = [VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL.name,VOTING_TEMPLATE.TEZOSTEMPLATE.name];
    const [openVotingTemplateOptions, setOpenVotingTemplateOptions] = React.useState(false);
    const anchorRefVotingOptionsComboBox = React.useRef<HTMLDivElement>(null);
    const [selectedIndexVotingTemplateOption, setSelectedIndexVotingTemplateOption] = React.useState(0);
    
    const handleMenuItemVotingTemplateOptionsClick = (index : number) => {
      setSelectedIndexVotingTemplateOption(index);
      setOpenVotingTemplateOptions(false);
    };
    
    const handleToggleMenuItemVotingTemplateOptions = () => {
      setOpenVotingTemplateOptions((prevOpen) => !prevOpen);
    };
    
    const handleCloseMenuItemVotingTemplateOptions = (event : MouseEvent | TouchEvent) => {
      if (anchorRefVotingOptionsComboBox.current && anchorRefVotingOptionsComboBox.current.contains(event.target as Node)) {
        return;
      }
      
      setOpenVotingTemplateOptions(false);
    };
    /** END OF CREATE BUTTON SECTION */
    
    
    
    /**
    * LANDING PAGE FIRST TIME
    *  */  
    //console.log("firstTime",firstTime,"publicToken",publicToken,"userAddress",userAddress,"userBalance",userBalance);
    let network = process.env["REACT_APP_NETWORK"]? NetworkType[process.env["REACT_APP_NETWORK"].toUpperCase() as keyof typeof NetworkType] : NetworkType.ITHACANET;
    
    if (false && !userAddress && (!publicToken || publicToken==null))
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
      />
      </div>
      
      <div className="buttons">
      <Button sx={{marginTop:1}} variant="contained" >
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
  else if (publicToken && (!userAddress || isNaN(userBalance))) {
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
  else if(true || userAddress){
    
    return (
      <div className="main-box">
      {(network != NetworkType.MAINNET)?<div className="banner">WARNING: TEST ONLY {network}</div>:<span />}
      <Box sx={{ height:"6vh", display: 'flex' ,backgroundColor : "var(--main-bg-color)" , color : "white", justifyContent: 'space-between', textAlign: "center",  fontSize: "1.5em",  padding: "0.2em"}}>               
      <img className="logo"
      src="/logo_white.png"
      alt="marigold-button"
      />
      
      
      <Button  variant="contained" sx={{marginRight:0.5}}
      id="search"
      onClick={() => setActiveTab("search")}
      >
      Search
      </Button>
      
      {userAddress?
        <React.Fragment>
        <ButtonGroup variant="contained" ref={anchorRefVotingOptionsComboBox} aria-label="split button">
        <Button onClick={() => setActiveTab(votingTemplateOptions[selectedIndexVotingTemplateOption])}>{votingTemplateOptions[selectedIndexVotingTemplateOption]}</Button>
        <Button
        size="small"
        aria-controls={openVotingTemplateOptions ? 'split-button-menu' : undefined}
        aria-expanded={openVotingTemplateOptions ? 'true' : undefined}
        aria-label="select merge strategy"
        aria-haspopup="menu"
        onClick={handleToggleMenuItemVotingTemplateOptions}
        >
        <ArrowDropDownCircleRounded />
        </Button>
        </ButtonGroup>
        <Popper
        sx={{zIndex:"99999"}}
        open={openVotingTemplateOptions}
        anchorEl={anchorRefVotingOptionsComboBox.current}
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
          <ClickAwayListener  onClickAway={handleCloseMenuItemVotingTemplateOptions}>
          <MenuList id="split-button-menu">
          {votingTemplateOptions.map((option, index) => (
            <MenuItem
            key={option}
            disabled={index === 2}
            selected={index === selectedIndexVotingTemplateOption}
            onClick={(event) => handleMenuItemVotingTemplateOptionsClick(index)}
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

          
          { userAddress ? <Popup trigger={<AccountCircle fontSize="large"/>} position="bottom right">
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
          />
        }
        
        
        
        </Box>
        <div id="dialog">
        <div id="content">
        {activeTab === "search"? (
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
          ) : activeTab == VOTING_TEMPLATE.TEZOSTEMPLATE.name ? (
            <div>
            <h3 className="text-align-center">
            Create new {VOTING_TEMPLATE.TEZOSTEMPLATE.name} voting session 
            </h3>
            <CreateTezosTemplate
            Tezos={Tezos}
            userAddress={userAddress}
            votingPeriodOracle={votingPeriodOracle}
            wallet={wallet}
            setActiveTab={setActiveTab}
            />
            </div>
            ) : 
            (
              <div>
              <h3 className="text-align-center">
              Create new {VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL.name} voting session 
              </h3>
              <CreatePermissionedSimplePoll
              Tezos={Tezos}
              userAddress={userAddress}
              setActiveTab={setActiveTab}
              />
              </div>)
            }
            </div>
            
            </div>
            
            <div id="footer-phantom" />
            <div id="footer-login"><Box sx={{justifyContent: 'space-between', textAlign: "center",display : "flex"}}>
         <a href="https://github.com/marigold-dev/tzvote"><img height={15} src="https://github.githubassets.com/images/modules/logos_page/Octocat.png"/><img height={15} src="https://github.githubassets.com/images/modules/logos_page/GitHub-Logo.png"/></a>
         Marigold 2022
      </Box>
      </div>
            
            </div>
            
            
            );
          } 
                    
  else {
    console.log("publicToken",publicToken,"userAddress",userAddress,"userBalance",userBalance);
    return "An error occured !"
  }
                    
                  };
                  
                  export default App;
                  