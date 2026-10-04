#!/usr/bin/env bash
set -euo pipefail
umask 022
[[ "${1:-}" == --activate-reviewed-homepage ]] || { echo 'Reviewed homepage execution argument required.' >&2; exit 2; }
base=/var/www/personal-resume
previous='/var/www/personal-resume/releases/20260914T045343Z-blueprint-campus'
release="$base/releases/20260914T060021Z-blueprint-homepage"
incoming="$base/incoming/20260914T060021Z-blueprint-homepage"
archive='/var/tmp/20260914T060021Z-blueprint-homepage.tar.gz'
next="$base/current.next-20260914T060021Z-blueprint-homepage"
[[ "$(readlink -f "$base/current")" == "$previous" ]] || { echo 'Live release changed; aborting.' >&2; exit 3; }
[[ ! -e "$release" && ! -e "$incoming" && ! -e "$next" && ! -L "$next" ]]
printf '%s  %s\n' 'afb711da51a7203cf126733a9e451cebae74b5b1ce731ef15948818769c0797b' "$previous/index.html" | sha256sum --check --status
printf '%s  %s\n' '88fc67d827213ec752f6d03425914c70c00615a0014ec293fd99755869351e0e' "$archive" | sha256sum --check --status
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
