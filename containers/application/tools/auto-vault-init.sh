#!/bin/bash
# =============================================================================
# Vault Automatic Initialization Script - Silent mode
# Purpose: Automatically initialize and configure Vault on first startup
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$APP_DIR/.env.local"
VAULT_KEYS_FILE="$APP_DIR/.secrets/vault-keys.txt"

# Check if Vault container is running (wait up to 30 seconds)
for i in {1..15}; do
    if docker ps 2>/dev/null | grep -q "ft-vault"; then
        break
    fi
    if [ $i -eq 15 ]; then
        exit 1
    fi
    sleep 2
done

# Wait for Vault service to be fully ready
sleep 3

# Check if Vault is already initialized
VAULT_STATUS=$(docker exec ft-vault vault status 2>&1 || true)
if echo "$VAULT_STATUS" | grep -q "Initialized.*true"; then
    # Check if it's unsealed
    if echo "$VAULT_STATUS" | grep -q "Sealed.*false"; then
        exit 0
    else
        # Vault is sealed, try to unseal
        if [ -f "$VAULT_KEYS_FILE" ]; then
            UNSEAL_KEY=$(grep "Unseal Key" "$VAULT_KEYS_FILE" | cut -d: -f2 | tr -d ' ')
            docker exec ft-vault vault operator unseal "$UNSEAL_KEY" >/dev/null 2>&1
            exit 0
        else
            # No saved key found, but Vault data exists
            # Cannot unseal without the key - exit silently
            exit 1
        fi
    fi
fi

# ============= Initialize Vault =============
# Initialize Vault
INIT_OUTPUT=$(docker exec ft-vault vault operator init -key-shares=1 -key-threshold=1 2>&1)

UNSEAL_KEY=$(echo "$INIT_OUTPUT" | grep "Unseal Key 1" | cut -d: -f2 | tr -d ' ')
ROOT_TOKEN=$(echo "$INIT_OUTPUT" | grep "Initial Root Token" | cut -d: -f2 | tr -d ' ')

# Save keys to file
mkdir -p "$(dirname "$VAULT_KEYS_FILE")"
cat > "$VAULT_KEYS_FILE" << EOF
Vault Keys and Tokens
Generated: $(date)
==========================================
Unseal Key: $UNSEAL_KEY
Root Token: $ROOT_TOKEN
==========================================
⚠️  Please keep this file safe!
EOF

chmod 600 "$VAULT_KEYS_FILE"

# Unseal Vault
docker exec ft-vault vault operator unseal "$UNSEAL_KEY" >/dev/null 2>&1

# ============= Enable KV Engine =============
docker exec -e VAULT_TOKEN="$ROOT_TOKEN" vault vault secrets enable -path=secret kv-v2 >/dev/null 2>&1

# ============= Generate and Store Secrets =============
# Generate random secrets
JWT_ACCESS=$(openssl rand -base64 32)
JWT_REFRESH=$(openssl rand -base64 32)
JWT_TMP=$(openssl rand -base64 32)
COOKIE_SECRET=$(openssl rand -base64 32)

# Store JWT secrets
docker exec -e VAULT_TOKEN="$ROOT_TOKEN" vault vault kv put secret/backend/jwt \
    access_secret="$JWT_ACCESS" \
    refresh_secret="$JWT_REFRESH" \
    tmp_auth_secret="$JWT_TMP" >/dev/null 2>&1

# Store Cookie secret
docker exec -e VAULT_TOKEN="$ROOT_TOKEN" vault vault kv put secret/backend/cookie \
    secret="$COOKIE_SECRET" >/dev/null 2>&1

# Store empty OAuth placeholder (can be updated later manually)
docker exec -e VAULT_TOKEN="$ROOT_TOKEN" vault vault kv put secret/backend/oauth \
    client_id="" \
    client_secret="" >/dev/null 2>&1

# ============= Update .env.local =============
if [ -f "$ENV_FILE" ]; then
    # Use sed to update VAULT_TOKEN
    if grep -q "^VAULT_TOKEN=" "$ENV_FILE"; then
        sed -i "s|^VAULT_TOKEN=.*|VAULT_TOKEN=$ROOT_TOKEN|" "$ENV_FILE"
    else
        echo "VAULT_TOKEN=$ROOT_TOKEN" >> "$ENV_FILE"
    fi
fi

exit 0

