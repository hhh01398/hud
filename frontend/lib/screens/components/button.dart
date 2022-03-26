import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/responsive.dart';
import 'package:flutter/material.dart';

class Button extends StatelessWidget {
  final String label;
  final Function? onPressed;
  IconData? iconData;
  Size? size;

  Button(this.label, this.onPressed, {Key? key, this.iconData, this.size}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (Responsive.isMobile(context)) {
      return Padding(
          padding: const EdgeInsets.all(defaultPadding / 4),
          child: Container(
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: onPressed == null ? Colors.grey.shade700 : Colors.lightBlue,
                borderRadius: const BorderRadius.all(
                  Radius.circular(defaultPadding),
                ),
              ),
              child: Center(
                  child: IconButton(
                color: Colors.lightBlue,
                icon: iconData != null || label != ''
                    ? Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                        if (iconData != null) Icon(iconData, color: onPressed != null ? Colors.white : Colors.grey),
                        if (label != '') Text(label, style: TextStyle(color: onPressed != null ? Colors.white : Colors.grey))
                      ])
                    : Container(),
                onPressed: onPressed != null ? () => onPressed!() : null,
              ))));
    }

    return ElevatedButton.icon(
      style: TextButton.styleFrom(
        fixedSize: size,
        padding: EdgeInsets.symmetric(
          horizontal: defaultPadding * (Responsive.isMobile(context) ? 0 : 1.5),
          vertical: defaultPadding / (Responsive.isMobile(context) ? 2 : 1),
        ),
      ),
      onPressed: onPressed != null ? () => onPressed!() : null,
      icon: iconData != null ? Icon(iconData) : Container(),
      label: Responsive.isMobile(context) ? Container() : Text(label),
    );
  }
}
