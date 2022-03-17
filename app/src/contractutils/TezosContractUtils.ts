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
    name : string;
    status : STATUS;
    dateFrom : Date;
    dateTo : Date; 
    options : Array<string>;
    votes : Map<string, string>; //transient
    results : Map<string, number>;//transient
    userYetVoted: boolean;
    tzkt : Contract;//transient

    constructor(
        type : VOTING_TEMPLATE,
        name : string,
        status : STATUS,
        dateFrom : Date,
        dateTo : Date,
        options : Array<string>,
        votes : Map<string, string>, 
        results : Map<string, number>,
        tzkt : Contract,
        userYetVoted : boolean){
        this.type=type;
        this.name=name;
        this.status=status;
        this.dateFrom=dateFrom;
        this.dateTo=dateTo;
        this.options=options;
        this.results=results;
        this.votes=votes;
        this.tzkt=tzkt;
        this.userYetVoted = userYetVoted;
    }
}

//TODO export class PermissionedSimplePollVotingContract extends VotingContract{


export class TezosTemplateVotingContract extends VotingContract{
    votingPeriodIndex : number;
    votingPeriodOracle : string; // address of the oracle
    protocol : string;  //deployed on this network protocol
    
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
            super(VOTING_TEMPLATE.TEZOSTEMPLATE,name,status,dateFrom,dateTo,options,votes,results,tzkt,userYetVoted);
            this.votingPeriodIndex=votingPeriodIndex;
            this.votingPeriodOracle=votingPeriodOracle;
            this.protocol=protocol;
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