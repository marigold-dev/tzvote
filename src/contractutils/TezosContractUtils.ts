import { Contract } from "@dipdup/tzkt-api";


export class TezosVotingContract{
    name : string;
    votingPeriodIndex : number;
    options : Array<string>;
    votes : Map<string, string>; // votes by user
    results : Map<string, number>;// results by option
    votingPeriodOracle : string; // address of the oracle
    protocol : string;  //deployed on this network protocol
    tzkt : Contract;
    
    constructor(
        name : string,  
        votingPeriodIndex : number,  
        options : Array<string>,
        votes : Map<string, string>, 
        results : Map<string, number>,
        votingPeriodOracle : string,
        protocol : string,
        tzkt : Contract){
            this.name=name;
            this.votingPeriodIndex=votingPeriodIndex;
            this.options=options;
            this.results=results;
            this.votes=votes;
            this.votingPeriodOracle=votingPeriodOracle;
            this.protocol=protocol;
            this.tzkt=tzkt;
        }
    }
    
    export abstract class TezosVotingContractUtils {


        public static userNotYetVoted(userAddress: string, selectedContract: TezosVotingContract) {
            return !selectedContract.votes.has(userAddress);
        }
        
        public static convertFromTZKTTezosContract(tzktContract : Contract) : TezosVotingContract {
            return new TezosVotingContract(
                tzktContract.storage.name,
                tzktContract.storage.votingPeriodIndex,
                Array.from<string>(new Map(Object.entries<string>(tzktContract.storage.options)).values()),
                new Map<string,string>(Object.entries<string>(tzktContract.storage.votes)),
                new Map<string,number>(  Object.keys(tzktContract.storage.results).map((key,index)=>[key,Number(tzktContract.storage.results[key])])),
                tzktContract.storage.votingPeriodOracle,
                tzktContract.storage.protocol,
                tzktContract);
            }
            
        }