import 'package:flutter/material.dart';
import 'package:humanity_unchained_dao/screens/components/profile_details.dart';

import '../../constants.dart';
import 'components/header.dart';

class ProfileScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
          padding: EdgeInsets.all(defaultPadding),
          child: Column(children: [
            const Header('Profile'),
            const SizedBox(height: defaultPadding),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 5,
                  child: Column(children: [ProfileDetails()]),
                )
              ],
            ),
          ])),
    );
  }
}
