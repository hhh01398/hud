import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/controllers/web3_controller.dart';
import 'package:humanity_unchained_dao/screens/components/delegates_table.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class DelegatesForm extends StatelessWidget {
  final _formKey = GlobalKey<FormState>();
  final addressController = TextEditingController();
  Widget searchResult = Container();

  DelegatesForm({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GetBuilder<Web3Controller>(
        init: Web3Controller(),
        builder: (web3controller) {
          searchResult = web3controller.searchedDelegates.isEmpty
              ? Column(children: const [SizedBox(height: defaultPadding), Text('No delegate was found with that address')])
              : DelegatesTable();

          return Container(
              padding: const EdgeInsets.all(defaultPadding),
              decoration: const BoxDecoration(
                color: secondaryColor,
                borderRadius: BorderRadius.all(Radius.circular(10)),
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(
                  "Delegate Search",
                  style: Theme.of(context).textTheme.subtitle1,
                ),
                Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextFormField(
                        controller: addressController,
                        decoration: const InputDecoration(hintText: 'Enter delegate address'),
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
                          onPressed: () => _formKey.currentState!.validate(),
                          child: const Text('Search'),
                        ),
                      ),
                      searchResult,
                    ],
                  ),
                )
              ]));
        });
  }
}
