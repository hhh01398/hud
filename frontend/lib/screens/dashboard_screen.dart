import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/responsive.dart';
import 'package:humanity_unchained_dao/screens/components/dao_params.dart';
import 'package:humanity_unchained_dao/screens/components/delegates_form.dart';
import 'package:humanity_unchained_dao/screens/components/deployment_table.dart';
import 'package:humanity_unchained_dao/screens/components/header.dart';
import 'package:humanity_unchained_dao/screens/components/profile_details.dart';
import 'package:humanity_unchained_dao/screens/components/referrals.dart';
import 'package:humanity_unchained_dao/screens/components/seats_table.dart';
import 'package:humanity_unchained_dao/screens/components/tallies_table.dart';
import 'package:humanity_unchained_dao/screens/components/transactions_table.dart';
import 'package:flutter/material.dart';

import 'components/token_details.dart';

class DashboardScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(defaultPadding),
        child: Column(
          children: [
            const Header('Dashboard'),
            const SizedBox(height: defaultPadding),
            if (Responsive.isMobile(context))
              Column(children: [
                TalliesTable(limitCount: 10),
                const SizedBox(height: defaultPadding),
                SeatsTable(),
                const SizedBox(height: defaultPadding),
                const TokenDetails(),
                const SizedBox(height: defaultPadding),
                const DaoParams(),
                const SizedBox(height: defaultPadding),
                const Referrals(),
                const SizedBox(height: defaultPadding),
                TransactionsTable(limitCount: 10),
                const SizedBox(height: defaultPadding),
                DelegatesForm(),
                const SizedBox(height: defaultPadding),
                const ProfileDetails(),
                const SizedBox(height: defaultPadding),
                DeploymentTable(),
              ])
            else
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    flex: 5,
                    child: Column(
                      children: [
                        TalliesTable(limitCount: 10),
                        const SizedBox(height: defaultPadding),
                        TransactionsTable(limitCount: 10),
                        const SizedBox(height: defaultPadding),
                        SeatsTable(),
                        const SizedBox(height: defaultPadding),
                        DelegatesForm(),
                        const SizedBox(height: defaultPadding),
                        DeploymentTable(),
                      ],
                    ),
                  ),
                  const SizedBox(width: defaultPadding),
                  Expanded(
                    flex: 2,
                    child: Column(children: const [
                      TokenDetails(),
                      SizedBox(height: defaultPadding),
                      ProfileDetails(),
                      SizedBox(height: defaultPadding),
                      Referrals(),
                      SizedBox(height: defaultPadding),
                      DaoParams()
                    ]),
                  ),
                ],
              )
          ],
        ),
      ),
    );
  }
}
