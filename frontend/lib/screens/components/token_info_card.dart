import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/utils/utils.dart';
import 'package:decimal/decimal.dart';
import 'package:flutter/material.dart';

class TokenInfoCard extends StatelessWidget {
  const TokenInfoCard({
    Key? key,
    required this.title,
    required this.svgSrc,
    required this.numTokens,
    required this.totalTokenSupply,
    required this.tokenPrice,
    required this.priceCcy,
  }) : super(key: key);

  final Color svgSrc;
  final String title, priceCcy;
  final BigInt numTokens, totalTokenSupply;
  final Decimal tokenPrice;

  @override
  Widget build(BuildContext context) {
    final Decimal marketCap = balanceToUnits(numTokens);
    final Decimal percentage = Decimal.parse(numTokens.toString()) / Decimal.parse(totalTokenSupply.toString()) * Decimal.parse('100');

    return Container(
      margin: const EdgeInsets.only(top: defaultPadding),
      padding: const EdgeInsets.all(defaultPadding),
      decoration: BoxDecoration(
        border: Border.all(width: 2, color: primaryColor.withOpacity(0.15)),
        borderRadius: const BorderRadius.all(
          Radius.circular(defaultPadding),
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.circle,
            size: 20,
            color: svgSrc,
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: defaultPadding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    '${percentage.toStringAsFixed(4)}%',
                    style: Theme.of(context).textTheme.caption!.copyWith(color: Colors.white70),
                  ),
                ],
              ),
            ),
          ),
          Column(
            children: [
              Text(formatCcy(marketCap.toDouble()) + ' ' + tokenSymbol),
              Text((tokenPrice == Decimal.zero ? 'n/a' : formatCcy((tokenPrice * balanceToUnits(numTokens)).toDouble())) + ' ' + ccySymbol, style: Theme.of(context).textTheme.caption!.copyWith(color: Colors.white70)),
            ],
          )
        ],
      ),
    );
  }
}
