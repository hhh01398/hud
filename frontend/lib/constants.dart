import 'package:decimal/decimal.dart';
import 'package:flutter/material.dart';

// Visuals

const appName = 'Humanity Unchained DAO';
const appNameLogo = 'Humanity\nUnchained\nDAO';

const primaryColor = Color(0xFF2697FF);
const secondaryColor = Color(0xFF2A2D3E);
const tertiaryColor = Color(0xFFFFFFFF);
const bgColor = Color(0xFF212332);

class Palette {
  static const int reserve = 0xFF26E5FF;
  static const int circulating = 0xFFEE2727;
  static const int ok = 0xFF26E5FF;
  static const int notOk = 0xFFEE2727;
}

const defaultPadding = 16.0;
const socialMediaLogoSize = 24.0;
const selfAvatarSize = 30.0;
const avatarSize = 15.0;

const creatorEthAddress = '0xD219F00ae0E217552C931f2084CfFd8914d32B48';
const creatorAvatarUrl = 'https://new-free-world.org/assets/img/avatar.png';
const creatorTag = 'NewFreeWorld';


// External links

class SocialMediaUrl {
  static const String discourse = 'https://forum.humanityunchained.org';
  static const String telegram = 'https://t.me/humanityunchaineddao';
  static const String github = 'https://github.com/hhh01398/hud';
  static const String twitter = 'https://twitter.com/UnchainedDAO';
  static const String odysee = 'https://odysee.com/@HumanityUnchainedDAO';
}

const urlInstructionsMetamask = 'https://docs.polygon.technology/docs/develop/metamask/config-polygon-on-metamask/';
const urlForum = 'https://forum.humanityunchained.org/';
const urlForumProposalPrefix = 'transaction-proposal-';


// Token

final ethPrecisionFactor = Decimal.parse('1e18');
const tokenSymbol = 'HUD';
const ccySymbol = 'DAI';
const tokenContractAddresses = {
  137: {
    'DAI': '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
  }
};


// External APIs

const ipfsUrl = 'https://ipfs.kleros.io';
const pohApiUrl = 'https://api.thegraph.com/subgraphs/name/kleros/proof-of-humanity-mainnet';
const urlPohProfile = 'https://app.proofofhumanity.id/profile/';


// Ethereum

const Map<int, String> supportedChains = {
  137: 'mainnet',
  80001: 'testnet',
  31337: 'local',
};

const Map<int, String> chainLongName = {
  137: 'Polygon mainnet',
  80001: 'Polygon testnet Mumbai',
  31337: 'localhost',
};

const defaultChainNoWeb3Wallet = 137;
const defaultJsonRpcProviderUrl = 'https://polygon-rpc.com';


// Smart contracts

final contractNames = {
  'poh': 'ProofOfHumanityOracle',
  'assembly': 'Assembly',
  'wallet': 'Wallet',
  'token': 'Token',
  'faucet': 'Faucet',
};

const Map<int, String> citizenVoteMapping = {
  0: 'NotVoted',
  1: 'Yay',
  2: 'Nay',
};


// Development flags

const enableAvatars = true;
const enablePrice = true;
