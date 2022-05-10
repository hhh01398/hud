import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:humanity_unchained_dao/constants.dart';
import 'package:humanity_unchained_dao/models/poh_profile.dart';
import 'package:humanity_unchained_dao/utils/utils.dart';

class PohService {
  Future<PohProfile> getProfileData(String ethAddress) async {
    final p = PohProfile();
    p.ethAddress = ethAddress;

    if (!enableAvatars) return p;

    try {
      logging('$ethAddress: Querying PoH data API...');
      final query = json.encode({
        'id': 'IdQuery',
        'query': '''query IdQuery(
  \$id: ID!
  \$_id: [String!]
) {
  contract(id: 0) {
    submissionDuration
    ...submitProfileCard
    ...submissionDetailsCardContract
    ...submissionDetailsAccordionContract
    id
  }
  submission(id: \$id) {
    name
    status
    registered
    submissionTime
    disputed
    ...submissionDetailsCardSubmission
    ...submissionDetailsAccordionSubmission
    id
  }
  vouchers: submissions(where: {vouchees_contains: \$_id}) {
    ...submissionDetailsCardVouchers
    id
  }
}

fragment challengeButtonRequest on Request {
  disputed
  arbitrator
  arbitratorExtraData
  usedReasons
  currentReason
  metaEvidence {
    URI
    id
  }
}

fragment deadlinesContract on Contract {
  submissionDuration
  renewalTime
  challengePeriodDuration
  ...removeButtonContract
}

fragment deadlinesSubmission on Submission {
  id
  submissionTime
  request: requests(orderBy: creationTime, orderDirection: desc, first: 1) {
    lastStatusChange
    ...challengeButtonRequest
    ...removeButtonRequest
    id
  }
}

fragment removeButtonContract on Contract {
  submissionBaseDeposit
  sharedStakeMultiplier
}

fragment removeButtonRequest on Request {
  arbitrator
  arbitratorExtraData
}

fragment submissionDetailsAccordionContract on Contract {
  sharedStakeMultiplier
  winnerStakeMultiplier
  loserStakeMultiplier
}

fragment submissionDetailsAccordionSubmission on Submission {
  id
  disputed
  request: requests(orderBy: creationTime, orderDirection: desc, first: 1) {
    requester
    arbitrator
    arbitratorExtraData
    id
    evidence(orderBy: creationTime, orderDirection: desc) {
      creationTime
      id
      URI
      sender
    }
    challenges(orderBy: creationTime) {
      id
      appealPeriod
      reason
      disputeID
      challenger
      challengeID
      rounds(orderBy: creationTime, orderDirection: desc, first: 1) {
        paidFees
        hasPaid
        id
      }
      lastRoundID
    }
  }
}

fragment submissionDetailsCardContract on Contract {
  submissionBaseDeposit
  submissionDuration
  requiredNumberOfVouches
  challengePeriodDuration
  ...deadlinesContract
}

fragment submissionDetailsCardSubmission on Submission {
  id
  status
  registered
  submissionTime
  name
  disputed
  vouchees {
    id
  }
  requests(orderBy: creationTime, orderDirection: desc, first: 1) {
    arbitrator
    arbitratorExtraData
    lastStatusChange
    evidence(orderBy: creationTime, first: 1) {
      URI
      id
    }
    vouches {
      id
      submissionTime
    }
    id
  }
  latestRequest: requests(orderBy: creationTime, orderDirection: desc, first: 1) {
    challenges(orderBy: creationTime) {
      disputeID
      lastRoundID
      reason
      duplicateSubmission {
        id
      }
      rounds(orderBy: creationTime, first: 1) {
        contributions {
          values
          id
        }
        hasPaid
        id
      }
      id
    }
    id
  }
  ...deadlinesSubmission
}

fragment submissionDetailsCardVouchers on Submission {
  id
  submissionTime
  name
  requests(orderBy: creationTime, orderDirection: desc, first: 1) {
    evidence(orderBy: creationTime, first: 1) {
      URI
      id
    }
    id
  }
}

fragment submitProfileCard on Contract {
  arbitrator
  arbitratorExtraData
  submissionBaseDeposit
  registrationMetaEvidence {
    URI
    id
  }
}''',
        'variables': {
          'id': ethAddress.toLowerCase(),
          '_id': [ethAddress.toLowerCase()],
        }
      });

      var response = await http.post(Uri.parse(pohApiUrl), body: query);
      logging('$ethAddress: Received response from PoH data API. Decoding...');
      final registrationJsonURI = json.decode(response.body)['data']['submission']['request'][0]['evidence'][0]['URI'];
      var url = ipfsUrl + registrationJsonURI;
      logging('$ethAddress: Fetching 1st data file from IPFS ($url)...');
      response = await http.get(Uri.parse(url));
      logging('$ethAddress: Received 1st data file from IPFS. Decoding...');
      final fileURI = json.decode(response.body)['fileURI'];
      url = ipfsUrl + fileURI;
      logging('$ethAddress: Fetching 2nd data file from IPFS ($url)...');
      response = await http.get(Uri.parse(url));
      logging('$ethAddress: Received 2nd data file from IPFS. Decoding...');
      var d = json.decode(response.body);
      p.ethAddress = ethAddress;
      p.name = d['name'];
      p.firstName = d['firstName'];
      p.lastName = d['lastName'];
      p.photoUrl = d['photo'];
      p.videoUrl = d['video'];
      logging('PoH data for address $ethAddress retrieved!: ${p.toString()}');
    } catch (e) {
      logging('Error: Could not load PoH data for address $ethAddress: ${e.toString()}');
    }

    return p;
  }
}
