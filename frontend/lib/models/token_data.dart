import 'package:decimal/decimal.dart';
import 'package:humanity_unchained_dao/utils/utils.dart';

class TokenData {
  BigInt totalSupply = BigInt.one;
  String reserveAddress = '';
  BigInt reserveBalance = BigInt.zero;
  Decimal priceUsd = Decimal.zero;

  Decimal? marketCap() {
    return balanceToUnits(totalSupply) * priceUsd;
  }

  @override
  String toString() {
    return "($totalSupply,$reserveAddress,$reserveBalance,$priceUsd)";
  }
}
