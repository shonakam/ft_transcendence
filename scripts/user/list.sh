#!/usr/bin/env bash

curl -s -X GET "http://localhost:8080/api/v1/users/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
