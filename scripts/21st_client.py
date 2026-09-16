#!/usr/bin/env python3
"""
21st.dev MCP Client & CLI Helper for InterviewForge
Allows searching 21st.dev UI components and fetching code directly into the codebase.
"""

import sys
import json
import urllib.request
import urllib.error
import argparse
import os

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

API_URL = "https://21st.dev/api/mcp"
API_KEY = os.environ.get("API_KEY_21ST", "21st_sk_2f29889556df41e95a5fde6075f9e73c171bb842289e7b70a0b47b0666e72496")

def call_mcp(method, params=None, req_id=1):
    payload = {
        "jsonrpc": "2.0",
        "id": req_id,
        "method": method,
        "params": params or {}
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=data,
        headers={
            "x-api-key": API_KEY,
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream"
        }
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def search(query, limit=5, item_type="component"):
    res = call_mcp("tools/call", {
        "name": "search",
        "arguments": {"query": query, "limit": limit, "type": item_type}
    })
    for content in res.get("result", {}).get("content", []):
        print(content.get("text", ""))

def get_component(component_id):
    res = call_mcp("tools/call", {
        "name": "get_component",
        "arguments": {"id": int(component_id)}
    })
    for content in res.get("result", {}).get("content", []):
        print(content.get("text", ""))

def list_tools():
    res = call_mcp("tools/list")
    tools = res.get("result", {}).get("tools", [])
    print(f"Connected to 21st.dev MCP Server - Total Tools: {len(tools)}\n")
    for t in tools:
        print(f"• {t.get('name')}: {t.get('description', '')[:120]}...")

def run_stdio():
    """Stdio transport proxy for MCP clients requiring local process execution."""
    session_id = None
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req_data = json.loads(line)
        except json.JSONDecodeError:
            continue
        
        headers = {
            "x-api-key": API_KEY,
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream"
        }
        if session_id:
            headers["mcp-session-id"] = session_id
            
        req = urllib.request.Request(
            API_URL,
            data=line.encode("utf-8"),
            headers=headers
        )
        try:
            with urllib.request.urlopen(req) as resp:
                sess = resp.headers.get("mcp-session-id")
                if sess:
                    session_id = sess
                res_bytes = resp.read()
                if res_bytes and "id" in req_data:
                    sys.stdout.write(res_bytes.decode("utf-8") + "\n")
                    sys.stdout.flush()
        except urllib.error.HTTPError as e:
            if "id" in req_data:
                err_res = {
                    "jsonrpc": "2.0",
                    "id": req_data.get("id"),
                    "error": {"code": e.code, "message": str(e.read().decode("utf-8"))}
                }
                sys.stdout.write(json.dumps(err_res) + "\n")
                sys.stdout.flush()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="21st.dev MCP Client")
    subparsers = parser.add_subparsers(dest="subcommand")

    # tools
    subparsers.add_parser("tools", help="List all available MCP tools")

    # search
    p_search = subparsers.add_parser("search", help="Search 21st.dev components")
    p_search.add_argument("query", help="Component search query")
    p_search.add_argument("-n", "--limit", type=int, default=5, help="Number of results")

    # get
    p_get = subparsers.add_parser("get", help="Get code for a component by ID")
    p_get.add_argument("id", type=int, help="Component ID")

    # stdio
    subparsers.add_parser("stdio", help="Run as stdio MCP bridge server")

    args = parser.parse_args()

    if args.subcommand == "tools":
        list_tools()
    elif args.subcommand == "search":
        search(args.query, args.limit)
    elif args.subcommand == "get":
        get_component(args.id)
    elif args.subcommand == "stdio":
        run_stdio()
    else:
        list_tools()
