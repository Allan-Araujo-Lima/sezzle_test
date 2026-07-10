#!/bin/sh
set -e

# Sobe o backend Go em background (porta 8080, interna ao container)
/app/server &
backend_pid=$!

# Se o nginx cair, derruba o backend também
trap 'kill "$backend_pid" 2>/dev/null' EXIT INT TERM

# nginx em foreground mantém o container vivo
nginx -g 'daemon off;'
