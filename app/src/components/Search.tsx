import React, { ChangeEvent, FormEvent, useState } from "react";
import { TezosToolkit, WalletContract } from "@taquito/taquito";
import { Contract, ContractsService } from '@dipdup/tzkt-api';
import { Autocomplete, Avatar, Backdrop, Box, Button, Card, CardContent, CardMedia, Chip, CircularProgress, FormControl, FormControlLabel, FormHelperText, FormLabel, Grid, Paper, Popover, Radio, RadioGroup, Slider, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField, Tooltip, Typography } from "@mui/material";
import { BarChart, Block, Circle, EmojiEvents, Face, RunningWithErrors } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { TezosVotingContract,TezosVotingContractUtils } from "../contractutils/TezosContractUtils";
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { STATUS, TransactionInvalidBeaconError } from "../contractutils/TezosUtils";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import * as moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import {  NetworkType} from "@airgap/beacon-sdk";
momentDurationFormatSetup(moment);

const Search = ({
  Tezos,
  userAddress,
  votingTemplateAddress,
  userRolls,
  beaconConnection
}: {
  Tezos: TezosToolkit;
  userAddress: string;
  votingTemplateAddress: string;
  userRolls:number;
  beaconConnection:boolean;
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
  
  
  const refreshData = () => {
    (async () => {
      let allContractFromTzkt : Array<Contract>= (await contractsService.getSame({address:votingTemplateAddress , includeStorage:true, sort:{desc:"id"}}));
      console.log("refreshData",userAddress);
      let allConvertertedContracts :Array<TezosVotingContract>= await Promise.all(allContractFromTzkt.map( async(tzktObject:Contract) => await TezosVotingContractUtils.convertFromTZKTTezosContract(Tezos,tzktObject,userAddress))); 
      setAllContracts(allConvertertedContracts);
      setOptions(Array.from(new Set(allConvertertedContracts.map((c: TezosVotingContract) => c.name))));
    })();
  }
  
  const filterOnNewInput = (filterValue : string | null) => {
    if(filterValue == null || filterValue === '')setContracts([]);
    else{
      let filteredContract = allContracts.filter((c: TezosVotingContract) => {
        return c.name.search(new RegExp(""+filterValue, 'gi')) >= 0}
        )
        setContracts(filteredContract); 
      }}
      
      //EFFECTS
      React.useEffect(refreshData, []); //init load
      React.useEffect(refreshData, [beaconConnection]); //connection events
      React.useEffect(() => filterOnNewInput(inputValue), [allContracts]); //if data refreshed, need to refresh the filtered list too
      
      const contractsService = new ContractsService( {baseUrl: "https://api."+(process.env["NETWORK"]? NetworkType[process.env["NETWORK"].toUpperCase() as keyof typeof NetworkType]  : NetworkType.HANGZHOUNET)+".tzkt.io" , version : "", withCredentials : false});
      
      const dateSliderToString = (value : number, index : number) =>{
        return new Date(value).toLocaleString();
      }
      
      const durationToString = (value : number) : string =>{
        return moment.duration(value, "milliseconds").format('d [days] hh:mm:ss left');
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
            
            //refresh info on list
            setTimeout(() => { console.log("the list will refresh soon");refreshData();filterOnNewInput(inputValue);}, 2000);
            
            enqueueSnackbar("Your vote has been accepted (wait a bit the refresh)", {variant: "success", autoHideDuration:10000});
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
        if(STATUS.ONGOING == contract.status) 
        return(<div>
          {(!contract.userYetVoted && userRolls>0)?<Button style={{margin: "0.2em"}} aria-describedby={"votePopupId"+selectedContract?.tzkt.address} variant="contained" onClick={(e)=>showVote(e,contract)}>VOTE</Button>:""}
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
            
            const popover = () : ReactJSXElement =>{ 
              
              if(selectedContract != null){ 
                
                let data = Array.from(selectedContract.results.keys()).map((key)=>{return {"name": key, "value": selectedContract.results.get(key)}});
                let getColorArray = (dataItems : Array<any>) : Map<string,string> => {
                  var result = new Map<string,string>();
                  for (let dataitem of dataItems) {
                    var letters = '0123456789ABCDEF'.split('');
                    var color = '#';
                    for (var j = 0; j < 6; j += 1) {
                      color += letters[Math.floor(Math.random() * 16)];
                    }
                    result.set(dataitem.name,color);
                  }
                  return result;
                }
                const COLORS = getColorArray(data);
                
                const RADIAN = Math.PI / 180;
                const renderCustomizedLabel = ({ cx , cy, midAngle, innerRadius, outerRadius, percent, index }:any) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.3;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  
                  return (
                    <text fontSize={"0.8em"} x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                    {`${(percent * 100).toFixed(0)}%`}
                    </text>
                    );
                  };
                  
                  
                  return <Popover 
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
                  <Paper elevation={3} sx={{minWidth:"90vw",minHeight:"50vh"}} >
                  <Grid container height={100}>
                  <Grid item xs={8}>
                  <div style={{padding:"0.2em"}}>
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
                    <Circle htmlColor={COLORS.get(value)} /> {value} 
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
                    <div style={{padding:"0.2em"}}>
                    
                    
                    <PieChart width={window.innerWidth*0.3} height={window.innerHeight*0.3}>
                    <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius="100%"
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.get(entry.name)} />
                      ))}
                      </Pie>
                      </PieChart>
                      
                      </div>
                      </Grid>
                      <Grid item xs={4}>
                      <div style={{padding:"0.2em"}}><Chip avatar={<Avatar>{selectedContract?.votes.size}</Avatar>} label="Bakers"/></div>
                      </Grid>
                      <div style={{padding:"0.2em"}}><Chip avatar={<Avatar>{Array.from(selectedContract?.results.values()).reduce( ( value :number , acc : number) => value + acc, 0)   }</Avatar>} label="Rolls"/></div>
                      </Grid>
                      </Grid>
                      </Paper>
                      </Popover>}
                      else return<div />; 
                    };
                    
                    // STATUS.ONGOING
                    if(contract.status == STATUS.ONGOING){
                      return(<div><Chip aria-owns={open ? "resultPopupId"+contract.tzkt.address : undefined} aria-haspopup="true" onMouseEnter={(e) => showResults(e, contract)} onMouseLeave={closeResults} icon={<RunningWithErrors />} color="success" label={contract.status} />
                      <Slider  component="div"    style={{width:"90%"}}
                      aria-label="Period" 
                      key={`slider-${contract.tzkt.address}`}
                      value={(new Date()).getTime() }
                      getAriaValueText= {dateSliderToString}
                      valueLabelFormat={dateSliderToString}
                      valueLabelDisplay="auto"
                      min={contract.dateFrom.getTime() }
                      max={contract.dateTo.getTime() }
                      />
                      <div>{(durationToString(contract.dateTo.getTime() - Date.now()))}</div>
                      
                      {popover()}
                      </div>);
                    }else{
                      // STATUS.LOCKED
                      const winnerList = getWinner(contract);
                      if(winnerList.length > 0 ){
                        const result : string = "Winner is : " + winnerList.join(' , ');
                        return(<div ><Chip icon={<BarChart />} aria-owns={open ? "resultPopupId"+contract.tzkt.address : undefined} aria-haspopup="true" onMouseEnter={(e) => showResults(e, contract)} onMouseLeave={closeResults} style={{margin: "0.2em"}} color="error" label={<span>{contract.status}<br />(Period : {contract.votingPeriodIndex})</span>} />
                        <Chip style={{margin: "0.2em"}} icon={<EmojiEvents />} label={result} />
                        {popover()}
                        </div>);
                      }else {
                        return(<div ><Chip icon={<BarChart />}  aria-owns={open ? "resultPopupId"+contract.tzkt.address : undefined} aria-haspopup="true" onMouseEnter={(e) => showResults(e, contract)} onMouseLeave={closeResults}  style={{margin: "0.2em"}} color="warning" label={<span>{contract.status}<br />(Period : {contract.votingPeriodIndex})</span>} /><Chip style={{margin: "0.2em"}} icon={<Block />} label="NO WINNER" /></div>);
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
                          <Card  key={contract.tzkt.address} sx={{ display: 'flex' , marginTop : "0.2em"}}>
                          
                          
                          <Box width="60%" sx={{ display: 'flex', flexDirection: 'column' }}>
                          <CardContent sx={{ flex: '1 0 auto' , padding : "1vw"}}>
                          <Typography component="div" variant="h6">
                          <a
                          href={`https://hangzhou2net.tzkt.io/${contract.tzkt.address}/info`}
                          target="_blank"
                          rel="noopener noreferrer"
                          >
                          {contract.name}
                          </a>
                          </Typography>
                          
                          <Typography variant="subtitle1" color="text.secondary" component="div">
                          <div>Created by </div>
                          <Chip style={{maxWidth: "40vw"}} icon={<Face />} label={contract.tzkt.creator?.address} clickable target="_blank" component="a" href={`https://`+(process.env["NETWORK"]? NetworkType[process.env["NETWORK"].toUpperCase() as keyof typeof NetworkType]  : NetworkType.HANGZHOUNET)+`.tzkt.io/${contract.tzkt.creator?.address}/info`} />  
                          </Typography>
                          
                          {buttonChoices(contract)}
                          </CardContent>
                          </Box>
                          
                          
                          <Box width="40%" paddingTop="1em" >
                          {resultArea(contract)}
                          </Box>
                          
                          </Card>
                          ))}
                          
                          </div>
                          );
                        };
                        
                        export default Search;
                        