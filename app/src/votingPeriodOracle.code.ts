
export const VotingPeriodOracleCode: { __type: 'VotingPeriodOracleCode', protocol: string, code: object[] } = {
    __type: 'VotingPeriodOracleCode',
    protocol: 'PsDELPH1Kxsxt8f9eWbxQeRxkjfbxoqM52jvs5Y5fBxWWh4ifpo',
    code: JSON.parse(`[{"prim":"parameter","args":[{"prim":"nat"}]},{"prim":"storage","args":[{"prim":"pair","args":[{"prim":"address","annots":["%admin"]},{"prim":"nat","annots":["%votingPeriodIndex"]}]}]},{"prim":"code","args":[[[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIP","args":[[{"prim":"CDR"}]]}]],[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"CAR"},{"prim":"SENDER"},{"prim":"COMPARE"},{"prim":"NEQ"},{"prim":"IF","args":[[{"prim":"DROP","args":[{"int":"2"}]},{"prim":"PUSH","args":[{"prim":"string"},{"string":"You are not the admin !!!"}]},{"prim":"FAILWITH"}],[{"prim":"UPDATE","args":[{"int":"2"}]},{"prim":"NIL","args":[{"prim":"operation"}]},{"prim":"PAIR"}]]}]]},{"prim":"view","args":[{"string":"currentVotingPeriod"},{"prim":"unit"},{"prim":"nat"},[{"prim":"CDR"},{"prim":"CDR"}]]}]`)
};
