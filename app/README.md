# TzVote

[logo]: https://i.imgflip.com/r56sp.jpg?a456398 "Vote"

[Full details here](https://hackmd.io/EBB3pObiT5y5eJs4tPQjXQ?view)

# Oracle

The Oracle is here to store missing information of current **voting period index**

## compile

```
ligo compile contract votingPeriodOracle.jsligo --output-file votingPeriodOracle.tz --entry-point main

ligo compile storage votingPeriodOracle.jsligo '{votingPeriodIndexes:(Map.empty as map<string, nat>),admin:("tz1VApBuWHuaTfDHtKzU3NBtWFYsxJvvWhYk" as address)}' --output-file votingPeriodOracleStorage.tz --entry-point main

ligo compile parameter votingPeriodOracle.jsligo 'UpdateCurrentVotingPeriod(["ghostnet",(6 as nat)])' --output-file votingPeriodOracleParameter.tz --entry-point main

```

## Test

### Dry run

```
ligo run dry-run votingPeriodOracle.jsligo 'UpdateCurrentVotingPeriod(["ghostnet",(6 as nat)])' '{votingPeriodIndexes:(Map.empty as map<string, nat>),admin:("tz1VApBuWHuaTfDHtKzU3NBtWFYsxJvvWhYk" as address)}'

```

### Unit tests

```
ligo run test unit_votingPeriodOracle.jsligo
```

## Deploy

```
tezos-client originate contract oracleGhost transferring 0 from myFirstKey running votingPeriodOracle.tz --init "$(cat votingPeriodOracleStorage.tz)" --burn-cap 1
```

output : KT1ThrY7xDKEo2BXeHjjQ4vcF1Mo5rUhtW48

### initialize some data

```
tezos-client transfer 0 from myFirstKey to oracleGhost  --arg '(Right (Pair "ghostnet" 6))' --burn-cap 0.005
```

# Smart contract

## Compile Tezos baker contract

```
ligo compile contract tezosTemplate3.jsligo --output-file tezosTemplate3.tz --entry-point main

ligo compile storage tezosTemplate3.jsligo '{  name : "Which is the cutiest pokemon?",votingPeriodIndex : (6 as nat),  options : list(["Mew","Pikachu"]) ,  votes : (Map.empty as map<address, string>),  results : (Map.empty as map<string, int>) , votingPeriodOracle :  ("KT1ThrY7xDKEo2BXeHjjQ4vcF1Mo5rUhtW48" as address)  ,   protocol : "ghostnet"}' --output-file tezosTemplate3Storage.tz --entry-point main

ligo compile parameter tezosTemplate3.jsligo 'Vote(["Pikachu",Crypto.hash_key("edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav" as key)])' --output-file tezosTemplate3Parameter.tz --entry-point main

```

## Compile permissioned Simple Poll contract

```
ligo compile contract permissionedSimplePoll.jsligo --output-file permissionedSimplePoll.tz --entry-point main

ligo compile storage permissionedSimplePoll.jsligo '{  name : "Which is the cutiest pokemon?" , from_ : ("2022-01-01t00:00:00Z" as timestamp), to : ("2023-01-01t00:00:00Z" as timestamp) ,  options : list(["Mew","Pikachu"]) , owner : ("tz1VApBuWHuaTfDHtKzU3NBtWFYsxJvvWhYk" as address) , registeredVoters : list([]) as list<address>,  votes : (Map.empty as map<address, string>),  results : (Map.empty as map<string, int>)}' --output-file permissionedSimplePollStorage.tz

ligo compile parameter permissionedSimplePoll.jsligo 'Vote("Pikachu")' --output-file permissionedSimplePollParameter.tz --entry-point main

```

## Compile both for the frontend

```
ligo compile contract tezosTemplate3.jsligo --output-file ./tezosTemplate3.tz.json --entry-point main --michelson-format json
ligo compile contract permissionedSimplePoll.jsligo --output-file ./permissionedSimplePoll.tz.json --entry-point main --michelson-format json
```

## Test

### Dry run

```
ligo run dry-run tezosTemplate3.jsligo 'Vote(["Pikachu",Crypto.hash_key("edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav" as key)])' '{  name : "Which is the cutiest pokemon?",votingPeriodIndex : (27 as nat),  options : list(["Mew","Pikachu"]) ,  votes : (Map.empty as map<address, string>),  results : (Map.empty as map<string, int>)  , votingPeriodOracle :  ("KT1ThrY7xDKEo2BXeHjjQ4vcF1Mo5rUhtW48" as address)  ,   protocol : "ghostnet"}'
```

### Unit tests

```
ligo run test unit_tezosTemplate3.jsligo
```

## Deploy

```
tezos-client originate contract tezosTemplateGhost transferring 0 from myFirstKey running tezosTemplate3.tz --init "$(cat tezosTemplate3Storage.tz)" --burn-cap 1

tezos-client originate contract permissionedSimplePollGhost transferring 0 from myFirstKey running permissionedSimplePoll.tz --init "$(cat permissionedSimplePollStorage.tz)" --burn-cap 1

```

Can return a contract address : KT1NgiC6MC6H9ccAtzk3WqwQ41VCwrQvSTzc , KT19c4S1wQVTHJkuDbZ8VjimrPKZeaFC3o8S

### Real run

```
tezos-client transfer 0 from tz1VApBuWHuaTfDHtKzU3NBtWFYsxJvvWhYk to KT1XHJzvYghgw9Y1FgtznLBMtkAu1FRWsTq8 -D --arg '(Left (Pair "Pikachu" "tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx"))'  --burn-cap 0.01
```

# App

## Build

### Locally

Install dependencies:

`yarn install`

### Docker

```
docker build -t tzvotes .
```

## Deploy

### Locally

Start development server:

`yarn run start`

Open https://localhost:3000 in your browser to see a sample application.

### Docker

```
docker run -d -p 3000:80 tzvotes
```

# TIPS

Add one of my account **myFirstKey** as a baker

```
tezos-client register key myFirstKey as delegate
```
