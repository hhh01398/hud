import 'package:humanity_unchained_dao/constants.dart';
import 'package:flutter/material.dart';

class LoaderOverlay extends StatelessWidget {
  final double opacity;
  final Widget child;

  const LoaderOverlay(this.opacity, this.child, {Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: <Widget>[
        const Center(
          child: Text(
            'Loading...',
            style: TextStyle(
              color: tertiaryColor,
              fontSize: 24,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Opacity(opacity: opacity, child: child),
      ],
    );
  }
}
