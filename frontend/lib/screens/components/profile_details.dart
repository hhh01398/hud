import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/controllers/web3_controller.dart';
import 'package:humanity_unchained_dao/responsive.dart';
import 'package:humanity_unchained_dao/screens/components/button.dart';
import 'package:humanity_unchained_dao/screens/components/profile_info_card.dart';
import 'package:humanity_unchained_dao/screens/components/rounded_container.dart';
import 'package:humanity_unchained_dao/utils/utils.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

class ProfileDetails extends StatelessWidget {
  const ProfileDetails({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GetBuilder<Web3Controller>(
        init: Web3Controller(),
        builder: (controller) {
          bool isHuman = controller.daoProfile.value.isHuman == true;
          bool isCitizen = controller.daoProfile.value.isCitizen == true;
          bool isDelegate = controller.daoProfile.value.isDelegate == true;

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
                  "Profile",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                ProfileInfoCard(
                    svgSrc: isHuman ? const Color(Palette.ok) : const Color(Palette.notOk),
                    title: "Humanity",
                    tooltipText: "To join this DAO, you need to prove you are a human first.",
                    description: isHuman ? "You are a human" : "You are not a human",
                    button: isHuman
                        ? Container()
                        : Button("Prove", () {
                            Get.defaultDialog(title: "Info", textConfirm: "Prove humanity", textCancel: "Cancel", onCancel: () {}, onConfirm: () => launch('https://www.proofofhumanity.id/'), middleText: "To join the DAO, you first need to prove you are a human.\nVisit https://www.proofofhumanity.id or click the button below and follow the steps.");
                          })),
                ProfileInfoCard(
                    svgSrc: isCitizen ? const Color(Palette.ok) : const Color(Palette.notOk),
                    title: "Citizenship",
                    description: isCitizen ? "You are a citizen" : "You are not a citizen",
                    tooltipText: "To be able to vote or appoint a delegate, you need prove you are a human first and then apply for citizenship.",
                    button: (!isHuman || isCitizen)
                        ? Container()
                        : Button("Apply", () async {
                            await controller.applyForCitizenship();
                          })),
                ProfileInfoCard(
                    svgSrc: isDelegate ? const Color(Palette.ok) : const Color(Palette.notOk),
                    title: "Delegation",
                    description: isDelegate ? "You are a delegate" : "You are not a delegate",
                    tooltipText: "To become a delegate, you need prove you are a human first.",
                    button: (!isHuman || isDelegate)
                        ? Container()
                        : Button("Apply", () async {
                            await controller.applyForDelegation();
                          })),
                const SizedBox(height: defaultPadding),
                const Text(
                  "Balances",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                RoundedContainer(
                  child: Column(children: [
                    Row(children: [
                      const Expanded(child: Text('Token')),
                      Text('${balanceToUnits(controller.daoProfile.value.currentTokenBalance).toStringAsPrecision(5)} $tokenSymbol'),
                    ]),
                    Row(children: [
                      const Expanded(child: Text('Rewards')),
                      Text('${balanceToUnits(controller.daoProfile.value.rewardBalance).toStringAsPrecision(5)} $tokenSymbol'),
                    ]),
                    const SizedBox(height: defaultPadding / 2),
                    Button(
                      'Claim rewards',
                      controller.daoProfile.value.isDelegate == false
                          ? null
                          : () async {
                              await controller.claimRewards();
                            },
                    ),
                  ]),
                ),
              ],
            ),
          );
        });
  }
}
