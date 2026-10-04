# Homepage and content patch

This is private local deployment material; do not publish this directory.

## Completed publication

Release `20260914T061003Z-blueprint-motion500` is active at <https://www.moorn.online/>. Entrance, return, and orbit transitions now use 500 ms. The apex <https://moorn.online/> retains its existing HTTP 301 redirect to the `www` address. The archive SHA-256 is `eba457e04bc9a47941f1d5419e2975acc0bb43ef1aa005b495f60afdf35ab9e2`.

The final patch contains exactly the three default files below. Remote checks verified their hashes and preserved all other 24 site files byte-for-byte. Public checks matched all 14 root/demo resource hashes, all five other existing routes, and three excluded-path 404 responses. Nginx configuration and services were unchanged.

`deployment-verification.json` records the public checks. `activation-record.json` records activation and rollback information. The previous release `/var/www/personal-resume/releases/20260914T060021Z-blueprint-homepage` remains available; the generated `20260914T061003Z-blueprint-motion500/rollback-homepage-remote.sh` restores it only if this new release is still active. The original homepage publication and its earlier rollback record remain in their own timestamped directory.

The user's follow-up authorizes replacing the original root homepage with the blueprint experience and updating the reviewed college/campus content. The root agent supplies the final explicit file scope after QA.

Initial read-only checks, before the root homepage replacement, confirmed:

- `current` points to `/var/www/personal-resume/releases/20260914T045343Z-blueprint-campus`.
- `https://moorn.online/` redirects with HTTP 301 to `https://www.moorn.online/`.
- The `www` virtual host reads `/var/www/personal-resume/current/index.html`; HTTP domain requests redirect to HTTPS `www`.
- The previous root page SHA-256 is `afb711da51a7203cf126733a9e451cebae74b5b1ce731ef15948818769c0797b`.
- Nginx and x-ui are active. No configuration or listener change is needed.

Preparation requires the new root HTML to contain exactly one `<base href="/demos/blueprint-campus/">`. The default explicit patch is:

1. `index.html`
2. `demos/blueprint-campus/index.html`
3. `demos/blueprint-campus/app.js`

Additional reviewed demo changes can be included only with `--include-demo-file entrance-scene.js`, `interior-scene.js`, or `styles.css`. Preparation refuses any other locally changed demo runtime file that is missing from the patch, based on the already published 13-file manifest.

Before every new publication, refresh `current-server-state.json` from a successful read-only SSH `readlink -f /var/www/personal-resume/current` and `sha256sum /var/www/personal-resume/current/index.html` check. The preparer reads this timestamped state; it no longer contains a hardcoded old homepage hash. Generated scripts pin both values and refuse a changed live release. `--release-label blueprint-motion500` identifies the current half-second motion update; the previous generated scripts remain unchanged.

From the repository root, after final homepage QA and the exact scope are supplied:

```powershell
python -X utf8 demos/blueprint-campus/source-data/deployment/homepage/prepare_homepage.py --include-demo-file entrance-scene.js
```

The command only creates a local archive, SHA-256 manifest, release record, and guarded deployment/rollback scripts. The sample optional argument must be omitted if that file was not changed/approved.

Do not upload or execute before the root agent's explicit homepage execution signal. Authentication must be interactive; no passwords are stored here or in the package.

The remote script checks the expected current release, original root hash, archive hash and exact members, Nginx configuration, and service state. It copies the current complete release, overwrites only the manifest paths, and verifies both the changed-file hashes and every non-targeted existing file before the atomic symlink switch. The old release remains available. No service reload is performed.

Deployment requires the generated shell script's `--activate-reviewed-homepage` argument. Rollback requires `--rollback-homepage-release` and aborts if the active release has changed since this publication.
