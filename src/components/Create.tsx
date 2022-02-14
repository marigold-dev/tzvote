import React, { useState, Dispatch, SetStateAction, FormEvent } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { TezosVotingContract } from "../contractutils/TezosContractUtils";
import { Box, Button, CardMedia, FormControl, FormControlLabel, FormLabel, Grid, Paper, Radio, RadioGroup, TextField, Tooltip, Typography } from "@mui/material";
import { Account } from "@dipdup/tzkt-api";
import { useSnackbar } from "notistack";
import { TezosUtils } from "../contractutils/TezosUtils";

interface CreateProps {
  Tezos: TezosToolkit;
  userAddress: string;
}

const Create = ({ Tezos, userAddress }: CreateProps) => {
  
  // MESSAGES
  
  const { enqueueSnackbar } = useSnackbar();
  
  // CURRRENT CONTRACT
  
  const [contract, setContract] = useState<TezosVotingContract>(new TezosVotingContract(
    '',
    new Date(),
    new Date(),
    [],
    new Map<string,string>(),
    new Map<string,number>(),
    {} as Account));
    
    const createVoteContract = async(event: FormEvent<HTMLFormElement>, contract: TezosVotingContract) => {
      event.preventDefault();
      try {
        console.log(await TezosUtils.getVotingPeriodStartDate(Tezos)) ;
        console.log(await TezosUtils.getVotingPeriodBestEndDate(Tezos)) ;
        console.log(await TezosUtils.getVotingPeriodBadAverageEndDate(Tezos)) ;
      } catch (error : any) {
        enqueueSnackbar(error.message, { variant:"error" , autoHideDuration:10000});
      }
    };
    
    /*
    
    <FormLabel id="demo-radio-buttons-group-label">Options</FormLabel>
    <RadioGroup 
    aria-labelledby="demo-radio-buttons-group-label"
    name="radio-buttons-group"
    value={voteValue}
    onChange={handleVoteRadioChange}
    >
    {contract.options.map((option : string) => (<FormControlLabel key={option} value={option} control={<Radio />} label={option} />))}
    </RadioGroup>
    <FormHelperText style={{color:"red"}}>{voteHelperText}</FormHelperText>
    
    
    */
    
    return <div style={{padding:"1em"}}>
    <form  onSubmit={(e)=>createVoteContract(e,contract)}>
    <FormControl fullWidth>
    <Grid container spacing={2}>
    <Grid item xs={10}>
    <Box>
    
    <TextField fullWidth
    required
    id="name"
    label="Question"
    defaultValue=""
    />

<div style={{paddingTop:"2em"}}>
  <FormLabel required id="demo-radio-buttons-group-label">Select a period</FormLabel>
  <RadioGroup row 
    aria-labelledby="demo-radio-buttons-group-label"
    defaultValue="25"
    name="radio-buttons-group"
  >
    <FormControlLabel  labelPlacement="top" value="25" control={<Radio />} label={
    <React.Fragment >
            <Paper style={{padding:"1em"}} elevation={3}>Period 25<br />
            From 2022/01/01 10:00:00<br />
            To 2023/01/01 10:00:00</Paper>
          </React.Fragment>}  />
    <FormControlLabel labelPlacement="top" value="26" control={<Radio />} label="Period 26" />
    <FormControlLabel labelPlacement="top" value="27" control={<Radio />} label="Period 27" />
    <FormControlLabel labelPlacement="top" value="28" control={<Radio />} label="Period 28" />
    <FormControlLabel labelPlacement="top" value="29" control={<Radio />} label="Period 29" />
  </RadioGroup>
  </div>

    </Box>
    </Grid>
    <Grid item xs={2}>
    <CardMedia
    component="img"
    height="auto"
    image="https://static8.depositphotos.com/1009634/988/v/950/depositphotos_9883921-stock-illustration-no-user-profile-picture.jpg"
    />
    </Grid>
    <Grid item xs={12}>
    HERE THE OPTIONS
    </Grid>
    <Grid item xs={12}>
    <Box textAlign='center'>
    <Button sx={{ mt: 1, mr: 1 }} type="submit" variant="outlined">
    CREATE
    </Button>
    </Box>
    </Grid>
    </Grid>  
    
    
    </FormControl>   
    </form>    
    </div>
  };
  
  export default Create;
  
  
  
  