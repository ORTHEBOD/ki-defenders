"""Uploads the Ki Defenders app bundle to Google Play (internal testing), with no size limit.

The app bundle comes from a GitHub release made by the "Build apps" workflow (.github/workflows/apps.yml).
It uses Rise of Ki's service account key: D:\\RiseOfKi_keys\\play_service_account.json (outside the
project, never in git). The service account riseofki-server@ki-defenders.iam.gserviceaccount.com has
"release to testing tracks" and "manage testing tracks" on Ki Defenders in Play Console.

    python tools/upload_play.py ["release notes"] [internal,alpha] [--tag app-1.0.31]
        Uploads the newest release (or --tag) to the tracks (default: internal).
    python tools/upload_play.py --check
        Only shows what is on each testing track now.
Needs: gh (GitHub CLI, signed in) and the Python package `cryptography`.
"""
import base64
import json
import os
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

PACKAGE = "com.orthebod.kidefenders"
REPO = "ORTHEBOD/ki-defenders"
KEY = r"D:\RiseOfKi_keys\play_service_account.json"
API = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications/" + PACKAGE
UPLOAD = "https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/" + PACKAGE
TRACK_NAMES = {"internal": "Internal testing", "alpha": "Closed testing"}


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def access_token() -> str:
    key = json.load(open(KEY, encoding="utf-8"))
    now = int(time.time())
    head = b64url(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
    claims = b64url(json.dumps({"iss": key["client_email"], "scope": "https://www.googleapis.com/auth/androidpublisher",
                                "aud": key["token_uri"], "iat": now, "exp": now + 3600}).encode())
    rsa = serialization.load_pem_private_key(key["private_key"].encode(), password=None)
    sig = rsa.sign(f"{head}.{claims}".encode(), padding.PKCS1v15(), hashes.SHA256())
    body = urllib.parse.urlencode({"grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                                   "assertion": f"{head}.{claims}.{b64url(sig)}"}).encode()
    return json.load(urllib.request.urlopen(key["token_uri"], body))["access_token"]


def call(token: str, method: str, url: str, body=None, content_type="application/json"):
    data = json.dumps(body).encode() if isinstance(body, (dict, list)) else body
    req = urllib.request.Request(url, data=data, method=method,
                                 headers={"Authorization": "Bearer " + token, "Content-Type": content_type})
    try:
        return json.load(urllib.request.urlopen(req, timeout=600))
    except urllib.error.HTTPError as e:
        raise RuntimeError("%s %s -> %d: %s" % (method, url.split("?")[0], e.code, e.read().decode()[:600]))


# Downloads the app bundle of a GitHub release (the newest one when tag is None) into a new folder
def download_bundle(tag):
    folder = tempfile.mkdtemp(prefix="kd-aab-")
    cmd = ["gh", "release", "download", "-R", REPO, "-p", "*.aab", "-D", folder]
    if tag:
        cmd.insert(3, tag)
    subprocess.run(cmd, check=True)
    return os.path.join(folder, "ki-defenders.aab")


def check(token: str) -> None:
    edit = call(token, "POST", API + "/edits", {})["id"]
    for track in ("internal", "alpha"):
        info = call(token, "GET", API + "/edits/%s/tracks/%s" % (edit, track))
        for r in info.get("releases", []):
            print("%s: %s, version code %s, %s" % (TRACK_NAMES[track], r.get("name"), ",".join(r.get("versionCodes", [])), r.get("status")))
    # Nothing was changed: the edit is just dropped


def main() -> None:
    token = access_token()
    if "--check" in sys.argv:
        check(token)
        return
    tag = sys.argv[sys.argv.index("--tag") + 1] if "--tag" in sys.argv else None
    args = [a for i, a in enumerate(sys.argv[1:], 1) if not a.startswith("--") and sys.argv[i - 1] != "--tag"]
    notes = args[0] if args else "New test version of Ki Defenders."
    tracks = (args[1] if len(args) > 1 else "internal").split(",")
    aab = download_bundle(tag)
    edit = call(token, "POST", API + "/edits", {})["id"]
    print("Uploading %s (%.1f MB)..." % (aab, os.path.getsize(aab) / 1e6))
    bundle = call(token, "POST", UPLOAD + "/edits/%s/bundles?uploadType=media" % edit,
                  open(aab, "rb").read(), "application/octet-stream")
    code = bundle["versionCode"]
    print("Uploaded: version code %d" % code)
    release = {"name": "%d (1.0.%d)" % (code, code), "versionCodes": [str(code)], "status": "completed",
               "releaseNotes": [{"language": "en-US", "text": notes}]}
    for track in tracks:
        call(token, "PUT", API + "/edits/%s/tracks/%s" % (edit, track), {"track": track, "releases": [release]})
    call(token, "POST", API + "/edits/%s:commit" % edit)
    for track in tracks:
        print("%s: version 1.0.%d is live for testers." % (TRACK_NAMES.get(track, track), code))


if __name__ == "__main__":
    main()
