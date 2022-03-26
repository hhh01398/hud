import 'dart:math';

import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/controllers/web3_controller.dart';
import 'package:humanity_unchained_dao/models/wallet_transaction.dart';
import 'package:humanity_unchained_dao/responsive.dart';
import 'package:humanity_unchained_dao/screens/components/button.dart';
import 'package:humanity_unchained_dao/screens/components/tooltip.dart';
import 'package:humanity_unchained_dao/utils/utils.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class TransactionsTable extends StatefulWidget {
  int? limitCount;

  TransactionsTable({this.limitCount, Key? key}) : super(key: key);

  @override
  _TransactionsTableState createState() => _TransactionsTableState();
}

class _TransactionsTableState extends State<TransactionsTable> {
  bool ascending = true;

  @override
  Widget build(BuildContext context) {
    return GetX<Web3Controller>(builder: (controller) {
      List<WalletTransaction> transactions = controller.daoData.value.transactions;

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
                "Proposals",
                style: Theme.of(context).textTheme.subtitle1,
              ),
              const SizedBox(width: 5),
              const TooltipInfo("List of transaction proposals out of the DAO's wallet"),
            ],
          ),
          SizedBox(
            width: double.infinity,
            child: DataTable(
              sortColumnIndex: 1,
              sortAscending: ascending,
              columnSpacing: defaultPadding,
              // minWidth: 600,
              columns: [
                const DataColumn(label: Text("Tx Id")),
                if (!Responsive.isMobile(context)) const DataColumn(label: Text("Destination")),
                if (!Responsive.isMobile(context)) const DataColumn(label: Text("Value")),
                if (!Responsive.isMobile(context)) const DataColumn(label: Text("Data")),
                const DataColumn(label: Text("Executed")),
              ],
              rows: List.generate(
                widget.limitCount == null ? transactions.length : min(transactions.length, widget.limitCount!),
                (index) => transactionsDataRow(context, transactions[index]),
              ),
            ),
          ),
          widget.limitCount != null && transactions.length > widget.limitCount!
              ? Button('See more', () {
                  Get.offAndToNamed("/transactions");
                })
              : Container(),
        ]),
      );
    });
  }
}

DataRow transactionsDataRow(BuildContext context, WalletTransaction transaction) {
  return DataRow(
    cells: [
      DataCell(Text(transaction.id.toString())),
      if (!Responsive.isMobile(context)) DataCell(Text(ethAddressShortener(transaction.destinationAddress))),
      if (!Responsive.isMobile(context)) DataCell(Text('${balanceToUnits(BigInt.parse(transaction.value.toString())).toStringAsFixed(4)} ETH')),
      if (!Responsive.isMobile(context)) DataCell(Text(shorten(transaction.data.toString(), 2, 2))),
      DataCell(transaction.executed
          ? const Text('Yes', style: TextStyle(color: Color(Palette.ok)))
          : const Text('No', style: TextStyle(color: Color(Palette.notOk)))),
    ],
  );
}
