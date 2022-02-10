import React, { useState } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { Contract, ContractsService } from '@dipdup/tzkt-api';
import { Autocomplete, Box, Button, Card, CardContent, CardMedia, Chip, Grid, Paper, Popover, Slider, TextField, Typography } from "@mui/material";
import { Block, EmojiEvents, Face, RunningWithErrors } from "@mui/icons-material";
import { Mark } from "@mui/base";
import { red } from "@mui/material/colors";

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
  const [value, setValue] = React.useState<string|null>(null);
  
  
  //LIST
  const [contracts, setContracts] = useState<Array<Contract>>([]);
  
  React.useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);
  
  React.useEffect(() => {
    
    let active = true;
    
    if (inputValue === '') {
      setOptions(value ? [value] : []);
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
          
          if (value && options.indexOf(value) === -1) {
            newOptions = [...newOptions,value];
          }
          
          setOptions(newOptions);
        }else{
        }
      })();
      
      return () => {
        active = false;
      };
    }, [value, inputValue, loading]);
    
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
    const votePopupId = Boolean(votePopup) ? 'votePopupId' : undefined;
    const showVote = (event: React.MouseEvent<HTMLButtonElement>) => {
      setVotePopup(event.currentTarget);
    };
    const closeVote = () => {
      setVotePopup(null);
    };
    
    //buttons
    const buttonChoices = (contract : Contract) : any => {
      if(STATUS.ONGOING == getStatus(contract) ) 
      return <div><Button aria-describedby={votePopupId} variant="contained" onClick={showVote}>VOTE</Button>
      <Popover 
      id={votePopupId}
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
      <Paper elevation={3} >NOT IMPLEMENTED</Paper>
      </Popover>
      </div> ;
    }
    
    
    //RESULT AREA 
    
    //popupresults
    const [resultPopup, setResultPopup] = React.useState<null | HTMLElement>(null);
    const showResults = (event: React.MouseEvent<HTMLDivElement>) => {
      setResultPopup(event.currentTarget);
    };
    const closeResults = () => {
      setResultPopup(null);
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
        return <div><Chip icon={<RunningWithErrors />} style={{marginBottom: "1em"}} color="success" label={getStatus(contract)} />
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
          return <div ><Chip aria-owns={open ? "resultPopupId" : undefined} aria-haspopup="true" onMouseEnter={showResults} onMouseLeave={closeResults} style={{marginBottom: "1em"}} color="error" label={getStatus(contract)+" ("+(new Date(contract.storage.dateTo)).toLocaleDateString()+")"} />
          <Chip icon={<EmojiEvents />} label={result} aria-owns={open ? "resultPopupId" : undefined} aria-haspopup="true" onMouseEnter={showResults} onMouseLeave={closeResults}/>
          <Popover 
          id="resultPopupId"
          sx={{
            pointerEvents: 'none',
          }}
          anchorEl={resultPopup}
          open={Boolean(resultPopup)}
          onClose={closeResults}
          disableRestoreFocus
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          >
          <Paper elevation={3} sx={{width:"50em",height:"25em"}} >
          <Grid container spacing={2} height={100}>
          <Grid item xs={8}>
          <div style={{backgroundColor:"red"}}>RESULTS</div>
          </Grid>
          <Grid item xs={4}>
            <Grid item xs={4}>
            <div style={{backgroundColor:"green"}}>CAMEMBERT</div>
            </Grid>
            <Grid item xs={4}>
            <div style={{backgroundColor:"yellow"}}>BAKERs</div>
            </Grid>
            <div style={{backgroundColor:"blue"}}>ROLLS</div>
            </Grid>
          </Grid>
          </Paper>
          </Popover>
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
      value={value}
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
          setValue(newValue);
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
        