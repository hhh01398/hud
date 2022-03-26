import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/controllers/web3_controller.dart';
import 'package:humanity_unchained_dao/screens/components/rounded_container.dart';
import 'package:humanity_unchained_dao/utils/utils.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class DaoParams extends StatelessWidget {
  const DaoParams({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GetBuilder<Web3Controller>(
        init: Web3Controller(),
        builder: (controller) {
          return Container(
            padding: const EdgeInsets.all(defaultPadding),
            decoration: const BoxDecoration(
              color: secondaryColor,
              borderRadius: BorderRadius.all(Radius.circular(10)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Parameters",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: defaultPadding),
                const Text(
                  "Voting",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                RoundedContainer(
                    child: Column(children: [
                  Row(children: [
                    const Expanded(child: Text('Total citizens')),
                    Text(controller.daoData.value.citizenCount.toString()),
                  ]),
                  const SizedBox(height: defaultPadding / 4),
                  Row(children: [
                    const Expanded(child: Text('Total delegates')),
                    Text(controller.daoData.value.delegateCount.toString()),
                  ]),
                  const SizedBox(height: defaultPadding / 4),
                  Row(children: [
                    const Expanded(child: Text('Number of seats')),
                    Text(controller.daoData.value.seatCount.toString()),
                  ]),
                  const SizedBox(height: defaultPadding / 4),
                  Row(children: [
                    const Expanded(child: Text('Tallies count')),
                    Text(controller.daoData.value.tallies.length.toString()),
                  ]),
                  const SizedBox(height: defaultPadding / 4),
                  Row(children: [
                    const Expanded(child: Text('Voting threshold')),
                    Text('${controller.daoData.value.votingPercentThreshold.toString()}%'),
                  ]),
                  const SizedBox(height: defaultPadding / 4),
                  Row(children: [
                    const Expanded(child: Text('Grace period')),
                    Text('${(controller.daoData.value.tallyMaxDuration / 3600.0 / 24.0).toStringAsFixed(2)} days'),
                  ]),
                  const SizedBox(height: defaultPadding / 4),
                  Row(children: [
                    const Expanded(child: Text('Revocation phase')),
                    Text('${(controller.daoData.value.revocationPeriod / 3600.0 / 24.0).toStringAsFixed(2)} days'),
                  ]),
                  Row(children: [
                    const Expanded(child: Text('Quorum')),
                    Text('${controller.daoData.value.quorum} citizens'),
                  ]),
                ])),
                const SizedBox(height: defaultPadding),
                const Text(
                  "Delegation",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                RoundedContainer(
                  child: Column(children: [
                    Row(children: [
                      const Expanded(child: Text('Reward rate')),
                      Text('${balanceToUnits(controller.daoData.value.delegationRewardRate).toString()} $tokenSymbol'),
                    ]),
                  ]),
                ),
                const SizedBox(height: defaultPadding),
                const Text(
                  "Referrals",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                RoundedContainer(
                    child: Column(children: [
                  Row(children: [
                    const Expanded(child: Text('Referrer reward')),
                    Text('${balanceToUnits(controller.daoData.value.referrerAmount).toString()} $tokenSymbol'),
                  ]),
                  const SizedBox(height: defaultPadding / 4),
                  Row(children: [
                    const Expanded(child: Text('Referred reward')),
                    Text('${balanceToUnits(controller.daoData.value.referredAmount).toString()} $tokenSymbol'),
                  ]),
                ])),
                const SizedBox(height: defaultPadding),
                const Text(
                  "Execution",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                RoundedContainer(
                    child: Column(
                  children: [
                    Row(children: [
                      const Expanded(child: Text('Max exponent')),
                      Text(controller.daoData.value.execRewardExponentMax.toString()),
                    ]),
                  ],
                )),
              ],
            ),
          );
        });
  }
}
