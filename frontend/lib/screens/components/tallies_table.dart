import 'dart:math';

import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/controllers/web3_controller.dart';
import 'package:humanity_unchained_dao/models/dao_data.dart';
import 'package:humanity_unchained_dao/models/dao_profile.dart';
import 'package:humanity_unchained_dao/responsive.dart';
import 'package:humanity_unchained_dao/screens/components/button.dart';
import 'package:humanity_unchained_dao/screens/components/tooltip.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class TalliesTable extends StatefulWidget {
  int? limitCount;

  TalliesTable({this.limitCount, Key? key}) : super(key: key);

  @override
  _TalliesTableState createState() => _TalliesTableState();
}

class _TalliesTableState extends State<TalliesTable> {
  bool ascending = true;

  @override
  Widget build(BuildContext context) {
    List<Tally> _tallies = [];

    return Container(
      padding: const EdgeInsets.all(defaultPadding),
      decoration: const BoxDecoration(
        color: secondaryColor,
        borderRadius: BorderRadius.all(Radius.circular(10)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(
          children: [
            Text(
              "Tallies",
              style: Theme.of(context).textTheme.subtitle1,
            ),
            const SizedBox(width: 5),
            const TooltipInfo("List of tallies of delegates' and citizens' votes on the transactions"),
          ],
        ),
        SizedBox(
          width: double.infinity,
          child: GetX<Web3Controller>(builder: (controller) {
            _tallies = controller.daoData.value.tallies;

            if (ascending) {
              _tallies.sort((a, b) => a.submissionTime.compareTo(b.submissionTime));
            } else {
              _tallies.sort((a, b) => b.submissionTime.compareTo(a.submissionTime));
            }

            return DataTable(
              sortColumnIndex: 2,
              sortAscending: ascending,
              columnSpacing: defaultPadding,
              // minWidth: 600,
              columns: [
                const DataColumn(label: Text("Id")),
                if (!Responsive.isMobile(context)) const DataColumn(label: Text("Tx Id")),
                if (!Responsive.isMobile(context))
                  DataColumn(
                      label: const Text("Expiring"),
                      onSort: (columnIndex, ascending) {
                        setState(() {
                          this.ascending = ascending;
                        });
                      },
                      numeric: true),
                DataColumn(label: Row(children: const [Text("Delegated"), TooltipInfo("Number of votes from delegates")])),
                if (!Responsive.isMobile(context))
                  DataColumn(label: Row(children: const [Text("Direct"), TooltipInfo("Effective number of citizen votes")])),
                const DataColumn(label: Text("Cast Vote")),
                const DataColumn(label: Text("Status")),
              ],
              rows: List.generate(
                widget.limitCount == null ? _tallies.length : min(_tallies.length, widget.limitCount!),
                (index) => talliesDataRow(context, controller, _tallies[index], controller.daoProfile.value),
              ),
            );
          }),
        ),
        widget.limitCount != null && _tallies.length > widget.limitCount!
            ? Button('See more', () {
                Get.offAndToNamed("/tallies");
              })
            : Container(),
      ]),
    );
  }
}

DataRow talliesDataRow(BuildContext context, Web3Controller controller, Tally tally, DaoProfile profile) {
  final status = tally.getStatus();

  String getDialogText(bool yay, int tallyId, bool isDelegate) {
    return "You are about to cast a ${yay ? 'Yes' : 'No'} vote as a ${isDelegate ? 'delegate' : 'citizen'} on the tally $tallyId";
  }

  Widget voteDataCell(bool yay) {
    if (yay && tally.vote == 'Yay') {
      return const Text('You voted Yes already');
    }
    if (!yay && tally.vote == 'Nay') {
      return const Text('You voted No already');
    }

    bool enabledButton = (!['Approved', 'Enacted'].contains(status)) && (profile.isCitizen || profile.isDelegate);

    return Button(
        '',
        enabledButton
            ? () async {
                Get.defaultDialog(
                    title: "Confirm vote",
                    textConfirm: "Cast vote",
                    textCancel: "Cancel",
                    onCancel: () {
                      Get.back();
                    },
                    onConfirm: () async {
                      Get.back();
                      if (profile.isDelegate) {
                        await controller.castDelegateVote(tally.id, yay);
                      } else {
                        await controller.castCitizenVote(tally.id, yay);
                      }
                    },
                    middleText: getDialogText(yay, tally.id, profile.isDelegate));
              }
            : null,
        iconData: yay ? Icons.thumb_up : Icons.thumb_down);
  }

  return DataRow(
    cells: [
      DataCell(Text(tally.id.toString())),
      if (!Responsive.isMobile(context)) DataCell(Text(tally.proposalId.toString())),
      if (!Responsive.isMobile(context)) DataCell(Text(tally.votingEndTime.toIso8601String())),
      DataCell(Text('${tally.delegatedYays} (Yes)')),
      DataCell(Text('${tally.citizenYays} (Yes) / ${tally.citizenNays} (No)')),
      DataCell(Row(children: [
        voteDataCell(true),
        if (!Responsive.isMobile(context)) const SizedBox(width: 5),
        voteDataCell(false),
      ])),
      DataCell(Text(status)),
    ],
  );
}
