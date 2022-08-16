#!/bin/sh
set -e

rm -rf build
flutter clean
flutter build web

sh scripts/assets_path.sh
sh scripts/version.sh
cp -r assets/config/ build/web/assets/
