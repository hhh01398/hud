import 'dart:convert';

import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/utils/utils.dart';
import 'package:flutter/services.dart' show rootBundle;

class Config {
  dynamic data;
  String? versionNumber;

  Future load() async {
    logging('Loading configuration...');

    versionNumber = (await rootBundle.loadString('config/version.txt')).trim();
    dynamic d = {};

    for (int chainId in supportedChains.keys) {
      String chainName = supportedChains[chainId]!;
      logging('Loading chain data: $chainName ($chainId) ...');

      try {
        var contractAddresses = json.decode(await rootBundle.loadString('config/contracts/$chainName/config.json'));
        var contracts = {};

        for (final id in contractNames.keys) {
          contracts[id] = {
            'address': contractAddresses['contractAddresses'][id],
            'abi': json.encode(json.decode(await rootBundle.loadString('config/contracts/$chainName/${contractNames[id]}.json'))['abi']),
          };
        }

        d['$chainId'] = {'name': chainName, 'contracts': contracts};
      } catch (e) {
        logging('Error: $e');
      }
    }
    data = json.decode(json.encode(d));

    logging('Configuration loaded!');
  }
}
