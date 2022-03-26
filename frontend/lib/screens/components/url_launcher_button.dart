import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class UrlLauncherButton extends StatelessWidget {
  final String url;

  const UrlLauncherButton(this.url, {Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
        width: 30,
        child: FlatButton(
          mouseCursor: MaterialStateMouseCursor.clickable,
          onPressed: () => launch(url),
          child: Tooltip(child: const Icon(Icons.open_in_new, color: Colors.white), message: url),
        ));
  }
}
