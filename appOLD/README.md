# TzVote

[logo]: https://i.imgflip.com/r56sp.jpg?a456398 "Vote"

[Full details here](https://hackmd.io/EBB3pObiT5y5eJs4tPQjXQ?view)

# Oracle

The Oracle is here to store missing information of current **voting period index**

## compile

```bash
TAQ_LIGO_IMAGE=ligolang/ligo:0.71.1 taq compile votingPeriodOracle.jsligo
```

## Test

### Dry run

```bash
taq simulate votingPeriodOracle.tz --param pokeGame.parameter.default_parameter.tz  --sender alice --protocol nairobi
```

### Unit tests

```bash
taq test unit_votingPeriodOracle.jsligo
```

## Deploy

```bash
taq deploy votingPeriodOracle.tz -e "testing" --storage votingPeriodOracle.storage.ghostnet.tz
```

```bash
taq deploy votingPeriodOracle.tz -e "production" --storage votingPeriodOracle.storage.mainnet.tz
```

output : KT19cxHuiRiKktLb5bj9MWGrmHzncjreExcY

### initialize some data

```bash
taq call votingPeriodOracle --param pokeGame.parameter.default_parameter.tz  -e testing
```

# Smart contract

## Compile Tezos baker contract

```bash
TAQ_LIGO_IMAGE=ligolang/ligo:0.71.1 taq compile tezosTemplate3.jsligo
```

### Unit tests

```bash
taq test unit_tezosTemplate3.jsligo
```

### Deploy

```bash
taq deploy tezosTemplate3.tz -e "testing" --storage tezosTemplate3.storage.ghostnet.tz
```

KT1G4DCjT2SviF7T6Ji9zB5m65DR67Mw91nZ

```bash
taq deploy tezosTemplate3.tz -e "production" --storage tezosTemplate3.storage.mainnet.tz
```

## Compile permissioned Simple Poll contract

```bash
TAQ_LIGO_IMAGE=ligolang/ligo:0.71.1 taq compile permissionedSimplePoll.jsligo
```

### Unit tests

```bash
taq test unit_permissionedSimplePoll.jsligo
```

### Deploy

```bash
taq deploy permissionedSimplePoll.tz -e "testing" --storage permissionedSimplePoll.storage.ghostnet.tz
```

```bash
taq deploy permissionedSimplePoll.tz -e "production" --storage permissionedSimplePoll.storage.mainnet.tz
```

# App

## Compile both for the frontend

```bash
TAQ_LIGO_IMAGE=ligolang/ligo:0.71.1 taq compile tezosTemplate3.jsligo --json && mv artifacts/tezosTemplate3.json ./app/src/contracttemplates/

TAQ_LIGO_IMAGE=ligolang/ligo:0.71.1 taq compile permissionedSimplePoll.jsligo --json && mv artifacts/permissionedSimplePoll.json ./app/src/contracttemplates/
```

Generate types

```bash
taq install @taqueria/plugin-contract-types
taq generate types ./app/src
```

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
