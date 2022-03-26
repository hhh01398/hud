import 'package:humanity_unchained_dao/config.dart';
import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/models/dao_data.dart';
import 'package:humanity_unchained_dao/models/dao_profile.dart';
import 'package:humanity_unchained_dao/models/poh_profile.dart';
import 'package:humanity_unchained_dao/models/token_data.dart';
import 'package:humanity_unchained_dao/models/wallet_transaction.dart';
import 'package:humanity_unchained_dao/services/poh_service.dart';
import 'package:humanity_unchained_dao/utils/utils.dart';
import 'package:flutter_web3/flutter_web3.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

class Web3Controller extends GetxController {
  bool get isConnected => Ethereum.isSupported && currentAddress.isNotEmpty;

  final pohService = PohService();
  final pohProfile = PohProfile().obs;
  String currentAddress = '';
  int currentChain = -1.obs;
  Web3Provider? web3provider;
  JsonRpcProvider? jsonRpcProvider;
  Config? config;
  RxBool loading = true.obs;
  final tokenData = TokenData().obs;
  final daoData = DaoData().obs;
  final daoProfile = DaoProfile().obs;
  final searchedDelegates = <PohProfile>[].obs;
  late Contract dao, wallet, token;

  @override
  void onInit() {
    init();
    super.onInit();
  }

  Future init() async {
    if (config == null) {
      config = Config();
      await config!.load();
    }

    logging('Checking for Ethereum support...');

    if (Ethereum.isSupported) {
      final accs = await ethereum!.requestAccount();
      currentChain = await ethereum!.getChainId();

      checkChainSupport();

      if (accs.isEmpty) {
        Get.defaultDialog(
          title: 'Error',
          textCancel: 'Close',
          onCancel: () {},
          middleText: 'Your web3 wallet has no address available',
        );
      } else {
        currentAddress = accs.first;
        await loadProfile();
      }

      ethereum!.on('AppointDelegate', (m) {
        dartify(m);
        update();
      });
    } else {
      currentChain = defaultChainNoWeb3Wallet;
      jsonRpcProvider = JsonRpcProvider(defaultJsonRpcProviderUrl);
    }
    await load();
  }

  void checkChainSupport() {
    if (!supportedChains.keys.contains(currentChain)) {
      Get.defaultDialog(
        title: 'Wrong chain',
        textConfirm: "Configure Metamask",
        textCancel: 'Close',
        onCancel: () {},
        onConfirm: () => launch(urlInstructionsMetamask),
        middleText: '$appName is deployed on Polygon mainnet (chainID=137), but you are connected to chainID=$currentChain.',
      );
    }
  }

  Future loadProfile() async {
    final PohProfile _pohProfile = await pohService.getProfileData(currentAddress);

    pohProfile.update((_) {
      _!.ethAddress = currentAddress;
      _.name = _pohProfile.name;
      _.firstName = _pohProfile.firstName;
      _.lastName = _pohProfile.lastName;
      _.photoUrl = _pohProfile.photoUrl;
      _.videoUrl = _pohProfile.videoUrl;
    });

    update();
  }

  Future load() async {
    loading.value = true;
    update();

    checkChainSupport();
    loadContracts();

    await updateDelegateSeats();
    await updateWalletProposals();
    await updateToken();
    await updateDao();

    ethereum!.on('AppointDelegate', (message) {
      // TODO: event subscription does not work
      logging(dartify(message));
    });

    loading.value = false;
    update();
  }

  void loadContracts() {
    logging('Loading contracts...');
    dao = getContract('assembly');
    wallet = getContract('wallet');
    token = getContract('token');
    logging('Contracts loaded!');
  }

  Future reloadAll() async {
    await loadProfile();
    await load();
  }

  Contract getContract(String name) {
    var pr = provider == null ? jsonRpcProvider : provider!.getSigner();
    return Contract(
      getContractConfig(name)['address'],
      Interface(getContractConfig(name)['abi']),
      pr,
    );
  }

  String getNetworkName() {
    return currentChain == -1 ? 'Not connected' : config!.data['$currentChain']['name'];
  }

  dynamic getContractConfig(String name) {
    return config!.data['$currentChain']['contracts'][name];
  }

  clear() {
    currentAddress = '';
    currentChain = -1;
    update();
  }

  Future updateDao() async {
    try {
      logging('Loading DAO data...');

      final dao = getContract('assembly');
      daoProfile.value.address = currentAddress;
      daoProfile.value.isHuman = await dao.call('isHuman', [currentAddress]);
      daoProfile.value.isCitizen = await dao.call('isCitizen', [currentAddress]);
      daoProfile.value.isDelegate = await dao.call('isDelegate', [currentAddress]);
      daoProfile.value.appointedDelegate = await dao.call('getAppointedDelegate');
      daoProfile.value.isReferredClaimed = await dao.call('isReferredClaimed', [currentAddress]);

      daoData.value.tallies.clear();
      for (var i = 0; i < int.parse((await dao.call('getTallyCount', [])).toString()); i++) {
        final obj = await dao.call('getTally', [i]);
        final t = Tally();
        t.id = i;
        t.proposalId = int.parse(obj[0].toString());
        t.submissionTime = DateTime.fromMillisecondsSinceEpoch(int.parse(obj[1].toString()));
        t.revocationPeriodStartTime = DateTime.fromMillisecondsSinceEpoch(int.parse(obj[2].toString()));
        t.votingEndTime = DateTime.fromMillisecondsSinceEpoch(int.parse(obj[3].toString()));
        t.delegatedYays = int.parse(obj[4].toString());
        t.citizenYays = int.parse(obj[5].toString());
        t.citizenNays = int.parse(obj[6].toString());
        t.citizenCount = int.parse(obj[7].toString());
        t.status = obj[8].toString();
        t.phase = (await dao.call('getTallyPhase', [i])).toString();

        // Note: UI currently does not support scenario when a human votes as a delegate and also as a citizen at the same time
        if (daoProfile.value.isDelegate) {
          t.vote = await dao.call('getDelegateVote', [i]) ? 'Yay' : '';
        } else if (daoProfile.value.isCitizen) {
          t.vote = citizenVoteMapping[int.parse((await dao.call('getCitizenVote', [i])).toString())]!;
        }

        daoData.value.tallies.add(t);
      }

      daoData.value.seatCount = int.parse((await dao.call('getSeatCount')).toString());
      daoData.value.votingPercentThreshold = int.parse((await dao.call('getVotingPercentThreshold')).toString());
      daoData.value.citizenCount = int.parse((await dao.call('getCitizenCount')).toString());
      daoData.value.delegateCount = int.parse((await dao.call('getDelegateCount')).toString());
      daoData.value.tallyMaxDuration = int.parse((await dao.call('getTallyDuration')).toString());
      daoData.value.revocationPeriod = (daoData.value.tallyMaxDuration / 2).round();
      daoData.value.quorum = int.parse((await dao.call('getQuorum')).toString());
      daoData.value.delegationRewardRate = BigInt.tryParse((await dao.call('getDelegationRewardRate', [])).toString()) ?? BigInt.zero;
      final referralRewardParams = await dao.call('getReferralRewardParams', []);
      daoData.value.referredAmount = BigInt.tryParse(referralRewardParams[0].toString()) ?? BigInt.zero;
      daoData.value.referrerAmount = BigInt.tryParse(referralRewardParams[1].toString()) ?? BigInt.zero;
      daoData.value.execRewardExponentMax = BigInt.tryParse(await dao.call('getExecRewardExponentMax', [])) ?? BigInt.zero;
      daoProfile.value.currentTokenBalance = BigInt.parse((await token.call('balanceOf', [currentAddress])).toString());
      daoProfile.value.rewardBalance = BigInt.parse((await dao.call('getRewardBalance', [currentAddress])).toString());
      daoProfile.value.appointmentCount = BigInt.parse((await dao.call('getAppointmentCount', [currentAddress])).toString());

      daoProfile.refresh();
      daoData.refresh();

      logging('DAO data loaded');
    } catch (e) {
      logging('Error:updateDao:$e');
    }
  }

  Future updateToken() async {
    try {
      logging('Loading Token data...');

      final token = getContract('token');
      tokenData.value.totalSupply = BigInt.parse((await token.call('totalSupply', [])).toString());
      tokenData.value.reserveAddress = (await token.call('getReserve', [])).toString();
      tokenData.value.reserveBalance = BigInt.parse((await token.call('balanceOf', [tokenData.value.reserveAddress])).toString());
      //tokenData.value.priceUsd = // TODO
      logging('Token data loaded');

      tokenData.refresh();
    } catch (e) {
      logging('Error:updateToken:$e');
    }
  }

  Future updateWalletProposals() async {
    try {
      var proposalCount = await wallet.call('getProposalCount', []);
      List<WalletTransaction> _transactions = [];
      for (var i = 0; i < int.parse(proposalCount.toString()); i++) {
        final tx = await wallet.call('getProposal', [i]);
        final t = WalletTransaction(
            id: i,
            destinationAddress: tx[0].toString(),
            value: BigInt.parse(tx[1].toString()),
            data: tx[2].toString(),
            executed: tx[3].toString() == 'true');
        _transactions.add(t);
      }
      daoData.value.transactions.clear();
      daoData.value.transactions.addAll(_transactions);
    } catch (e) {
      logging('Error:updateWalletProposals:$e');
    }
  }

  Future updateDelegateSeats() async {
    try {
      var ret = await dao.call('getDelegateSeatAppointmentCounts', []);

      daoData.value.appointmentCounts.clear();
      for (var i = 0; i < ret[0].length; i++) {
        daoData.value.appointmentCounts[ret[0][i].toString().trim()] = int.parse(ret[1][i].toString());
      }

      ret = await dao.call('getDelegateSeats', []);
      List<PohProfile> _delegateSeats = [];
      for (final address in ret) {
        _delegateSeats.add(await pohService.getProfileData(address));
      }

      daoData.value.delegateSeats.clear();
      daoData.value.delegateSeats.addAll(_delegateSeats);
    } catch (e) {
      logging('Error:updateDelegateSeats:$e');
    }
  }

  Future applyForDelegation() async {
    try {
      logging('Applying for delegation..');
      final tx = await dao.call('applyForDelegation', []);
      // await tx.wait(); // TODO: waiting for tx does not work
      await updateDelegateSeats();
      await updateDao();
      update();
    } on EthereumException catch (e) {
      // if (e.code == -32603 && e.message == 'Internal JSON-RPC error.') errorDialog(e);
      errorDialog(e);
    }
  }

  Future applyForCitizenship() async {
    try {
      logging('Applying for citizenship..');
      final tx = await dao.call('applyForCitizenship', []);
      await updateDelegateSeats();
      await updateDao();
      update();
    } on EthereumException catch (e) {
      // if (e.code == -32603 && e.message == 'Internal JSON-RPC error.') errorDialog(e);
      errorDialog(e);
    }
  }

  Future appointDelegate(String delegateAddress) async {
    try {
      final tx = await dao.call('appointDelegate', [delegateAddress]);
      await updateDelegateSeats();
      await updateDao();
      update();
    } on EthereumException catch (e) {
      // if (e.code == -32603 && e.message == 'Internal JSON-RPC error.') errorDialog(e);
      errorDialog(e);
    }
  }

  Future castDelegateVote(int tallyId, bool yay) async {
    try {
      logging('Casting delegate ${yay ? 'Yes' : 'No'} vote on proposal $tallyId...');
      final tx = await dao.call('castDelegateVote', [tallyId, yay]);
      await updateDelegateSeats();
      await updateDao();
      update();
    } on EthereumException catch (e) {
      errorDialog(e);
    }
  }

  Future castCitizenVote(int tallyId, bool yay) async {
    try {
      logging('Casting citizen ${yay ? 'Yes' : 'No'} vote on proposal $tallyId...');
      final tx = await dao.call('castCitizenVote', [tallyId, yay]);
      await updateDelegateSeats();
      await updateDao();
      update();
    } on EthereumException catch (e) {
      errorDialog(e);
    }
  }

  Future claimReferralReward(String address) async {
    try {
      final tx = await dao.call('claimReferralReward', [address]);
      await updateDao();
      update();
    } on EthereumException catch (e) {
      errorDialog(e);
    }
  }

  Future claimRewards() async {
    try {
      final tx = await dao.call('claimRewards', []);
      await updateDao();
      update();
    } on EthereumException catch (e) {
      errorDialog(e);
    }
  }

  Future<PohProfile?>? getDelegateData(String address) async {
    try {
      final isDelegate = (await dao.call('isDelegate', [address])).toString() == 'true';
      searchedDelegates.clear();
      if (isDelegate) {
        final PohProfile _pohProfile = await pohService.getProfileData(address);
        searchedDelegates.add(_pohProfile);
      }
      update();
    } on EthereumException catch (e) {
      errorDialog(e);
    }
  }

  Future claimSeat(int seatNum) async {
    try {
      final tx = await dao.call('claimSeat', [seatNum]);
      await updateDelegateSeats();
      update();
    } on EthereumException catch (e) {
      errorDialog(e);
    }
  }
}

void errorDialog(e) {
  Get.defaultDialog(
      title: "Error",
      textCancel: "Close",
      onCancel: () {},
      middleText: "An error ocurred, check your browser logs for more information\n\nError: ${e.code} ${e.message}");
}
