"""Collect before/after HTTPS hashes without reading or storing credentials."""

import argparse
import hashlib
import json
import ssl
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ORIGIN = "https://www.moorn.online"
EXISTING = ["/", "/work.html", "/education.html", "/script.js", "/styles.css", "/demos/hardnest/"]
EXCLUDED = [
    "/.git/config", "/contact.html", "/demos/blueprint-campus/assets/portrait-blue.png",
    "/demos/blueprint-campus/assets/source-data/osm-campus-raw.json",
    "/demos/blueprint-campus/assets/source-data/fetch-osm.py",
    "/demos/blueprint-campus/source-data/deployment/prepare_release.py",
    "/demos/blueprint-campus/source-data/qa/",
    "/demos/blueprint-campus/source-data/runtime/",
    "/demos/blueprint-campus/server.mjs", "/demos/blueprint-campus/Start-Demo.ps1",
    "/demos/blueprint-campus/README.md",
]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=["before", "after"])
    args = parser.parse_args()
    latest = json.loads((HERE / "latest-prepared.json").read_text(encoding="utf-8"))
    directory = Path(latest["directory"])
    release = json.loads((directory / "release.json").read_text(encoding="utf-8"))
    nonce = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")

    def fetch(path):
        request = urllib.request.Request(ORIGIN + path + "?verify=" + nonce, headers={"Accept-Encoding": "identity", "Cache-Control": "no-cache", "User-Agent": "Blueprint-Release-Verification/1.0"})
        try:
            response = urllib.request.urlopen(request, timeout=40, context=ssl.create_default_context())
        except urllib.error.HTTPError as error:
            response = error
        with response:
            body = response.read()
            return {"path": path, "status": response.status, "bytes": len(body), "sha256": hashlib.sha256(body).hexdigest(), "content_type": response.headers.get("Content-Type"), "final_url": response.url.split("?")[0]}

    def fetch_all(paths):
        with ThreadPoolExecutor(max_workers=6) as executor:
            return list(executor.map(fetch, paths))

    existing = fetch_all(EXISTING)
    if args.mode == "before":
        assert all(item["status"] == 200 for item in existing), existing
        record = {"checked_at_utc": datetime.now(timezone.utc).isoformat(), "origin": ORIGIN, "existing_routes": existing}
        (directory / "public-before.json").write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
        print(json.dumps({"status": "public_baseline_recorded", "existing_routes": len(existing)}))
        return

    baseline = json.loads((directory / "public-before.json").read_text(encoding="utf-8"))
    before_by_path = {item["path"]: item for item in baseline["existing_routes"]}
    for item in existing:
        item["matches_before"] = item["status"] == 200 and item["sha256"] == before_by_path[item["path"]]["sha256"]
    resources = fetch_all(["/demos/blueprint-campus/" + item["path"] for item in release["files"]])
    expected = {"/demos/blueprint-campus/" + item["path"]: item["sha256"] for item in release["files"]}
    for item in resources:
        item["matches_local"] = item["status"] == 200 and item["sha256"] == expected[item["path"]]
    excluded = fetch_all(EXCLUDED)
    landing = fetch("/demos/blueprint-campus/")
    landing["matches_local"] = landing["status"] == 200 and landing["sha256"] == expected["/demos/blueprint-campus/index.html"]
    passed = (all(item["matches_before"] for item in existing)
              and all(item["matches_local"] for item in resources)
              and all(item["status"] == 404 for item in excluded)
              and landing["matches_local"])
    record = {
        "checked_at_utc": datetime.now(timezone.utc).isoformat(), "status": "passed" if passed else "failed",
        "public_url": release["public_url"], "release_id": release["release_id"],
        "previous_release": release["previous_release"], "active_release": release["new_release"],
        "archive_sha256": release["archive_sha256"], "landing": landing,
        "published_resources": resources, "existing_routes": existing, "excluded_paths": excluded,
        "rollback_script": str(directory / "rollback-remote.sh"),
        "scope": "HTTPS byte hashes and route states; interactive browser QA is performed separately by the root agent.",
    }
    (directory / "deployment-verification.json").write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
    (HERE / "deployment-verification.json").write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": record["status"], "published_resources": len(resources), "resources_match": sum(item["matches_local"] for item in resources), "existing_routes_unchanged": sum(item["matches_before"] for item in existing), "excluded_404": sum(item["status"] == 404 for item in excluded), "release_id": release["release_id"], "public_url": release["public_url"]}))
    if not passed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
