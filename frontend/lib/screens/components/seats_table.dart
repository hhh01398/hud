// import 'package:data_table_2/data_table_2.dart';
import 'dart:math';

import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/controllers/web3_controller.dart';
import 'package:humanity_unchained_dao/responsive.dart';
import 'package:humanity_unchained_dao/screens/components/delegate_row.dart';
import 'package:humanity_unchained_dao/screens/components/tooltip.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SeatsTable extends StatefulWidget {
  int? limitCount;
  final sortColumnIndex = 3;

  SeatsTable({this.limitCount, Key? key}) : super(key: key);

  @override
  _SeatsTableState createState() => _SeatsTableState();
}

class _SeatsTableState extends State<SeatsTable> {
  bool ascending = false;

  var delegateSeats = [];
  var appointmentCounts = <String, int>{};

  @override
  Widget build(BuildContext context) {
    return GetX<Web3Controller>(builder: (controller) {
      final d = controller.daoData.value;
      delegateSeats = d.delegateSeats;
      appointmentCounts = d.appointmentCounts;

      if (ascending) {
        delegateSeats.sort((a, b) => appointmentCounts[a.ethAddress]!.compareTo(appointmentCounts[b.ethAddress]!));
      } else {
        delegateSeats.sort((a, b) => appointmentCounts[b.ethAddress]!.compareTo(appointmentCounts[a.ethAddress]!));
      }

      final rowList = List.generate(
        widget.limitCount == null ? delegateSeats.length : min(delegateSeats.length, widget.limitCount!),
        (index) => delegateDataRow(context, d.delegateSeats.indexOf(delegateSeats[index]), delegateSeats[index], appointmentCounts, controller),
      );

      List<Widget> bottom = [const SizedBox(width: defaultPadding * 1.5)];

      if (d.seatCount > d.delegateSeats.length) {
        bottom.addAll([
          claimSeatButton(context, controller, d.delegateSeats.length),
          const SizedBox(width: defaultPadding * 2),
        ]);
      }

      bottom.addAll([
        distributeDelegationRewardButton(context, controller),
        const SizedBox(width: 5),
        const TooltipInfo("For a correct delegate reward calculation, click this button to apply any changes in the citizen appointment count or seat distribution"),
      ]);

      return Container(
          padding: const EdgeInsets.all(defaultPadding),
          decoration: const BoxDecoration(
            color: secondaryColor,
            borderRadius: BorderRadius.all(Radius.circular(10)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Seats",
                style: Theme.of(context).textTheme.subtitle1,
              ),
              SizedBox(
                width: double.infinity,
                child: DataTable(
                    sortColumnIndex: widget.sortColumnIndex,
                    sortAscending: ascending,
                    columnSpacing: defaultPadding,
                    columns: [
                      const DataColumn(label: Text("Claim Seat")),
                      const DataColumn(label: Text("Identity")),
                      const DataColumn(label: Text("Website")),
                      if (!Responsive.isMobile(context)) const DataColumn(label: Text("Address")),
                      DataColumn(
                          label: Row(children: const [
                            Text("Citizens"),
                            SizedBox(width: 5),
                            TooltipInfo("Number of citizens who chose this delegate"),
                          ]),
                          onSort: (columnIndex, ascending) {
                            setState(() {
                              this.ascending = ascending;
                            });
                          },
                          numeric: true),
                      const DataColumn(label: Text("Actions")),
                    ],
                    rows: rowList),
              ),
              Row(children: bottom),
            ],
          ));
    });
  }
}
