import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/controllers/web3_controller.dart';
import 'package:humanity_unchained_dao/screens/components/clipboard_button.dart';
import 'package:humanity_unchained_dao/screens/components/rounded_container.dart';
import 'package:humanity_unchained_dao/utils/utils.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class DeploymentTable extends StatefulWidget {
  int? limitCount;

  DeploymentTable({this.limitCount, Key? key}) : super(key: key);

  @override
  _DeploymentTableState createState() => _DeploymentTableState();
}

class _DeploymentTableState extends State<DeploymentTable> {
  @override
  Widget build(BuildContext context) {
    return GetBuilder<Web3Controller>(
        init: Web3Controller(),
        builder: (controller) {
          final uiVersionNumber = controller.config!.versionNumber;
          return Container(
              padding: const EdgeInsets.all(defaultPadding),
              decoration: const BoxDecoration(
                color: secondaryColor,
                borderRadius: BorderRadius.all(Radius.circular(10)),
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(
                  "Deployment",
                  style: Theme.of(context).textTheme.subtitle1,
                ),
                const SizedBox(height: defaultPadding),
                RoundedContainer(child: Text("UI Version: ${uiVersionNumber ?? ''}")),
                const SizedBox(height: defaultPadding),
                RoundedContainer(
                    child: Column(
                  children: [
                    SizedBox(
                        width: double.infinity,
                        child: DataTable(
                          columns: const [
                            DataColumn(label: Text("Contract")),
                            DataColumn(label: Text("Address")),
                          ],
                          rows: List.generate(contractNames.keys.length, (i) {
                            final id = contractNames.keys.toList()[i];
                            final name = contractNames[id]!;
                            var address = 'n/a';
                            try {
                              address = controller.getContractConfig(id)['address'];
                            } catch (e) {}
                            return DataRow(cells: [
                              DataCell(Text(name)),
                              DataCell(Row(children: [
                                ClipboardButton(address),
                                Text(ethAddressShortener(address)),
                              ])),
                            ]);
                          }),
                        )),
                  ],
                )),
              ]));
        });
  }
}
