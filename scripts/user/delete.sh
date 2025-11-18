#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

export ACCESS_TOKEN=$($SCRIPT_DIR/../auth/login.sh | jq -r '.accessToken')

curl -s -X DELETE "http://localhost:8080/api/v1/users/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "email": "alice@example.com",
    "password": "StrongPassword123!"
  }'
