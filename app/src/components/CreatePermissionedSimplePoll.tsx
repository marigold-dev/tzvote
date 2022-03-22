import React, { useState, Dispatch, SetStateAction, FormEvent, MouseEventHandler } from "react";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { PermissionedSimplePollVotingContract } from "../contractutils/TezosContractUtils";
import { Backdrop, Box, Button, CircularProgress, FormControl, FormLabel, Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Radio, RadioGroup, StepIcon, TextField, Tooltip, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { TransactionInvalidBeaconError } from "../contractutils/TezosUtils";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Add, Delete, Padding } from "@mui/icons-material";
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';

const jsonContractTemplate = require('../contracttemplates/permissionedSimplePoll.tz.json')

interface CreateProps {
  Tezos: TezosToolkit;
  userAddress: string;
  setActiveTab : Dispatch<SetStateAction<string>>;
}

const CreatePermissionedSimplePoll = ({ Tezos, userAddress , setActiveTab }: CreateProps) => {
  
  //TEZOS OPERATIONS
  const [tezosLoading, setTezosLoading]  = React.useState(false);
  
  // MESSAGES
  
  const { enqueueSnackbar } = useSnackbar();
  
  // CURRRENT CONTRACT
  
  const [contract, setContract] = useState<PermissionedSimplePollVotingContract>(new PermissionedSimplePollVotingContract(
    'Enter question here ...',
    new Date(),
    new Date(),
    [],
    new Map(),
    new Map(),
    undefined,
    userAddress,
    []));
    
    const [inputOption,setInputOption] =useState<string>("");   
    const [inputVoter,setInputVoter] =useState<string>("");   

    const createVoteContract = async(event: FormEvent<HTMLFormElement>, contract: PermissionedSimplePollVotingContract) => {
      
      event.preventDefault();
      
      //block if no option
      if(contract.options == undefined || contract.options.length == 0 ) {console.log("At least one option is needed...");return;}
      
      //block if no option
      if(!contract.dateFrom || !contract.dateTo) {console.log("All dates are required");return;}
      
      setTezosLoading(true);
    


      Tezos.wallet
      .originate({
        code: jsonContractTemplate,
        storage: {
          name : contract.name,
          from : contract.dateFrom.toISOString(),
          to : contract.dateTo.toISOString(),
          options : contract.options,
          owner : contract.owner,
          registeredVoters : contract.registeredVoters,
          results : MichelsonMap.fromLiteral(contract.results), //MichelsonMap<string, int>
          votes : MichelsonMap.fromLiteral(contract.votes) , //MichelsonMap<address, string>
        }
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
    onChange={(e) => {setContract({...contract, name : e.target.value!} as PermissionedSimplePollVotingContract)}}
    />
        
    <FormLabel sx={{paddingTop:"1em",paddingBottom:"1em"}} component="div" required id="demo-radio-buttons-group-label">Select dates</FormLabel>
    
    <LocalizationProvider  dateAdapter={AdapterDateFns}>
    <DatePicker
    label="Enter start date*"
    value={contract.dateFrom}
    onChange={(newValue) => {setContract({...contract, dateFrom : newValue!} as PermissionedSimplePollVotingContract)}}
    renderInput={(params) => <TextField {...params} />}
    />
    </LocalizationProvider>

    <Box component="div" sx={{height:"1em"}}/>

    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <DatePicker 
    label="Enter end date*"
    value={contract.dateTo}
    onChange={(newValue) => {setContract({...contract, dateTo : newValue!} as PermissionedSimplePollVotingContract)}}
    renderInput={(params) => <TextField {...params} />}
    />
    </LocalizationProvider>
   
    
    </Box>
    </Grid>
    <Grid item xs={12}>
    
    
    <Tooltip open={contract.options.length==0} title="At least one option is needed" placement="top-end" aria-label="add"> 
    <FormLabel error={contract.options.length==0} required id="demo-radio-buttons-group-label">Options</FormLabel>
    </Tooltip>
    
    <Box alignContent={"center"}>
    <TextField value={inputOption} label="type your option here" onChange={(e) => setInputOption(e.target.value)} ></TextField>
    <Button sx={{ marginLeft: "1em" }}  variant="outlined" onClick={()=>{setContract({...contract, options : contract.options.concat(inputOption)} as PermissionedSimplePollVotingContract);setInputOption("");}}><Add style={{padding : "0.4em 0em"}}/></Button>
    </Box>
    
    <List inputMode="text" >
    {
      contract.options.map((option: string, index: number) => (
        <ListItem key={index} disablePadding value={option} >
        <ListItemButton>
        <ListItemIcon>
        <RadioButtonUncheckedIcon   />
        </ListItemIcon>
        <FormLabel>{option}</FormLabel> 
        <Delete onClick={()=>{contract.options.splice(index, 1);setContract({...contract, options : contract.options} as PermissionedSimplePollVotingContract)}}/>
        </ListItemButton>
        </ListItem>
        ))
      }
      </List>


    <FormLabel >Registered voters</FormLabel>
      <Box alignContent={"center"}>
    <TextField value={inputVoter} label="Add voter here" onChange={(e) => setInputVoter(e.target.value)} ></TextField>
    <Button sx={{ marginLeft: "1em" }}  variant="outlined" onClick={()=>{setContract({...contract, registeredVoters : contract.registeredVoters.concat(inputVoter)} as PermissionedSimplePollVotingContract);setInputVoter("")}}><Add style={{padding : "0.4em 0em"}}/></Button>
    </Box>
      <List inputMode="text" >
    {
      contract.registeredVoters.map((voter: string, index: number) => (
        <ListItem key={voter} disablePadding value={voter} >
        <ListItemButton>
        <ListItemIcon>
        <RadioButtonUncheckedIcon   />
        </ListItemIcon>
        <FormLabel>{voter}</FormLabel> 
        <Delete onClick={()=>{contract.registeredVoters.splice(index, 1);setContract({...contract, registeredVoters : contract.registeredVoters} as PermissionedSimplePollVotingContract)}}/>
        </ListItemButton>
        </ListItem>
        ))
      }
      </List>
      
      </Grid>
      <Grid item xs={12}>
      <Box textAlign='center'>
      <Button sx={{ mt: 1, mr: 1 }} type="submit" variant="contained" disabled={!contract.name || !contract.dateFrom || !contract.dateTo || contract.options.length == 0}>
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
      
      
      export default CreatePermissionedSimplePoll;
      
      
      
      
      
      