#!/bin/bash
# =============================================================================
# Vault 初始化脚本
# 用途：在新环境中初始化 Vault 并存入必要的 secrets
# 使用：./scripts/vault/init.sh
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo "       Vault 初始化脚本"
echo "=========================================="
echo ""

# 检查 Vault 容器是否运行
if ! docker ps | grep -q "vault"; then
    echo -e "${RED}❌ Vault 容器未运行${NC}"
    echo "请先执行: docker compose up -d vault"
    exit 1
fi

# 检查 Vault 状态
VAULT_STATUS=$(docker exec vault vault status -format=json 2>/dev/null || echo '{"initialized":false}')
INITIALIZED=$(echo $VAULT_STATUS | jq -r '.initialized')
SEALED=$(echo $VAULT_STATUS | jq -r '.sealed')

echo "Vault 状态检查："
echo "  - 已初始化: $INITIALIZED"
echo "  - 已密封: $SEALED"
echo ""

# ============= 初始化 =============
if [ "$INITIALIZED" = "false" ]; then
    echo -e "${YELLOW}🔧 Vault 未初始化，开始初始化...${NC}"
    
    INIT_OUTPUT=$(docker exec vault vault operator init -key-shares=1 -key-threshold=1 -format=json)
    
    UNSEAL_KEY=$(echo $INIT_OUTPUT | jq -r '.unseal_keys_b64[0]')
    ROOT_TOKEN=$(echo $INIT_OUTPUT | jq -r '.root_token')
    
    echo ""
    echo -e "${GREEN}✅ 初始化成功！${NC}"
    echo ""
    echo "=========================================="
    echo -e "${RED}⚠️  请安全保存以下信息！${NC}"
    echo "=========================================="
    echo "Unseal Key: $UNSEAL_KEY"
    echo "Root Token: $ROOT_TOKEN"
    echo "=========================================="
    echo ""
    
    # 解封
    echo "🔓 解封 Vault..."
    docker exec vault vault operator unseal $UNSEAL_KEY > /dev/null
    echo -e "${GREEN}✅ 解封成功${NC}"
    
    export VAULT_TOKEN=$ROOT_TOKEN
else
    echo -e "${GREEN}✅ Vault 已初始化${NC}"
    
    # 检查是否需要解封
    if [ "$SEALED" = "true" ]; then
        echo ""
        echo -e "${YELLOW}⚠️  Vault 已密封，需要解封${NC}"
        read -p "请输入 Unseal Key: " UNSEAL_KEY
        docker exec vault vault operator unseal $UNSEAL_KEY > /dev/null
        echo -e "${GREEN}✅ 解封成功${NC}"
    fi
    
    # 获取 token
    echo ""
    read -p "请输入 Vault Root Token: " ROOT_TOKEN
    export VAULT_TOKEN=$ROOT_TOKEN
fi

# ============= 启用 KV Engine =============
echo ""
echo "📦 检查 KV secrets engine..."
docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault secrets enable -path=secret kv-v2 2>/dev/null && \
    echo -e "${GREEN}✅ KV engine 已启用${NC}" || \
    echo -e "${GREEN}✅ KV engine 已存在${NC}"

# ============= 存入 Secrets =============
echo ""
echo "🔐 存入 Secrets..."

# 检查是否已有 JWT secrets
EXISTING_JWT=$(docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault kv get secret/backend/jwt 2>/dev/null || echo "")

if [ -z "$EXISTING_JWT" ]; then
    echo ""
    echo "生成新的 JWT Secrets..."
    
    # 生成随机 secrets
    JWT_ACCESS=$(openssl rand -base64 32)
    JWT_REFRESH=$(openssl rand -base64 32)
    JWT_TMP=$(openssl rand -base64 32)
    
    docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault kv put secret/backend/jwt \
        access_secret="$JWT_ACCESS" \
        refresh_secret="$JWT_REFRESH" \
        tmp_auth_secret="$JWT_TMP" > /dev/null
    
    echo -e "${GREEN}✅ JWT secrets 已生成并存入${NC}"
else
    echo -e "${GREEN}✅ JWT secrets 已存在${NC}"
fi

# 检查 42 OAuth
EXISTING_OAUTH=$(docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault kv get secret/backend/42oauth 2>/dev/null || echo "")

if [ -z "$EXISTING_OAUTH" ]; then
    echo ""
    echo -e "${YELLOW}📝 需要配置 42 OAuth 凭证${NC}"
    echo "（如果没有，可以直接按回车跳过，之后再配置）"
    echo ""
    read -p "42 Client ID: " CLIENT_ID
    read -p "42 Client Secret: " CLIENT_SECRET
    
    if [ -n "$CLIENT_ID" ]; then
        docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault kv put secret/backend/42oauth \
            client_id="$CLIENT_ID" \
            client_secret="$CLIENT_SECRET" > /dev/null
        echo -e "${GREEN}✅ 42 OAuth 已存入${NC}"
    else
        # 存入空占位
        docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault kv put secret/backend/42oauth \
            client_id="" \
            client_secret="" > /dev/null
        echo -e "${YELLOW}⚠️  已创建空占位，请稍后使用 put.sh 更新${NC}"
    fi
else
    echo -e "${GREEN}✅ 42 OAuth 已存在${NC}"
fi

# ============= 完成 =============
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Vault 初始化完成！${NC}"
echo "=========================================="
echo ""
echo "请将以下内容添加到 .env.local："
echo ""
echo "VAULT_ENDPOINT=https://vault:8200"
echo "VAULT_TOKEN=$ROOT_TOKEN"
echo "VAULT_SKIP_VERIFY=true"
echo ""
echo "然后重启 backend："
echo "docker compose restart backend"
echo ""
