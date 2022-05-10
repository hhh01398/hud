import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:humanity_unchained_dao/constants.dart';
import 'package:url_launcher/url_launcher.dart';

class OpenBrowser extends StatelessWidget {
  final String url;
  final IconData? iconData;

  const OpenBrowser(this.url, {Key? key, this.iconData}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: () => launch(url),
      icon: Icon(iconData ?? FontAwesomeIcons.externalLinkSquareAlt, color: tertiaryColor, size: 15),
    );
  }
}
