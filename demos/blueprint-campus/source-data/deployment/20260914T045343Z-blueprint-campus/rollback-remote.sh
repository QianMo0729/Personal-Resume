#!/usr/bin/env bash
set -euo pipefail
[[ "${1:-}" == --rollback-blueprint-release ]] || exit 2
base=/var/www/personal-resume
[[ "$(readlink -f "$base/current")" == "$base/releases/20260914T045343Z-blueprint-campus" ]] || { echo 'Unexpected current release; aborting.' >&2; exit 3; }
[[ -d '/var/www/personal-resume/releases/20260816T114515Z-stats-09' ]]
next="$base/current.rollback-20260914T045343Z-blueprint-campus"
[[ ! -e "$next" && ! -L "$next" ]]
ln -s '/var/www/personal-resume/releases/20260816T114515Z-stats-09' "$next"
mv -Tf -- "$next" "$base/current"
readlink -f "$base/current"
