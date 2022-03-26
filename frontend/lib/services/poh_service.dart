import 'package:humanity_unchained_dao/models/poh_profile.dart';

class PohService {
  Future<PohProfile> getProfileData(String ethAddress) async {
    // TODO: fetch PoH's profile data (photo, nickname)
    PohProfile p = PohProfile();
    p.ethAddress = ethAddress;
    return p;
  }
}
