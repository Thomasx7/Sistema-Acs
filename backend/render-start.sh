#!/bin/sh
set -eu

# Migrations e seeds são preparados separadamente, após revisar o banco.
exec gunicorn --bind "0.0.0.0:${PORT:-10000}" --workers 1 --threads 4 --timeout 120 'app:create_app()'
