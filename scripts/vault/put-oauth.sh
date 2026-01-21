#!/bin/bash
# =============================================================================
# Update 42 OAuth Credentials in Vault
# Usage: ./scripts/vault/put-oauth.sh
# =============================================================================

if [ -z "$VAULT_TOKEN" ]; then
    echo "Please set the VAULT_TOKEN environment variable first"
    echo "export VAULT_TOKEN=<your-token>"
    exit 1
fi

echo "Update 42 OAuth Credentials"
echo ""
read -p "42 Client ID: " CLIENT_ID
read -p "42 Client Secret: " CLIENT_SECRET

docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault kv put secret/backend/oauth \
    client_id="$CLIENT_ID" \
    client_secret="$CLIENT_SECRET"

echo ""
echo "✅ Updated!"
