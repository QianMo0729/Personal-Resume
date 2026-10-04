#!/usr/bin/env bash
set -euo pipefail
umask 022
[[ "${1:-}" == --activate-reviewed-homepage ]] || { echo 'Reviewed homepage execution argument required.' >&2; exit 2; }
base=/var/www/personal-resume
previous='/var/www/personal-resume/releases/20260914T060021Z-blueprint-homepage'
release="$base/releases/20260914T061003Z-blueprint-motion500"
incoming="$base/incoming/20260914T061003Z-blueprint-motion500"
archive='/var/tmp/20260914T061003Z-blueprint-motion500.tar.gz'
next="$base/current.next-20260914T061003Z-blueprint-motion500"
[[ "$(readlink -f "$base/current")" == "$previous" ]] || { echo 'Live release changed; aborting.' >&2; exit 3; }
[[ ! -e "$release" && ! -e "$incoming" && ! -e "$next" && ! -L "$next" ]]
printf '%s  %s\n' '77ec88a63f7f2001817d878a85fecf7eee5a94d736e083ef0e79349260a6238b' "$previous/index.html" | sha256sum --check --status
printf '%s  %s\n' 'eba457e04bc9a47941f1d5419e2975acc0bb43ef1aa005b495f60afdf35ab9e2' "$archive" | sha256sum --check --status
diff -u <(cat <<'EXPECTED_MEMBERS'
MANIFEST.sha256
payload/demos/blueprint-campus/app.js
payload/demos/blueprint-campus/index.html
payload/index.html
EXPECTED_MEMBERS
) <(tar -tzf "$archive" | LC_ALL=C sort)
nginx -t
systemctl is-active --quiet nginx
systemctl is-active --quiet x-ui

mkdir "$incoming" "$release"
tar -xzf "$archive" -C "$incoming" --no-same-owner --no-same-permissions
(cd "$incoming/payload" && sha256sum --check ../MANIFEST.sha256)
cat > "$incoming/changed-paths.txt" <<'CHANGED_PATHS'
demos/blueprint-campus/app.js
demos/blueprint-campus/index.html
index.html
CHANGED_PATHS
(cd "$previous" && find . -type f -print0 | LC_ALL=C sort -z | while IFS= read -r -d '' path; do
    if ! grep -Fqx -- "${path#./}" "$incoming/changed-paths.txt"; then
        sha256sum -- "$path"
    fi
done) > "$incoming/preserved-files.sha256"
cp -a -- "$previous/." "$release/"
cp -a -- "$incoming/payload/." "$release/"
(cd "$release" && sha256sum --check "$incoming/MANIFEST.sha256" && sha256sum --check "$incoming/preserved-files.sha256")
[[ "$(readlink -f "$base/current")" == "$previous" ]] || { echo 'Concurrent release detected; not activating.' >&2; exit 4; }
ln -s "$release" "$next"
mv -Tf -- "$next" "$base/current"
printf 'previous=%s\ncurrent=%s\nurl=https://www.moorn.online/\npreserved_files=' "$previous" "$(readlink -f "$base/current")" | tee "$incoming/activation.txt"
wc -l < "$incoming/preserved-files.sha256" | tee -a "$incoming/activation.txt"
systemctl is-active nginx x-ui
# Static symlink publication needs no Nginx edits, reloads, or service restarts.
