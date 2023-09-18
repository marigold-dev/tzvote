# Introduction

Vote is the base of the democracy

> Elections belong to the people. It's their decision. If they decide to turn their back on the fire and burn their behinds, then they will just have to sit on their blisters.
>
> **Abraham Lincoln**

![img](https://tzvote.marigold.dev/vote.jpg)

## The problem

Giving power on an intermediary to process the votes is a threat in case of malicious actor. Even with electronic voting system, there are not clear proof of frauds but still remain some questions [(article here)](https://www.bbc.com/news/election-us-2020-54959962).

**Can we leverage the decentralized feature of blockchain to solve the intermediary problem ? It what TzVote claims to provide**

## Solution

TzVote helps you deploy your own poll on a smart contract and gives you a simple website to interact with it

## Flavours

There are different ways to create a poll, so we decided to create template for each particular use cases.
First, here are the criteria to consider :

- question count : how many question on the poll ?
- option count : how many options on the answer ?
- votes choices count : only once or multiple answers
- voting power : how is calculated the end result
- dates : dates to consider
- censorship resistant : what is the level of decentralization of your poll ?
- privacy : does the poll include hidden ballot and preserve anonymity ?

Here are the available templates :

| name              | #questions | #options | #choices | voting power               | dates               | censorship resistant       | privacy |
| ----------------- | ---------- | -------- | -------- | -------------------------- | ------------------- | -------------------------- | ------- |
| permissioned vote | 1          | n        | 1        | 1 allowed address = 1 vote | from, to            | poll creator choose voters | no      |
| baker vote        | 1          | n        | 1        | Tezos baker total stake    | Tezos voting period | yes                        | no      |

## Next developments

- bring complete anonymity, ballots might be hidden (to avoid physical threats)
- bring more templates : [Borda](https://en.wikipedia.org/wiki/Borda_count), Samarkand
- [Proof of Humanity](https://proofofhumanity.id/)

## Links

- [TzVote DAPP (Web based - mainnet)](https://tzvote.marigold.dev/)
- [TzVote DAPP (Android - mainnet)](https://play.google.com/store/apps/details?id=dev.marigold.tzvote)
- TEZOS COMMUNITY DAPP (iOS) Soon

- [TzVote DAPP (Web based - ghostnet)](https://ghostnet.tzvote.marigold.dev)
