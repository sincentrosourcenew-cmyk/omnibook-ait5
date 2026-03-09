from __future__ import annotations

from pathlib import Path
import re

import streamlit as st
import streamlit.components.v1 as components

BASE_DIR = Path(__file__).parent


def _read_text(name: str) -> str:
    path = BASE_DIR / name
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def _build_embedded_html() -> str:
    html = _read_text("index.html")
    css = _read_text("styles.css")
    js = _read_text("app.js").replace("</script>", "<\/script>")

    if not html:
        return "<h1>OMNIBOOK AI</h1><p>index.html was not found.</p>"

    # Remove external file references and inject local content inline for Streamlit embedding.
    html = re.sub(r"<link[^>]*href=[\"']\./styles\.css[\"'][^>]*>", "", html)
    html = re.sub(r"<script[^>]*src=[\"']\./app\.js[\"'][^>]*></script>", "", html)

    html = html.replace("</head>", f"<style>{css}</style></head>")
    html = html.replace('</body>', f'<script type="text/babel" data-presets="react">{js}</script></body>')
    return html


st.set_page_config(page_title="OMNIBOOK AI", page_icon="🤍", layout="wide")

st.title("🤍 OMNIBOOK AI")
st.caption("Clean. Spacious. Powerful.")

embedded = _build_embedded_html()
components.html(embedded, height=2400, scrolling=True)
