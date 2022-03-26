import 'package:flutter/material.dart';

import '../../constants.dart';
import 'components/header.dart';
import 'components/transactions_table.dart';

class TransactionsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: EdgeInsets.all(defaultPadding),
        child: Column(
          children: [
            const Header('Transactions'),
            const SizedBox(height: defaultPadding),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 5,
                  child: Column(
                    children: [
                      TransactionsTable(),
                    ],
                  ),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}
