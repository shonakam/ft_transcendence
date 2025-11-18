#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

export REFRESH_TOKEN=$($SCRIPT_DIR/../auth/login.sh | jq -r '.refreshToken')

sleep 2 # waiting restore refreshToken

curl -s -X POST "http://localhost:8080/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
