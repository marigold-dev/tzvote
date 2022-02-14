import { TezosToolkit } from "@taquito/taquito";
import BigNumber from 'bignumber.js';

export abstract class TezosUtils{
     
    /**
    * Give date of current voting period start
    */
    public static async getVotingPeriodStartDate(Tezos : TezosToolkit) : Promise<Date> {
        const currentPeriodStartBlock = await (await Tezos.rpc.getCurrentPeriod()).voting_period.start_position;
        return new Date (await (await Tezos.rpc.getBlockHeader({block:""+currentPeriodStartBlock})).timestamp) ;
    }
    
    /**
    * Estimated best end of current voting period
    * dateFrom.getTime() + (1000 * blocks_per_voting_period * time_between_blocks[0].toNumber() */       
    public static async getVotingPeriodBestEndDate(Tezos : TezosToolkit) : Promise<Date> {
        const blocks_per_voting_period = await (await Tezos.rpc.getConstants()).blocks_per_voting_period ;
        const time_between_blocks = await (await Tezos.rpc.getConstants()).time_between_blocks;
        return  new Date( (await this.getVotingPeriodStartDate(Tezos)).getTime() + (1000 * blocks_per_voting_period * time_between_blocks[0].toNumber()));
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