import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/controllers/menu_controller.dart';
import 'package:humanity_unchained_dao/controllers/web3_controller.dart';
import 'package:humanity_unchained_dao/responsive.dart';
import 'package:humanity_unchained_dao/screens/components/button.dart';
import 'package:humanity_unchained_dao/utils/utils.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:provider/provider.dart';

import 'avatar.dart';

class Header extends StatelessWidget {
  final String title;

  const Header(
    this.title, {
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GetBuilder<Web3Controller>(
        init: Web3Controller(),
        builder: (controller) {
          return Row(
            children: [
              if (!Responsive.isDesktop(context))
                IconButton(
                  icon: const Icon(Icons.menu),
                  onPressed: context.read<MenuController>().controlMenu,
                ),
              Text(title, style: Theme.of(context).textTheme.headline6),
              const Spacer(),
              Button(Responsive.isMobile(context) ? '' : 'Refresh', () async {
                await controller.reloadAll();
              }, iconData: Icons.refresh),
              const SizedBox(width: defaultPadding / 2),
              ProfileCard(controller)
            ],
          );
        });
  }
}

class ProfileCard extends StatelessWidget {
  final Web3Controller controller;
  const ProfileCard(
    this.controller, {
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var p = controller.pohProfile.value;
    var d = controller.daoProfile.value;

    return Container(
        margin: const EdgeInsets.only(left: defaultPadding),
        padding: const EdgeInsets.symmetric(
          horizontal: defaultPadding,
          vertical: defaultPadding / 2,
        ),
        decoration: BoxDecoration(
          color: secondaryColor,
          borderRadius: const BorderRadius.all(Radius.circular(10)),
          border: Border.all(color: Colors.white10),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Avatar(p, selfAvatarSize),
            if (!Responsive.isMobile(context))
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: defaultPadding / 2),
                child: Column(children: [
                  Text(p.ethAddress.isNotEmpty ? ethAddressShortener(p.ethAddress) : 'No address'),
                  Text('${balanceToUnits(d.currentTokenBalance).toStringAsFixed(5)} $tokenSymbol'),
                ]),
              ),
          ],
        ));
  }
}
