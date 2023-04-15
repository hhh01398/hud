
[本文件的中文翻译](./ADDITIONAL_RULES_ZH.md) | [Traducción de este documento al español](./ADDITIONAL_RULES_ES.md)

# Humanity Unchained DAO

<!-- TOC -->

- [Humanity Unchained DAO](#humanity-unchained-dao)
    - [Introduction](#introduction)
- [Additional Rules](#additional-rules)
    - [General](#general)
    - [App](#app)
        - [General](#general)
        - [Identity Management System](#identity-management-system)
        - [Assembly](#assembly)
            - [Members](#members)
            - [Delegates](#delegates)
            - [Seats](#seats)
        - [Voting](#voting)
            - [General](#general)
            - [Off-chain](#off-chain)
            - [On-chain](#on-chain)
            - [Quorum](#quorum)
        - [Guidemother](#guidemother)
        - [Wallet](#wallet)
        - [Token](#token)
        - [Emblems](#emblems)
            - [Clusters](#clusters)
        - [Referral program](#referral-program)
    - [Management of off-chain services](#management-of-off-chain-services)
        - [Infringement of the Rules](#infringement-of-the-rules)
    - [Additional Rules amedment procedure](#additional-rules-amedment-procedure)

<!-- /TOC -->

## Introduction

We are [Humanity Unchained DAO](https://humanityunchained.org) (or **HUD** for short), a [Decentralized Autonomous Organization (DAO)](https://en.wikipedia.org/wiki/Decentralized_autonomous_organization) and alternative to the governance monopoly imposed globally through states, transnational institutions and big corporations worldwide that enslaves humanity. 

We are building a new human civilization based on the principle of unconditional respect for the consent of human beings. Under this principle, any governance system, such as constitutions and laws, monetary policies, justice systems, electoral systems, supranational treaties, religious organizations, etc. are ilegitimate *as long as* the human beings under the domination of such systems had not given their [consent](./constitution/CONSTITUTION.md#article-2) to abide by the rules of such systems.

The principles of our alternative are written in the [New World Agreement Constitution](./constitution), which lays the foundation to build a new framework for coexistence that allows human beings who want to choose and create the governance structures they would like to live under to do so.

HUD members must promise to uphold the [Constitution](./constitution) and the [Additional Rules](#additional-rules) (this very document), which set the rules to build a *World Jury System* that enables the emergence of a free market of governance structures in the form of DAOs, which we call *smart social contracts*. These *smart social contracts* may be diverse in purpose, internal rules, and in the way they are organized socially, economically, etc. They may also share resources in the physical world, such as territories. In the case of dispute, the DAO holds a trial by jury whose ruling must be abode TODO CHECK GRAMMAR by the DAO members.

The jury consists of all the members of HUD or, optionally, their appointed delegates. For this purpose, HUD runs a [semi-direct democracy](https://en.wikipedia.org/wiki/Semi-direct_democracy) on the [blockchain](https://en.wikipedia.org/wiki/Blockchain) that allows members not only to hold trials, but also to collectively interact with other [smart contracts](https://en.wikipedia.org/wiki/Smart_contract) on-chain to, for example, manage the DAO's finances or to update its code. In order to guarantee the 1-person-1-vote principle, members must prove that they are living human beings and that they have not registered in the DAO multiple times. This can be done anonymously (see rule [Identity_1](#Identity_1) for more information).

The jury's ruling may be enforced in a number of ways, such as by banning members, revoking roles, or seizing tokens. HUD has two types of tokens: a [fungible token](#token), which is used to fuel the DAO's economy, and a special type of [Non-Fungible Token](https://en.wikipedia.org/wiki/Non-fungible_token) called [emblem](#emblems), which is used to appoint or to revoke roles in *smart social contracts*.

This document describes the specifications a possible implementation of *Additional Rules* as per the [Constitution](./constitution). Unlike the [Constitution](./constitution), which cannot be amended, the DAO [can change](./constitution/CONSTITUTION.md#article-6) the [Additional Rules](./) democratically. Therefore, all members should be aware that, as long as they remain members, they must abide not only by the Constitution, but also by any future version of this document. Members may voluntarily leave the DAO any time.


# Additional Rules

## General

<a name="General_1">[General_1]</a>
The DAO shall be called Humanity Unchained DAO.

<a name="General_2">[General_2]</a>
The DAO's logo will be a simplified figure of two human forms embracing.

<img src="../logo.png"/>

<a name="General_3">[General_3]</a>
The primary official language of the DAO shall be English.

<a name="General_4">[General_4]</a>
The secondary official languages of the DAO shall be Mandarin Chinese and Spanish.

<a name="General_5">[General_5]</a>
Translations of the original sources in the primary language to the secondary languages may be used for the Constitution, the Additional Rules and the user interface of the application, to the extent possible. In the event of any discrepancy between the different language versions, the primary official language version shall always prevail.

<a name="General_6">[General_6]</a>
Wherever possible, automation and decentralization shall be prioritized over manual and centralized.

<a name="General_7">[General_7]</a>
Jury's judgments shall prevail over specifications. Specifications shall prevail over the code.


## App

### General

<a name="AppGeneral_1">[AppGeneral_1]</a>
There shall be an app which implements the requirements established in the Constitution and the Additional Rules.

<a name="AppGeneral_2">[AppGeneral_2]</a>
The app should be implemented using a technology that is publicly accesible, secure, verifiable and tamper-proof. The DAO may decide whether or not to upgrade the app to use more advanced technologies as the state-of-the-art of decentralized technologies evolves.

<a name="AppGeneral_3">[AppGeneral_3]</a>
The app shall be a Web3 app built on Ethereum smart contracts and be deployed on the Polygon blockchain.

<a name="AppGeneral_4">[AppGeneral_4]</a>
The smart contracts shall be modifiable only by the DAO.

<a name="AppGeneral_5">[AppGeneral_5]</a>
The smart contract addresses shall be resolved from the [Ethereum Name Service](https://ens.domains/) name **humanityunchaineddao.eth**.


### Identity Management System

<a name="Identity_1">[Identity_1]</a>
The app shall provide a way for members to create and manage their digital identity.

<a name="Identity_2">[Identity_2]</a>
The Identity Management System shall be sybil-resistant.

<a name="Identity_3">[Identity_3]</a>
It shall be possible to integrate other identity systems.

<a name="Identity_4">[Identity_4]</a>
Members shall be able to choose whether their HUD identity is anonymous or not.

<a name="Identity_5">[Identity_5]</a>
Members may register one non-anonymous HUD identity and one anonymous HUD identity.

<a name="Identity_6">[Identity_6]</a>
The app shall support [Proof of Humanity](https://proofofhumanity.id/) as non-anonymous identity system. An oracle system shall be created to sync the Proof of Humanity smart contract on the Ethereum mainnet to Polygon chain.

<a name="Identity_7">[Identity_7]</a>
The app shall support [SISMO](https://sismo.io)'s [Proof of Humanity](https://proofofhumanity.id/) badge as anonymous identity system.

<a name="Identity_8">[Identity_8]</a>
Identity's metadata shall be stored on [IPFS](https://en.wikipedia.org/wiki/InterPlanetary_File_System).

<a name="Identity_9">[Identity_9]</a>
The default IPFS gateway shall be [nftstorage.link](https://nftstorage.link).


### Assembly

#### Members

<a name="Members_1">[Members_1]</a>
All members of the DAO must possess a valid registration on the Identity Management System.

<a name="Members_2">[Members_2]</a>
In order to become a member, applicants shall sign with their wallets a promise to uphold the [constitution](./constitution/CONSTITUTION) and the current and future versions of the Additional Rules for the duration of their membership.

<a name="Members_3">[Members_3]</a>
Members may cancel their membership at anytime.


#### Delegates

<a name="Delegates_1">[Delegates_1]</a>
Members may appoint a delegate, who shall cast votes on behalf of the members.

<a name="Delegates_2">[Delegates_2]</a>
Delegates shall not require being members.


#### Seats


<a name="Seats_1">[Seats_1]</a>
There shall be 20 seats.

<a name="Seats_2">[Seats_2]</a>
Delegates with the most number of appointed members may take a seat.

<a name="Seats_3">[Seats_3]</a>
Seated delegates may be rewarded in HUD tokens and proportially to the number of appointing citizens.


### Voting

#### General

<a name="Voting_1">[Voting_1]</a>
The way to count votes shall be 1-human-1-vote.

<a name="Voting_2">[Voting_2]</a>
There shall be two types of votes: member votes and delegate votes.

<a name="Voting_3">[Voting_3]</a>
The vote sign can be "Yes", "No" and "Blank".

<a name="Voting_4">[Voting_4]</a>
Votings on proposals that require on-chain transactions shall be done on-chain.

<a name="Voting_5">[Voting_5]</a>
Distrusted addresses shall not be able to vote.


#### Off-chain

<a name="OffChainVoting_1">[OffChainVoting_1]</a>
It shall be possible to carry out votings off-chain on [Snapshot](snapshot.org).


#### On-chain


<a name="OnChainVoting_1">[OnChainVoting_1]</a>
The app shall implement an on-chain voting system that allows members of the DAO to collectively interact with any smart contract running on the same chain. The system shall support the submission of proposals containing transactions which shall be executed if a majority of the members so approve.

<a name="OnChainVoting_2">[OnChainVoting_2]</a>
Anyone except for distrusted addresses may submit proposals.

<a name="OnChainVoting_3">[OnChainVoting_3]</a>
Proposals may contain any number of transactions. 

<a name="OnChainVoting_4">[OnChainVoting_4]</a>
It shall be possible to attach metadata to proposals and transactions.

<a name="OnChainVoting_5">[OnChainVoting_5]</a>
Only members may create votings on the submitted proposals.

<a name="OnChainVoting_6">[OnChainVoting_6]</a>
The creation of votings shall be free of charge.

<a name="OnChainVoting_7">[OnChainVoting_7]</a>
Delegate Voting: The proposal shall be approved by the delegates of the DAO if the sum of all delegate votes of seated delegates who voted "yes" is greater than the total number of members who appointed a seated delegated multiplied by a certain threshold.

<a name="OnChainVoting_8">[OnChainVoting_8]</a>
Member Voting: The proposal shall be approved or rejected by the members of the DAO if the number of members who voted "yes" or the number of members votes who voted "no", respectively, is larger than the total number of members multiplied by a certain theshold.

<a name="OnChainVoting_9">[OnChainVoting_9]</a>
If the results of Delegate Voting and Member Voting are in conflict (e.g. Delegates approve and Members do not approve, or vice versa), then the Member's always overrides the Delegate's.

<a name="OnChainVoting_10">[OnChainVoting_10]</a>
The DAO can set the value of these thresholds, or otherwise it shall be 50% by default.

<a name="OnChainVoting_11">[OnChainVoting_11]</a>
The transactions of approved proposals may be executed by anyone.

<a name="OnChainVoting_12">[OnChainVoting_12]</a>
Transaction executors may be rewarded with HUD tokens.

<a name="OnChainVoting_13">[OnChainVoting_13]</a>
Seated delegates who have abstained from voting on the last voting shall be distrusted.
Members who have abstained from voting on the last two votings and have not appointed a delegate shall be distrusted.

<a name="OnChainVoting_14">[OnChainVoting_14]</a>
Votings shall start on Monday 00:00 CET and shall end on Saturday 23:59 CET of the same week.


#### Quorum

<a name="Quorum_1">[Quorum_1]</a>
A minimum number of registered members (also known as *Member Quorum*) is needed for a proposal to executed if approved. Until the Quorum is reached, only the [Guidemother](#guidemother) shall be able to execute approved proposals.

<a name="Quorum_2">[Quorum_2]</a>
The quorum shall be at least 1000 members.


### Guidemother

<a name="Guidemother_1">[Guidemother_1]</a>
Until the [quorum](#quorum) has been reached, the guidemother may be able modify or re-deploy the smart contracts, but for the sole purposes of fixing bugs or to lower the number of quorum members required.


<a name="Guidemother_2">[Guidemother_2]</a>
The guidemother shall be removed automatically once the [quorum](#quorum) has been reached.


### Wallet

<a name="Wallet_1">[Wallet_1]</a>
The DAO shall own a wallet to store any kind of token on the chain.

<a name="Wallet_2">[Wallet_2]</a>
Transfers out of the wallet may be possible only through an on-chain voting approved by the DAO.


### Token

<a name="Token_1">[Token_1]</a>
DAO shall have a fungible token, which will be called *HUD token*.

<a name="Token_2">[Token_2]</a>
The token shall implement the [ERC-777 standard](https://eips.ethereum.org/EIPS/eip-777).

<a name="Token_3">[Token_3]</a>
Symbol: HUD
Name: Humanity Unchained DAO
Decimals: 18

<a name="Token_4">[Token_4]</a>
The initial total supply shall be 1 trillion tokens.

<a name="Token_5">[Token_5]</a>
The DAO shall own a reserve de tokens.

<a name="Token_6">[Token_6]</a>
The DAO shall have full control of the token, such as the ability to mint, burn and forcibly transfer tokens, and to prevent specific addresses to receive or send tokens.

 
### Emblems

Note: In this section, the term "DAO" is used to refer either to the organization in general or to any smart contract of to the app.

<a name="Emblems_1">[Emblems_1]</a>
The app shall implement a special type of non-fungible token, called *Emblem*, that provides the DAO with a flexible way to build and manage organizational structures.

<a name="Emblems_2">[Emblems_2]</a>
The Emblems implementation shall follow the [ERC-1155 Multi Token Standard](https://eips.ethereum.org/EIPS/eip-1155).

<a name="Emblems_3">[Emblems_3]</a> 
Anybody may create an emblem.

<a name="Emblems_4">[Emblems_4]</a> 
The emblem's creator shall have the emblem's admin role by default. Such role mat be transferred to another address by the DAO and the admin itself.

<a name="Emblems_5">[Emblems_5]</a> 
The emblem's URI, where the token's metadata is stored, shall be changed by the DAO only. Should the emblem's admin or holders want to change the URI, a proposal shall be submitted to the DAO for on-chain voting.

<a name="Emblems_6">[Emblems_6]</a> 
The DAO or the emblem's admin may set a mandatory deposit in HUD tokens required to hold the emblem. Addresses who do not deposit the amount shall not be able to receive emblem's tokens. If the address already holds tokens, the holder shall not be able to make use of the tokens until the full required amount is deposited.

<a name="Emblems_7">[Emblems_7]</a> 
Emblems may be non-transferable (also known as *soulbound*), meaning that the owner cannot transfer them out to another address, unless the owner is the emblem's admin or the DAO. This feature is set upon the emblem's creation and only the DAO can change it.

<a name="Emblems_8">[Emblems_8]</a>
Accounts may or may not own more than one token of a specific emblem unless the owner is the emblem's admin or the DAO. This feature is set upon the emblem's creation and only the DAO can change it.

<a name="Emblems_9">[Emblems_9]</a>
The DAO and the admin can forcefully transfer emblem tokens from any address except from a DAO's. This includes burning tokens (which effectively is equivalent to transfer them to the zero address).

<a name="Emblems_10">[Emblems_10]</a> 
Emblems may be *verified*, which means that they are legitimized by the DAO. The DAO may curate an emblem through on-chain voting. Emblems created by the DAO shall be curated by default. 

<a name="Emblems_11">[Emblems_11]</a>
The DAO may charge for the creation of new emblems, as well as for the minting of tokens of a particular emblem, in HUD tokens. The DAO shall not pay any fees for the creation or minting of emblem tokens.

<a name="Emblems_12">[Emblems_12]</a>
The DAO's members, delegates and seats shall be emblems, whose admin is the DAO, they shall be non-transferable and each address may only own one token.

<a name="Emblems_13">[Emblems_13]</a>
The membership emblem's minting fee and deposit required shall be zero.

<a name="Emblems_14">[Emblems_14]</a>
The delegate's emblem minting fee shall be zero. The deposit required shall be 100 HUD tokens.

<a name="Emblems_15">[Emblems_15]</a>
The seat's emblem minting fee shall be zero. The deposit required shall be 200 HUD tokens.

<a name="Emblems_16">[Emblems_16]</a>
The DAO shall have full control of the emblem tokens, such as the ability to mint, burn and forcibly transfer tokens, and to prevent specific addresses to receive or send tokens.


#### Clusters

<a name="Clusters_1">[Clusters_1]</a>
A special type of emblem that is linked to one or more territories shall be called a cluster. The spatial coordinates of the territories will be stored as part of the token metadata.

<a name="Clusters_2">[Clusters_2]</a>
Clusters' territories shall be represented graphically in a map on the app.

### Referral program

<a name="Referral_1">[Referral_1]</a>
Every new registered member shall be eligible for a referral reward of 50 HUD tokens.

<a name="Referral_2">[Referral_2]</a>
Members who bring new members to the DAO shall be rewarded 50 HUD tokens per each new referred member.

## Management of off-chain services

<a name="Community_1">[Community_1]</a>
The DAO shall appoint members to be responsible for managing off-chain services through the creation and transfer of emblems created for such purpose. Such emblems shall be referred as *admin emblems*.

<a name="Community_2">[Community_2]</a>
An admin emblem shall be created for each of the following external services:
- Web domains and servers
- Telegram
- Twitter
- Github
- Forum
- ENS

<a name="Community_3">[Community_3]</a>
Admin emblems shall be transferable only by the DAO.

<a name="Community_4">[Community_4]</a>
A member may only hold one admin emblem for each off-chain service.

<a name="Community_5">[Community_5]</a>
A deposit of 1000 HUD tokens is needed to hold an admin emblem.

<a name="Community_6">[Community_6]</a>
The emblem holders shall not be distrusted members.

<a name="Community_7">[Community_7]</a>
The Guidemother shall handover the credentials of any off-chain service in her possesion to the corresponding emblem holders before the Quorum is reached.


### Infringement of the Rules

<a name="Distrust_1">[Distrust_1]</a>
The App shall provide a way for the DAO to keep a record of expelled members.

<a name="Distrust_2">[Distrust_2]</a>
The App shall provide a way for the DAO to keep a record of addresses who have been reprimanded for breaching any rules. Such addresses shall be referred as *distrusted*.

<a name="Distrust_3">[Distrust_3]</a>
The DAO may set what addresses are distrust through an on-chain voting.

<a name="Distrust_4">[Distrust_4]</a>
The DAO may distrust addresses for any reason it deems appropriate.

<a name="Distrust_5">[Distrust_5]</a>
For a member to be expelled, the member's address must be distrusted first.

<a name="Distrust_6">[Distrust_6]</a>
Distrusted addresses may be trusted back by the DAO through an on-chain voting.

<a name="Emblems_7">[Emblems_7]</a>
Distrusted addresses shall be unable to receive or send HUD tokens or emblems.

<a name="Distrust_8">[Distrust_8]</a>
Distrusted addresses shall not be able to become members or delegates.

<a name="Distrust_9">[Distrust_9]</a>
Distrusted delegates cannot claim a seat. Distrusted seated delegates can keep their seats.

<a name="Distrust_10">[Distrust_10]</a>
Distrusted addresses shall not be able to submit proposals or start votings.

<a name="Distrust_11">[Distrust_11]</a>
Seated delegates shall be automatically distrusted if they abstain to vote in the latest on-chain voting.

<a name="Distrust_12">[Distrust_12]</a>
Members shall be automatically distrusted if they abstain in the two latest on-chain votings and have no appointed delegate.

<a name="Distrust_13">[Distrust_13]</a>
Distrusted addresses may not be emblem administrators.


## Additional Rules amedment procedure

<a name="AdditionalRules_1">[AdditionalRules_XXX]</a>
The Additional Rules document shall be version-controlled.

<a name="AdditionalRules_2">[AdditionalRules_XXX]</a>
New versions of the Additional Rules document shall effectively come into force once the DAO smart contract is updated through an on-chain voting with the reference (e.g. an URI) to the new Additional Rules document.