import React, { ChangeEvent, FormEvent, useState } from "react";
import { TezosToolkit, WalletContract } from "@taquito/taquito";
import { Contract, ContractsService } from '@dipdup/tzkt-api';
import { Autocomplete, Avatar, Backdrop, Box, Button, Card, CardContent, CardMedia, Chip, CircularProgress, FormControl, FormControlLabel, FormHelperText, FormLabel, Grid, Paper, Popover, Radio, RadioGroup, Slider, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField, Typography } from "@mui/material";
import { Block, EmojiEvents, Face, RunningWithErrors } from "@mui/icons-material";
import { Mark } from "@mui/base";
import { useSnackbar } from "notistack";
import { TezosVotingContract,TezosVotingContractUtils } from "../contractutils/TezosContractUtils";
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { STATUS, TransactionInvalidBeaconError } from "../contractutils/TezosUtils";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

const Search = ({
  Tezos,
  userAddress,
  votingTemplateAddress
}: {
  Tezos: TezosToolkit;
  userAddress: string;
  votingTemplateAddress: string;
}): JSX.Element => {
  
  //SEARCH
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = useState<Array<string>>([]);
  const loading = open && options.length === 0;
  const [inputValue, setInputValue] = React.useState<string>('');
  const [searchValue, setSearchValue] = React.useState<string|null>(null);
  
  //LIST
  const [allContracts, setAllContracts] = useState<Array<TezosVotingContract>>([]);
  const [contracts, setContracts] = useState<Array<TezosVotingContract>>([]);
  
  //SELECTED CONTRACT
  const [selectedContract, setSelectedContract] = useState<TezosVotingContract|null>(null);
  
  //TEZOS OPERATIONS
  const [tezosLoading, setTezosLoading]  = React.useState(false);
  
  // MESSAGES
  const { enqueueSnackbar } = useSnackbar();
  
  //EFFECTS
  React.useEffect(() => {
    (async () => {
      let allContracts : Array<Contract>= (await contractsService.getSame({address:votingTemplateAddress , includeStorage:true, sort:{desc:"id"}}));
      let allConvetertedContracts :Array<TezosVotingContract>= await Promise.all(allContracts.map( async(tzktObject:Contract) => await TezosVotingContractUtils.convertFromTZKTTezosContract(Tezos,tzktObject))); 
      setAllContracts(allConvetertedContracts);
      setOptions(allConvetertedContracts.map((c: TezosVotingContract) => c.name));
    })();
  }, []);
  
  const filterOnNewInput = async(filterValue : string | null) => {
    if(filterValue == null || filterValue === '')setContracts([]);
    else{
      let filteredContract = allContracts.filter((c: TezosVotingContract) => {
        return c.name.search(new RegExp(""+filterValue, 'gi')) >= 0}
        )
        setContracts(filteredContract); 
      }}
      
      const contractsService = new ContractsService( {baseUrl: "https://api.hangzhou2net.tzkt.io" , version : "", withCredentials : false});
      
      const dateSliderToString = (value : number,index : number) : string =>{
        return new Date(value*1000000000000).toLocaleString();
      }
      
      const fromToMarks = (contract : TezosVotingContract) : Mark[] =>{ 
        const min :number =  contract.dateFrom.getTime() / 1000000000000;
        const max :number = contract.dateTo.getTime() / 1000000000000;
        return([
          {value : min , label : dateSliderToString(min,0) },
          {value :max, label : dateSliderToString(max,0) }
        ]) ; 
      }
      
      //BUTTON ACTION AREA
      //popupvote
      const [votePopup, setVotePopup] = React.useState<null | HTMLElement>(null);
      const showVote = (event: React.MouseEvent<HTMLButtonElement>, c : TezosVotingContract|null) => {
        setVotePopup(event.currentTarget);
        setSelectedContract(c);
      };
      const closeVote = () => {
        setVotePopup(null);
        setSelectedContract(null);
      };
      
      //buttons
      const [voteHelperText, setVoteHelperText] = React.useState('');
      const [voteValue, setVoteValue] = React.useState('');
      const handleVoteRadioChange = (event : ChangeEvent<HTMLInputElement>) => {
        setVoteValue(event.target.value);
        setVoteHelperText(' ');
      };
      const handleVoteSubmit = async (event : FormEvent<HTMLFormElement>, contract : TezosVotingContract) => {
        
        event.preventDefault();
        setTezosLoading(true);
        
        let c : WalletContract = await Tezos.wallet.at(""+contract.tzkt.address);
        if (voteValue !== '') {
          
          try {
            const pkh = await Tezos.wallet.pkh();            
            const op = await c.methods.vote(voteValue,pkh).send();
            closeVote();
            await op.confirmation();
            enqueueSnackbar("Your vote has been acccepted", {variant: "success", autoHideDuration:10000});
          } catch (error : any) {
            console.table(`Error: ${JSON.stringify(error, null, 2)}`);
            let tibe : TransactionInvalidBeaconError = new TransactionInvalidBeaconError(error);
            enqueueSnackbar(tibe.data_message, { variant:"error" , autoHideDuration:10000});
            closeVote();
          } finally {
            setTezosLoading(false);
          }
          
        } else {
          setVoteHelperText('Please select an option.');
        }
        setTezosLoading(false);
      };
      
      const buttonChoices = (contract : TezosVotingContract) => {
        if(STATUS.ONGOING == contract.status && TezosVotingContractUtils.userNotYetVoted(userAddress,contract)) 
        return(<div><Button aria-describedby={"votePopupId"+selectedContract?.tzkt.address} variant="contained" onClick={(e)=>showVote(e,contract)}>VOTE</Button>
        {selectedContract != null ?
          <Popover 
          id={"votePopupId"+selectedContract?.tzkt.address}
          anchorEl={votePopup}
          open={Boolean(votePopup)}
          onClose={closeVote}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          >
          <Paper elevation={3} sx={{minWidth:"20em",minHeight:"10em"}} >
          <div style={{padding:"1em"}}>
          <form onSubmit={(e)=>handleVoteSubmit(e,selectedContract)}>
          <FormControl>
          <FormLabel id="demo-radio-buttons-group-label">Options</FormLabel>
          <RadioGroup 
          aria-labelledby="demo-radio-buttons-group-label"
          name="radio-buttons-group"
          value={voteValue}
          onChange={handleVoteRadioChange}
          >
          {selectedContract.options.map((option : string) => (<FormControlLabel key={option} value={option} control={<Radio />} label={option} />))}
          </RadioGroup>
          <FormHelperText style={{color:"red"}}>{voteHelperText}</FormHelperText>
          <Button sx={{ mt: 1, mr: 1 }} type="submit" variant="outlined">
          VOTE
          </Button>
          </FormControl>   
          </form>    
          </div>
          </Paper>
          </Popover>
          : <div/>}
          </div> );
        }
        
        
        /*************************************/
        /***  RESULT AREA *******************
        *************************************/
        
        //popupresults
        const [resultPopup, setResultPopup] = React.useState<null | HTMLElement>(null);
        const showResults = (event: React.MouseEvent<HTMLDivElement>, c : TezosVotingContract) => {
          setSelectedContract(c);
          setResultPopup(event.currentTarget);
        };
        const closeResults = () => {
          setSelectedContract(null);
          setResultPopup(null);
        };
        
        const getWinner= (contract : TezosVotingContract) :  Array<string> => {
          var winnerList : Array<string> = new Array();
          var maxScore :number = 0;
          for (let [key ,value ] of contract.results){
            if(value == maxScore){
              winnerList.push(key);
            }else if(value > maxScore){
              winnerList= new Array(); winnerList.push(key);
            }else{
              //pass
            }
          }
          return winnerList;
        }
        
        const resultArea = (contract : TezosVotingContract) => {
          
          const popover = () : ReactJSXElement =>{ if(selectedContract != null)return <Popover 
            id={"resultPopupId"+selectedContract?.tzkt.address}
            sx={{
              pointerEvents: 'none',
            }}
            anchorEl={resultPopup}
            open={Boolean(resultPopup)}
            onClose={closeResults}
            
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            >
            <Paper elevation={3} sx={{minWidth:"40em",minHeight:"20em"}} >
            <Grid container spacing={2} height={100}>
            <Grid item xs={8}>
            <div style={{padding:"1em"}}>
            <TableContainer component={Paper}>
            <Table aria-label="simple table">
            <TableHead>
            <TableRow>
            <TableCell>Options</TableCell>
            <TableCell align="right">Result</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            { Object.entries<string>(selectedContract?.options).map(([key,value]) => (
              <TableRow
              key={key}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
              <TableCell component="th" scope="row">
              {value}
              </TableCell>
              <TableCell align="right"> {getWinner(selectedContract).indexOf(value)>=0?<EmojiEvents/>:""}{ selectedContract?.results.get(value)} 
              </TableCell>
              </TableRow>
              ))}
              </TableBody>
              </Table>
              </TableContainer>
              
              </div>
              </Grid>
              <Grid item xs={4}>
              <Grid item xs={4}>
              
              <div style={{padding:"1em"}}>
              
              <img height={100} width={100} src="https://peltiertech.com/images/2013-09/No3DCharts.png"/>
              
              </div>
              
              </Grid>
              <Grid item xs={4}>
              <div style={{padding:"1em"}}><Chip avatar={<Avatar>{selectedContract?.votes.size}</Avatar>} label="Bakers involved"/></div>
              </Grid>
              <div style={{padding:"1em"}}><Chip avatar={<Avatar>{Array.from(selectedContract?.results.values()).reduce( ( value :number , acc : number) => value + acc, 0)   }</Avatar>} label="Rolls have been stacked"/></div>
              </Grid>
              </Grid>
              </Paper>
              </Popover>
              else return<div />; 
            };
            
            // STATUS.ONGOING
            if(contract.status == STATUS.ONGOING){
              return(<div><Chip aria-owns={open ? "resultPopupId"+contract.tzkt.address : undefined} aria-haspopup="true" onMouseEnter={(e) => showResults(e, contract)} onMouseLeave={closeResults} icon={<RunningWithErrors />} style={{marginBottom: "1em"}} color="success" label={contract.status} />
              <Slider 
              aria-label="Period"
              key={`slider-${contract.tzkt.address}`}
              value={(new Date()).getTime() / 1000000000000}
              getAriaValueText= {dateSliderToString}
              valueLabelFormat={dateSliderToString}
              valueLabelDisplay="auto"
              min={contract.dateFrom.getTime() / 1000000000000}
              max={contract.dateTo.getTime() / 1000000000000}
              marks={fromToMarks(contract)}
              />
              {popover()}
              </div>);
            }else{
              // STATUS.LOCKED
              const winnerList = getWinner(contract);
              if(winnerList.length > 0 ){
                const result : string = "Winner is : " + winnerList.join(' , ');
                return(<div ><Chip aria-owns={open ? "resultPopupId"+contract.tzkt.address : undefined} aria-haspopup="true" onMouseEnter={(e) => showResults(e, contract)} onMouseLeave={closeResults} style={{marginBottom: "1em"}} color="error" label={contract.status+" (Period:"+contract.votingPeriodIndex+")"} />
                <Chip icon={<EmojiEvents />} label={result} />
                {popover()}
                </div>);
              }else {
                return(<div ><Chip aria-owns={open ? "resultPopupId"+contract.tzkt.address : undefined} aria-haspopup="true" onMouseEnter={(e) => showResults(e, contract)} onMouseLeave={closeResults}  style={{marginBottom: "1em"}} color="warning" label={contract.status+" (Period : "+contract.votingPeriodIndex+")"} /><Chip icon={<Block />} label="NO WINNER" /></div>);
              }
            }
            
          };
          
          /*************************************/
          /***  MAIN FRAME *******************
          *************************************/
          return (
            <div>
            <Backdrop
            sx={{ color: '#fff', zIndex: (theme : any) => theme.zIndex.drawer + 1 }}
            open={tezosLoading}
            >
            <CircularProgress color="inherit" />
            </Backdrop>
            
            <Autocomplete
            id="searchInput"
            freeSolo
            autoComplete
            filterSelectedOptions
            value={searchValue}
            sx={{ width: "90%" }}
            open={open}
            onOpen={() => {setOpen(true);}}
            onClose={() => {setOpen(false);}}
            isOptionEqualToValue={(option, value) => option === value}
            getOptionLabel={(option) => option}
            options={options}
            loading={loading}
            loadingText="Type at least 2 characters for autocomplete"
            renderInput={(params) => (<TextField {...params} label="Search ... and press Enter" fullWidth /> )}
            onInputChange={(event, newInputValue) => {setInputValue(newInputValue);}}
            onChange={(event, newValue) => {filterOnNewInput(newValue)}}
            renderOption={(props, option, { inputValue }) => {
              const matches = match(option, inputValue);
              const parts = parse(option, matches);
              return (
                <li {...props}>
                <div>
                {parts.map((part, index) => (
                  <span
                  key={index}
                  style={{
                    fontWeight: part.highlight ? 700 : 400,
                  }}
                  >
                  {part.text}
                  </span>
                  ))}
                  </div>
                  </li>
                  );
                }}  
                />
                {contracts.map((contract, index) => (
                  <Card key={contract.tzkt.address} sx={{ display: 'flex' }}>
                  <Box width="70%" sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto' }}>
                  
                  <Typography component="div" variant="h5">
                  <a
                  href={`https://hangzhou2net.tzkt.io/${contract.tzkt.address}/info`}
                  target="_blank"
                  rel="noopener noreferrer"
                  >
                  {contract.name}
                  </a>
                  </Typography>
                  
                  <Typography variant="subtitle1" color="text.secondary" component="div">
                  <span>Created by </span><Chip icon={<Face />} label={contract.tzkt.creator?.address} clickable target="_blank" component="a" href={`https://hangzhou2net.tzkt.io/${contract.tzkt.creator?.address}/info`} />  
                  </Typography>
                  
                  {buttonChoices(contract)}
                  </CardContent>
                  
                  </Box>
                  <Box paddingTop="1em" paddingRight="5em" paddingLeft="5em" width="20%">
                  {resultArea(contract)}
                  </Box>
                  <Box padding="1em" height="auto" width="10%">
                  <CardMedia
                  component="img"
                  height="auto"
                  image="https://static8.depositphotos.com/1009634/988/v/950/depositphotos_9883921-stock-illustration-no-user-profile-picture.jpg"
                  />
                  </Box>
                  </Card>
                  ))}
                  
                  </div>
                  );
                };
                
                export default Search;
                