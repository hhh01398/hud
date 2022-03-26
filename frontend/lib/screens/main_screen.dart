import 'package:humanity_unchained_dao/controllers/menu_controller.dart';
import 'package:humanity_unchained_dao/controllers/web3_controller.dart';
import 'package:humanity_unchained_dao/responsive.dart';
import 'package:humanity_unchained_dao/screens/components/loader_overlay.dart';
import 'package:flutter/material.dart';
import 'package:flutter_web3/flutter_web3.dart';
import 'package:get/get.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import 'components/side_menu.dart';

class MainScreen extends StatefulWidget {
  final Widget child;

  const MainScreen({
    Key? key,
    required this.child,
  }) : super(key: key);

  @override
  _MainScreenState createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance!.addPostFrameCallback((_) {
      if (!Ethereum.isSupported) {
        Get.defaultDialog(
          title: "Error",
          textConfirm: "Download MetaMask",
          textCancel: "Close",
          onCancel: () {},
          onConfirm: () => launch('https://www.metamask.io/'),
          middleText: "Your browser does not support Dapps. You need to install a Web3 wallet (for example: Metamask)",
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final mainWidget = Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (Responsive.isDesktop(context))
          const Expanded(
            child: SideMenu(),
          ),
        Expanded(
          flex: 5,
          child: widget.child,
        ),
      ],
    );

    // print('controller.loading.value = ${controller!.loading.value}');

    return GetBuilder<Web3Controller>(
        init: Web3Controller(),
        builder: (h) => Scaffold(
              key: context.read<MenuController>().scaffoldKey,
              drawer: SideMenu(),
              body: SafeArea(
                  child: GetBuilder<Web3Controller>(
                      init: Web3Controller(),
                      builder: (controller) {
                        return controller.loading.value ? LoaderOverlay(0.1, mainWidget) : mainWidget;
                      })),
            ));
  }
}
