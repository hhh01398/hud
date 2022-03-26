import 'package:flutter/material.dart';
import 'package:humanity_unchained_dao/screens/components/delegates_form.dart';
import 'package:humanity_unchained_dao/screens/components/seats_table.dart';
// import 'package:humanity_unchained_dao/screens/components/delegates_table.dart.disabled';

import '../../constants.dart';
import 'components/header.dart';

class DelegatesScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: EdgeInsets.all(defaultPadding),
        child: Column(
          children: [
            const Header('Delegates'),
            const SizedBox(height: defaultPadding),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 5,
                  child: Column(
                    children: [
                      SeatsTable(),
                      const SizedBox(height: defaultPadding),
                      DelegatesForm(),
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
