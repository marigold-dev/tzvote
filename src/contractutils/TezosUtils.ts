import { TezosToolkit } from "@taquito/taquito";
import BigNumber from 'bignumber.js';

export enum STATUS {
    ONGOING = "ONGOING",
    LOCKED = "LOCKED"
}

export class TransactionInvalidBeaconError {
    name: string;
    title: string;
    message: string;
    description: string;
    data_contract_handle: string;
    data_with_string: string;
    data_expected_form: string;
    data_message:string;
    
    /**
    * 
    * @param transactionInvalidBeaconError  {
    "name": "UnknownBeaconError",
    "title": "Aborted",
    "message": "[ABORTED_ERROR]:The action was aborted by the user.",
    "description": "The action was aborted by the user."
}
*/

constructor(transactionInvalidBeaconError : any){
    this.name=transactionInvalidBeaconError.name;
    this.title=transactionInvalidBeaconError.title;
    this.message=transactionInvalidBeaconError.message;
    this.description=transactionInvalidBeaconError.description;
    this.data_contract_handle=""; 
    this.data_with_string="";
    this.data_expected_form="";
    this.data_message =this.message;
    if(transactionInvalidBeaconError.data != undefined){
        let dataArray = (Array.from<any>(new Map(Object.entries<any>(transactionInvalidBeaconError.data)).values()));
        let contract_handle =dataArray.find((obj)=>obj.contract_handle != undefined);
        this.data_contract_handle= contract_handle!= undefined ? contract_handle.contract_handle:"";
        let withString = dataArray.find((obj)=>obj.with != undefined);
        this.data_with_string= withString != undefined ? withString.with.string:"";
        let expected_form =  dataArray.find((obj)=>obj.expected_form != undefined);
        this.data_expected_form = expected_form!= undefined?(expected_form.expected_form + ":" +expected_form.wrong_expression.string):"";
        this.data_message = (this.data_contract_handle?"Error on contract : "+this.data_contract_handle+" ":"")+(this.data_with_string? "error : "+this.data_with_string+" ":"")+(this.data_expected_form?"error : "+this.data_expected_form+" ":"");
    }
}
};

export abstract class TezosUtils{
    
    /**
    * Return count + 1 dates that correspond to current voting period start date until end date of the last count period,
    * @param Tezos 
    * @param count 
    */
    public static async getCurrentAndNextAtBestVotingPeriodDates(Tezos: TezosToolkit, count: number): Promise<Array<Date>> {
        return new Promise<Array<Date>>(  async(resolve, reject) => { 
            var dates : Array<Date>= new Array();
            var startDate : Date = await this.getVotingPeriodStartDate(Tezos);
            dates.push(startDate);
            const blocks_per_voting_period = await(await Tezos.rpc.getConstants()).blocks_per_voting_period ;
            const time_between_blocks = await(await Tezos.rpc.getConstants()).time_between_blocks;
            for(let i = 0 ; i< count;i++){
                let endDate : Date = new Date(  startDate.getTime()  + (1000 * blocks_per_voting_period * time_between_blocks[0].toNumber()))
                dates.push(endDate);
                startDate = endDate;
            }
            resolve(dates);
        });
    }
    
    /**
    * Give index of current voting period 
    */
    public static async getVotingPeriodIndex(Tezos : TezosToolkit) : Promise<number> {
        return await (await Tezos.rpc.getCurrentPeriod()).voting_period.index;
    }
    
    /**
    * Give date of current voting period start
    */
    public static async getVotingPeriodStartDate(Tezos : TezosToolkit) : Promise<Date> {
        const currentPeriodStartBlock = await (await Tezos.rpc.getCurrentPeriod()).voting_period.start_position;
        return new Date (await (await Tezos.rpc.getBlockHeader({block:""+currentPeriodStartBlock})).timestamp) ;
    }
    
    /**
    * Estimated best end of current voting period
    * dateFrom.getTime() + (1000 * blocks_per_voting_period * time_between_blocks[0].toNumber() 
    * @param startDate (optional) by default it is the current period
    * */       
    public static async getVotingPeriodBestEndDate(Tezos : TezosToolkit , startDate? : Date) : Promise<Date> {
        const blocks_per_voting_period = await (await Tezos.rpc.getConstants()).blocks_per_voting_period ;
        const time_between_blocks = await (await Tezos.rpc.getConstants()).time_between_blocks;
        return  new Date(  (startDate?startDate.getTime():(await this.getVotingPeriodStartDate(Tezos)).getTime())       + (1000 * blocks_per_voting_period * time_between_blocks[0].toNumber()));
    }
    
    /**
    * Estimated bad average end of current voting period. We suppose an average of 1 jump priority and 10% of missing endorsements
    * dateFrom.getTime() + (1000 * blocks_per_voting_period * ((time_between_blocks[0].toNumber() +  (  time_between_blocks[1].toNumber() * 1 ) + (delay_per_missing_endorsement?delay_per_missing_endorsement.toNumber():0) * (initial_endorsers?initial_endorsers*0.1:0)    )     )) ) */       
    public static async getVotingPeriodBadAverageEndDate(Tezos : TezosToolkit) : Promise<Date> {
        var delay_per_missing_endorsement :BigNumber | undefined=  await (await Tezos.rpc.getConstants()).delay_per_missing_endorsement ;
        var initial_endorsers : number | undefined =  await (await Tezos.rpc.getConstants()).initial_endorsers;
        const blocks_per_voting_period = await (await Tezos.rpc.getConstants()).blocks_per_voting_period ;
        const time_between_blocks = await (await Tezos.rpc.getConstants()).time_between_blocks;
        return  new Date( (await this.getVotingPeriodStartDate(Tezos)).getTime() + (1000 * blocks_per_voting_period * ((time_between_blocks[0].toNumber() +  (  time_between_blocks[1].toNumber() * 1 ) + (delay_per_missing_endorsement?delay_per_missing_endorsement.toNumber():0) * (initial_endorsers?initial_endorsers*0.1:0)    )     )) );
    }
    
}