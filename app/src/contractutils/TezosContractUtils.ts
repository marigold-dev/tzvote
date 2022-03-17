import { Account, Contract } from "@dipdup/tzkt-api";
import { TezosToolkit } from "@taquito/taquito";
import { STATUS, TezosUtils } from "./TezosUtils";

export class VOTING_TEMPLATE {
    public static readonly TEZOSTEMPLATE = new VOTING_TEMPLATE("bakers", "For bakers only, it uses bakers' roll power to vote and sticks to a Tezos voting period");
    public static readonly PERMISSIONEDSIMPLEPOLL = new VOTING_TEMPLATE("permissioned","Contract owner can add/remove permissioned addresses. Each address has 1 vote power. Period dates are free of choice" );
  
    private constructor(public readonly name: string, public readonly description: string) {
    }
  }

export abstract class VotingContract{
    type : VOTING_TEMPLATE;

    constructor(type : VOTING_TEMPLATE){
        this.type=type;
    }
}

export class TezosTemplateVotingContract extends VotingContract{
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
    userYetVoted: boolean;
    
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
        tzkt : Contract,
        userYetVoted : boolean){
            super(VOTING_TEMPLATE.TEZOSTEMPLATE);
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
            this.tzkt=tzkt;
            this.userYetVoted = userYetVoted;
        };
        }
        
export abstract class VotingContractUtils {
    
    public static async convertFromTZKTTezosContractToTezosTemplateVotingContract(Tezos:TezosToolkit,tzktContract : Contract, userAddress : string) : Promise<TezosTemplateVotingContract> {
        let votingPeriodBlockResult  = await Tezos.rpc.getCurrentPeriod();
        const currentPeriodStartBlock = votingPeriodBlockResult.voting_period.start_position;
        let dateFrom = new Date (await (await Tezos.rpc.getBlockHeader({block:""+currentPeriodStartBlock})).timestamp) ;
        const constantsResponse = await Tezos.rpc.getConstants();
        let blocksUntilTheEnd : number = constantsResponse.blocks_per_voting_period ;
        const time_between_blocks = constantsResponse.time_between_blocks;
        let dateTo =new Date(dateFrom.getTime() + (1000 * blocksUntilTheEnd * time_between_blocks[0].toNumber()));
        if(tzktContract.storage.votingPeriodIndex == votingPeriodBlockResult.voting_period.index){ //if current, we can have more accurate thatns to remaining blocks data
            blocksUntilTheEnd = votingPeriodBlockResult.remaining;
            dateTo =new Date(Date.now() + (1000 * blocksUntilTheEnd * time_between_blocks[0].toNumber()));
        }
        let votes = new Map<string,string>(Object.entries<string>(tzktContract.storage.votes));
        return new TezosTemplateVotingContract(
            tzktContract.storage.name,
            tzktContract.storage.votingPeriodIndex,
            (tzktContract.storage.votingPeriodIndex == votingPeriodBlockResult.voting_period.index)?STATUS.ONGOING:STATUS.LOCKED,
            dateFrom,
            dateTo,
            Array.from<string>(new Map(Object.entries<string>(tzktContract.storage.options)).values()),
            votes,
            new Map<string,number>(  Object.keys(tzktContract.storage.results).map((key,index)=>[key,Number(tzktContract.storage.results[key])])),
            tzktContract.storage.votingPeriodOracle,
            tzktContract.storage.protocol,
            tzktContract,
            votes.has(userAddress));
        }
        
    }