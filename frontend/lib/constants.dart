import 'package:decimal/decimal.dart';
import 'package:flutter/material.dart';

const appName = 'Humanity Unchained DAO';
const appNameLogo = 'Humanity\nUnchained\nDAO';
const primaryColor = Color(0xFF2697FF);
const secondaryColor = Color(0xFF2A2D3E);
const tertiaryColor = Color(0xFFFFFFFF);
const bgColor = Color(0xFF212332);

const socialMediaLogoSize = 24.0;
const defaultPadding = 16.0;

class SocialMediaUrl {
  static const String discourse = 'https://forum.humanityunchained.org';
  static const String telegram = 'https://t.me/humanityunchaineddao';
  static const String github = 'https://github.com/hhh01398/hud';
  static const String twitter = 'https://twitter.com/UnchainedDAO';
}

final ethPrecisionFactor = Decimal.parse('1e18');
const tokenSymbol = 'HUD';

const ipfsServerAddress = 'https://cloudflare-ipfs.com';

class Palette {
  static const int reserve = 0xFF26E5FF;
  static const int circulating = 0xFFEE2727;
  static const int ok = 0xFF26E5FF;
  static const int notOk = 0xFFEE2727;
}

const selfAvatarSize = 30.0;
const avatarSize = 25.0;

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

final urlInstructionsMetamask = 'https://docs.polygon.technology/docs/develop/metamask/config-polygon-on-metamask/';

final urlPohProfile = 'https://app.proofofhumanity.id/profile/';
