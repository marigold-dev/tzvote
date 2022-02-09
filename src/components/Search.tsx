import React, { useState, Dispatch, SetStateAction, Component } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { Contract, ContractsService,DefaultApiOptions } from '@dipdup/tzkt-api';
import { render } from "react-dom";
import { Box, Card, CardContent, CardMedia, Chip, Slider, TextField, Typography } from "@mui/material";
import { EmojiEvents, PersonOutlined } from "@mui/icons-material";
import { Mark } from "@mui/base";
import { OverridableComponent } from "@mui/material/OverridableComponent";


const Search = ({
  Tezos,
  userAddress
}: {
  Tezos: TezosToolkit;
  userAddress: string;
}): JSX.Element => {
  const [nameFilter, setNameFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [contracts, setContracts] = useState<Array<Contract>>([]);
  
  const contractsService = new ContractsService( {baseUrl: "https://api.hangzhou2net.tzkt.io" , version : "", withCredentials : false});
  
  const search = async (nf : string): Promise<void> => {
    setNameFilter(nf);
    if (nameFilter) {
      setLoading(true);
      try {
        
        setContracts(await contractsService.getSame({address:"KT1PYJvdStoHsCsNoKTFigqCqjd5eWo1uMYd" , includeStorage:true}));
        console.log(contracts);
        
        
        
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };
  
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

  const dateArea = (contract : Contract) : any => {
    if(false && Date.parse(contract.storage.dateFrom) < Date.now() && Date.now() < Date.parse(contract.storage.dateTo)){
      return <Slider 
      aria-label="Period"
      key={`slider-${contract.address}`}
      value={(new Date()).getTime() / 1000000000000}
      getAriaValueText= {dateSliderToString}
      valueLabelFormat={dateSliderToString}
      valueLabelDisplay="on"
      min={Date.parse(contract.storage.dateFrom)/ 1000000000000}
      max={Date.parse(contract.storage.dateTo)/ 1000000000000}
      marks={fromToMarks(contract)}
      />
    }else{
      //get the winner because it is finished
      console.log(contract.storage.results);
      if(contract.storage.results){

        return <Chip icon={<EmojiEvents />} label="NO WINNER" />
      }else {
        return <Chip icon={<EmojiEvents />} label="NO WINNER" />
      }
    }
  };
  
  
  return (
    <div>
    <div id="search-inputs">
    <input
    type="text"
    placeholder="name"
    value={nameFilter}
    onChange={e => search(e.target.value)}
    />
    </div>
    
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
      Created by <PersonOutlined /> {contract.creator?.address}
      </Typography>
      </CardContent>
      
      </Box>
      <Box paddingTop="5em" paddingRight="5em" width="20%">
    
      {dateArea(contract)}
      
      </Box>
      <Box padding="1em" height="auto" width="10%">
      <CardMedia
      component="img"
      height="auto"
      image="https://serpapi.com/searches/62039f63c504e9175f2238e7/images/ff0d6c4883bc7817d743130c6c3d06fe3be6453e795638841abe6e46e9fe994e.jpeg"
      />
      </Box>
      </Card>
      ))}
      
      </div>
      );
    };
    
    export default Search;
    