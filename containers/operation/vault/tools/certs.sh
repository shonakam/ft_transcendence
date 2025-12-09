#!/bin/bash

CERT_DIR="/vault/certs"
mkdir -p $CERT_DIR

openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout "$CERT_DIR/private-key.pem" \
    -out "$CERT_DIR/full-chain.pem" \
    -subj "/CN=ft-vault"
