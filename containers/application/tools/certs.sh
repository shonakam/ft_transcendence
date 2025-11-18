#!/usr/bin/env bash

DOMAIN_NAME=${ENV_DOMAIN_NAME:-transcenders.42.fr}

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SCRIPT_DIR+="/../.secrets/certs"

sudo rm -rf $SCRIPT_DIR/../../.secrets
mkdir -p $SCRIPT_DIR

echo "certs" >> $SCRIPT_DIR/../.gitignore
echo "certs/${DOMAIN_NAME}.key" >> $SCRIPT_DIR/../.gitignore
echo "certs/${DOMAIN_NAME}.crt" >> $SCRIPT_DIR/../.gitignore

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout $SCRIPT_DIR/${DOMAIN_NAME}.key \
    -out $SCRIPT_DIR/${DOMAIN_NAME}.crt \
    -subj "/C=FR/ST=Ile-de-France/L=Paris/O=42School/OU=Inception/CN=${DOMAIN_NAME}"

echo "SSL証明書と秘密鍵が '$SCRIPT_DIR' に生成されました。"
