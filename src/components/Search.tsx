import React, { ChangeEvent, FormEvent, FormEventHandler, useState } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { Contract, ContractsService } from '@dipdup/tzkt-api';
import { Autocomplete, Avatar, Box, Button, Card, CardContent, CardMedia, Chip, FormControl, FormControlLabel, FormHelperText, FormLabel, Grid, Paper, Popover, Radio, RadioGroup, Slider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField, Typography } from "@mui/material";
import { Block, EmojiEvents, Face, Image, RunningWithErrors } from "@mui/icons-material";
import { Mark } from "@mui/base";

const Search = ({
  Tezos,
  userAddress
}: {
  Tezos: TezosToolkit;
  userAddress: string;
}): JSX.Element => {
  
  enum STATUS {
    ONGOING = "ONGOING",
    FINISHED = "FINISHED"
  }
  
  //SEARCH
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = useState<Array<string>>([]);
  const loading = open && options.length === 0;
  const [inputValue, setInputValue] = React.useState<string>('');
  const [searchValue, setSearchValue] = React.useState<string|null>(null);
  
  
  //LIST
  const [contracts, setContracts] = useState<Array<Contract>>([]);
  
  //SELECTED CONTRACT
  const [selectedContract, setSelectedContract] = useState<Contract|null>(null);
  
  React.useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);
  
  React.useEffect(() => {
    
    let active = true;
    
    if (inputValue === '') {
      setOptions(searchValue ? [searchValue] : []);
      setContracts([]);
      return undefined;
    }
    
    (async () => {
      
      setContracts((await contractsService.getSame({address:"KT1PYJvdStoHsCsNoKTFigqCqjd5eWo1uMYd" , includeStorage:true, sort:{desc:"id"}}))
      .filter((c: Contract, index: number, array: Contract[]) => {
        return (c.storage.name as string).search(new RegExp(inputValue, 'gi')) >= 0}
        )); 
        
        if (active) {
          let newOptions: Array<string> = [];
          
          if (contracts) {
            newOptions = [...newOptions, ...contracts.map((c: Contract, index: number, array: Contract[]) => {return c.storage.name;})];
          }
          
          if (searchValue && options.indexOf(searchValue) === -1) {
            newOptions = [...newOptions,searchValue];
          }
          
          setOptions(newOptions);
        }else{
        }
      })();
      
      return () => {
        active = false;
      };
    }, [searchValue, inputValue, loading]);
    
    const contractsService = new ContractsService( {baseUrl: "https://api.hangzhou2net.tzkt.io" , version : "", withCredentials : false});
    
    
    
    const dateSliderToString = (value : number,index : number) : string =>{
      return new Date(value*1000000000000).toLocaleString();
    }
    
    const fromToMarks = (contract : Contract) : Mark[] =>{ 
      const min :number = Date.parse(contract.storage.dateFrom)/ 1000000000000;
      const max :number = Date.parse(contract.storage.dateTo)/ 1000000000000;
      return [
        {value : min , label : dateSliderToString(min,0) },
        {value :max, label : dateSliderToString(max,0) }
      ]; 
    }
    
    //BUTTON ACTION AREA
    //popupvote
    const [votePopup, setVotePopup] = React.useState<null | HTMLElement>(null);
    const showVote = (event: React.MouseEvent<HTMLButtonElement>, c : Contract|null) => {
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
    const [voteError, setVoteError] = React.useState(false);
    const handleVoteRadioChange = (event : ChangeEvent<HTMLInputElement>) => {
      setVoteValue(event.target.value);
      setVoteHelperText(' ');
      setVoteError(false);
    };
    const handleVoteSubmit = (event : FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (voteValue !== '') {
        //TODO
        setVoteError(false);
      } else {
        setVoteHelperText('Please select an option.');
        setVoteError(true);
      }
    };

    const buttonChoices = (contract : Contract) : any => {
      if(STATUS.ONGOING == getStatus(contract) ) 
      return <div><Button aria-describedby={"votePopupId"+selectedContract?.address} variant="contained" onClick={(e)=>showVote(e,contract)}>VOTE</Button>
      {selectedContract != null ?
        <Popover 
        id={"votePopupId"+selectedContract?.address}
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
            <form onSubmit={handleVoteSubmit}>
        <FormControl>
        <FormLabel id="demo-radio-buttons-group-label">Options</FormLabel>
        <RadioGroup 
        aria-labelledby="demo-radio-buttons-group-label"
        name="radio-buttons-group"
        value={voteValue}
        onChange={handleVoteRadioChange}
        >
        {(Array.from<string>(new Map(Object.entries<string>(selectedContract.storage.options)).values()))
        .map(option => (<FormControlLabel key={option} value={option} control={<Radio />} label={option} />))}
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
        </div> ;
      }
      
      
      //RESULT AREA 
      
      //popupresults
      const [resultPopup, setResultPopup] = React.useState<null | HTMLElement>(null);
      const showResults = (event: React.MouseEvent<HTMLDivElement>, c : Contract) => {
        setResultPopup(event.currentTarget);
        setSelectedContract(c);
      };
      const closeResults = () => {
        setResultPopup(null);
        setSelectedContract(null);
      };
      
      const getWinner= (contract : Contract) :  Array<string> => {
        var winnerList : Array<string> = new Array();
        var maxScore :number = 0;
        for (let [key ,value ] of new Map<string,number>(Object.entries(contract.storage.results))){
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
      
      const getStatus= (contract : Contract) : string => {
        if(Date.parse(contract.storage.dateFrom) < Date.now() && Date.now() < Date.parse(contract.storage.dateTo))
        return STATUS.ONGOING; else
        return STATUS.FINISHED;
      }
      
      const resultArea = (contract : Contract) : any => {
        if(Date.parse(contract.storage.dateFrom) < Date.now() && Date.now() < Date.parse(contract.storage.dateTo)){
          return <div><Chip aria-owns={open ? "resultPopupId"+contract.address : undefined} aria-haspopup="true" onMouseEnter={(e) => showResults(e, contract)} onMouseLeave={closeResults} icon={<RunningWithErrors />} style={{marginBottom: "1em"}} color="success" label={getStatus(contract)} />
          <Slider 
          aria-label="Period"
          key={`slider-${contract.address}`}
          value={(new Date()).getTime() / 1000000000000}
          getAriaValueText= {dateSliderToString}
          valueLabelFormat={dateSliderToString}
          valueLabelDisplay="auto"
          min={Date.parse(contract.storage.dateFrom)/ 1000000000000}
          max={Date.parse(contract.storage.dateTo)/ 1000000000000}
          marks={fromToMarks(contract)}
          /></div>;
        }else{
          //get the winner because it is finished
          const winnerList = getWinner(contract);
          if(winnerList.length > 0 ){
            const result : string = "Winner is : " + winnerList.join(' , ');
            return <div ><Chip aria-owns={open ? "resultPopupId"+contract.address : undefined} aria-haspopup="true" onMouseEnter={(e) => showResults(e, contract)} onMouseLeave={closeResults} style={{marginBottom: "1em"}} color="error" label={getStatus(contract)+" ("+(new Date(contract.storage.dateTo)).toLocaleDateString()+")"} />
            <Chip icon={<EmojiEvents />} label={result} aria-owns={open ? "resultPopupId"+contract.address : undefined} aria-haspopup="true" onMouseEnter={(e) => showResults(e, contract)} onMouseLeave={closeResults}/>
            {selectedContract != null ?
              <Popover 
              id={"resultPopupId"+selectedContract?.address}
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
              { Object.entries<string>(selectedContract?.storage.options).map(([key,value]) => (
                <TableRow
                key={key}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                <TableCell component="th" scope="row">
                {value}
                </TableCell>
                <TableCell align="right"> {getWinner(selectedContract).indexOf(value)>=0?<EmojiEvents/>:""}{ new Map<string,number>(Object.entries(selectedContract?.storage.results)).get(value)} 
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
                <div style={{padding:"1em"}}><Chip avatar={<Avatar>{Object.entries(selectedContract.storage.votes).length}</Avatar>} label="Bakers involved"/></div>
                </Grid>
                <div style={{padding:"1em"}}><Chip avatar={<Avatar>{  Array.from<number>((new Map<string,number>(Object.entries<number>(selectedContract.storage.results))).values()).reduce( ( value , acc) => Number(value) + Number(acc), 0  )   }</Avatar>} label="Rolls have been stacked"/></div>
                </Grid>
                </Grid>
                </Paper>
                </Popover>
                :<div></div>}
                </div>;
              }else {
                return <div ><Chip style={{marginBottom: "1em"}} color="warning" label={getStatus(contract)+" ("+(new Date(contract.storage.dateTo)).toLocaleDateString()+")"} /><Chip icon={<Block />} label="NO WINNER" /></div>;
              }
            }
          };
          
          return (
            <div>
            
            <Autocomplete
            id="searchInput"
            freeSolo
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={searchValue}
            sx={{ width: "90%" }}
            open={open}
            onOpen={() => {
              setOpen(true);
            }}
            onClose={() => {
              setOpen(false);
            }}
            isOptionEqualToValue={(option, value) => option === value}
            getOptionLabel={(option) => option}
            options={options}
            loading={loading}
            renderInput={(params) => (
              <TextField {...params} label="Type a question here ..." fullWidth />
              )}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
              }}
              onChange={(event, newValue) => {
                setOptions(newValue && options.indexOf(newValue) === -1 ? [newValue, ...options] : options);
                setSearchValue(newValue);
              }}
              />
              
              {contracts.map((contract, index) => (
                <Card key={contract.address} sx={{ display: 'flex' }}>
                <Box width="70%" sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                
                <Typography component="div" variant="h5">
                <a
                href={`https://hangzhou2net.tzkt.io/${contract.address}/info`}
                target="_blank"
                rel="noopener noreferrer"
                >
                {contract.storage.name}
                </a>
                </Typography>
                
                
                
                
                <Typography variant="subtitle1" color="text.secondary" component="div">
                <span>Created by </span><Chip icon={<Face />} label={contract.creator?.address} clickable target="_blank" component="a" href={`https://hangzhou2net.tzkt.io/${contract.creator?.address}/info`} />  
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
              