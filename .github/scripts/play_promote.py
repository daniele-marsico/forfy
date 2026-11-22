# Porta l'ultima build del test interno nei test chiusi/aperti di Google Play.
# Uso: SA=<json service account> PKG=<package> TARGET=auto|alpha|<nome track> python play_promote.py
#  - auto: tutti i track di test che hanno già una release attiva (escluso internal e production)
import json, os, sys
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

creds = service_account.Credentials.from_service_account_info(
    json.loads(os.environ["SA"]), scopes=["https://www.googleapis.com/auth/androidpublisher"])
ap = build("androidpublisher", "v3", credentials=creds, cache_discovery=False)
pkg = os.environ["PKG"]
target = (os.environ.get("TARGET") or "auto").strip()

edit = ap.edits().insert(packageName=pkg, body={}).execute()["id"]
tracks = ap.edits().tracks().list(packageName=pkg, editId=edit).execute().get("tracks", [])

print("Situazione attuale dei track:")
for t in tracks:
    for r in t.get("releases", []):
        print(f"  {t['track']}: {r.get('name')} | {r.get('status')} | versioni {r.get('versionCodes')}")

def top(r):
    return max(int(v) for v in r.get("versionCodes", ["0"]))

internal = next((t for t in tracks if t["track"] == "internal"), None)
src = [r for r in (internal or {}).get("releases", []) if r.get("status") == "completed" and r.get("versionCodes")]
if not src:
    sys.exit("Nessuna release completata nel test interno: niente da promuovere.")
src = max(src, key=top)
codes, newest = src["versionCodes"], top(src)
print(f"Build da promuovere: {codes}")

if target == "auto":
    active = ("completed", "inProgress", "halted")
    targets = [t["track"] for t in tracks if t["track"] not in ("internal", "production")
               and any(r.get("status") in active for r in t.get("releases", []))]
    if not targets:
        sys.exit("Nessun test chiuso/aperto attivo trovato: rilancia indicando il nome del track (es. alpha).")
else:
    targets = [x.strip() for x in target.split(",") if x.strip()]

changed = False
for tr in targets:
    cur = next((t for t in tracks if t["track"] == tr), {})
    if any(top(r) >= newest for r in cur.get("releases", []) if r.get("status") == "completed"):
        print(f"{tr}: ha già la build {newest} o successiva, salto")
        continue
    body = {"track": tr, "releases": [{"name": f"{newest} - Forfettix", "versionCodes": codes, "status": "completed"}]}
    ap.edits().tracks().update(packageName=pkg, editId=edit, track=tr, body=body).execute()
    print(f"{tr}: impostata la build {codes}")
    changed = True

if not changed:
    print("Niente da cambiare.")
    sys.exit(0)
try:
    ap.edits().commit(packageName=pkg, editId=edit).execute()
except HttpError as e:
    if "changesNotSentForReview" not in str(e):
        raise
    ap.edits().commit(packageName=pkg, editId=edit, changesNotSentForReview=True).execute()
    print("Salvato ma NON inviato in revisione: invialo da Play Console > Panoramica pubblicazione.")
print("Fatto. Dopo la revisione di Google (di solito poche ore) i tester ricevono l'aggiornamento.")
