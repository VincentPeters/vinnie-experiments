# src/components/pydemo-stdlib.py
# This module is loaded into Pyodide and exposes plot_xy, plot_lines,
# plot_hist, print_md, show_df at the top level of the user's namespace.

import json as _json
import io as _io

_outputs = []


def _emit(kind, payload):
    _outputs.append({"kind": kind, "payload": payload})


def _reset_outputs():
    _outputs.clear()


def _drain_outputs():
    out = list(_outputs)
    _outputs.clear()
    return out


def plot_xy(x, y, title=None, mode="markers"):
    """Single line or scatter. mode is 'markers' or 'lines' or 'lines+markers'."""
    fig = {
        "data": [{"x": list(x), "y": list(y), "mode": mode, "type": "scattergl"}],
        "layout": {
            "title": title or "",
            "margin": {"l": 40, "r": 10, "t": 30 if title else 10, "b": 30},
            "autosize": True,
        },
    }
    _emit("plotly", _json.dumps(fig))


def plot_lines(series, title=None):
    """series: dict of name -> (x, y) tuple, or dict of name -> list (uses index)."""
    data = []
    for name, val in series.items():
        if isinstance(val, tuple) and len(val) == 2:
            x, y = val
        else:
            y = list(val)
            x = list(range(len(y)))
        data.append({"x": list(x), "y": list(y), "mode": "lines", "name": name, "type": "scattergl"})
    fig = {
        "data": data,
        "layout": {
            "title": title or "",
            "margin": {"l": 40, "r": 10, "t": 30 if title else 10, "b": 30},
            "autosize": True,
        },
    }
    _emit("plotly", _json.dumps(fig))


def plot_hist(values, bins=30, title=None):
    fig = {
        "data": [{"x": list(values), "type": "histogram", "nbinsx": bins}],
        "layout": {
            "title": title or "",
            "margin": {"l": 40, "r": 10, "t": 30 if title else 10, "b": 30},
            "autosize": True,
        },
    }
    _emit("plotly", _json.dumps(fig))


def print_md(text):
    """Markdown-rendered text output. Renderer is JS-side; we just emit raw."""
    _emit("md", str(text))


def show_df(df, max_rows=100):
    """Polars or pandas DataFrame as HTML table, capped at max_rows."""
    try:
        import polars as pl
        if isinstance(df, pl.DataFrame):
            html = df.head(max_rows)._repr_html_()
            _emit("html", html)
            return
    except ImportError:
        pass
    try:
        import pandas as pd
        if isinstance(df, pd.DataFrame):
            html = df.head(max_rows).to_html(index=False)
            _emit("html", html)
            return
    except ImportError:
        pass
    _emit("html", "<pre>show_df: not a polars or pandas DataFrame</pre>")
