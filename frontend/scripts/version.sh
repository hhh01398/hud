#!/bin/sh
set -e

grep "version: " pubspec.yaml | awk -F" " '{print $2}' > assets/config/version.txt
