import 'package:flutter/material.dart';
import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/models/poh_profile.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

class Avatar extends StatelessWidget {
  final PohProfile profile;
  final double size;

  const Avatar(
    this.profile,
    this.size, {
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return profile.photoUrl.isNotEmpty && profile.photoUrl != ''
        ? FlatButton(
            mouseCursor: MaterialStateMouseCursor.clickable,
            onPressed: () => launch(urlPohProfile + profile.ethAddress),
            child: CircleAvatar(radius: size, backgroundImage: NetworkImage(ipfsServerAddress + profile.photoUrl)))
        // : Icon(FontAwesomeIcons.user, color: tertiaryColor, size: size);

        : IconButton(
            onPressed: () => launch(urlPohProfile + profile.ethAddress), icon: Icon(FontAwesomeIcons.user, color: tertiaryColor, size: size));
  }
}
