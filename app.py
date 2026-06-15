import csv
import os
from flask import Flask, jsonify, render_template

app = Flask(__name__)

_LOCAL_CSV = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ql-group_activity-report-1781516667.csv")
_DOWNLOADS_CSV = "/Users/aritrabose/Downloads/ql-group_activity-report-1781516667.csv"

def _resolve_csv():
    # Prefer the bundled CSV (works on Vercel and locally)
    if os.path.exists(_LOCAL_CSV):
        try:
            open(_LOCAL_CSV).close()
            return _LOCAL_CSV
        except Exception:
            pass
    return _DOWNLOADS_CSV


def load_rows():
    rows = []
    with open(_resolve_csv(), newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            try:
                given  = float(r["Given Score"])
                maxsc  = float(r["Maximum Score"])
                mins   = float(r["Learning time (minutes)"])
            except (ValueError, KeyError):
                given = maxsc = mins = 0.0
            date_c = r.get("Date completed", "").replace(" UTC", "")[:10] or None
            date_s = r.get("Date started",   "").replace(" UTC", "")[:10] or None
            rows.append({
                "member":       r["Member"],
                "activity":     r["Activity"],
                "type":         r["Activity Type"],
                "passed":       r["Passed"].strip().lower() == "true",
                "given_score":  given,
                "max_score":    maxsc,
                "minutes":      mins,
                "date_started":   date_s,
                "date_completed": date_c,
                "parent_type":  r.get("Parent Type", ""),
                "parent_name":  r.get("Parent Name", ""),
                "url":          r.get("Content Url", ""),
            })
    return rows


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/rows")
def api_rows():
    return jsonify(load_rows())


if __name__ == "__main__":
    app.run(debug=True, port=5050)
