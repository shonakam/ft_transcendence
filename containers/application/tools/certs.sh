#!/usr/bin/env bash

DOMAIN_NAME=${ENV_DOMAIN_NAME:-transcendence.42.fr}

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SECRETS_DIR="$SCRIPT_DIR/../.secrets"
CERTS_DIR="$SECRETS_DIR/certs"

# 証明書が既に存在する場合はスキップ
if [ -f "$CERTS_DIR/${DOMAIN_NAME}.crt" ] && [ -f "$CERTS_DIR/${DOMAIN_NAME}.key" ]; then
    echo "SSL証明書は既に存在します。スキップします。"
    exit 0
fi

# .secrets ディレクトリを再作成
sudo rm -rf "$SECRETS_DIR"
mkdir -p "$CERTS_DIR"

# .gitignore を作成（追記ではなく上書き）
cat > "$SECRETS_DIR/.gitignore" << EOF
*
!.gitignore
EOF

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$CERTS_DIR/${DOMAIN_NAME}.key" \
    -out "$CERTS_DIR/${DOMAIN_NAME}.crt" \
    -subj "/C=FR/ST=Ile-de-France/L=Paris/O=42School/OU=Inception/CN=${DOMAIN_NAME}"

chmod 644 "$CERTS_DIR/${DOMAIN_NAME}.key"
chmod 644 "$CERTS_DIR/${DOMAIN_NAME}.crt"

echo "SSL証明書と秘密鍵が '$CERTS_DIR' に生成されました。"
