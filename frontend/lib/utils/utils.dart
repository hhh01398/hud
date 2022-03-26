import 'package:humanity_unchained_dao/constants.dart';
import 'package:decimal/decimal.dart';
import 'package:intl/intl.dart';

final d = (String s) => Decimal.parse(s);

String shorten(String str, int padStart, int padEnd) {
  return str.length <= (2 + padStart + padEnd) ? str : str.substring(0, padStart + 2) + '...' + str.substring(str.length - padEnd, str.length);
}

String ethAddressShortener(String address) {
  return shorten(address, 4, 4);
}

Decimal balanceToUnits(BigInt b) {
  return Decimal.parse(b.toString()) / ethPrecisionFactor;
}

String formatCcy(double d) {
  return NumberFormat.compactCurrency(locale: 'en_US', symbol: '').format(d);
}

void logging(String s) {
  print(s);
}
