#!/bin/sh
set -e

vault server -dev &
VAULT_PID=$!

echo "Waiting for Vault to become ready (max 30s)..."
TIMEOUT=30
while [ $TIMEOUT -gt 0 ]; do
    if vault status -sealed=false > /dev/null 2>&1; then
        echo "Vault is ready!"
        break
    fi
    sleep 1
    TIMEOUT=$((TIMEOUT - 1))
done

if [ $TIMEOUT -eq 0 ]; then
    echo "ERROR: Vault failed to unseal or start."
    exit 1
fi

vault kv put secret/transcendence/config @/secrets.json

wait $VAULT_PID
