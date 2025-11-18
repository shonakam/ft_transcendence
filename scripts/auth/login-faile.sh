#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

export ACCESS_TOKEN=$($SCRIPT_DIR/../auth/login.sh | jq -r '.accessToken')

sleep 2

curl -s -X GET "http://localhost:8080/api/v1/users/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
