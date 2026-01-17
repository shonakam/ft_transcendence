#!/bin/bash
# =============================================================================
# 列出 Vault 中所有 Secrets
# 使用：./scripts/vault/list.sh
# =============================================================================

if [ -z "$VAULT_TOKEN" ]; then
    echo "请先设置 VAULT_TOKEN 环境变量"
    echo "export VAULT_TOKEN=<your-token>"
    exit 1
fi

echo "Vault Secrets 列表："
echo ""

docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault kv list secret/

echo ""
echo "Backend secrets:"
docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault kv list secret/backend/ 2>/dev/null || echo "(空)"
