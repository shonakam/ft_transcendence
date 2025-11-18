#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

export ACCESS_TOKEN=$($SCRIPT_DIR/../auth/login.sh | jq -r '.accessToken')

curl -s -X POST "http://localhost:8080/api/v1/auth/logout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d {}
