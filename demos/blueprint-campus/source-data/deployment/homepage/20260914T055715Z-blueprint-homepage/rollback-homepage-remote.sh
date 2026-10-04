#!/usr/bin/env bash
set -euo pipefail
[[ "${1:-}" == --rollback-homepage-release ]] || exit 2
base=/var/www/personal-resume
[[ "$(readlink -f "$base/current")" == "$base/releases/20260914T055715Z-blueprint-homepage" ]] || { echo 'Unexpected current release; aborting.' >&2; exit 3; }
[[ -d '/var/www/personal-resume/releases/20260914T045343Z-blueprint-campus' ]]
next="$base/current.rollback-20260914T055715Z-blueprint-homepage"
[[ ! -e "$next" && ! -L "$next" ]]
ln -s '/var/www/personal-resume/releases/20260914T045343Z-blueprint-campus' "$next"
mv -Tf -- "$next" "$base/current"
readlink -f "$base/current"
