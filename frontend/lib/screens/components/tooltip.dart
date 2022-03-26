import 'package:flutter/material.dart';

class TooltipInfo extends StatelessWidget {
  final String message;
  final IconData? iconData;

  const TooltipInfo(this.message, {Key? key, this.iconData}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      margin: const EdgeInsets.only(left: 20),
      child: Icon(iconData ?? Icons.info, color: Colors.white, size: 18),
      message: message,
    );
  }
}
