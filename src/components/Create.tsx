import React, { useState, Dispatch, SetStateAction, FormEvent, useEffect, ChangeEvent } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { TezosVotingContract } from "../contractutils/TezosContractUtils";
import { Box, Button, CardMedia, FormControl, FormControlLabel, FormLabel, Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Radio, RadioGroup, StepIcon, TextField, Tooltip, Typography } from "@mui/material";
import { Account } from "@dipdup/tzkt-api";
import { useSnackbar } from "notistack";
import { TezosUtils } from "../contractutils/TezosUtils";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Delete } from "@mui/icons-material";
import { updateOptionalTypeNode } from "typescript";

interface CreateProps {
  Tezos: TezosToolkit;
  userAddress: string;
  setActiveTab : Dispatch<SetStateAction<string>>;
}

const Create = ({ Tezos, userAddress ,setActiveTab }: CreateProps) => {
  
  // MESSAGES
  
  const { enqueueSnackbar } = useSnackbar();
  
  // CURRRENT CONTRACT
  
  const [contract, setContract] = useState<TezosVotingContract>(new TezosVotingContract(
    '',
    0,
    new Date(),
    new Date(),
    ["new option"],
    new Map<string,string>(),
    new Map<string,number>(),
    {} as Account));
    
    const [currentVotingPeriodIndex,setCurrentVotingPeriodIndex] =useState<number>(0);   
    const [periodDates,setPeriodDates] =useState<Array<Date>>([]);   
    
    //init on load once
    useEffect(() => {
      
      async function fetchCurrentIndex() {
        setCurrentVotingPeriodIndex(await TezosUtils.getVotingPeriodIndex(Tezos));
        setContract({...contract , index : await TezosUtils.getVotingPeriodIndex(Tezos)});
      }
      
      async function fetchCurrentAndNextVotingPeriodDates(count :number){
        fetchCurrentIndex();
        setPeriodDates(await TezosUtils.getCurrentAndNextAtBestVotingPeriodDates(Tezos,5));
      }
      
      fetchCurrentAndNextVotingPeriodDates(5);
    }, [])
    
    const createVoteContract = async(event: FormEvent<HTMLFormElement>, contract: TezosVotingContract) => {
      event.preventDefault();
      try {
        console.log(contract);
        setActiveTab("search");
        enqueueSnackbar("Not yet implemented", { variant:"warning" , autoHideDuration:10000});
      } catch (error : any) {
        enqueueSnackbar(error.message, { variant:"error" , autoHideDuration:10000});
      }
    };
    
    const removeOption = (index: number) => {
        contract.options.splice(index, 1);
        setContract({...contract});
    }

    const updateOption = (e : ChangeEvent, index: number) => {
      contract.options[index]=(""+(e.target as HTMLFormElement).value);
      setContract({...contract});
  }

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
    value={contract.name}
    onChange={(e) => setContract({...contract, name: e.target.value})}
    />
    
    <div style={{paddingTop:"2em"}}>
    <FormLabel required id="demo-radio-buttons-group-label">Select a period</FormLabel>
    <RadioGroup row 
    aria-labelledby="demo-radio-buttons-group-label"
    defaultValue="25"
    name="radio-buttons-group"
    value={contract.index}
    onChange={(e) => setContract({...contract, index: Number(e.target.value)})}
    >
    {[
      ...Array(5),
    ].map((value: undefined, index: number) => (
      <FormControlLabel key={currentVotingPeriodIndex+index} labelPlacement="top" value={currentVotingPeriodIndex+index} control={<Radio />} label={
        <React.Fragment >
        <Paper style={{padding:"1em"}} elevation={3}>
        Period {currentVotingPeriodIndex+index}<br />
        From {(periodDates[index]?periodDates[index].toLocaleDateString():"")}<br />
        To {(periodDates[index+1]?periodDates[index+1].toLocaleDateString():"")}<br/>
        (estimated) </Paper>
        </React.Fragment>}  />
        ))}
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
        
        <Box>
        <FormLabel id="demo-radio-buttons-group-label">Options</FormLabel>
        <Button sx={{ marginLeft: "1em" }}  variant="outlined" onClick={()=>{setContract({...contract,options:contract.options.concat("new option")})}}>Add option</Button>
        </Box>
        <List   inputMode="text" >
        {
          contract.options.map((option: string, index: number) => (
            <ListItem key={option} disablePadding value={option} >
            <ListItemButton>
            <ListItemIcon>
            <RadioButtonUncheckedIcon   />
            </ListItemIcon>
            <TextField onChange={(e : ChangeEvent ) => updateOption(e,index)} value={option} /> 
            <Delete onClick={() => removeOption(index)}/>
            </ListItemButton>
            </ListItem>
            ))
          }
          </List>
          
          </Grid>
          <Grid item xs={12}>
          <Box textAlign='center'>
          <Button sx={{ mt: 1, mr: 1 }} type="submit" variant="contained">
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
        
        
        
        
        
        