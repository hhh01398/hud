class WalletTransaction {
  int id;
  String destinationAddress;
  BigInt value;
  String data;
  bool executed;

  WalletTransaction({
    required this.id,
    required this.destinationAddress,
    required this.value,
    required this.data,
    required this.executed,
  });

  @override
  String toString() {
    return "($id,$destinationAddress,$value,$data,$executed)";
  }
}

