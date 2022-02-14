import { Contract } from "@dipdup/tzkt-api";

export enum STATUS {
    ONGOING = "ONGOING",
    FINISHED = "FINISHED"
  }

export class TezosVotingContract{
    name : string;
    dateTo : Date;
    dateFrom : Date;
    options : Array<string>;
    votes : Map<string, string>; // votes by user
    results : Map<string, number>;// results by option
    tzkt : Contract;
    
    constructor(
        name : string,  
        dateTo : Date, 
        dateFrom : Date,   
        options : Array<string>,
        votes : Map<string, string>, 
        results : Map<string, number>,
        tzkt : Contract){
            this.name=name;
            this.dateTo=dateTo;
            this.dateFrom=dateFrom;
            this.options=options;
            this.results=results;
            this.votes=votes;
            this.tzkt=tzkt;
        }
    }
    
    export abstract class TezosVotingContractUtils {

        public static getVotingPeriodStatus(contract: TezosVotingContract) {
            if(contract.dateFrom < new Date() && new Date() < contract.dateTo)
            return STATUS.ONGOING; else
            return STATUS.FINISHED;
        }

        public static userNotYetVoted(userAddress: string, selectedContract: TezosVotingContract) {
            return !selectedContract.votes.has(userAddress);
        }
        
        public static convertFromTZKTTezosContract(tzktContract : Contract) : TezosVotingContract {
            return new TezosVotingContract(
                tzktContract.storage.name,
                new Date(tzktContract.storage.dateTo),
                new Date(tzktContract.storage.dateFrom),
                Array.from<string>(new Map(Object.entries<string>(tzktContract.storage.options)).values()),
                new Map<string,string>(Object.entries<string>(tzktContract.storage.votes)),
                new Map<string,number>(  Object.keys(tzktContract.storage.results).map((key,index)=>[key,Number(tzktContract.storage.results[key])])),
                tzktContract);
            }
            
        }