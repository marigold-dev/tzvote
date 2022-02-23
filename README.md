# Marigold voting app

[logo]: https://i.imgflip.com/r56sp.jpg?a456398 "Vote"

[Full details here](https://hackmd.io/EBB3pObiT5y5eJs4tPQjXQ?view)


# Oracle

The Oracle is here to store missing information of current **voting period index**

## compile

```
ligo compile contract votingPeriodOracle.jsligo --output-file votingPeriodOracle.tz --entry-point main

ligo compile storage votingPeriodOracle.jsligo '{votingPeriodIndexes:(Map.empty as map<string, nat>),admin:("tz1VApBuWHuaTfDHtKzU3NBtWFYsxJvvWhYk" as address)}' --output-file votingPeriodOracleStorage.tz --entry-point main

ligo compile parameter votingPeriodOracle.jsligo 'UpdateCurrentVotingPeriod(["hangzhounet",(27 as nat)])' --output-file votingPeriodOracleParameter.tz --entry-point main

```

## Test 

### Dry run

```
ligo run dry-run votingPeriodOracle.jsligo 'UpdateCurrentVotingPeriod(["hangzhounet",(27 as nat)])' '{votingPeriodIndexes:(Map.empty as map<string, nat>),admin:("tz1VApBuWHuaTfDHtKzU3NBtWFYsxJvvWhYk" as address)}'

```

### Unit tests

```
ligo run test unit_votingPeriodOracle.jsligo
```

### initialize some data

```
tezos-client transfer 1 from tz1VApBuWHuaTfDHtKzU3NBtWFYsxJvvWhYk to KT1GLuqbSEoaRb3GE4UtUgGkDukVS766V53A  --arg '(Right (Pair "hangzhounet" 27))' --burn-cap 0.005
```

# Smart contract

## Compile

```
ligo compile contract tezosTemplate3.jsligo --output-file tezosTemplate3.tz --entry-point main

ligo compile storage tezosTemplate3.jsligo '{  name : "Which is the cutiest pokemon?",votingPeriodIndex : (27 as nat),  options : list(["Mew","Pikachu"]) ,  votes : (Map.empty as map<address, string>),  results : (Map.empty as map<string, int>) , votingPeriodOracle :  ("KT1GLuqbSEoaRb3GE4UtUgGkDukVS766V53A" as address)  ,   protocol : "hangzhounet"}' --output-file tezosTemplate3Storage.tz --entry-point main

ligo compile parameter tezosTemplate3.jsligo 'Vote(["Pikachu",Crypto.hash_key("edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav" as key)])' --output-file tezosTemplate3Parameter.tz --entry-point main

```

## Compile for the frontend

```
ligo compile contract tezosTemplate3.jsligo --output-file ./tezosTemplate3.tz.json --entry-point main --michelson-format json
```

## Test


### Dry run

```
ligo run dry-run tezosTemplate3.jsligo 'Vote(["Pikachu",Crypto.hash_key("edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav" as key)])' '{  name : "Which is the cutiest pokemon?",votingPeriodIndex : (27 as nat),  options : list(["Mew","Pikachu"]) ,  votes : (Map.empty as map<address, string>),  results : (Map.empty as map<string, int>)  , votingPeriodOracle :  ("KT1GLuqbSEoaRb3GE4UtUgGkDukVS766V53A" as address)  ,   protocol : "hangzhounet"}' 
```

### Real run

```
tezos-client transfer 1 from tz1VApBuWHuaTfDHtKzU3NBtWFYsxJvvWhYk to KT1XHJzvYghgw9Y1FgtznLBMtkAu1FRWsTq8 -D --arg '(Left (Pair "Pikachu" "tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx"))'  --burn-cap 0.005 
```

### Unit tests

```
ligo run test unit_tezosTemplate3.jsligo
```


## Deploy 

```
tezos-client originate contract tezosTemplate transferring 0 from tz1VApBuWHuaTfDHtKzU3NBtWFYsxJvvWhYk running tezosTemplate3.tz --init "$(cat tezosTemplate3Storage.tz)" --burn-cap 1
```

Can return a contract address : KT1PYJvdStoHsCsNoKTFigqCqjd5eWo1uMYd

# App

## Build 

### Locally

Install dependencies:

   `yarn install`

### Docker

```
docker build -t delegator-votes .
```

## Deploy

### Locally

Start development server:

   `yarn run start`

Open https://localhost:3000 in your browser to see a sample application.

### Docker

```
docker run -d -p 3000:80 delegator-votes
```

# TIPS

Add one of my account **myFirstKey** as a baker

```
tezos-client register key myFirstKey as delegate
```
