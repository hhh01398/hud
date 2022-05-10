import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/controllers/web3_controller.dart';
import 'package:humanity_unchained_dao/responsive.dart';
import 'package:humanity_unchained_dao/screens/components/delegate_row.dart';
import 'package:humanity_unchained_dao/screens/components/tooltip.dart';

class DelegatesTable extends StatefulWidget {
  int? limitCount;

  DelegatesTable({this.limitCount, Key? key}) : super(key: key);

  @override
  _DelegatesTableState createState() => _DelegatesTableState();
}

class _DelegatesTableState extends State<DelegatesTable> {
  bool ascending = true;

  var appointmentCounts = <String, int>{};

  @override
  Widget build(BuildContext context) {
    return GetX<Web3Controller>(builder: (controller) {
      final d = controller.daoData.value;
      appointmentCounts = d.appointmentCounts;

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
                "Delegates",
                style: Theme.of(context).textTheme.subtitle1,
              ),
              SizedBox(
                width: double.infinity,
                child: DataTable(
                  sortColumnIndex: 2,
                  sortAscending: ascending,
                  columnSpacing: defaultPadding,
                  columns: [
                    DataColumn(
                      label: Row(children: const [
                        Text("Identity"),
                        SizedBox(width: 5),
                        TooltipInfo("Delegate's identity on Proof of Humanity. Click on the avatar to visit the delegate's website."),
                      ]),
                    ),
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
                  rows: List.generate(controller.searchedDelegates.length, (index) {
                    return delegateDataRow(context, null, controller.searchedDelegates[index], appointmentCounts, controller);
                  }),
                ),
              ),
            ],
          ));
    });
  }
}
