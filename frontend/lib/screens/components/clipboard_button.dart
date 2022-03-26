import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

class ClipboardButton extends StatelessWidget {
  final String content;

  const ClipboardButton(this.content, {Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FlatButton(
      mouseCursor: MaterialStateMouseCursor.clickable,
      onPressed: () {
        Clipboard.setData(ClipboardData(text: content));
        Get.snackbar('Copied', 'Copied "$content" to the clipboard succesfully');
      },
      child: Tooltip(
        child: const Icon(Icons.copy, color: Colors.white),
        message: content,
      ),
    );
  }
}
