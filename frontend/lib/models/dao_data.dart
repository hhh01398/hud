import 'package:humanity_unchained_dao/models/poh_profile.dart';
import 'package:humanity_unchained_dao/models/wallet_transaction.dart';

class DaoData {
  List<PohProfile> delegateSeats = <PohProfile>[];
  Map<String, int> appointmentCounts = <String, int>{};
  List<WalletTransaction> transactions = <WalletTransaction>[];

  int seatCount = 0;
  int votingPercentThreshold = 0;
  int tallyMaxDuration = 0;
  int revocationPeriod = 0;
  int quorum = 0;

  List<Tally> tallies = <Tally>[];
  int citizenCount = 0;
  int delegateCount = 0;

  BigInt delegationRewardRate = BigInt.zero;

  BigInt referrerAmount = BigInt.zero;
  BigInt referredAmount = BigInt.zero;

  BigInt execRewardExponentMax = BigInt.zero;
}

class Tally {
  int id = 0;
  int proposalId = 0;
  DateTime submissionTime = DateTime(0);
  DateTime revocationPeriodStartTime = DateTime(0);
  DateTime votingEndTime = DateTime(0);
  int delegatedYays = 0;
  int citizenYays = 0;
  int citizenNays = 0;
  int citizenCount = 0;
  String status = '';

  String phase = '';
  String vote = '';

  String getPhase() {
    if (phase == '0') return 'Open';
    if (phase == '1') return 'Only citizens';
    if (phase == '2') return 'Ended';
    return 'N/A';
  }

  String getStatus() {
    if (status == '0') return 'Provisional'; // ProvisionalNotApproved
    if (status == '1') return 'Provisional'; // ProvisionalApproved
    if (status == '2') return 'Not Approved';
    if (status == '3') return 'Approved';
    if (status == '4') return 'Enacted';
    return 'N/A';
  }

  @override
  String toString() {
    return {
      'id': id,
      'proposalId': proposalId,
      'submissionTime': submissionTime.toIso8601String(),
      'revocationPeriodStartTime': revocationPeriodStartTime.toIso8601String(),
      'votingEndTime': votingEndTime.toIso8601String(),
      'delegatedYays': delegatedYays,
      'citizenYays': citizenYays,
      'citizenNays': citizenNays,
      'citizenCount': citizenCount,
      'status': status,
    }.toString();
  }
}
