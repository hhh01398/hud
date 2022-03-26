import 'package:humanity_unchained_dao/screens/components/deployment_table.dart';
import 'package:flutter/material.dart';
import 'package:humanity_unchained_dao/screens/components/dao_params.dart';

import '../../constants.dart';
import 'components/header.dart';

class ParametersScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
          padding: EdgeInsets.all(defaultPadding),
          child: Column(children: [
            const Header('Parameters'),
            const SizedBox(height: defaultPadding),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 5,
                  child: Column(children: [
                    DaoParams(),
                    const SizedBox(height: defaultPadding),
                    DeploymentTable(),
                  ]),
                )
              ],
            ),
          ])),
    );
  }
}
