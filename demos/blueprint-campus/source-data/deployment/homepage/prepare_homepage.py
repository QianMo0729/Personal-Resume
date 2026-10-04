"""Build a reviewed homepage/content patch without performing remote actions."""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import tarfile
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
DEMO_PREFIX = "demos/blueprint-campus/"
ASSET_BASE_RELEASE = "20260914T045343Z-blueprint-campus"
REQUIRED = ["index.html", DEMO_PREFIX + "index.html", DEMO_PREFIX + "app.js"]
OPTIONAL = ["entrance-scene.js", "interior-scene.js", "styles.css"]


def digest(body):
    return hashlib.sha256(body).hexdigest()


class Bases(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []

    def handle_starttag(self, tag, attrs):
        if tag == "base":
            self.hrefs.append(dict(attrs).get("href"))


def scripts(release_id, archive_name, archive_hash, names, previous, previous_root_hash):
    expected_members = "\n".join(sorted(["MANIFEST.sha256"] + ["payload/" + name for name in names]))
    changed_paths = "\n".join(sorted(names))
    deploy = f"""#!/usr/bin/env bash
set -euo pipefail
umask 022
[[ "${{1:-}}" == --activate-reviewed-homepage ]] || {{ echo 'Reviewed homepage execution argument required.' >&2; exit 2; }}
base=/var/www/personal-resume
previous='{previous}'
release="$base/releases/{release_id}"
incoming="$base/incoming/{release_id}"
archive='/var/tmp/{archive_name}'
next="$base/current.next-{release_id}"
[[ "$(readlink -f "$base/current")" == "$previous" ]] || {{ echo 'Live release changed; aborting.' >&2; exit 3; }}
[[ ! -e "$release" && ! -e "$incoming" && ! -e "$next" && ! -L "$next" ]]
printf '%s  %s\\n' '{previous_root_hash}' "$previous/index.html" | sha256sum --check --status
printf '%s  %s\\n' '{archive_hash}' "$archive" | sha256sum --check --status
diff -u <(cat <<'EXPECTED_MEMBERS'
{expected_members}
EXPECTED_MEMBERS
) <(tar -tzf "$archive" | LC_ALL=C sort)
nginx -t
systemctl is-active --quiet nginx
systemctl is-active --quiet x-ui

mkdir "$incoming" "$release"
tar -xzf "$archive" -C "$incoming" --no-same-owner --no-same-permissions
(cd "$incoming/payload" && sha256sum --check ../MANIFEST.sha256)
cat > "$incoming/changed-paths.txt" <<'CHANGED_PATHS'
{changed_paths}
CHANGED_PATHS
(cd "$previous" && find . -type f -print0 | LC_ALL=C sort -z | while IFS= read -r -d '' path; do
    if ! grep -Fqx -- "${{path#./}}" "$incoming/changed-paths.txt"; then
        sha256sum -- "$path"
    fi
done) > "$incoming/preserved-files.sha256"
cp -a -- "$previous/." "$release/"
cp -a -- "$incoming/payload/." "$release/"
(cd "$release" && sha256sum --check "$incoming/MANIFEST.sha256" && sha256sum --check "$incoming/preserved-files.sha256")
[[ "$(readlink -f "$base/current")" == "$previous" ]] || {{ echo 'Concurrent release detected; not activating.' >&2; exit 4; }}
ln -s "$release" "$next"
mv -Tf -- "$next" "$base/current"
printf 'previous=%s\\ncurrent=%s\\nurl=https://www.moorn.online/\\npreserved_files=' "$previous" "$(readlink -f "$base/current")" | tee "$incoming/activation.txt"
wc -l < "$incoming/preserved-files.sha256" | tee -a "$incoming/activation.txt"
systemctl is-active nginx x-ui
# Static symlink publication needs no Nginx edits, reloads, or service restarts.
"""
    rollback = f"""#!/usr/bin/env bash
set -euo pipefail
[[ "${{1:-}}" == --rollback-homepage-release ]] || exit 2
base=/var/www/personal-resume
[[ "$(readlink -f "$base/current")" == "$base/releases/{release_id}" ]] || {{ echo 'Unexpected current release; aborting.' >&2; exit 3; }}
[[ -d '{previous}' ]]
next="$base/current.rollback-{release_id}"
[[ ! -e "$next" && ! -L "$next" ]]
ln -s '{previous}' "$next"
mv -Tf -- "$next" "$base/current"
readlink -f "$base/current"
"""
    return deploy, rollback


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--include-demo-file", action="append", default=[], choices=OPTIONAL)
    parser.add_argument("--release-id")
    parser.add_argument("--release-label", default="blueprint-homepage")
    parser.add_argument("--baseline-state", type=Path, default=HERE / "current-server-state.json")
    args = parser.parse_args()
    state = json.loads(args.baseline_state.read_text(encoding="utf-8"))
    previous, previous_root_hash = state["current_release"], state["root_sha256"]
    if not re.fullmatch(r"/var/www/personal-resume/releases/[A-Za-z0-9-]+", previous):
        raise ValueError("Invalid server-state release path")
    if not re.fullmatch(r"[0-9a-f]{64}", previous_root_hash):
        raise ValueError("Invalid server-state homepage hash")
    release_id = args.release_id or datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + "-" + args.release_label
    if not re.fullmatch(r"[A-Za-z0-9-]+", release_id):
        raise ValueError("Unsafe release identifier")
    names = sorted(set(REQUIRED + [DEMO_PREFIX + name for name in args.include_demo_file]))
    before = {name: ((ROOT / name).stat().st_mtime_ns, (ROOT / name).stat().st_size) for name in names}
    contents = {name: (ROOT / name).read_bytes() for name in names}
    after = {name: ((ROOT / name).stat().st_mtime_ns, (ROOT / name).stat().st_size) for name in names}
    if before != after:
        raise RuntimeError("Files changed during preparation; wait for final QA and run again")
    page = contents["index.html"].decode("utf-8")
    bases = Bases()
    bases.feed(page)
    if bases.hrefs != ["/demos/blueprint-campus/"]:
        raise ValueError("Root homepage must have exactly one base href=/demos/blueprint-campus/")
    if "blueprintDemo" not in (ROOT / (DEMO_PREFIX + "app.js")).read_text(encoding="utf-8"):
        raise ValueError("Expected blueprint runtime missing")
    baseline = json.loads((HERE.parent / ASSET_BASE_RELEASE / "release.json").read_text(encoding="utf-8"))
    for item in baseline["files"]:
        name = DEMO_PREFIX + item["path"]
        if name not in names and digest((ROOT / name).read_bytes()) != item["sha256"]:
            raise ValueError(f"Runtime file changed but was not approved for this patch: {name}")
    manifest = "".join(f"{digest(contents[name])}  {name}\n" for name in names).encode()
    directory = HERE / release_id
    directory.mkdir(exist_ok=False)
    archive_name = release_id + ".tar.gz"
    archive = directory / archive_name
    with tarfile.open(archive, "w:gz", format=tarfile.PAX_FORMAT) as package:
        entries = {"MANIFEST.sha256": manifest, **{"payload/" + name: body for name, body in contents.items()}}
        for name, body in sorted(entries.items()):
            entry = tarfile.TarInfo(name)
            entry.size, entry.mode, entry.mtime = len(body), 0o644, 0
            entry.uid = entry.gid = 0
            entry.uname = entry.gname = "root"
            package.addfile(entry, io.BytesIO(body))
    archive_hash = digest(archive.read_bytes())
    deploy, rollback = scripts(release_id, archive_name, archive_hash, names, previous, previous_root_hash)
    (directory / "deploy-homepage-remote.sh").write_text(deploy, encoding="utf-8", newline="\n")
    (directory / "rollback-homepage-remote.sh").write_text(rollback, encoding="utf-8", newline="\n")
    (directory / "MANIFEST.sha256").write_bytes(manifest)
    report = {
        "prepared_at_utc": datetime.now(timezone.utc).isoformat(),
        "status": "prepared_locally_not_uploaded_or_deployed", "release_id": release_id,
        "previous_release": previous, "previous_root_sha256": previous_root_hash,
        "baseline_state": str(args.baseline_state.resolve()),
        "baseline_checked_at_utc": state.get("checked_at_utc"),
        "new_release": "/var/www/personal-resume/releases/" + release_id,
        "public_urls": ["https://www.moorn.online/", "https://moorn.online/"],
        "archive": archive_name, "archive_sha256": archive_hash,
        "archive_bytes": archive.stat().st_size,
        "files": [{"path": name, "bytes": len(contents[name]), "sha256": digest(contents[name])} for name in names],
        "unchanged_demo_files_verified_locally": sum(DEMO_PREFIX + item["path"] not in names for item in baseline["files"]),
        "scope": "Copy the current complete site and overwrite only the explicit changed-file allowlist. Preserve all other files byte-for-byte.",
    }
    (directory / "release.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (HERE / "latest-prepared.json").write_text(json.dumps({"directory": str(directory), "release_id": release_id}, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"directory": str(directory), "file_count": len(names), "archive_sha256": archive_hash, "status": report["status"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
