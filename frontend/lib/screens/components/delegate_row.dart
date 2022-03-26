import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/controllers/web3_controller.dart';
import 'package:humanity_unchained_dao/models/poh_profile.dart';
import 'package:humanity_unchained_dao/responsive.dart';
import 'package:humanity_unchained_dao/screens/components/avatar.dart';
import 'package:humanity_unchained_dao/screens/components/button.dart';
import 'package:humanity_unchained_dao/screens/components/clipboard_button.dart';
import 'package:humanity_unchained_dao/utils/utils.dart';
import 'package:flutter/material.dart';

DataRow delegateDataRow(BuildContext context, int? seatNum, PohProfile? delegate, Map<String, int> appointmentCounts, Web3Controller controller) {
  return DataRow(
    cells: [
      if (seatNum != null) DataCell(claimSeatButton(context, controller, seatNum, shrink: true)),
      DataCell(
        Row(
          children: [
            delegate == null ? Container() : Avatar(delegate, avatarSize),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: defaultPadding),
              child: delegate == null ? Container() : Text(delegate.name),
            ),
          ],
        ),
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

Button claimSeatButton(
  BuildContext context,
  Web3Controller controller,
  int seatNum, {
  bool shrink = false,
}) {
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
