"""Verify the homepage patch through bounded, concurrent HTTPS requests."""

import hashlib
import json
import subprocess
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ORIGIN = "https://www.moorn.online"
BASE_RELEASE = "20260914T045343Z-blueprint-campus"


def main():
    latest = json.loads((HERE / "latest-prepared.json").read_text(encoding="utf-8"))
    folder = Path(latest["directory"])
    release = json.loads((folder / "release.json").read_text(encoding="utf-8"))
    original = json.loads((HERE.parent / BASE_RELEASE / "release.json").read_text(encoding="utf-8"))
    old_public = json.loads((HERE.parent / BASE_RELEASE / "deployment-verification.json").read_text(encoding="utf-8"))
    expected = {"/demos/blueprint-campus/" + item["path"]: item["sha256"] for item in original["files"]}
    expected.update({"/" + item["path"]: item["sha256"] for item in release["files"]})
    nonce = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")

    def fetch(url, follow=True):
        command = ["curl.exe", "-sS", "--connect-timeout", "8", "--max-time", "20", "-H", "Accept-Encoding: identity", "-H", "Cache-Control: no-cache"]
        if follow:
            command.append("-L")
        command.extend([url + "?verification=" + nonce, "-w", "\n__RELEASE_METADATA__%{http_code}|%{url_effective}"])
        process = subprocess.run(command, capture_output=True, timeout=24)
        if process.returncode:
            return {"url": url, "status": None, "error": process.stderr.decode("utf-8", errors="replace").strip()}
        body, metadata = process.stdout.rsplit(b"\n__RELEASE_METADATA__", 1)
        code, effective = metadata.decode().split("|", 1)
        return {"url": url, "status": int(code), "bytes": len(body), "sha256": hashlib.sha256(body).hexdigest(), "final_url": effective.split("?")[0]}

    with ThreadPoolExecutor(max_workers=4) as pool:
        resources = list(pool.map(fetch, [ORIGIN + path for path in expected]))
    for result, path in zip(resources, expected):
        result["matches_local"] = result["status"] == 200 and result.get("sha256") == expected[path]

    old_routes = [item for item in old_public["existing_routes"] if item["path"] != "/"]
    with ThreadPoolExecutor(max_workers=4) as pool:
        preserved = list(pool.map(fetch, [ORIGIN + item["path"] for item in old_routes]))
    for result, before in zip(preserved, old_routes):
        result["matches_previous"] = result["status"] == 200 and result.get("sha256") == before["sha256"]

    root = fetch(ORIGIN + "/")
    root["matches_local"] = root["status"] == 200 and root.get("sha256") == expected["/index.html"]
    apex = fetch("https://moorn.online/")
    apex["matches_local"] = apex["status"] == 200 and apex.get("sha256") == expected["/index.html"] and apex["final_url"] == ORIGIN + "/"
    apex_redirect = fetch("https://moorn.online/", follow=False)
    excluded_paths = ["/.git/config", "/demos/blueprint-campus/assets/portrait-blue.png", "/demos/blueprint-campus/source-data/deployment/homepage/prepare_homepage.py"]
    with ThreadPoolExecutor(max_workers=3) as pool:
        excluded = list(pool.map(fetch, [ORIGIN + path for path in excluded_paths]))
    passed = (all(item["matches_local"] for item in resources)
              and all(item["matches_previous"] for item in preserved)
              and root["matches_local"] and apex["matches_local"]
              and apex_redirect["status"] == 301
              and all(item["status"] == 404 for item in excluded))
    report = {
        "checked_at_utc": datetime.now(timezone.utc).isoformat(), "status": "passed" if passed else "failed",
        "release_id": release["release_id"], "previous_release": release["previous_release"],
        "active_release": release["new_release"], "public_url": ORIGIN + "/",
        "archive_sha256": release["archive_sha256"], "root": root, "apex": apex,
        "apex_redirect": apex_redirect, "resources": resources,
        "preserved_routes": preserved, "excluded_paths": excluded,
        "scope": "Public HTTPS file hashes and routing. Browser interactions are checked independently by the root agent.",
    }
    (folder / "deployment-verification.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    (HERE / "deployment-verification.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": report["status"], "resource_hashes_matched": sum(item["matches_local"] for item in resources), "resources_total": len(resources), "old_routes_unchanged": sum(item["matches_previous"] for item in preserved), "excluded_404": sum(item["status"] == 404 for item in excluded), "root_match": root["matches_local"], "apex_match": apex["matches_local"], "release_id": release["release_id"]}))
    if not passed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
