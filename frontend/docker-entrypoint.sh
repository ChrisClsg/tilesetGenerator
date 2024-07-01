#!/usr/bin/env bash
set -Eeuo pipefail

echo "=> Installing dependencies…"
npm install
echo "=> Done."

echo "=> Running application…"
exec npm run dev
