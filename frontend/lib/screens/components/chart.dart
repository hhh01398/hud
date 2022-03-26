import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/controllers/web3_controller.dart';
import 'package:humanity_unchained_dao/utils/utils.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class Chart extends StatelessWidget {
  const Chart({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GetX<Web3Controller>(builder: (controller) {
      double percentageReserve = 100.0;

      percentageReserve =
          (d(controller.tokenData.value.reserveBalance.toString()) / d(controller.tokenData.value.totalSupply.toString()) * d('100')).toDouble();
      percentageReserve = percentageReserve > 99.0
          ? 99.0
          : percentageReserve; // For aesthetic purposes, always display a small piece allocated to the circulating supply
      final double percentageCirculating = 100.0 - percentageReserve;

      return SizedBox(
        height: 180,
        child: Stack(
          children: [
            PieChart(
              PieChartData(
                sectionsSpace: 0,
                centerSpaceRadius: 20,
                startDegreeOffset: -90,
                sections: [
                  PieChartSectionData(
                    color: const Color(Palette.circulating),
                    value: percentageCirculating,
                    showTitle: false,
                    radius: 50,
                  ),
                  PieChartSectionData(
                    color: const Color(Palette.reserve),
                    value: percentageReserve,
                    showTitle: false,
                    radius: 60,
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    });
  }
}
