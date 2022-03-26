import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/controllers/web3_controller.dart';
import 'package:humanity_unchained_dao/screens/components/tooltip.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class Referrals extends StatelessWidget {
  const Referrals({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GetBuilder<Web3Controller>(
        init: Web3Controller(),
        builder: (controller) {
          bool isReferredClaimed = controller.daoProfile.value.isReferredClaimed;

          return Container(
            padding: const EdgeInsets.all(defaultPadding),
            decoration: const BoxDecoration(
              color: secondaryColor,
              borderRadius: BorderRadius.all(Radius.circular(10)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Referrals",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Container(
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
                        color: isReferredClaimed ? const Color(Palette.ok) : const Color(Palette.notOk),
                      ),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: defaultPadding),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(children: const [
                                Expanded(
                                    child: Text(
                                  "Tokens claimed",
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                )),
                                TooltipInfo("Earn free tokens by entering the address of your referrer.")
                              ]),
                              Text(
                                isReferredClaimed ? "You already got your tokens" : "You have not yet claimed your tokens",
                                style: Theme.of(context).textTheme.caption!.copyWith(color: Colors.white70),
                              ),
                              isReferredClaimed ? Container() : MyCustomFormState(web3controller: controller),
                            ],
                          ),
                        ),
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

class MyCustomFormState extends StatelessWidget {
  final _formKey = GlobalKey<FormState>();
  final Web3Controller web3controller;
  final addressController = TextEditingController();

  MyCustomFormState({
    Key? key,
    required this.web3controller,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextFormField(
            controller: addressController,
            decoration: const InputDecoration(hintText: 'Enter your referrer address'),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter a valid address';
              }
              return null;
            },
          ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16.0),
            child: ElevatedButton(
              onPressed: () async {
                if (_formKey.currentState!.validate()) {
                  await web3controller.claimReferralReward(addressController.value.text);
                }
              },
              child: const Text('Claim'),
            ),
          ),
        ],
      ),
    );
  }
}
