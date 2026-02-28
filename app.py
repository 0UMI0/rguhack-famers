import os
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/echo", methods=["POST"])
def echo():
    data = request.get_json(silent=True) or {}
    message = str(data.get("message", ""))[:500]
    return jsonify({"echo": message})


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug)
