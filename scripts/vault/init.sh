#!/bin/bash
# =============================================================================
# Vault Initialization Script
# Purpose: Initialize Vault in a new environment and store necessary secrets
# Usage: ./scripts/vault/init.sh
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo "       Vault Initialization Script"
echo "=========================================="
echo ""

# Check if Vault container is running
if ! docker ps | grep -q "vault"; then
    echo -e "${RED}❌ Vault container is not running${NC}"
    echo "Run first: docker compose up -d vault"
    exit 1
fi

# Check Vault status
VAULT_STATUS=$(docker exec vault vault status -format=json 2>/dev/null || echo '{"initialized":false}')
INITIALIZED=$(echo $VAULT_STATUS | jq -r '.initialized')
SEALED=$(echo $VAULT_STATUS | jq -r '.sealed')

echo "Vault Status Check:"
echo "  - Initialized: $INITIALIZED"
echo "  - Sealed: $SEALED"
echo ""

# ============= Initialize =============
if [ "$INITIALIZED" = "false" ]; then
    echo -e "${YELLOW}🔧 Vault not initialized, starting initialization...${NC}"
    
    INIT_OUTPUT=$(docker exec vault vault operator init -key-shares=1 -key-threshold=1 -format=json)
    
    UNSEAL_KEY=$(echo $INIT_OUTPUT | jq -r '.unseal_keys_b64[0]')
    ROOT_TOKEN=$(echo $INIT_OUTPUT | jq -r '.root_token')
    
    echo ""
    echo -e "${GREEN}✅ Initialization successful!${NC}"
    echo ""
    echo "=========================================="
    echo -e "${RED}⚠️  Please save the information below safely!${NC}"
    echo "=========================================="
    echo "Unseal Key: $UNSEAL_KEY"
    echo "Root Token: $ROOT_TOKEN"
    echo "=========================================="
    echo ""
    
    # Unseal
    echo "🔓 Unsealing Vault..."
    docker exec vault vault operator unseal $UNSEAL_KEY > /dev/null
    echo -e "${GREEN}✅ Unsealing successful${NC}"
    
    export VAULT_TOKEN=$ROOT_TOKEN
else
    echo -e "${GREEN}✅ Vault is already initialized${NC}"
    
    # Check if unseal is needed
    if [ "$SEALED" = "true" ]; then
        echo ""
        echo -e "${YELLOW}⚠️  Vault is sealed, needs to be unsealed${NC}"
        read -p "Please enter Unseal Key: " UNSEAL_KEY
        docker exec vault vault operator unseal $UNSEAL_KEY > /dev/null
        echo -e "${GREEN}✅ Unsealing successful${NC}"
    fi
    
    # Get token
    echo ""
    read -p "Please enter Vault Root Token: " ROOT_TOKEN
    export VAULT_TOKEN=$ROOT_TOKEN
fi

# ============= Enable KV Engine =============
echo ""
echo "📦 Checking KV secrets engine..."
docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault secrets enable -path=secret kv-v2 2>/dev/null && \
    echo -e "${GREEN}✅ KV engine enabled${NC}" || \
    echo -e "${GREEN}✅ KV engine already exists${NC}"

# ============= Store Secrets =============
echo ""
echo "🔐 Storing Secrets..."

# Check if JWT secrets already exist
EXISTING_JWT=$(docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault kv get secret/backend/jwt 2>/dev/null || echo "")

if [ -z "$EXISTING_JWT" ]; then
    echo ""
    echo "Generating new JWT Secrets..."
    
    # Generate random secrets
    JWT_ACCESS=$(openssl rand -base64 32)
    JWT_REFRESH=$(openssl rand -base64 32)
    JWT_TMP=$(openssl rand -base64 32)
    
    docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault kv put secret/backend/jwt \
        access_secret="$JWT_ACCESS" \
        refresh_secret="$JWT_REFRESH" \
        tmp_auth_secret="$JWT_TMP" > /dev/null
    
    echo -e "${GREEN}✅ JWT secrets generated and stored${NC}"
else
    echo -e "${GREEN}✅ JWT secrets already exist${NC}"
fi

# Check 42 OAuth
EXISTING_OAUTH=$(docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault kv get secret/backend/oauth 2>/dev/null || echo "")

if [ -z "$EXISTING_OAUTH" ]; then
    echo ""
    echo -e "${YELLOW}📝 Need to configure 42 OAuth credentials${NC}"
    echo "(If you don't have them, just press Enter to skip, can configure later)"
    echo ""
    read -p "42 Client ID: " CLIENT_ID
    read -p "42 Client Secret: " CLIENT_SECRET
    
    if [ -n "$CLIENT_ID" ]; then
        docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault kv put secret/backend/oauth \
            client_id="$CLIENT_ID" \
            client_secret="$CLIENT_SECRET" > /dev/null
        echo -e "${GREEN}✅ 42 OAuth stored${NC}"
    else
        # Store empty placeholder
        docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault kv put secret/backend/oauth \
            client_id="" \
            client_secret="" > /dev/null
        echo -e "${YELLOW}⚠️  Empty placeholder created, please update later using put.sh${NC}"
    fi
else
    echo -e "${GREEN}✅ 42 OAuth already exists${NC}"
fi

# ============= Complete =============
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Vault initialization complete!${NC}"
echo "=========================================="
echo ""
echo "Please add the following to .env.local:"
echo ""
echo "VAULT_ENDPOINT=https://vault:8200"
echo "VAULT_TOKEN=$ROOT_TOKEN"
echo "VAULT_SKIP_VERIFY=true"
echo ""
echo "Then restart backend:"
echo "docker compose restart backend"
echo ""
