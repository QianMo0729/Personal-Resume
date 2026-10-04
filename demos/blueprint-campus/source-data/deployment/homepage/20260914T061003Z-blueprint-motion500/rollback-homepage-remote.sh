#!/usr/bin/env bash
set -euo pipefail
[[ "${1:-}" == --rollback-homepage-release ]] || exit 2
base=/var/www/personal-resume
[[ "$(readlink -f "$base/current")" == "$base/releases/20260914T061003Z-blueprint-motion500" ]] || { echo 'Unexpected current release; aborting.' >&2; exit 3; }
[[ -d '/var/www/personal-resume/releases/20260914T060021Z-blueprint-homepage' ]]
next="$base/current.rollback-20260914T061003Z-blueprint-motion500"
[[ ! -e "$next" && ! -L "$next" ]]
ln -s '/var/www/personal-resume/releases/20260914T060021Z-blueprint-homepage' "$next"
mv -Tf -- "$next" "$base/current"
readlink -f "$base/current"
