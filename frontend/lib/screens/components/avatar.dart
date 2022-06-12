import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/models/poh_profile.dart';
import 'package:url_launcher/url_launcher.dart';

class Avatar extends StatelessWidget {
  final PohProfile profile;
  final double size;
  String? url;

  Avatar(
    this.profile,
    this.size, {
    this.url,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    ImageProvider? pic;

    if (profile.photoUrl.isNotEmpty && profile.photoUrl != '') {
      pic = NetworkImage(ipfsUrl + profile.photoUrl);
    } else if (profile.ethAddress.toLowerCase() == creatorEthAddress.toLowerCase()) {
      pic = NetworkImage(creatorAvatarUrl);
    }

    if (pic != null) {
      return FlatButton(
        mouseCursor: MaterialStateMouseCursor.clickable,
        onPressed: () => url != null ? launch(url!) : null,
        child: CircleAvatar(
          radius: size,
          backgroundImage: pic,
        ),
      );
    }

    return IconButton(
      onPressed: () => url != null ? launch(url!) : null,
      icon: Icon(FontAwesomeIcons.user, color: tertiaryColor, size: size),
    );
  }
}
