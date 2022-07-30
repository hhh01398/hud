import 'package:humanity_unchained_dao/constants.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

class SideMenu extends StatelessWidget {
  const SideMenu({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    const spacingFactor = 0.2;

    return Drawer(
      child: ListView(
        children: [
          DrawerHeader(
              child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 10),
              Image.asset("assets/images/logo.png"),
              const SizedBox(height: 3),
              const Text(appNameLogo, textAlign: TextAlign.center),
            ],
          )),
          DrawerListTile(
            title: "Dashboard",
            svgSrc: Icons.dashboard,
            press: () {
              Get.offAndToNamed("/");
            },
          ),
          DrawerListTile(
            title: "Delegates",
            svgSrc: Icons.group,
            press: () {
              Get.offAndToNamed("/delegates");
            },
          ),
          DrawerListTile(
            title: "Tallies",
            svgSrc: Icons.poll,
            press: () {
              Get.offAndToNamed("/tallies");
            },
          ),
          DrawerListTile(
            title: "Proposals",
            svgSrc: Icons.psychology,
            press: () {
              Get.offAndToNamed("/proposals");
            },
          ),
          DrawerListTile(
            title: "Economy",
            svgSrc: Icons.bar_chart_rounded,
            press: () {
              Get.offAndToNamed("/economy");
            },
          ),
          DrawerListTile(
            title: "Parameters",
            svgSrc: Icons.settings,
            press: () {
              Get.offAndToNamed("/parameters");
            },
          ),
          DrawerListTile(
            title: "Profile",
            svgSrc: Icons.person,
            press: () {
              Get.offAndToNamed("/profile");
            },
          ),
          const SizedBox(height: 2 * defaultPadding),
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            IconButton(
              onPressed: () => launch(SocialMediaUrl.discourse),
              icon: const Icon(FontAwesomeIcons.discourse, color: tertiaryColor, size: socialMediaLogoSize),
            ),
            IconButton(
              onPressed: () => launch(SocialMediaUrl.telegram),
              icon: const Icon(FontAwesomeIcons.telegramPlane, color: tertiaryColor, size: socialMediaLogoSize),
            ),
            const SizedBox(width: defaultPadding * spacingFactor),
            IconButton(
              onPressed: () => launch(SocialMediaUrl.github),
              icon: const Icon(FontAwesomeIcons.github, color: tertiaryColor, size: socialMediaLogoSize),
            ),
            const SizedBox(width: defaultPadding * spacingFactor),
            IconButton(
              onPressed: () => launch(SocialMediaUrl.twitter),
              icon: const Icon(FontAwesomeIcons.twitter, color: tertiaryColor, size: socialMediaLogoSize),
            ),
            const SizedBox(width: defaultPadding * spacingFactor),
            IconButton(
              onPressed: () => launch(SocialMediaUrl.youtube),
              icon: const Icon(FontAwesomeIcons.youtube, color: tertiaryColor, size: socialMediaLogoSize),
            ),
          ]),
        ],
      ),
    );
  }
}

class DrawerListTile extends StatelessWidget {
  const DrawerListTile({
    Key? key,
    required this.title,
    required this.svgSrc,
    required this.press,
  }) : super(key: key);

  final String title;
  final IconData svgSrc;
  final VoidCallback press;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: press,
      horizontalTitleGap: defaultPadding,
      leading: Icon(
        svgSrc,
        color: Colors.white54,
        size: 32,
      ),
      title: Text(
        title,
        style: const TextStyle(color: Colors.white54),
      ),
    );
  }
}
