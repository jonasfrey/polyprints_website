#!/bin/bash
# Copyright (C) 2026 Jonas Immanuel Frey - Licensed under GPLv2. See LICENSE file for details

# Self-locate: cd to the directory containing this script
cd "$(dirname "$(readlink -f "$0")")"

# Read PORT from .env
n_port=$(grep -E '^PORT=' .env 2>/dev/null | cut -d'=' -f2)
n_port=${n_port:-8000}

s_url="http://localhost:${n_port}"

# Check if already running by testing the port
if curl -s --max-time 2 "${s_url}" > /dev/null 2>&1; then
    # Already running, just open/focus browser
    xdg-open "${s_url}" > /dev/null 2>&1
    exit 0
fi

# Ensure deno is on PATH (may not be when launched from .desktop file)
export PATH="$HOME/.deno/bin:$PATH"

if ! command -v deno > /dev/null 2>&1; then
    notify-send "Web App" "deno not found. Please install deno first." 2>/dev/null
    exit 1
fi

# Ensure log directory exists
mkdir -p .gitignored

# Start the server in the background, redirect output to a log file
deno task run > .gitignored/server.log 2>&1 &
n_pid=$!

# Wait for the server to become ready (up to 15 seconds)
for n_it in $(seq 1 15); do
    # Check if process is still alive
    if ! kill -0 "$n_pid" 2>/dev/null; then
        notify-send "Web App" "Server crashed on startup. Check .gitignored/server.log" 2>/dev/null
        exit 2
    fi
    if curl -s --max-time 1 "${s_url}" > /dev/null 2>&1; then
        xdg-open "${s_url}" > /dev/null 2>&1
        exit 0
    fi
    sleep 1
done

# If we get here, server didn't start in time
notify-send "Web App" "Server failed to start within 15s. Check .gitignored/server.log" 2>/dev/null
exit 2
