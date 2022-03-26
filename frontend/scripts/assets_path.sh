#!/bin/sh
set -e

sed -i 's#assets/#assets/assets/#' build/web/index.html
