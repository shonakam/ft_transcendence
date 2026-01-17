#!/bin/bash
# 生成 Vault 自签名证书，供 Vault HTTPS 使用
# 放入 .secrets/certs/vault/ 目录

CERT_DIR="$(dirname "$0")/../.secrets/certs/vault"
mkdir -p "$CERT_DIR"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$CERT_DIR/vault.key" \
  -out "$CERT_DIR/vault.crt" \
  -subj "/CN=vault" \
  -addext "subjectAltName=DNS:vault,DNS:localhost,IP:127.0.0.1"

chmod 600 "$CERT_DIR/vault.key"
chmod 644 "$CERT_DIR/vault.crt"

echo "Vault TLS certificate generated at $CERT_DIR"
