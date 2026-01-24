#!/bin/bash
# Vault Policy Setup Script
# 创建策略并为每个服务生成隔离的 token

set -e

VAULT_ADDR="${VAULT_ADDR:-https://localhost:8200}"
VAULT_TOKEN="${VAULT_TOKEN:-}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
POLICY_DIR="${SCRIPT_DIR}/../.secrets/policies"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Vault Policy Setup ===${NC}"

if [ -z "$VAULT_TOKEN" ]; then
    echo -e "${RED}Error: VAULT_TOKEN is not set${NC}"
    echo "Please export VAULT_TOKEN=<your-root-token>"
    exit 1
fi

# Vault CLI 命令（使用 curl 以支持自签名证书）
vault_api() {
    local method=$1
    local path=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -sk -X "$method" \
            -H "X-Vault-Token: $VAULT_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "${VAULT_ADDR}/v1/${path}"
    else
        curl -sk -X "$method" \
            -H "X-Vault-Token: $VAULT_TOKEN" \
            "${VAULT_ADDR}/v1/${path}"
    fi
}

# 检查 Vault 状态
echo -e "\n${YELLOW}Checking Vault status...${NC}"
STATUS=$(curl -sk "${VAULT_ADDR}/v1/sys/health" | grep -o '"sealed":[^,]*' | cut -d: -f2)
if [ "$STATUS" = "true" ]; then
    echo -e "${RED}Error: Vault is sealed. Please unseal first.${NC}"
    exit 1
fi
echo -e "${GREEN}Vault is unsealed and ready.${NC}"

# 创建 Backend Policy
echo -e "\n${YELLOW}Creating backend policy...${NC}"
BACKEND_POLICY=$(cat "$POLICY_DIR/backend.hcl" | sed 's/"/\\"/g' | tr '\n' ' ')
vault_api PUT "sys/policies/acl/backend" "{\"policy\": \"$(cat $POLICY_DIR/backend.hcl | sed ':a;N;$!ba;s/\n/\\n/g' | sed 's/"/\\"/g')\"}"
echo -e "${GREEN}Backend policy created.${NC}"

# 创建 Database Policy
echo -e "\n${YELLOW}Creating database policy...${NC}"
vault_api PUT "sys/policies/acl/database" "{\"policy\": \"$(cat $POLICY_DIR/database.hcl | sed ':a;N;$!ba;s/\n/\\n/g' | sed 's/"/\\"/g')\"}"
echo -e "${GREEN}Database policy created.${NC}"

# 创建 Frontend Policy
echo -e "\n${YELLOW}Creating frontend policy...${NC}"
vault_api PUT "sys/policies/acl/frontend" "{\"policy\": \"$(cat $POLICY_DIR/frontend.hcl | sed ':a;N;$!ba;s/\n/\\n/g' | sed 's/"/\\"/g')\"}"
echo -e "${GREEN}Frontend policy created.${NC}"

# 生成 Backend Token (绑定 backend policy)
echo -e "\n${YELLOW}Generating backend service token...${NC}"
BACKEND_TOKEN_RESP=$(vault_api POST "auth/token/create" '{"policies": ["backend"], "ttl": "720h", "display_name": "backend-service"}')
BACKEND_TOKEN=$(echo "$BACKEND_TOKEN_RESP" | grep -o '"client_token":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}Backend token generated.${NC}"

# 生成 Database Token (绑定 database policy)
echo -e "\n${YELLOW}Generating database service token...${NC}"
DB_TOKEN_RESP=$(vault_api POST "auth/token/create" '{"policies": ["database"], "ttl": "720h", "display_name": "database-service"}')
DB_TOKEN=$(echo "$DB_TOKEN_RESP" | grep -o '"client_token":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}Database token generated.${NC}"

# 输出结果
echo -e "\n${GREEN}=== Policy Setup Complete ===${NC}"
echo ""
echo -e "${YELLOW}Service Tokens (save these securely):${NC}"
echo "----------------------------------------"
echo -e "VAULT_BACKEND_TOKEN=${GREEN}${BACKEND_TOKEN}${NC}"
echo -e "VAULT_DATABASE_TOKEN=${GREEN}${DB_TOKEN}${NC}"
echo "----------------------------------------"
echo ""
echo -e "${YELLOW}Update your .env.local with:${NC}"
echo "VAULT_TOKEN=${BACKEND_TOKEN}  # For backend service"
echo ""
echo -e "${YELLOW}Policies created:${NC}"
echo "- backend: Can only read secret/data/backend/*"
echo "- database: Can only read secret/data/database/*"
echo "- frontend: Can only read secret/data/frontend/config"
echo ""
echo -e "${GREEN}Isolation is now enforced!${NC}"
