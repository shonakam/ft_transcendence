#!/usr/bin/env bash

# LOGIN URL
# curl https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-9e607539ebde05b68b59a5102e9cc13cd12d1c822626c06b952970fef1992a11&redirect_uri=https%3A%2F%2Ftranscendence.42.fr%2Fauth%2Fcallback&response_type=code

AUTH_CODE=""
PROVIDER=ft
curl -X POST "http://localhost:8080/api/v1/auth/login/oidc/${PROVIDER}" \
    -H "Content-Type: application/json" \
    -d "{\"code\": \"$AUTH_CODE\"}"
