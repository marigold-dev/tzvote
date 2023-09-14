# TzVote

[logo]: https://i.imgflip.com/r56sp.jpg?a456398 "Vote"

[Full details here](https://hackmd.io/EBB3pObiT5y5eJs4tPQjXQ?view)

# Oracle

The Oracle is here to store missing information of current **voting period index**

## compile

```bash
TAQ_LIGO_IMAGE=ligolang/ligo:0.72.0 taq compile votingPeriodOracle.jsligo
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

ghostnet : KT1ACfH87dohx1bAVc4PigcNBAFSTdxrRwj7
mainnet : KT1C8Varn3RWkSk6jJBVSRUHkmmXArGefifp

### initialize some data

```bash
taq call votingPeriodOracle --param pokeGame.parameter.default_parameter.tz  -e testing
```

# Smart contract

## Compile Tezos baker contract

```bash
TAQ_LIGO_IMAGE=ligolang/ligo:0.72.0 taq compile tezosTemplate3.jsligo
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

KT1FohLnkN7zNk4fQy99D4TJoM83Ln8JJz4c

## Compile permissioned Simple Poll contract

```bash
TAQ_LIGO_IMAGE=ligolang/ligo:0.72.0 taq compile permissionedSimplePoll.jsligo
```

### Unit tests

```bash
taq test unit_permissionedSimplePoll.jsligo
```

### Deploy

```bash
taq deploy permissionedSimplePoll.tz -e "testing" --storage permissionedSimplePoll.storage.ghostnet.tz
```

KT1ACfH87dohx1bAVc4PigcNBAFSTdxrRwj7

```bash
taq deploy permissionedSimplePoll.tz -e "production" --storage permissionedSimplePoll.storage.mainnet.tz
```

KT1CXVRgTKeEn2F2fqVX7tWcMrYRn8vaJwUa

# App

## Compile both for the frontend

```bash
TAQ_LIGO_IMAGE=ligolang/ligo:0.72.0 taq compile tezosTemplate3.jsligo --json && mv artifacts/tezosTemplate3.json ./app/src/contracttemplates/

TAQ_LIGO_IMAGE=ligolang/ligo:0.72.0 taq compile permissionedSimplePoll.jsligo --json && mv artifacts/permissionedSimplePoll.json ./app/src/contracttemplates/
```

Generate types

```bash
taq install @taqueria/plugin-contract-types
taq generate types ./app/src
```

## Build

Install dependencies:

```bash
npm i
npm run local
```

## Build for Android (linked to mainnet config by default on package.json)

```bash
ionic capacitor add android
ionic capacitor copy android
npm install -g cordova-res
cordova-res android --skip-config --copy
ionic capacitor sync android
ionic capacitor update android
```

# TIPS

Add one of my account **alice** as a baker

```
tezos-client register key alice as delegate
```
