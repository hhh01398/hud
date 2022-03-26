import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/screens/components/tooltip.dart';
import 'package:flutter/material.dart';

class ProfileInfoCard extends StatelessWidget {
  ProfileInfoCard({
    Key? key,
    this.tooltipText,
    required this.title,
    required this.svgSrc,
    required this.description,
    required this.button,
  }) : super(key: key);

  final Color svgSrc;
  final String title, description;
  final Widget button;
  String? tooltipText;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: defaultPadding),
      padding: const EdgeInsets.all(defaultPadding),
      decoration: BoxDecoration(
        border: Border.all(width: 2, color: primaryColor.withOpacity(0.15)),
        borderRadius: const BorderRadius.all(
          Radius.circular(defaultPadding),
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.circle,
            size: 20,
            color: svgSrc,
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: defaultPadding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Expanded(
                        child: Text(
                      title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    )),
                    tooltipText != null ? TooltipInfo(tooltipText!) : Container(),
                  ]),
                  Text(
                    description,
                    style: Theme.of(context).textTheme.caption!.copyWith(color: Colors.white70),
                  ),
                  button,
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
