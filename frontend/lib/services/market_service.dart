class MarketService {
  static const exhangeAuthority = 'api.1inch.exchange';
  static const exchangeUnencodedPath = 'v4.0/137/quote';
  static const exhangeAppUrl = 'https://app.1inch.io';

  static Uri getApiUri(Map<String, String?> queryParameters) {
    return Uri.https(exhangeAuthority, exchangeUnencodedPath, queryParameters);
  }

  static String getAppUrl(int chainId, String ccy1, String ccy2) {
    return exhangeAppUrl + '#/' + chainId.toString() + '/swap/' + ccy1 + '/' + ccy2;
  }
}
