import 'package:flutter/material.dart';
import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/controllers/web3_controller.dart';
import 'package:humanity_unchained_dao/models/poh_profile.dart';
import 'package:humanity_unchained_dao/responsive.dart';
import 'package:humanity_unchained_dao/screens/components/avatar.dart';
import 'package:humanity_unchained_dao/screens/components/button.dart';
import 'package:humanity_unchained_dao/screens/components/clipboard_button.dart';
import 'package:humanity_unchained_dao/screens/components/open_browser.dart';
import 'package:humanity_unchained_dao/utils/utils.dart';

DataRow delegateDataRow(BuildContext context, int? seatNum, PohProfile? delegate, Map<String, int> appointmentCounts, Web3Controller controller) {
  return DataRow(
    cells: [
      if (seatNum != null) DataCell(claimSeatButton(context, controller, seatNum)),
      DataCell(
        Row(
          children: [
            delegate == null
                ? Container()
                : Avatar(
                    delegate,
                    avatarSize,
                    url: urlPohProfile + delegate.ethAddress.toLowerCase(),
                  ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: defaultPadding),
              child: delegate == null
                  ? Container()
                  : delegate.ethAddress.toLowerCase() == creatorEthAddress.toLowerCase()
                      ? const Text(creatorTag)
                      : Text(delegate.name),
            ),
          ],
        ),
      ),
      DataCell(
        delegate == null ? Container() : OpenBrowser(urlForum + 't/' + delegate.ethAddress.toLowerCase()),
      ),
      if (!Responsive.isMobile(context))
        DataCell(delegate == null
            ? Container()
            : Row(children: [
                SizedBox(width: 30, height: 30, child: ClipboardButton(delegate.ethAddress)),
                const SizedBox(width: 10),
                Text(ethAddressShortener(delegate.ethAddress)),
              ])),
      DataCell(delegate == null
          ? Container()
          : appointmentCounts[delegate.ethAddress] == null
              ? const Text('0')
              : Text(appointmentCounts[delegate.ethAddress].toString())),
      DataCell(controller.daoProfile.value.appointedDelegate == delegate!.ethAddress
          ? const Text('You appointed this delegate')
          : Button(
              Responsive.isMobile(context) ? '' : 'Appoint',
              controller.daoProfile.value.isHuman == false
                  ? null
                  : () async {
                      await controller.appointDelegate(delegate.ethAddress);
                    },
              iconData: Icons.person_add_alt_1_rounded)),
    ],
  );
}

Button claimSeatButton(BuildContext context, Web3Controller controller, int seatNum) {
  return Button(
    '#$seatNum',
    controller.daoProfile.value.isDelegate == false
        ? null
        : () async {
            await controller.claimSeat(seatNum);
          },
    iconData: Icons.event_seat_outlined,
    size: const Size(110.0, 36.0),
  );
}

Button distributeDelegationRewardButton(BuildContext context, Web3Controller controller) {
  return Button(
    'Update',
    controller.daoProfile.value.isDelegate == false
        ? null
        : () async {
            await controller.distributeDelegationReward();
          },
    iconData: Icons.autorenew,
  );
}
