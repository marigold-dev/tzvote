import React, { useState, Dispatch, SetStateAction, FormEvent } from "react";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { TezosTemplateVotingContract } from "../contractutils/TezosContractUtils";
import { Backdrop, Box, Button, CircularProgress, FormControl, FormControlLabel, FormLabel, Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Radio, RadioGroup, StepIcon, TextField, Tooltip, Typography } from "@mui/material";
import { Account } from "@dipdup/tzkt-api";
import { useSnackbar } from "notistack";
import { TezosUtils, TransactionInvalidBeaconError } from "../contractutils/TezosUtils";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Add, Delete } from "@mui/icons-material";
import { BeaconWallet } from "@taquito/beacon-wallet";

const jsonContractTemplate = require('../contracttemplates/tezosTemplate3.tz.json')

interface CreateProps {
  Tezos: TezosToolkit;
  userAddress: string;
  votingPeriodOracle : string;
  wallet : BeaconWallet;
  setActiveTab : Dispatch<SetStateAction<string>>;
}

const CreateTezosTemplate = ({ Tezos, userAddress , votingPeriodOracle, wallet, setActiveTab }: CreateProps) => {
  
 //TEZOS OPERATIONS
 const [tezosLoading, setTezosLoading]  = React.useState(false);

  // MESSAGES
  
  const { enqueueSnackbar } = useSnackbar();
  
  // CURRRENT CONTRACT
  
  const [contract, setContract] = useState<TezosTemplateVotingContract>(new TezosTemplateVotingContract(
    '',
    0,
    new Date(),
    new Date(),
    [],
    new Map(),
    new Map(),
    votingPeriodOracle,
    wallet?.client?.preferredNetwork));
    
    const [currentVotingPeriodIndex,setCurrentVotingPeriodIndex] =useState<number>(0);   
    const [periodDates,setPeriodDates] =useState<Array<Date>>([]);   
    const [inputOption,setInputOption] =useState<string>("");   
    
    
    // INIT ONCE 
    React.useEffect(() => {
      (async () => {
        contract.votingPeriodIndex = await TezosUtils.getVotingPeriodIndex(Tezos);
        setCurrentVotingPeriodIndex(contract.votingPeriodIndex);
        setPeriodDates(await TezosUtils.getCurrentAndNextAtBestVotingPeriodDates(Tezos,5));
        setContract(contract);
      })();
    }, []);
    
    
    const createVoteContract = async(event: FormEvent<HTMLFormElement>, contract: TezosTemplateVotingContract) => {

      event.preventDefault();

      //block if no option
      if(contract.options == undefined || contract.options.length == 0 ) {console.log("At least one option is needed...");return;}

      setTezosLoading(true);
      console.log(contract);
      
      Tezos.wallet
      .originate({
        code: jsonContractTemplate,
        storage: {
          name : contract.name,
          votingPeriodIndex : contract.votingPeriodIndex,
          options : contract.options,
          votes : MichelsonMap.fromLiteral(contract.votes) , //MichelsonMap<address, string>
          results : MichelsonMap.fromLiteral(contract.results), //MichelsonMap<string, int>
          votingPeriodOracle : contract.votingPeriodOracle, 
          protocol : contract.protocol
        },
      })
      .send()
      .then((originationOp) => {
        console.log(`Waiting for confirmation of origination...`);
        return originationOp.contract();
      })
      .then((contract) => {
        setActiveTab("search");
        enqueueSnackbar(`Origination completed for ${contract.address}.`, { variant:"success" , autoHideDuration:10000});
      })
      .catch((error) => {
        console.table(`Error: ${JSON.stringify(error, null, 2)}`);
        let tibe : TransactionInvalidBeaconError = new TransactionInvalidBeaconError(error);
        enqueueSnackbar(tibe.data_message, { variant:"error" , autoHideDuration:10000});
      }).finally(()=>{
        setTezosLoading(false);
      });
    };

    
    return userAddress?<div style={{padding:"1em"}}><Backdrop
    sx={{ color: '#fff', zIndex: (theme : any) => theme.zIndex.drawer + 1 }}
    open={tezosLoading}
    >
    <CircularProgress color="inherit" />
    </Backdrop>
    
    <form  onSubmit={(e)=>createVoteContract(e,contract)}>
    <FormControl fullWidth>
    <Grid container >
    <Grid item xs={12}>
    <Box>
    
    <TextField fullWidth
    required
    id="name"
    label="Question"
    value={contract.name}
    onChange={(e) => {setContract({...contract, name : e.target.value!} as TezosTemplateVotingContract)}}
    />
    
    <div style={{paddingTop:"2em"}}>
    <FormLabel required id="demo-radio-buttons-group-label">Select a period</FormLabel>
    <RadioGroup row 
    aria-labelledby="demo-radio-buttons-group-label"
    defaultValue="25"
    name="radio-buttons-group"
    value={contract.votingPeriodIndex}
    onChange={(e) => {setContract({...contract, votingPeriodIndex : Number(e.target.value!)}  as TezosTemplateVotingContract)}}
    >
    {[
      ...Array(5),
    ].map((value: undefined, index: number) => (
      <FormControlLabel key={currentVotingPeriodIndex+index} labelPlacement="top" value={currentVotingPeriodIndex+index} control={<Radio required/>} label={
        <React.Fragment >
        <Paper style={{padding:"0.5em",fontSize: "0.8rem"}} elevation={3}>
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
        <Grid item xs={12}>
        

        <FormLabel error={contract.options.length==0} required id="demo-radio-buttons-group-label">Options</FormLabel>

        <Box alignContent={"center"}>
        <TextField value={inputOption} label="type your option here" onChange={(e) => setInputOption(e.target.value)} ></TextField>
        <Tooltip open={contract.options.length==0} title="At least one option is needed" placement="top-end" aria-label="add"> 
        <Button sx={{ marginLeft: "1em" }}  variant="outlined" onClick={()=>{setContract({...contract, options : contract.options.concat(inputOption)} as TezosTemplateVotingContract);setInputOption("");}}><Add style={{padding : "0.4em 0em"}}/></Button>
        </Tooltip>
        </Box>
        
        <List inputMode="text" >
        {
          contract.options.map((option: string, index: number) => (
            <ListItem key={option} disablePadding value={option} >
            <ListItemButton>
            <ListItemIcon>
            <RadioButtonUncheckedIcon   />
            </ListItemIcon>
            <FormLabel>{option}</FormLabel> 
            <Delete onClick={()=>{contract.options.splice(index, 1);setContract({...contract, options : contract.options} as TezosTemplateVotingContract)}}/>
            </ListItemButton>
            </ListItem>
            ))
          }
          </List>
          
          </Grid>
          <Grid item xs={12}>
          <Box textAlign='center'>
          <Button sx={{ mt: 1, mr: 1 }} type="submit" variant="contained" disabled={!contract.name || !contract.votingPeriodIndex || contract.options.length == 0}>
          CREATE
          </Button>
          </Box>
          </Grid>
          </Grid>  
  
          </FormControl>   
          </form>    
          </div>
          :
          <span />        };
        
        
        export default CreateTezosTemplate;
        
        
        
        
        
        