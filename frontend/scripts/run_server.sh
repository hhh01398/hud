#!/bin/sh
set -e

#flutter clean
#sh scripts/version.sh
flutter run -d web-server --release --web-hostname 0.0.0.0 --web-port 5000
