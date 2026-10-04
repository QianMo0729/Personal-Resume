#!/usr/bin/env bash
set -euo pipefail
umask 022
[[ "${1:-}" == --activate-reviewed-release ]] || { echo 'Explicit reviewed-release argument required.' >&2; exit 2; }
base=/var/www/personal-resume
expected_previous='/var/www/personal-resume/releases/20260816T114515Z-stats-09'
release="$base/releases/20260914T045343Z-blueprint-campus"
incoming="$base/incoming/20260914T045343Z-blueprint-campus"
archive='/var/tmp/20260914T045343Z-blueprint-campus.tar.gz'
current="$base/current"
next="$base/current.next-20260914T045343Z-blueprint-campus"

# Every check above the mkdir is read-only. Never change an unexpected live release.
[[ "$(readlink -f "$current")" == "$expected_previous" ]] || { echo 'Current release changed; aborting.' >&2; exit 3; }
[[ -d "$expected_previous" && ! -e "$release" && ! -e "$incoming" && ! -e "$next" && ! -L "$next" ]]
[[ ! -e "$expected_previous/demos/blueprint-campus" ]]
printf '%s  %s\n' '41114f6c1e823405986b92a9aff5c3140b3d0031076030aaf47cb422e71c66c8' "$archive" | sha256sum --check --status
diff -u <(cat <<'EXPECTED_MEMBERS'
MANIFEST.sha256
payload/app.js
payload/assets/campus-data.json
payload/assets/campus-plan.svg
payload/assets/source-data/README.md
payload/assets/sustech-logo.png
payload/entrance-anchor.js
payload/entrance-scene.js
payload/index.html
payload/interior-scene.js
payload/styles.css
payload/vendor/THREE-LICENSE.txt
payload/vendor/three.core.js
payload/vendor/three.module.js
EXPECTED_MEMBERS
) <(tar -tzf "$archive" | LC_ALL=C sort)
nginx -t
systemctl is-active --quiet nginx
systemctl is-active --quiet x-ui

mkdir -p "$base/incoming"
mkdir "$incoming" "$release"
tar -xzf "$archive" -C "$incoming" --no-same-owner --no-same-permissions
(cd "$incoming/payload" && sha256sum --check ../MANIFEST.sha256)
cp -a -- "$expected_previous/." "$release/"
mkdir -p "$release/demos"
cp -a -- "$incoming/payload" "$release/demos/blueprint-campus"
(cd "$release/demos/blueprint-campus" && sha256sum --check "$incoming/MANIFEST.sha256")

# Preserve all existing regular site files byte-for-byte. Audit files stay outside web roots.
(cd "$expected_previous" && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum) > "$incoming/previous-site.sha256"
(cd "$release" && sha256sum --check "$incoming/previous-site.sha256")
[[ "$(readlink -f "$current")" == "$expected_previous" ]] || { echo 'Concurrent release detected; not activating.' >&2; exit 4; }
ln -s "$release" "$next"
mv -Tf -- "$next" "$current"
printf 'previous=%s\ncurrent=%s\nurl=%s\n' "$expected_previous" "$(readlink -f "$current")" 'https://www.moorn.online/demos/blueprint-campus/' | tee "$incoming/activation.txt"
systemctl is-active nginx x-ui
# No Nginx configuration edits, reloads, or other service changes are needed.
