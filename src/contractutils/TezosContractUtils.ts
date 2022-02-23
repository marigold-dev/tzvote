import { Account, Contract } from "@dipdup/tzkt-api";
import { TezosToolkit } from "@taquito/taquito";
import { STATUS, TezosUtils } from "./TezosUtils";


export class TezosVotingContract{
    name : string;
    votingPeriodIndex : number;
    status : STATUS;//transient
    dateFrom : Date; //transient
    dateTo : Date; //transient
    options : Array<string>;
    votes : Map<string, string>; //transient
    results : Map<string, number>;//transient
    votingPeriodOracle : string; // address of the oracle
    protocol : string;  //deployed on this network protocol
    tzkt : Contract;//transient
    
    constructor(
        name : string,  
        votingPeriodIndex : number,  
        status : STATUS,
        dateFrom : Date,
        dateTo : Date,
        options : Array<string>,
        votes : Map<string, string>, 
        results : Map<string, number>,
        votingPeriodOracle : string,
        protocol : string,
        tzkt : Contract){
            this.name=name;
            this.votingPeriodIndex=votingPeriodIndex;
            this.status=status;
            this.dateFrom=dateFrom;
            this.dateTo=dateTo;
            this.options=options;
            this.results=results;
            this.votes=votes;
            this.votingPeriodOracle=votingPeriodOracle;
            this.protocol=protocol;
            this.tzkt=tzkt};
        }
        
        export abstract class TezosVotingContractUtils {
            
            
            public static userNotYetVoted(userAddress: string, selectedContract: TezosVotingContract) {
                return !selectedContract.votes.has(userAddress);
            }
            
            public static async convertFromTZKTTezosContract(Tezos:TezosToolkit,tzktContract : Contract) : Promise<TezosVotingContract> {
                let votingPeriodBlockResult  = await Tezos.rpc.getCurrentPeriod();
                const currentPeriodStartBlock = votingPeriodBlockResult.voting_period.start_position;
                let dateFrom = new Date (await (await Tezos.rpc.getBlockHeader({block:""+currentPeriodStartBlock})).timestamp) ;
                const constantsResponse = await Tezos.rpc.getConstants();
                const blocks_per_voting_period = constantsResponse.blocks_per_voting_period ;
                const time_between_blocks = constantsResponse.time_between_blocks;
                let dateTo =new Date(dateFrom.getTime() + (1000 * blocks_per_voting_period * time_between_blocks[0].toNumber()));
                return new TezosVotingContract(
                    tzktContract.storage.name,
                    tzktContract.storage.votingPeriodIndex,
                    (tzktContract.storage.votingPeriodIndex == votingPeriodBlockResult.voting_period.index)?STATUS.ONGOING:STATUS.LOCKED,
                    dateFrom,
                    dateTo,
                    Array.from<string>(new Map(Object.entries<string>(tzktContract.storage.options)).values()),
                    new Map<string,string>(Object.entries<string>(tzktContract.storage.votes)),
                    new Map<string,number>(  Object.keys(tzktContract.storage.results).map((key,index)=>[key,Number(tzktContract.storage.results[key])])),
                    tzktContract.storage.votingPeriodOracle,
                    tzktContract.storage.protocol,
                    tzktContract);
                }
                
            }