# Humanity Unchained DAO Rules

<!-- TOC -->

- [Humanity Unchained DAO Rules](#humanity-unchained-dao-rules)
- [Introduction](#introduction)
- [Basic Principles & Guidelines](#basic-principles--guidelines)
- [App](#app)
    - [General](#general)
    - [Assembly](#assembly)
    - [Voting](#voting)
        - [Quorum](#quorum)
        - [Guidemother](#guidemother)
    - [Token](#token)
    - [Emblems](#emblems)
    - [Clusters](#clusters)
    - [Oath violation](#oath-violation)
    - [Referral program](#referral-program)
- [Management of off-chain services](#management-of-off-chain-services)
- [Additional Rules amedment procedure](#additional-rules-amedment-procedure)

<!-- /TOC -->

# Introduction

We are [Humanity Unchained DAO](https://humanityunchained.org) (or **HUD**, for short), a [Decentralized Autonomous Organization (DAO)](https://en.wikipedia.org/wiki/Decentralized_autonomous_organization) that provides an alternative to the current global governance monopoly, which enslaves humanity and is run by states, supranational organizations, and large companies through coercion and forced compliance. We are building a new human civilisation based on the voluntary consent of individuals using decentralized [Web3 technologies](./TODO). We call this new paradigm the New World Agreement (NWA).

Under such Agreement, all human beings who join HUD are effectively able to choose, modify and create the governance structures they desire to live under. For that, HUD members must swear to abide by the [New World Agreement Constitution](./CONSTITUTION) and the [Additional Rules](./TODO), which serve as the framework for creating a *global justice system* that enables the emergence of a free market of such governance structures in the form of DAOs, which we call *smart social contracts*. These *smart social contracts* may be diverse in purpose, internal rules, and in the way they are organized socially, economically, etc. They may also share resources in the physical world, such as territories. However, all *smart social contracts* must abide by the [Constitution](./CONSTITUTION) and the [Additional Rules](./TODO). Whenever the [self-enforcement capabilities](./TODO) of [smart contracts](./TODO) cannot or should not be used, the enforcement of the provisions of the *smart social contracts* and the fair resolution of disputes are ensured by the *global justice system*.

The *global justice system* is a [trial by jury](./TODO) whose jurors are all the members of HUD or, optionally, their appointed delegates. For this purpose, HUD runs a [semi-direct democracy](TODO) on the [Polygon blockchain](./TODO) that allows members not only to hold trials, but also to collectively interact with other smart contracts on-chain to, for example, manage the DAO's treasury or to deploy code updates. In order to guarantee the 1-person-1-vote principle, members must register their digital identity in the blockchain, which can be done anonymously (see rule [Identity_1](#Identity_1) for more information).

The jury's ruling may be enforced in a number of ways, such as by banning members or by forcibly transfer HUD tokens. HUD has two types of tokens: a fungible token, which is used to fuel the New World Agreement's economy (see [XXX](#XXX) for more information), and a special type of [Non-Fungible Token](./TODO) called *emblem*, which can be used to appoint or to revoke roles in *smart social contracts*. In [XXX](#XXX) we explain how human beings and DAOs who want to join a *smart social contract* can do so by holding their emblems.

This document is intended to establish one possible implementation of *Additional Rules* as per the [Constitution](./CONSTITUTION) and to provide the specifications of a framework for DAOs to integrate with HUD.

As opposed to the [Constitution](./CONSTITUTION), the [Additional Rules](./TODO) document is mutable. Therefore, all members of HUD must be aware that, as long as they remain members, they shall abide by not only the Constitution but also the future versions of this document.

# Basic Principles & Guidelines

<a name="Language_1">[Language_1]</a>
The official language of the DAO is English.

<a name="Language_2">[Language_2]</a>
In addition to the official language, translations into Mandarin Chinese and Spanish languages may be used in social media channels and the app's user interface. In any case, the version in the official language shall always prevail should there be any discrepancy among versions in different languages.

<a name="Purpose_1">[Purpose_1]</a>
The Additional Rules builds a framework to create DAOs that can be judged through a global jury.
DAOs and individuals shall be able to, voluntarily, integrate their systems and wallets so the DAO can punish them in case they.

<a name="General_1">[General_1]</a>
Specifications shall prevail over code.

<a name="General_2">[General_2]</a> 
Whenever possible, automation and decentralization shall be prioritized over manual and centralized.

<a name="General_3">[General_3]</a> 
The following general principles of *Law* shall serve as a guideline for Trials by the members of HUD;

not ad-hominem
not backwards in time
estopple
bona fide
actori incumbit (onus) probandi
reparation of awronf
full compensation of prejudice
proportionality
rule of law



# App

## General

<a name="App_1">[App_1]</a> 
There shall be a software application which shall implement the requirements established in the Constitution and the Additional Rules.

<a name="App_2">[App_2]</a> 
The app should be implemented on a technology that is publicly accesible, secure, verifiable and tamper-proof. The DAO may decide to migrate to other more suitable technologies as the state-of-the-art of decentralized technologies evolves.

<a name="App_3">[App_3]</a> 
The application shall be a Web3(TODO add link) app built on Ethereum smart contract technology and be deployed on the Polygon Blockchain on the Internet.

<a name="App_4">[App_4]</a> 
The oficial code of the contracts is the one on the address pointed by [humanityunchained.ens](TODO: add link)

<a name="App_4">[App_4]</a> 
The DAO shall appoint a number of members that shall build and maintain all aspects of the app, such as the credentials to update the source code repository and the ENS.

<a name="Identity_3">[Identity_3]</a>
Human beings shall never be obliged to identify themselves with their legal name.

<a name="Identity_4.1">[Identity_4.1]</a>
The app shall use [Proof of Humanity](https://proofofhumanity.id/) as one of the identity system.
An oracle system to sync the Proof of Humanity smart contract on the Ethereum mainnet to Polygon chain shall be created.

<a name="Identity_5">[Identity_5]</a>
The app shall use SISMO[TODO] on [Proof of Humanity](https://proofofhumanity.id/) as one of the identity system.


## Assembly

<a name="Assembly_1">[Assembly_1]</a>
All members shall possess a valid registration on the Identity Registry.

<a name="Assembly_2">[Assembly_2]</a>
In order to become a member, the applicant shall join the Assembly by cryptographically signing an oath to swear to pledge by the [HUD constitution](./CONSTITUTION) and the [Additional Rules](TODO).

"I swear to abide by the Constitution of Humanity Unchained DAO and the Additional Rules document, whose URIs are stored in the smart contract ... of th Polygon chain, as long as I am a Member".

<a name="Assembly_XX">[Assembly_XXX]</a>
The app shall implement a [semi-direct on-chain voting system](TODO) that allows all members of the DAO to collectively interact with any smart contract running on the same chain. The system shall support the submission of transaction proposals, which shall be executed if a majority of members approves so.

<a name="Assembly_XX">[Assembly_XXX]</a>
The submission of proposals shall be free of charge, and shall be submitted by anyone.

<a name="Assembly_XX">[Assembly_XXX]</a>
The creation of tallies on the submitted proposals shall be free of charge.

<a name="Assembly_XX">[Assembly_XXX]</a>
The app shall be compatible with off-chain voting platforms such as [Snapshot](snapshot.org)

<a name="Assembly_XX">[Assembly_XXX]</a>
The DAO shall perform the Trial by Jury through one of the voting systems.


<a name="Assembly_XX">[Assembly_XXX]</a>
The App shall provide a way for members to leave the Organization as established in the [Constitution](./CONSTITUTION).


<a name="Assembly_XX">[Assembly_XXX]</a>
The DAO shall have a wallet to store any kind of digital asset on the chain that the Assembly has full control.


## Voting


<a name="Voting_XX">[Voting_XX]</a>
The way to count votes shall be 1-human-1-vote.

<a name="Voting_XX">[Voting_XX]</a>The vote can be Yes, No, Blank or Abstain (no vote).

<a name="Voting_XX">[Voting_XX]</a>There shall be two types of votes: member votes and delegate votes.
Members may appoint a delegate...



<a name="Voting_XX">[Voting_XX]</a>

4. A proposal may contain any number of transactions.
Anyone except distrusted addresses can create a proposal.

5. All votes are recorded in tallies. Each tally is intended to decide whether or not a Proposal is approved or not approved. Approved proposal shall be executed.
Tally T => Proposal P => Transaction X1, Transaction X2, ..., Transaction XN
A proposal


<a name="Voting_XX">[Voting_XX]</a> It should be possible to attach metadata to a proposal. The metadata shall refer to information about the proposal's context, purpose, authors, etc.

<a name="Voting_XX">[Voting_XX]</a>
Anyone can enact approved proposals


<a name="Voting_XX">[Voting_XX]</a>
Proposals, which are chain transactions, need to be approved by a majority, determined by a certain threshold percentage, to be executed. Delegates voting power is proportional to the amount of members.

<a name="Voting_XX">[Voting_XX]</a>

The voting process consist of the following steps:
1. Transaction submission: A transaction proposal is submitted to the Wallet contract.
2. Creation of a tally: A tally to vote on the proposal is created.
3. Voting: Delegates (and optionally members) cast their votes. The voting period is divided into 2 phases: deliberation and revocation.

| ------------------- tallyDuration-----------------|
| -- Deliberation phase -- | -- Revocation phase -- | --- Enaction ...
| -- Delegates can vote -- |
| -- Members can vote ----------------------------- |
| -------------------------------------------------------------------- > time

Members can cast their votes during either phase whereas delegates can only during the deliberation phase. This phase is intended to enable members the possibility of revoking any proposal that might have been approved by the delegates against the actual preference of their appointed members, as a member's majority superseds a delegate's majority.

Tallying up and enaction: Votes are counted and, if the proposal is approved, the transaction is execute

<a name="Voting_XX.1">[Voting_XX.1]</a> Delegate Voting: The proposal shall be Approved if the sum of all delegated votes of the seated delegates who voted "yes" is greater than the total number of members delegated by the seated delegates times a threshold.

<a name="Voting_XX.2">[Voting_XX.2]</a> Member Voting: The proposal shall be Approved if the number of member votes for "yes" or the number of member votes for "no" is larger than the number of members times a theshold, the proposal shall bre approved if the "yes" votes is larger than the "no" votes.

<a name="Voting_XX.3">[Voting_1.3]</a> If the results of Delegate Voting and Member Voting are in conflict (e.g. Delegates approve and Members do not approve, or vice versa), then the Member's always overrides the Delegate's.

<a name="Voting_XX.4">[Voting_1.4]</a> The DAO can set the value of these thresholds, or otherwise it shall be 50% by default.

<a name="Voting_XX.5">[Voting_1.5]</a> No tally shall be Approved unless minimum number of members, also known as Member Quorum, is registered.

<a name="Voting_XX">[Voting_XX]</a>
Votings will start on Monday 00:00 CET and will end on Saturday 23:59 CET of the same week.

### Quorum

<a name="Quorum_Rationale">Rationale</a>: A quorum is needed to prevent a small but organized group of members to accumulate enough voting power to damage the DAO during its initial stages.

<a name="Quorum_1">[Quorum_1]</a>
A quorum of a minimum of 1000 members need to be registered in order for a tally to be approved for execution.

<a name="Quorum_1">[Quorum_2]</a>
If the quorum is not reached by the time the tally has ended, the tally can only be executed by the [guidemother](#guidemother).

### Guidemother

<a name="Guidemother_Rationale">Rationale</a>: The only purpose of the guidemother is to protect the DAO from any attack or threats during the early stages of the DAO's history which the DAO would not be able to protect against by itself due to either not having a voting population large enough or the smart contract code having bugs or missing necessary features.

For this purpose:

1. Only the guidemother can execute tallies that have been approved by the DAO.

Example: Revert an organized attack from a group of trolls preventing the execution of a tally that would go against the Constitution or the Additional Rules.

2. Being able to quickly make urgent changes in the smart contracts without the need of a voting.

Example: Fix a bug and revert any damage.

<a name="Guidemother_1">[Guidemother_1]</a>
If a tally is approved but no quorum has yet been reached, only the guidemother shall be able to execute the tally.

<a name="Guidemother_2">[Guidemother_2]</a>
The guidemother has full power to modify the smart contracts code and data in any way until the [quorum](#quorum) has been reached.

<a name="Guidemother_3">[Guidemother_3]</a> 
The guidemother shall be removed automatically once the DAO has reached the [quorum](#quorum) number of registered members.

## Token

ERC777
DAO shall have a fungible token with the folloing parameters:

Symbol: HUD
Name: Humanity Unchained DAO
Decimals: 18

The DAO shall own a reserve of its native token (HUD), of which the DAO has full control so that the community can, for example, vote to forcibly transfer or lock HUD.

Rationale: The Assembly is a jury, and as such has the legitimation of to use the monopoly of violence.


<a name="Token_XXX">[Token_XXX]</a>
The use of HUD token shall never be forced.

<a name="Token_XXX">[Token_XXX]</a>
The app shall pay HUD tokens for the services:

1. *Delegation*: Delegates are rewarded with HUD for casting their vote on transation proposals.

2. *Execution*: The proposals are blockchain transactions to be executed if approved by the DAO. The DAO rewards with HUD to whoever is willing to pay the gas fees needed for the transaction's execution.

3. *Referrals*: ...

 
## Emblems

<a name="Emblems_XXX">[Emblems_XXX]</a>
Emblems are a special type of token that provide the DAO with a flexible framework to build complex organizational structures without the need of new smart contract code. Some potential use cases are assigning human beings roles to be responsible of tasks that otherwise cannot be done by a smart contract or tagging addresses that belong to a specific group.

<a name="Emblems_XXX">[Emblems_XXX]</a>
The DAO shall be able to 

<a name="Emblems_XXX">[Emblems_XXX]</a>
The Emblems implementation shall follow the standard ERC1155.




Create emblem: Defines a
Mint emblem tokens
Transfer emblem tokens



Example:

Emblem Id   Emblem URI        Admin     Description                     Number of Tokens    Distribution
1           ipfs:///          0x...     Members of cluster ABC          1,000               1 per address
2           None              DAO       Admins of a social network      5                   1 per address
3           https://server... 0x...     Tokens of company XYZ           1,000,000           Any


The URI has metadata containing an image, description, etc.
For the case of clusters, the metadata shall contain the geographical coordinates of the cluster's area.


<a name="Emblems_XXX">[Emblems_XXX]</a>
Anyone shall be able to create an emblem. Optionally, the DAO shall set a fee in HUD tokens for the creation of new emblems.


<a name="Emblems_XXX">[Emblems_XXX]</a>
The DAO, through on-chain voting, may:
1. Mint emblems
2. Transferred by the admin itself or the DAO.
3. Transfer emblems
of any emblem, regard


<a name="Emblems_XXX">[Emblems_XXX]</a> 
The emblem's creator shall be the emblem's admin. 

<a name="Emblems_XXX">[Emblems_XXX]</a> 
The emblem's URI, where the token's metadata is stored, shall be changed by the DAO only. Should the emblem's admin or holders want to change the URI, a proposal shall be made to HUD for on-chain voting.

<a name="Emblems_XXX">[Emblems_XXX]</a> 
The DAO or the emblem's admin may set a fee for every minted token of specific emblems.

<a name="Emblems_XXX">[Emblems_XXX]</a> 
The DAO or the admin may set a required deposit to hold a certain amount of HUD tokens for specific emblems.
Addresses who fail to do so, shall not be able to receive emblem's tokens. If the address already holds the tokens, the balance shall show as zero until the full required amount is deposited.

<a name="Emblems_XXX">[Emblems_XXX]</a> 
Emblems can be non-transferable, meaning that the owner cannot transfer them out to another address (unless the owner is the emblem's admin or the DAO).
Ownability is set upon  the emblem's creation and only the DAO can change it.

<a name="Emblems_XXX">[Emblems_XXX]</a>
Accounts may or may not own more than one token of a specific emblem (unless the owner is the emblem's admin or the DAO)
Ownability is set upon  the emblem's creation and only the DAO can change it.

<a name="Emblems_XXX">[Emblems_XXX]</a>
The DAO and the admin (except if the holder is the DAO) can forcefully transfer emblem tokens from any address, this includes burning tokens which effectively is equivalent to transfer them to the zero address.

<a name="Emblems_XXX">[Emblems_XXX]</a>The DAO shall not pay any fees for the creation or minting of emblem tokens.

<a name="Emblems_XXX">[Emblems_XXX]</a> 
Emblems can be curated, which means that they are legitimized by the DAO. Emblems created by the DAO shall be curated by default, whereas the rest need to request it to the DAO via on-chain voting.

<a name="Emblems_XXX">[Emblems_XXX]</a>
Blocked addresses shall be unable to receive or send emblem tokens.

<a name="Emblems_XXX">[Emblems_XXX]</a> 
Emblems should support to be used with Snapshot, Aragon DAO and Gnosis Multisig.

<a name="Emblems_XXX">[Emblems_XXX]</a>
The DAO's citizens, delegates and seats shall be represented as emblem tokens, whose admin is the DAO. They are non-transferable and each address can only own one token.

<a name="Emblems_XXX">[Emblems_XXX]</a>
The citizen's emblem minting fee and deposit required shall be zero.

<a name="Emblems_XXX">[Emblems_XXX]</a>
The delegate's emblem minting fee shall be zero. The deposit required shall be 100 HUD tokens.

<a name="Emblems_XXX">[Emblems_XXX]</a>
The seat's emblem minting fee shall be zero. The deposit required shall be 200 HUD tokens.

<a name="Emblems_XXX">[Emblems_XXX]</a>
Usecase example: An external DAO may create an emblem and assign the tokens to their members. By doing so, the DAO willingly chooses to abide by HUD's Constitution and Additional Rules. Accordingly, should there be a dispute among the DAO's members, HUD shall act as a judge and, if required, forcefully transfer any DAO's emblem tokens according to the veredict.


## Clusters

<a name="Clusters_XXX">[Clusters_XXX]</a>
Clusters are special types of emblems which are linked to one or more territories. The spacial coordinates of the territories shall be stored as part of the token's metadata.

<a name="Clusters_XXX">[Clusters_XXX]</a>
Clusters' territories shall be represented graphically in a map on the app.

<a name="Clusters_XXX">[Clusters_XXX]</a>
Usecase example: A DAO may create an emblem and assign the tokens to their members. By doing so, the DAO willingly chooses to abide by HUD's Constitution and Additional Rules. Accordingly, should there be a dispute among the DAO's members, HUD shall act as a judge and, if required, forcefully transfer any DAO's emblem tokens according to the veredict.


## Oath violation

<a name="Distrust_XXX">[Distrust_XXX]</a>
The App shall provide a way for members to flag other members TODO the Organization.

<a name="Distrust_XXX">[Distrust_XXX]</a>
Addresses may be distrusted by the DAO through an on-chain voting.
In any case, the distrust must be due to a serious offense to the terms of the Constitution and/or the Additional Rules that creates a harm or loss to one or more members of the DAO.

<a name="Distrust_XXX">[Distrust_XXX]</a>
Distrusted addresses shall not receive or send HUD or emblem tokens.

<a name="Distrust_XXX">[Distrust_XXX]</a>
Distrusted addresses shall not receive or send HUD or emblem tokens.

<a name="Distrust_XXX">[Distrust_XXX]</a>
Distrusted addresses shall not be able to become members or delegates.

<a name="Distrust_XXX">[Distrust_XXX]</a>
Distrusted delegates cannot claim a seat.

<a name="Distrust_XXX">[Distrust_XXX]</a>
Distrusted addresses shall not be able to create tallies.

<a name="Distrust_XXX">[Distrust_XXX]</a>
Seated delegates may be automatically distrusted if they abstain to vote in the latest on-chain voting.

<a name="Distrust_XXX">[Distrust_XXX]</a>
Members may be automatically distrusted if they abstain in the two latest on-chain votings and have no appointed delegate.

<a name="Distrust_XXX">[Distrust_XXX]</a>
Members and delegates must be expelled from the DAO as per [Article 6 of the Constitution](https://TODO)

<a name="Distrust_XXX">[Distrust_XXX]</a>
Members and delegates may be expelled for any other reason that the DAO may consider so.

## Referral program

<a name="Referral_XXX">[Referral_XXX]</a>
Every new member registered shall be eligible for a reward of 50 HUD tokens.

<a name="Referral_XXX">[Referral_XXX]</a>
For every new referred member, 50 HUD tokens will be rewarded to the referrer member.


# Management of off-chain services

<a name="Community_XXX">[Community_XXX]</a>
Whenever possible, the DAO shall use decentralized services for 
When a suitable decentralized version of a service is not available, a number of selected members of the DAO shall be appointed to manage the accounts of these services.

<a name="Community_XXX">[Community_XXX]</a>
Members responsible of the managament of off-chain services shall hold emblems for that purpose, which shall be called *Admin emblems*. *Admin emblems* shall be created and distributed by the DAO as follows:

<a name="Community_XXX">[Community_XXX]</a>
They shall be transferable only by the DAO

<a name="Community_XXX">[Community_XXX]</a>
A human can only hold one emblem of each type.

<a name="Community_XXX">[Community_XXX]</a>
A deposit of 200 HUD is needed to hold the token.

<a name="Community_XXX">[Community_XXX]</a>
An admin emblem shall be created for each of the following external services.

<a name="Community_XXX">[Community_XXX]</a>
The emblem holders must be trusted members.

<a name="Community_XXX">[Community_XXX]</a>
Service: Telegram
Number of emblem tokens: 5

<a name="Community_XXX">[Community_XXX]</a>
Service: The official website (https://humanityunchained.org)
Number of emblem tokens: XXX

<a name="Community_XXX">[Community_XXX]</a>
Service: Unstoppable domain (humanityunchained.dao)
Number of emblem tokens: XXX

<a name="Community_XXX">[Community_XXX]</a>
Service: GitHub
Number of emblem tokens: XXX

<a name="Community_XXX">[Community_XXX]</a>
Service: ENS (humanityunchained.eth, humanityunchaineddao.eth)
Number of emblem tokens: XXX

<a name="Community_XXX">[Community_XXX]</a>
Service: Twitter (@TODO)
Number of emblem tokens: XXX

# Additional Rules amedment procedure

<a name="AdditionalRules_XXX">[AdditionalRules_XXX]</a>
The Additional Rules document shall be version-controlled.

<a name="AdditionalRules_XXX">[AdditionalRules_XXX]</a>
The URI of the Additional Rules document shall be [TODO](TODO)

<a name="AdditionalRules_XXX">[AdditionalRules_XXX]</a>
New versions and changes of the Additional Rules document shall be voted off-chain.

<a name="AdditionalRules_XXX">[AdditionalRules_XXX]</a>
GitHub repository emblem holders shall be responsible to reflect those changes into the repository.