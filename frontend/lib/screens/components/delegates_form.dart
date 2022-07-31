import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/controllers/web3_controller.dart';
import 'package:humanity_unchained_dao/screens/components/delegates_table.dart';
import 'package:humanity_unchained_dao/utils/utils.dart';

class DelegatesForm extends StatefulWidget {
  DelegatesForm({
    Key? key,
  }) : super(key: key);

  @override
  _DelegatesFormState createState() => _DelegatesFormState();
}

class _DelegatesFormState extends State<DelegatesForm> {
  final _formKey = GlobalKey<FormState>();
  final addressController = TextEditingController();
  Widget searchResult = Container();
  bool searching = false;

  @override
  Widget build(BuildContext context) {
    return GetBuilder<Web3Controller>(
        init: Web3Controller(),
        builder: (web3controller) {
          if (searching) {
            searchResult = Column(children: const [SizedBox(height: defaultPadding), Text('Searching...')]);
          } else {
            searchResult = web3controller.searchedDelegates.isEmpty ? Column(children: const [SizedBox(height: defaultPadding), Text('No delegate was found with that address')]) : DelegatesTable();
          }

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
                          onPressed: () async {
                            _formKey.currentState!.validate();
                            setState(() {
                              searching = true;
                            });
                            logging('Searching delegate with address ${addressController.text} ...');
                            await web3controller.getDelegateData(addressController.text);
                            setState(() {
                              searching = false;
                            });
                          },
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
