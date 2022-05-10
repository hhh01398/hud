import 'package:decimal/decimal.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/controllers/web3_controller.dart';
import 'package:humanity_unchained_dao/screens/components/chart.dart';
import 'package:humanity_unchained_dao/screens/components/open_browser.dart';
import 'package:humanity_unchained_dao/screens/components/rounded_container.dart';
import 'package:humanity_unchained_dao/screens/components/token_info_card.dart';
import 'package:humanity_unchained_dao/screens/components/tooltip.dart';
import 'package:humanity_unchained_dao/services/market_service.dart';
import 'package:humanity_unchained_dao/utils/utils.dart';

class TokenDetails extends StatelessWidget {
  const TokenDetails({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GetBuilder<Web3Controller>(
        init: Web3Controller(),
        builder: (controller) {
          final t = controller.tokenData.value;
          final d = controller.daoData.value;

          return Container(
            padding: const EdgeInsets.all(defaultPadding),
            decoration: const BoxDecoration(
              color: secondaryColor,
              borderRadius: BorderRadius.all(Radius.circular(10)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: const [
                    Text(
                      "Token Details",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    SizedBox(width: 5),
                    TooltipInfo("Figures showing the current economics of the token.\nNote: n/a means a token price is not available at the moment."),
                  ],
                ),
                const SizedBox(height: defaultPadding / 2),
                RoundedContainer(
                  child: Column(
                    children: [
                      Row(children: [
                        const Expanded(child: Text('Total supply')),
                        Text(formatCcy(balanceToUnits(t.totalSupply).toDouble()) + ' ' + tokenSymbol),
                      ]),
                      Row(children: [
                        const Text('Price'),
                        const TooltipInfo('Latest exchange rate available on decentralized exchanges'),
                        const Spacer(),
                        Text((t.priceUsd == Decimal.zero ? 'n/a' : t.priceUsd.toStringAsPrecision(4)) + ' ' + ccySymbol),
                        OpenBrowser(MarketService.getAppUrl(controller.currentChain, tokenSymbol, ccySymbol)),
                      ]),
                      Row(
                        children: [
                          const Expanded(child: Text('Market cap')),
                          Text((t.marketCap() == Decimal.zero ? 'n/a' : formatCcy(t.marketCap()!.toDouble())) + ' ' + ccySymbol),
                        ],
                      ),
                      Row(
                        children: [
                          const Expanded(child: Text('Population')),
                          Text(d.citizenCount.toString()),
                        ],
                      ),
                      Row(
                        children: [
                          const Expanded(child: Text('Reserve per capita')),
                          Text(
                            t.marketCap() == null || d.citizenCount.toInt() == 0 ? '-' : formatCcy(balanceToUnits(BigInt.from(t.reserveBalance / BigInt.from(d.citizenCount))).toDouble()) + ' ' + tokenSymbol,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: defaultPadding),
                const Chart(),
                TokenInfoCard(
                  svgSrc: const Color(Palette.reserve),
                  title: "Reserve vault",
                  numTokens: t.reserveBalance,
                  totalTokenSupply: t.totalSupply,
                  tokenPrice: t.priceUsd,
                  priceCcy: ccySymbol,
                ),
                TokenInfoCard(
                  svgSrc: const Color(Palette.circulating),
                  title: "In circulation",
                  numTokens: (t.totalSupply) - (t.reserveBalance),
                  totalTokenSupply: t.totalSupply,
                  tokenPrice: t.priceUsd,
                  priceCcy: ccySymbol,
                ),
              ],
            ),
          );
        });
  }
}
