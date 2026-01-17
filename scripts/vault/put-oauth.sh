#!/bin/bash
# =============================================================================
# 更新 Vault 中的 42 OAuth 凭证
# 使用：./scripts/vault/put-oauth.sh
# =============================================================================

if [ -z "$VAULT_TOKEN" ]; then
    echo "请先设置 VAULT_TOKEN 环境变量"
    echo "export VAULT_TOKEN=<your-token>"
    exit 1
fi

echo "更新 42 OAuth 凭证"
echo ""
read -p "42 Client ID: " CLIENT_ID
read -p "42 Client Secret: " CLIENT_SECRET

docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault kv put secret/backend/42oauth \
    client_id="$CLIENT_ID" \
    client_secret="$CLIENT_SECRET"

echo ""
echo "✅ 已更新！"
