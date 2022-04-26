import { Contract } from "@dipdup/tzkt-api";
import { TezosToolkit } from "@taquito/taquito";
import { STATUS } from "./TezosUtils";

export class VOTING_TEMPLATE {
    public static readonly TEZOSTEMPLATE = new VOTING_TEMPLATE("bakers", "For bakers only, it uses bakers' roll power to vote and sticks to a Tezos voting period");
    public static readonly PERMISSIONEDSIMPLEPOLL = new VOTING_TEMPLATE("permissioned","Contract owner can add/remove permissioned addresses. Each address has 1 vote power. Period dates are free of choice" );
    
    private constructor(public readonly name: string, public readonly description: string) {
    }
}

export abstract class VotingContract{
    type : VOTING_TEMPLATE;
    name : string;
    dateFrom : Date;
    dateTo : Date; 
    options : Array<string>;
    votes : Map<string, string>; //transient
    results : Map<string, number>;//transient
    tzkt? : Contract | undefined;//transient
    status? : STATUS;//calculated at initialization
    
    constructor(
        type : VOTING_TEMPLATE,
        name : string,
        dateFrom : Date,
        dateTo : Date,
        options : Array<string>,
        votes : Map<string, string>, 
        results : Map<string, number>,
        tzkt? : Contract | undefined){
            this.type=type;
            this.name=name;
            this.dateFrom=dateFrom;
            this.dateTo=dateTo;
            this.options=options;
            this.results=results;
            this.votes=votes;
            this.tzkt=tzkt;
        }
        
        /**
        * Return if user can vote now
        * @param userAddress the user address
        * @param bakerPower (optional) baker power number 
        * @returns boolean
        */
        abstract userCanVoteNow(userAddress : string, bakerPower? : number) : boolean;
        
    }
    
    export class PermissionedSimplePollVotingContract extends VotingContract{
        
        owner : string; //the administrator who can add/remove voters
        registeredVoters : Array<string>; // registered people who can vote
        
        constructor(  
            name? : string,
            dateFrom? : Date,
            dateTo? : Date,
            options? : Array<string>,
            votes? : Map<string, string>, 
            results? : Map<string, number>,
            tzkt? : Contract,
            owner? : string,
            registeredVoters? : Array<string>,
            tzktContract? : Contract
            ){
                //default constructor
                if(!tzktContract){
                    if(!name || !dateFrom || !dateTo || !options || !owner || !registeredVoters )throw new Error("name ,dateFrom ,dateTo ,options ,owner ,registeredVoters are mandatory");
                    super(VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL,name!,dateFrom!,dateTo!,options!,new Map(),new Map(),undefined);
                    this.owner=owner!;
                    this.registeredVoters=registeredVoters!;
                }else{ //from tzkt constructor
                    super(
                        VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL,
                        tzktContract.storage.name,
                        new Date(tzktContract.storage.from),
                        new Date(tzktContract.storage.to),
                        Array.from<string>(new Map(Object.entries<string>(tzktContract.storage.options)).values()),
                        new Map<string,string>(Object.entries<string>(tzktContract.storage.votes)),
                        new Map<string,number>(  Object.keys(tzktContract.storage.results).map((key)=>[key,Number(tzktContract.storage.results[key])])),
                        tzktContract);
                        this.owner = tzktContract.storage.owner;
                        this.registeredVoters =  Array.from<string>(new Map(Object.entries<string>(tzktContract.storage.registeredVoters)).values());
                    }
                    this.status = (new Date > this.dateFrom && new Date() < this.dateTo )?STATUS.ONGOING:STATUS.LOCKED;
                }; 
                
                userCanVoteNow(userAddress: string, bakerPower?: number, Tezos?:TezosToolkit): boolean {
                    return !this.votes.has(userAddress!) && (this.status == STATUS.ONGOING ) && this.registeredVoters.indexOf(userAddress) >=0; 
                }    
                
                
            }
            
            
            export class TezosTemplateVotingContract extends VotingContract{
                votingPeriodIndex : number;
                votingPeriodOracle : string; // address of the oracle
                protocol : string;  //deployed on this network protocol
                
                constructor(  
                    name : string,
                    votingPeriodIndex : number,  
                    dateFrom : Date,
                    dateTo : Date,
                    options : Array<string>,
                    votes : Map<string, string>, 
                    results : Map<string, number>,
                    votingPeriodOracle : string,
                    protocol : string,
                    tzkt? : Contract){
                        super(VOTING_TEMPLATE.TEZOSTEMPLATE,name,dateFrom,dateTo,options,votes,results,tzkt);
                        this.votingPeriodIndex=votingPeriodIndex;
                        this.votingPeriodOracle=votingPeriodOracle;
                        this.protocol=protocol;
                    };
                    
                    userCanVoteNow(userAddress: string, bakerPower?: number): boolean {
                        return !this.votes.has(userAddress!) && ( this.status == STATUS.ONGOING ) && bakerPower! > 0; 
                    } 
                    
                }
                
                export abstract class VotingContractUtils {
                    
                    public static async convertFromTZKTTezosContractToTezosTemplateVotingContract(Tezos:TezosToolkit,tzktContract : Contract) : Promise<TezosTemplateVotingContract> {
                        let votingPeriodBlockResult  = await Tezos.rpc.getCurrentPeriod();
                        const currentPeriodStartBlock = votingPeriodBlockResult.voting_period.start_position;
                        let dateFrom = new Date (await (await Tezos.rpc.getBlockHeader({block:""+currentPeriodStartBlock})).timestamp) ;
                        const constantsResponse = await Tezos.rpc.getConstants();
                        let blocksUntilTheEnd : number = constantsResponse.blocks_per_voting_period ;
                        //Provided that at least two thirds of the total active stake participates honestly in consensus, then a decision is eventually taken.2 In the current implementation of Tenderbake the duration of each round increments by 15 seconds, starting from 30 seconds: thus the deadline for participation in round 0 is 30 seconds, that for round 1 is 45 seconds after that, and so on. So in normal conditions, when consensus is reached promptly at round 0 every time, we can expect Tenderbake to add one block every 30 seconds. Note that: Tenderbake has deterministic finality after just two blocks. In normal conditions, when the network is healthy, decisions are made at round 0, after 30 seconds. This means that in normal conditions the time to finality is about one minute.
                        const block_estimated_duration = 30;
                        let dateTo =new Date(dateFrom.getTime() + (1000 * blocksUntilTheEnd * block_estimated_duration));
                        if(tzktContract.storage.votingPeriodIndex == votingPeriodBlockResult.voting_period.index){ //if current, we can have more accurate thatns to remaining blocks data
                            blocksUntilTheEnd = votingPeriodBlockResult.remaining;
                            dateTo =new Date(Date.now() + (1000 * blocksUntilTheEnd * block_estimated_duration));
                        }
                        let votes = new Map<string,string>(Object.entries<string>(tzktContract.storage.votes));
                        let tezosTemplateVotingContract = new TezosTemplateVotingContract(
                            tzktContract.storage.name,
                            tzktContract.storage.votingPeriodIndex,
                            dateFrom,
                            dateTo,
                            Array.from<string>(new Map(Object.entries<string>(tzktContract.storage.options)).values()),
                            votes,
                            new Map<string,number>(  Object.keys(tzktContract.storage.results).map((key,index)=>[key,Number(tzktContract.storage.results[key])])),
                            tzktContract.storage.votingPeriodOracle,
                            tzktContract.storage.protocol,
                            tzktContract);
                            
                            tezosTemplateVotingContract.status = (tezosTemplateVotingContract.votingPeriodIndex == votingPeriodBlockResult.voting_period.index)?STATUS.ONGOING:STATUS.LOCKED;
                            return tezosTemplateVotingContract;
                        }
                        
                    } 