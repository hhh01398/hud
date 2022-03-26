class PohProfile {
  String ethAddress = '', name = '', firstName = '', lastName = '', photoUrl = '', videoUrl = '';

  @override
  String toString() {
    return {
      'ethAddress': ethAddress,
      'name': name,
      'firstName': firstName,
      'lastName': lastName,
      'photoUrl': photoUrl,
      'videoUrl': videoUrl,
    }.toString();
  }
}
