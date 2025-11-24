#!/usr/bin/env bash

# curl -s -X POST "http://localhost:8080/api/v1/users" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "email": "testuser_'"$(date +%s%N)"'@example.com",
#     "username": "'"$(date +%s)"'",
#     "password": "StrongPassword123!",
#     "imagePath": null
#   }'

curl -s -X POST "http://localhost:8080/api/v1/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "username": "alice",
    "password": "StrongPassword123!",
    "imagePath": null,
    "is2faEnabled": "true"
  }'
