import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/controllers/menu_controller.dart';
import 'package:humanity_unchained_dao/screens/dashboard_screen.dart';
import 'package:humanity_unchained_dao/screens/delegates_screen.dart';
import 'package:humanity_unchained_dao/screens/economy_screen.dart';
import 'package:humanity_unchained_dao/screens/main_screen.dart';
import 'package:humanity_unchained_dao/screens/parameters_screen.dart';
import 'package:humanity_unchained_dao/screens/profile_screen.dart';
import 'package:humanity_unchained_dao/screens/tallies_screen.dart';
import 'package:humanity_unchained_dao/screens/transactions_screen.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized;
  runApp(App());
}

class App extends StatelessWidget {
  const App({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      initialRoute: '/',
      getPages: [
        GetPage(
          name: '/',
          page: () {
            return MultiProvider(providers: [
              ChangeNotifierProvider(
                create: (context) => MenuController(),
              ),
            ], child: MainScreen(child: DashboardScreen()));
          },
        ),
        GetPage(
          name: '/delegates',
          page: () {
            return MultiProvider(providers: [
              ChangeNotifierProvider(
                create: (context) => MenuController(),
              ),
            ], child: MainScreen(child: DelegatesScreen()));
          },
        ),
        GetPage(
          name: '/tallies',
          page: () {
            return MultiProvider(providers: [
              ChangeNotifierProvider(
                create: (context) => MenuController(),
              ),
            ], child: MainScreen(child: TalliesScreen()));
          },
        ),
        GetPage(
          name: '/proposals',
          page: () {
            return MultiProvider(providers: [
              ChangeNotifierProvider(
                create: (context) => MenuController(),
              ),
            ], child: MainScreen(child: TransactionsScreen()));
          },
        ),
        GetPage(
          name: '/economy',
          page: () {
            return MultiProvider(providers: [
              ChangeNotifierProvider(
                create: (context) => MenuController(),
              ),
            ], child: MainScreen(child: EconomyScreen()));
          },
        ),
        GetPage(
          name: '/parameters',
          page: () {
            return MultiProvider(providers: [
              ChangeNotifierProvider(
                create: (context) => MenuController(),
              ),
            ], child: MainScreen(child: ParametersScreen()));
          },
        ),
        GetPage(
          name: '/profile',
          page: () {
            return MultiProvider(providers: [
              ChangeNotifierProvider(
                create: (context) => MenuController(),
              ),
            ], child: MainScreen(child: ProfileScreen()));
          },
        ),
      ],
      debugShowCheckedModeBanner: false,
      title: appName,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: bgColor,
        textTheme: GoogleFonts.poppinsTextTheme(Theme.of(context).textTheme).apply(bodyColor: Colors.white),
        canvasColor: secondaryColor,
      ),
      home: MultiProvider(
        providers: [
          ChangeNotifierProvider(
            create: (context) => MenuController(),
          ),
        ],
        child: MainScreen(child: DashboardScreen()),
      ),
    );
  }
}
