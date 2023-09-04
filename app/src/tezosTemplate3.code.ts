
export const TezosTemplate3Code: { __type: 'TezosTemplate3Code', protocol: string, code: object[] } = {
    __type: 'TezosTemplate3Code',
    protocol: 'PsDELPH1Kxsxt8f9eWbxQeRxkjfbxoqM52jvs5Y5fBxWWh4ifpo',
    code: JSON.parse(`[{"prim":"parameter","args":[{"prim":"pair","args":[{"prim":"string"},{"prim":"key_hash"}]}]},{"prim":"storage","args":[{"prim":"pair","args":[{"prim":"pair","args":[{"prim":"pair","args":[{"prim":"string","annots":["%name"]},{"prim":"list","annots":["%options"],"args":[{"prim":"string"}]}]},{"prim":"map","annots":["%results"],"args":[{"prim":"string"},{"prim":"int"}]},{"prim":"map","annots":["%votes"],"args":[{"prim":"address"},{"prim":"string"}]}]},{"prim":"nat","annots":["%votingPeriodIndex"]},{"prim":"address","annots":["%votingPeriodOracle"]}]}]},{"prim":"code","args":[[[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIP","args":[[{"prim":"CDR"}]]}]],[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIP","args":[[{"prim":"CDR"}]]}]],{"prim":"PUSH","args":[{"prim":"int"},{"int":"0"}]},[{"prim":"DIP","args":[{"int":"2"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"3"}]}],{"prim":"VOTING_POWER"},{"prim":"INT"},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[{"prim":"DROP","args":[{"int":"3"}]},{"prim":"PUSH","args":[{"prim":"string"},{"string":"Sender has no rolls and cannot vote"}]},{"prim":"FAILWITH"}],[{"prim":"NONE","args":[{"prim":"string"}]},[{"prim":"DIP","args":[{"int":"3"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"4"}]}],{"prim":"CAR"},{"prim":"CAR"},{"prim":"CDR"},{"prim":"NIL","args":[{"prim":"string"}]},{"prim":"SWAP"},{"prim":"ITER","args":[[{"prim":"CONS"}]]},{"prim":"ITER","args":[[{"prim":"PAIR"},[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"CAR"},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[{"prim":"CAR"},{"prim":"SOME"}],[{"prim":"CDR"}]]}]]},{"prim":"NONE","args":[{"prim":"string"}]},{"prim":"SWAP"},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[{"prim":"DROP","args":[{"int":"3"}]},{"prim":"PUSH","args":[{"prim":"string"},{"string":"Option does not exist"}]},{"prim":"FAILWITH"}],[[{"prim":"DIP","args":[{"int":"2"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"3"}]}],{"prim":"CAR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"SOURCE"},{"prim":"GET"},{"prim":"IF_NONE","args":[[],[{"prim":"PUSH","args":[{"prim":"string"},{"string":"  already exists for this user"}]},{"prim":"SWAP"},{"prim":"PUSH","args":[{"prim":"string"},{"string":"A vote with option "}]},{"prim":"CONCAT"},{"prim":"CONCAT"},{"prim":"FAILWITH"}]]},[{"prim":"DIP","args":[{"int":"2"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"3"}]}],{"prim":"CDR"},{"prim":"CDR"},{"prim":"UNIT"},{"prim":"VIEW","args":[{"string":"currentVotingPeriod"},{"prim":"nat"}]},{"prim":"IF_NONE","args":[[{"prim":"DROP","args":[{"int":"3"}]},{"prim":"PUSH","args":[{"prim":"string"},{"string":"Cannot find view currentVotingPeriod on given oracle address"}]},{"prim":"FAILWITH"}],[[{"prim":"DIP","args":[{"int":"3"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"4"}]}],{"prim":"CDR"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"COMPARE"},{"prim":"NEQ"},{"prim":"IF","args":[[{"prim":"DROP","args":[{"int":"3"}]},{"prim":"PUSH","args":[{"prim":"string"},{"string":"Not yet the time to vote"}]},{"prim":"FAILWITH"}],[[{"prim":"DIP","args":[{"int":"2"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"3"}]}],[{"prim":"DIP","args":[{"int":"3"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"4"}]}],{"prim":"CAR"},{"prim":"DUP"},{"prim":"CDR"},[{"prim":"DIP","args":[{"int":"5"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"6"}]}],{"prim":"CAR"},{"prim":"CDR"},{"prim":"CAR"},[{"prim":"DIP","args":[{"int":"4"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"5"}]}],{"prim":"GET"},{"prim":"IF_NONE","args":[[[{"prim":"DIP","args":[{"int":"5"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"6"}]}],{"prim":"CAR"},{"prim":"CDR"},{"prim":"CAR"},{"prim":"DIG","args":[{"int":"5"}]},{"prim":"VOTING_POWER"},{"prim":"INT"},[{"prim":"DIP","args":[{"int":"5"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"6"}]}],{"prim":"SWAP"},{"prim":"SOME"},{"prim":"SWAP"},{"prim":"UPDATE"}],[[{"prim":"DIP","args":[{"int":"6"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"7"}]}],{"prim":"CAR"},{"prim":"CDR"},{"prim":"CAR"},{"prim":"DIG","args":[{"int":"6"}]},{"prim":"VOTING_POWER"},{"prim":"INT"},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"ADD"},[{"prim":"DIP","args":[{"int":"5"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"6"}]}],{"prim":"SWAP"},{"prim":"SOME"},{"prim":"SWAP"},{"prim":"UPDATE"}]]},{"prim":"UPDATE","args":[{"int":"1"}]},{"prim":"UPDATE","args":[{"int":"2"}]},{"prim":"UPDATE","args":[{"int":"1"}]},{"prim":"DUP"},{"prim":"CAR"},{"prim":"DUP"},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"4"}]},{"prim":"CAR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"4"}]},{"prim":"SOURCE"},{"prim":"SWAP"},{"prim":"SOME"},{"prim":"SWAP"},{"prim":"UPDATE"},{"prim":"UPDATE","args":[{"int":"2"}]},{"prim":"UPDATE","args":[{"int":"2"}]},{"prim":"UPDATE","args":[{"int":"1"}]},{"prim":"NIL","args":[{"prim":"operation"}]},{"prim":"PAIR"}]]}]]}]]}]]}]]}]`)
};