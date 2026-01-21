#!/bin/bash
# =============================================================================
# Vault Automatic Initialization Script - Fully automated, no manual intervention required
# Purpose: Automatically initialize and configure Vault on first startup
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$APP_DIR/.env.local"
VAULT_KEYS_FILE="$APP_DIR/.secrets/vault-keys.txt"

echo ""
echo "=========================================="
echo "   Vault Automatic Initialization Script"
echo "=========================================="
echo ""

# Check if Vault container is running (wait up to 30 seconds)
echo "🔍 Checking Vault container status..."
for i in {1..15}; do
    if docker ps | grep -q "vault"; then
        echo -e "${GREEN}✅ Vault container has started${NC}"
        break
    fi
    if [ $i -eq 15 ]; then
        echo -e "${RED}❌ Vault container startup timeout${NC}"
        exit 1
    fi
    echo "⏳ Waiting for Vault container... ($i/15)"
    sleep 2
done

# Wait for Vault service to be fully ready
echo "⏳ Waiting for Vault service to be ready..."
sleep 3

# Check if Vault is already initialized
VAULT_STATUS=$(docker exec vault vault status 2>&1 || true)
if echo "$VAULT_STATUS" | grep -q "Initialized.*true"; then
    echo -e "${GREEN}✅ Vault is already initialized${NC}"
    
    # Check if it's unsealed
    if echo "$VAULT_STATUS" | grep -q "Sealed.*false"; then
        echo -e "${GREEN}✅ Vault is unsealed${NC}"
    else
        echo -e "${YELLOW}⚠️  Vault is sealed, attempting to unseal from saved key file...${NC}"
        if [ -f "$VAULT_KEYS_FILE" ]; then
            UNSEAL_KEY=$(grep "Unseal Key" "$VAULT_KEYS_FILE" | cut -d: -f2 | tr -d ' ')
            docker exec vault vault operator unseal "$UNSEAL_KEY" > /dev/null
            echo -e "${GREEN}✅ Unsealing successful${NC}"
        else
            echo -e "${RED}❌ Saved unseal key not found${NC}"
            exit 1
        fi
    fi
    
    echo ""
    echo -e "${GREEN}✅ Vault is ready!${NC}"
    exit 0
fi

# ============= Initialize Vault =============
echo -e "${YELLOW}🔧 Vault not initialized, starting automatic initialization...${NC}"

# Initialize Vault
INIT_OUTPUT=$(docker exec vault vault operator init -key-shares=1 -key-threshold=1 2>&1)

UNSEAL_KEY=$(echo "$INIT_OUTPUT" | grep "Unseal Key 1" | cut -d: -f2 | tr -d ' ')
ROOT_TOKEN=$(echo "$INIT_OUTPUT" | grep "Initial Root Token" | cut -d: -f2 | tr -d ' ')

echo ""
echo -e "${GREEN}✅ Initialization successful!${NC}"

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
echo -e "${GREEN}✅ Keys saved to: $VAULT_KEYS_FILE${NC}"

# Unseal Vault
echo ""
echo "🔓 Unsealing Vault..."
docker exec vault vault operator unseal "$UNSEAL_KEY" > /dev/null
echo -e "${GREEN}✅ Unsealing successful${NC}"

# ============= Enable KV Engine =============
echo ""
echo "📦 Enabling KV secrets engine..."
docker exec -e VAULT_TOKEN="$ROOT_TOKEN" vault vault secrets enable -path=secret kv-v2 2>&1 > /dev/null && \
    echo -e "${GREEN}✅ KV engine enabled${NC}"

# ============= Generate and Store Secrets =============
echo ""
echo "🔐 Generating and storing Secrets..."

# Generate random secrets
JWT_ACCESS=$(openssl rand -base64 32)
JWT_REFRESH=$(openssl rand -base64 32)
JWT_TMP=$(openssl rand -base64 32)
COOKIE_SECRET=$(openssl rand -base64 32)

# Store JWT secrets
docker exec -e VAULT_TOKEN="$ROOT_TOKEN" vault vault kv put secret/backend/jwt \
    access_secret="$JWT_ACCESS" \
    refresh_secret="$JWT_REFRESH" \
    tmp_auth_secret="$JWT_TMP" > /dev/null

echo -e "${GREEN}✅ JWT secrets generated and stored${NC}"

# Store Cookie secret
docker exec -e VAULT_TOKEN="$ROOT_TOKEN" vault vault kv put secret/backend/cookie \
    secret="$COOKIE_SECRET" > /dev/null

echo -e "${GREEN}✅ Cookie secret generated and stored${NC}"

# Store empty OAuth placeholder (can be updated later manually)
docker exec -e VAULT_TOKEN="$ROOT_TOKEN" vault vault kv put secret/backend/oauth \
    client_id="" \
    client_secret="" > /dev/null

echo -e "${GREEN}✅ OAuth placeholder created${NC}"

# ============= Update .env.local =============
echo ""
echo "📝 Updating .env.local file..."

if [ -f "$ENV_FILE" ]; then
    # Use sed to update VAULT_TOKEN
    if grep -q "^VAULT_TOKEN=" "$ENV_FILE"; then
        sed -i "s|^VAULT_TOKEN=.*|VAULT_TOKEN=$ROOT_TOKEN|" "$ENV_FILE"
    else
        echo "VAULT_TOKEN=$ROOT_TOKEN" >> "$ENV_FILE"
    fi
    echo -e "${GREEN}✅ .env.local updated${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local does not exist, skipping update${NC}"
fi

# ============= Complete =============
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Vault automatic initialization complete!${NC}"
echo "=========================================="
echo ""
echo "Key information saved to: $VAULT_KEYS_FILE"
echo ""
echo -e "${YELLOW}Tips:${NC}"
echo "1. To configure 42 OAuth, run: bash scripts/vault/put-oauth.sh"
echo "2. Restart backend to use Vault: docker compose restart backend"
echo ""

