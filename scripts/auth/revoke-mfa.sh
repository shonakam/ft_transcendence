#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

ACCESS_TOKEN=""

curl -s -X DELETE "http://localhost:8080/api/v1/auth/revoke-mfa/totp" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d {}
