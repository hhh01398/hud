class DaoProfile {
  String address = '';
  bool isHuman = false;
  bool isCitizen = false;
  bool isDelegate = false;
  String appointedDelegate = '';
  bool isReferredClaimed = false;
  BigInt currentTokenBalance = BigInt.zero;
  BigInt rewardBalance = BigInt.zero;
  BigInt appointmentCount = BigInt.zero;

  @override
  String toString() {
    return {
      'address': address,
      'isHuman': isHuman,
      'isCitizen': isCitizen,
      'isDelegate': isDelegate,
      'appointedDelegate': appointedDelegate,
      'isReferredClaimed': isReferredClaimed,
      'currentTokenBalance': currentTokenBalance,
      'rewardBalance': rewardBalance,
      'appointmentCount': appointmentCount
    }.toString();
  }
}
