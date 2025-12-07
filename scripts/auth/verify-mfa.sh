#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

$SCRIPT_DIR/../user/create.sh &> /dev/null 
export TMP_AUTH_TOKEN=$($SCRIPT_DIR/../auth/login.sh | jq -r '.tmpAuthToken')

CODE=745256

curl -s -X POST "http://localhost:8080/api/v1/auth/verify-mfa/totp" \
  -H "Content-Type: application/json" \
  -d "{\"tmpAuthToken\": \"$TMP_AUTH_TOKEN\", \"code\": \"$CODE\"}"
