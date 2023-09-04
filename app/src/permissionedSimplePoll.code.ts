
export const PermissionedSimplePollCode: { __type: 'PermissionedSimplePollCode', protocol: string, code: object[] } = {
    __type: 'PermissionedSimplePollCode',
    protocol: 'PsDELPH1Kxsxt8f9eWbxQeRxkjfbxoqM52jvs5Y5fBxWWh4ifpo',
    code: JSON.parse(`[{"prim":"parameter","args":[{"prim":"or","args":[{"prim":"or","args":[{"prim":"address","annots":["%addVoter"]},{"prim":"address","annots":["%removeVoter"]}]},{"prim":"string","annots":["%vote"]}]}]},{"prim":"storage","args":[{"prim":"pair","args":[{"prim":"pair","args":[{"prim":"pair","args":[{"prim":"timestamp","annots":["%from_"]},{"prim":"string","annots":["%name"]}]},{"prim":"list","annots":["%options"],"args":[{"prim":"string"}]},{"prim":"address","annots":["%owner"]}]},{"prim":"pair","args":[{"prim":"list","annots":["%registeredVoters"],"args":[{"prim":"address"}]},{"prim":"map","annots":["%results"],"args":[{"prim":"string"},{"prim":"int"}]}]},{"prim":"timestamp","annots":["%to"]},{"prim":"map","annots":["%votes"],"args":[{"prim":"address"},{"prim":"string"}]}]}]},{"prim":"code","args":[[[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIP","args":[[{"prim":"CDR"}]]}]],{"prim":"IF_LEFT","args":[[{"prim":"IF_LEFT","args":[[[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"CAR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"SOURCE"},{"prim":"COMPARE"},{"prim":"NEQ"},{"prim":"IF","args":[[{"prim":"DROP","args":[{"int":"2"}]},{"prim":"PUSH","args":[{"prim":"string"},{"string":"User has to be owner"}]},{"prim":"FAILWITH"}],[{"prim":"NONE","args":[{"prim":"address"}]},[{"prim":"DIP","args":[{"int":"2"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"3"}]}],{"prim":"CDR"},{"prim":"CAR"},{"prim":"CAR"},{"prim":"NIL","args":[{"prim":"address"}]},{"prim":"SWAP"},{"prim":"ITER","args":[[{"prim":"CONS"}]]},{"prim":"ITER","args":[[{"prim":"PAIR"},[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"CAR"},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[{"prim":"CAR"},{"prim":"SOME"}],[{"prim":"CDR"}]]}]]},{"prim":"NONE","args":[{"prim":"address"}]},{"prim":"SWAP"},{"prim":"COMPARE"},{"prim":"NEQ"},{"prim":"IF","args":[[{"prim":"DROP","args":[{"int":"2"}]},{"prim":"PUSH","args":[{"prim":"string"},{"string":"User is already registered"}]},{"prim":"FAILWITH"}],[[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"CDR"},{"prim":"CDR"},{"prim":"CAR"},{"prim":"NOW"},{"prim":"COMPARE"},{"prim":"GT"},{"prim":"IF","args":[[{"prim":"DROP","args":[{"int":"2"}]},{"prim":"PUSH","args":[{"prim":"string"},{"string":"Too late to add voter"}]},{"prim":"FAILWITH"}],[[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],[{"prim":"DIP","args":[{"int":"2"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"3"}]}],{"prim":"CDR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIG","args":[{"int":"4"}]},{"prim":"CDR"},{"prim":"CAR"},{"prim":"CAR"},{"prim":"DIG","args":[{"int":"4"}]},{"prim":"CONS"},{"prim":"UPDATE","args":[{"int":"1"}]},{"prim":"UPDATE","args":[{"int":"1"}]},{"prim":"UPDATE","args":[{"int":"2"}]},{"prim":"NIL","args":[{"prim":"operation"}]},{"prim":"PAIR"}]]}]]}]]}],[[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"CAR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"SOURCE"},{"prim":"COMPARE"},{"prim":"NEQ"},{"prim":"IF","args":[[{"prim":"DROP","args":[{"int":"2"}]},{"prim":"PUSH","args":[{"prim":"string"},{"string":"User has to be owner"}]},{"prim":"FAILWITH"}],[{"prim":"NONE","args":[{"prim":"address"}]},[{"prim":"DIP","args":[{"int":"2"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"3"}]}],{"prim":"CDR"},{"prim":"CAR"},{"prim":"CAR"},{"prim":"NIL","args":[{"prim":"address"}]},{"prim":"SWAP"},{"prim":"ITER","args":[[{"prim":"CONS"}]]},{"prim":"ITER","args":[[{"prim":"PAIR"},[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"CAR"},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[{"prim":"CAR"},{"prim":"SOME"}],[{"prim":"CDR"}]]}]]},{"prim":"NONE","args":[{"prim":"address"}]},{"prim":"SWAP"},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[{"prim":"DROP","args":[{"int":"2"}]},{"prim":"PUSH","args":[{"prim":"string"},{"string":"User not found"}]},{"prim":"FAILWITH"}],[[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"CDR"},{"prim":"CDR"},{"prim":"CAR"},{"prim":"NOW"},{"prim":"COMPARE"},{"prim":"GT"},{"prim":"IF","args":[[{"prim":"DROP","args":[{"int":"2"}]},{"prim":"PUSH","args":[{"prim":"string"},{"string":"Too late to remove voter"}]},{"prim":"FAILWITH"}],[[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"CDR"},{"prim":"CDR"},{"prim":"CDR"},[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"GET"},{"prim":"IF_NONE","args":[[],[{"prim":"PUSH","args":[{"prim":"string"},{"string":"  already exists for this user, we cannot remove it"}]},{"prim":"SWAP"},{"prim":"PUSH","args":[{"prim":"string"},{"string":"A vote with option "}]},{"prim":"CONCAT"},{"prim":"CONCAT"},{"prim":"FAILWITH"}]]},[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],[{"prim":"DIP","args":[{"int":"2"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"3"}]}],{"prim":"CDR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"NIL","args":[{"prim":"address"}]},{"prim":"DIG","args":[{"int":"5"}]},{"prim":"CDR"},{"prim":"CAR"},{"prim":"CAR"},{"prim":"NIL","args":[{"prim":"address"}]},{"prim":"SWAP"},{"prim":"ITER","args":[[{"prim":"CONS"}]]},{"prim":"ITER","args":[[{"prim":"PAIR"},{"prim":"DUP"},{"prim":"CAR"},[{"prim":"DIP","args":[{"int":"5"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"6"}]}],[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[{"prim":"DROP"},{"prim":"NONE","args":[{"prim":"address"}]}],[{"prim":"SOME"}]]},{"prim":"IF_NONE","args":[[{"prim":"CDR"}],[{"prim":"SWAP"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"CONS"}]]}]]},{"prim":"DIG","args":[{"int":"4"}]},{"prim":"DROP"},{"prim":"UPDATE","args":[{"int":"1"}]},{"prim":"UPDATE","args":[{"int":"1"}]},{"prim":"UPDATE","args":[{"int":"2"}]},{"prim":"NIL","args":[{"prim":"operation"}]},{"prim":"PAIR"}]]}]]}]]}]]}],[{"prim":"NONE","args":[{"prim":"address"}]},[{"prim":"DIP","args":[{"int":"2"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"3"}]}],{"prim":"CDR"},{"prim":"CAR"},{"prim":"CAR"},{"prim":"NIL","args":[{"prim":"address"}]},{"prim":"SWAP"},{"prim":"ITER","args":[[{"prim":"CONS"}]]},{"prim":"ITER","args":[[{"prim":"PAIR"},{"prim":"SOURCE"},[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"CAR"},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[{"prim":"CAR"},{"prim":"SOME"}],[{"prim":"CDR"}]]}]]},{"prim":"NONE","args":[{"prim":"address"}]},{"prim":"SWAP"},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[{"prim":"DROP","args":[{"int":"2"}]},{"prim":"PUSH","args":[{"prim":"string"},{"string":"User is not registered"}]},{"prim":"FAILWITH"}],[{"prim":"NONE","args":[{"prim":"string"}]},[{"prim":"DIP","args":[{"int":"2"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"3"}]}],{"prim":"CAR"},{"prim":"CDR"},{"prim":"CAR"},{"prim":"NIL","args":[{"prim":"string"}]},{"prim":"SWAP"},{"prim":"ITER","args":[[{"prim":"CONS"}]]},{"prim":"ITER","args":[[{"prim":"PAIR"},[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"CAR"},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[{"prim":"CAR"},{"prim":"SOME"}],[{"prim":"CDR"}]]}]]},{"prim":"NONE","args":[{"prim":"string"}]},{"prim":"SWAP"},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[{"prim":"DROP","args":[{"int":"2"}]},{"prim":"PUSH","args":[{"prim":"string"},{"string":"Option does not exist"}]},{"prim":"FAILWITH"}],[[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"CDR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"SOURCE"},{"prim":"GET"},{"prim":"IF_NONE","args":[[],[{"prim":"PUSH","args":[{"prim":"string"},{"string":"  already exists for this user"}]},{"prim":"SWAP"},{"prim":"PUSH","args":[{"prim":"string"},{"string":"A vote with option "}]},{"prim":"CONCAT"},{"prim":"CONCAT"},{"prim":"FAILWITH"}]]},[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"CDR"},{"prim":"CDR"},{"prim":"CAR"},{"prim":"NOW"},{"prim":"COMPARE"},{"prim":"GT"},[{"prim":"DIP","args":[{"int":"2"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"3"}]}],{"prim":"CAR"},{"prim":"CAR"},{"prim":"CAR"},{"prim":"NOW"},{"prim":"COMPARE"},{"prim":"LT"},{"prim":"OR"},{"prim":"IF","args":[[{"prim":"DROP","args":[{"int":"2"}]},{"prim":"PUSH","args":[{"prim":"string"},{"string":"Not yet the time to vote"}]},{"prim":"FAILWITH"}],[[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],[{"prim":"DIP","args":[{"int":"2"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"3"}]}],{"prim":"CDR"},{"prim":"DUP"},{"prim":"CAR"},[{"prim":"DIP","args":[{"int":"4"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"5"}]}],{"prim":"CDR"},{"prim":"CAR"},{"prim":"CDR"},[{"prim":"DIP","args":[{"int":"4"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"5"}]}],{"prim":"GET"},{"prim":"IF_NONE","args":[[[{"prim":"DIP","args":[{"int":"4"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"5"}]}],{"prim":"CDR"},{"prim":"CAR"},{"prim":"CDR"},{"prim":"PUSH","args":[{"prim":"int"},{"int":"1"}]},[{"prim":"DIP","args":[{"int":"5"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"6"}]}],{"prim":"SWAP"},{"prim":"SOME"},{"prim":"SWAP"},{"prim":"UPDATE"}],[[{"prim":"DIP","args":[{"int":"5"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"6"}]}],{"prim":"CDR"},{"prim":"CAR"},{"prim":"CDR"},{"prim":"PUSH","args":[{"prim":"int"},{"int":"1"}]},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"ADD"},[{"prim":"DIP","args":[{"int":"5"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"6"}]}],{"prim":"SWAP"},{"prim":"SOME"},{"prim":"SWAP"},{"prim":"UPDATE"}]]},{"prim":"UPDATE","args":[{"int":"2"}]},{"prim":"UPDATE","args":[{"int":"1"}]},{"prim":"UPDATE","args":[{"int":"2"}]},{"prim":"DUP"},{"prim":"CDR"},{"prim":"DUP"},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"4"}]},{"prim":"CDR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"4"}]},{"prim":"SOURCE"},{"prim":"SWAP"},{"prim":"SOME"},{"prim":"SWAP"},{"prim":"UPDATE"},{"prim":"UPDATE","args":[{"int":"2"}]},{"prim":"UPDATE","args":[{"int":"2"}]},{"prim":"UPDATE","args":[{"int":"2"}]},{"prim":"NIL","args":[{"prim":"operation"}]},{"prim":"PAIR"}]]}]]}]]}]]}]]}]`)
};