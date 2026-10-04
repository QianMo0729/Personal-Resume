"""Prepare the reviewed blueprint demo release; never connects to a server."""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import posixpath
import re
import tarfile
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

HERE = Path(__file__).resolve().parent
DEMO = HERE.parents[1]
PREVIOUS = "/var/www/personal-resume/releases/20260816T114515Z-stats-09"
PUBLIC_URL = "https://www.moorn.online/demos/blueprint-campus/"
FILES = [
    "index.html", "styles.css", "app.js", "interior-scene.js",
    "entrance-scene.js", "entrance-anchor.js", "assets/campus-data.json",
    "assets/campus-plan.svg", "assets/sustech-logo.png",
    "vendor/three.module.js", "vendor/three.core.js", "vendor/THREE-LICENSE.txt",
    "assets/source-data/README.md",
]


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        for key in ("src", "href"):
            if key in values:
                self.urls.append(values[key])


def sha256(content):
    return hashlib.sha256(content).hexdigest()


def check_references(contents):
    checked = set()
    external_pages = set()
    for name, content in contents.items():
        if not name.endswith((".html", ".js", ".css")):
            continue
        source = content.decode("utf-8")
        urls = []
        if name.endswith(".html"):
            parser = References()
            parser.feed(source)
            urls.extend(parser.urls)
        if name.endswith(".js"):
            urls.extend(re.findall(r"(?:\bfrom\s*|\bimport\s*|\bfetch\s*\(\s*)['\"]([^'\"]+)['\"]", source))
            urls.extend(re.findall(r"(?:src|href)=['\"]([^'\"]+)['\"]", source))
        if name.endswith(".css"):
            urls.extend(re.findall(r"url\(\s*['\"]?([^)'\"\s]+)", source))
        for url in urls:
            parsed = urlsplit(url)
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            path = posixpath.normpath(posixpath.join(posixpath.dirname(name), unquote(parsed.path)))
            if path.startswith("../"):
                if not (DEMO / path).is_file():
                    raise ValueError(f"Missing existing-site page referenced by {name}: {url}")
                external_pages.add(path)
            elif path.startswith("/") or path not in contents:
                raise ValueError(f"Unlisted runtime reference in {name}: {url} -> {path}")
            else:
                checked.add(path)
    return {"local_runtime_references": sorted(checked), "existing_site_pages": sorted(external_pages)}


def remote_script(release_id, archive_name, archive_hash, names):
    members = "\n".join(sorted(["MANIFEST.sha256"] + [f"payload/{name}" for name in names]))
    return f"""#!/usr/bin/env bash
set -euo pipefail
umask 022
[[ "${{1:-}}" == --activate-reviewed-release ]] || {{ echo 'Explicit reviewed-release argument required.' >&2; exit 2; }}
base=/var/www/personal-resume
expected_previous='{PREVIOUS}'
release="$base/releases/{release_id}"
incoming="$base/incoming/{release_id}"
archive='/var/tmp/{archive_name}'
current="$base/current"
next="$base/current.next-{release_id}"

# Every check above the mkdir is read-only. Never change an unexpected live release.
[[ "$(readlink -f "$current")" == "$expected_previous" ]] || {{ echo 'Current release changed; aborting.' >&2; exit 3; }}
[[ -d "$expected_previous" && ! -e "$release" && ! -e "$incoming" && ! -e "$next" && ! -L "$next" ]]
[[ ! -e "$expected_previous/demos/blueprint-campus" ]]
printf '%s  %s\\n' '{archive_hash}' "$archive" | sha256sum --check --status
diff -u <(cat <<'EXPECTED_MEMBERS'
{members}
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
[[ "$(readlink -f "$current")" == "$expected_previous" ]] || {{ echo 'Concurrent release detected; not activating.' >&2; exit 4; }}
ln -s "$release" "$next"
mv -Tf -- "$next" "$current"
printf 'previous=%s\\ncurrent=%s\\nurl=%s\\n' "$expected_previous" "$(readlink -f "$current")" '{PUBLIC_URL}' | tee "$incoming/activation.txt"
systemctl is-active nginx x-ui
# No Nginx configuration edits, reloads, or other service changes are needed.
"""


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--release-id", help="Optional explicit UTC release identifier")
    args = parser.parse_args()
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    release_id = args.release_id or f"{stamp}-blueprint-campus"
    if not re.fullmatch(r"[A-Za-z0-9-]+", release_id):
        raise ValueError("Release ID must use letters, digits, and hyphens only")
    names = FILES.copy()
    if (DEMO / "assets/source-data/NOTICE.txt").is_file():
        names.append("assets/source-data/NOTICE.txt")
    before = {name: ((DEMO / name).stat().st_mtime_ns, (DEMO / name).stat().st_size) for name in names}
    contents = {name: (DEMO / name).read_bytes() for name in names}
    after = {name: ((DEMO / name).stat().st_mtime_ns, (DEMO / name).stat().st_size) for name in names}
    if before != after:
        raise RuntimeError("Files changed while collecting the release. Run again after edits settle.")
    references = check_references(contents)
    manifest = "".join(f"{sha256(contents[name])}  {name}\n" for name in sorted(names)).encode()
    output = HERE / release_id
    output.mkdir(exist_ok=False)
    archive_name = release_id + ".tar.gz"
    archive = output / archive_name
    with tarfile.open(archive, "w:gz", format=tarfile.PAX_FORMAT) as package:
        entries = {"MANIFEST.sha256": manifest, **{f"payload/{name}": body for name, body in contents.items()}}
        for name in sorted(entries):
            info = tarfile.TarInfo(name)
            info.size = len(entries[name])
            info.mode = 0o644
            info.mtime = 0
            info.uid = info.gid = 0
            info.uname = info.gname = "root"
            package.addfile(info, io.BytesIO(entries[name]))
    archive_hash = sha256(archive.read_bytes())
    (output / "MANIFEST.sha256").write_bytes(manifest)
    (output / "deploy-remote.sh").write_text(remote_script(release_id, archive_name, archive_hash, names), encoding="utf-8", newline="\n")
    rollback = f"""#!/usr/bin/env bash
set -euo pipefail
[[ "${{1:-}}" == --rollback-blueprint-release ]] || exit 2
base=/var/www/personal-resume
[[ "$(readlink -f "$base/current")" == "$base/releases/{release_id}" ]] || {{ echo 'Unexpected current release; aborting.' >&2; exit 3; }}
[[ -d '{PREVIOUS}' ]]
next="$base/current.rollback-{release_id}"
[[ ! -e "$next" && ! -L "$next" ]]
ln -s '{PREVIOUS}' "$next"
mv -Tf -- "$next" "$base/current"
readlink -f "$base/current"
"""
    (output / "rollback-remote.sh").write_text(rollback, encoding="utf-8", newline="\n")
    report = {
        "prepared_at_utc": datetime.now(timezone.utc).isoformat(),
        "status": "prepared_locally_not_uploaded_or_deployed",
        "release_id": release_id, "public_url": PUBLIC_URL,
        "previous_release": PREVIOUS,
        "new_release": f"/var/www/personal-resume/releases/{release_id}",
        "archive": archive_name, "archive_sha256": archive_hash,
        "archive_bytes": archive.stat().st_size, "files": [
            {"path": name, "bytes": len(contents[name]), "sha256": sha256(contents[name])}
            for name in sorted(names)
        ], "reference_check": references,
        "excluded": ["portrait assets", "original photographs", "raw OSM", "QA", "runtime logs", "server scripts", "deployment helpers", "credentials"],
    }
    (output / "release.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (HERE / "latest-prepared.json").write_text(json.dumps({"directory": str(output), "release_id": release_id}, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"directory": str(output), "file_count": len(names), "archive_sha256": archive_hash, "status": report["status"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
