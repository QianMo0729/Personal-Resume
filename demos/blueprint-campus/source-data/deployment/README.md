# Blueprint demo release preparation

This directory is local deployment material and must never be included in the public site.

Target: <https://www.moorn.online/demos/blueprint-campus/>.

## Published release

The final release `20260914T045343Z-blueprint-campus` was activated and verified on 2026-09-14 UTC. Its archive SHA-256 is `41114f6c1e823405986b92a9aff5c3140b3d0031076030aaf47cb422e71c66c8`.

- `deployment-verification.json`: 13/13 public resource hashes matched, 6/6 existing routes retained their previous hashes, and 11/11 excluded paths returned 404.
- `activation-record.json`: successful remote activation, all 14 previous site files preserved byte-for-byte, and Nginx/x-ui active without configuration changes or service reloads.
- `20260914T045343Z-blueprint-campus/rollback-remote.sh`: guarded rollback to `/var/www/personal-resume/releases/20260816T114515Z-stats-09`, which remains on the server.
- `../qa/refinement/published-verification.json`: the root agent independently verified the public new card, all three 3D scene entry/return paths, mobile layout, and zero browser errors/failed requests.

Read-only inspection confirmed the existing active release as `/var/www/personal-resume/releases/20260816T114515Z-stats-09`. Deployment copies that complete release and adds only the approved blueprint demo files. Existing portfolio pages and the separately configured Hard Nest demo remain unchanged.

## Prepare after local QA

Run from the repository root:

```powershell
python -X utf8 demos/blueprint-campus/source-data/deployment/prepare_release.py
```

Preparation performs no network or remote operation. Every run reads the current file contents, validates local resource references against the allowlist, and creates a fresh timestamped directory with:

- A release archive containing only the approved public files plus a private extraction manifest.
- `MANIFEST.sha256` and `release.json` for review and public verification.
- `deploy-remote.sh` with pinned archive hash and expected prior release.
- `rollback-remote.sh` guarded against rolling back an unexpected later release.

The fixed allowlist is 12 runtime files plus `assets/source-data/README.md` and, if present, `assets/source-data/NOTICE.txt`. No portrait, original photo, raw OSM data, QA/runtime directory, server helper, or password is packaged. The manifest is extracted outside the public release, so it is not served.

## Deployment after the root agent's execution signal

Re-run preparation after all code edits and local QA have finished. Inspect the new `release.json` and manifest. Upload only its archive and `deploy-remote.sh` to `/var/tmp/` using SCP. Authenticate interactively; never place the password in command arguments, helper files, reports, or archives. Run the uploaded shell script with its required `--activate-reviewed-release` argument.

The remote script verifies the current release, exact tar member allowlist, archive SHA-256, extracted per-file SHA-256, Nginx configuration, and active services. It then copies the old release, adds the new demo, checks every old site file against its prior hash, rechecks for a concurrent publication, and switches `current` atomically. It does not change Nginx configuration or restart/reload any service.

Verify the public demo and all manifest files against HTTPS hashes. Check the old homepage and existing project routes still work. Confirm no excluded resource can be fetched. If verification fails, upload the generated rollback script and invoke it with `--rollback-blueprint-release`; this switches back only if the newly published release is still current.

The server's current TLS routing has Nginx stream traffic on `10.4.0.14:443` and the website HTTP TLS virtual host on `127.0.0.1:7443`. Existing Xray and x-ui listeners must remain untouched. No listener changes are needed for this static publication.
