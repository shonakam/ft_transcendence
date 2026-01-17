#!/bin/bash
# =============================================================================
# 查看 Vault 中的 Secrets
# 使用：./scripts/vault/get.sh [path]
# 示例：./scripts/vault/get.sh backend/jwt
# =============================================================================

if [ -z "$VAULT_TOKEN" ]; then
    echo "请先设置 VAULT_TOKEN 环境变量"
    echo "export VAULT_TOKEN=<your-token>"
    exit 1
fi

PATH_TO_GET=${1:-"backend/jwt"}

echo "读取 secret/$PATH_TO_GET ..."
echo ""

docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault kv get secret/$PATH_TO_GET
