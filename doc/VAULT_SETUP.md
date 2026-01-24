# Vault Automation Configuration Guide

## ✅ Completed Fixes

All Vault-related issues have been fixed and fully automated!

## 🎯 Automation Content

When you run `make up-app` or `make all`, the system automatically:

1. ✅ Generate Vault TLS certificate (self-signed)
2. ✅ Create Vault configuration file
3. ✅ Start Vault container
4. ✅ Initialize Vault (on first startup)
5. ✅ Automatically unseal Vault
6. ✅ Generate and store random secrets:
   - JWT access_secret
   - JWT refresh_secret  
   - JWT tmp_auth_secret
   - Cookie secret
   - OAuth placeholder
7. ✅ Update VAULT_TOKEN in .env.local
8. ✅ Backend automatically loads secrets from Vault

## 🔑 Access Vault Web UI

- **URL**: https://localhost:8200
- **Root Token**: View the `.secrets/vault-keys.txt` file
- Accept self-signed certificate warning in browser

## 👤 Quick Start for Code Review (Copy this!)

### ✅ Root Token (Permanently valid)
```
<ROOT_TOKEN_FROM_vault-keys.txt>
```

**Location**: `containers/application/.secrets/vault-keys.txt`

### Login Steps

1. **Open Vault UI**: https://localhost:8200
2. **Login Method**: Select **Method** → **Token**
3. **Paste Token**: Copy the token above into the input field
4. **Click Sign in**
5. **View Secrets**:
   - Left menu → **Secrets**
   - Click **secret** engine
   - Expand **backend** directory
   - See `jwt`, `oauth`, `cookie` three secret files

**Key Point**: This token is permanently valid, can still be used after system restart, no need to regenerate

## 📁 Important File Locations

```
containers/application/
├── .secrets/
│   ├── vault-config.hcl          # Vault server configuration
│   ├── vault-keys.txt             # ⚠️ Root Token and Unseal Key (generated)
│   └── certs/
│       └── vault/
│           ├── vault.crt          # TLS certificate
│           └── vault.key          # TLS private key
├── .env.local                     # Contains VAULT_TOKEN
└── tools/
    ├── auto-vault-init.sh         # 🆕 Automatic initialization script
    ├── gen-vault-cert.sh          # Certificate generation script
    └── vault/
        └── policies/              # Vault access policies
            ├── backend.hcl
            ├── frontend.hcl
            └── database.hcl
```

## 🔧 Manual Operations (Optional)

### Configure 42 OAuth Credentials

**Method 1: Using script (Recommended)**
```bash
# 1. Export token
export VAULT_TOKEN=$(sed -n 's/^Root Token: //p' containers/application/.secrets/vault-keys.txt)

# 2. Run script
bash scripts/vault/put-oauth.sh
# Will prompt for:
# - 42 Client ID
# - 42 Client Secret
```

**Method 2: Configure in Vault Web UI**
1. Login to https://localhost:8200
2. Secrets → secret → backend → oauth
3. Click "Create new version +"
4. Fill in:
   - `client_id`: Your 42 OAuth Client ID
   - `client_secret`: Your 42 OAuth Client Secret
5. Save

**Method 3: Direct command line write**
```bash
export VAULT_TOKEN=$(sed -n 's/^Root Token: //p' containers/application/.secrets/vault-keys.txt)

docker exec -e VAULT_TOKEN=$VAULT_TOKEN vault vault kv put secret/backend/oauth \
    client_id="Your Client ID" \
    client_secret="Your Client Secret"
```

**After configuration**: Restart backend for changes to take effect
```bash
docker compose restart backend
```

### Secrets Explanation

#### JWT Secrets
- **Purpose**: Generate and verify JWT access tokens
- **Contains**:
  - `access_secret`: Short-lived access token (15 minutes)
  - `refresh_secret`: Long-lived refresh token (1 day)
  - `tmp_auth_secret`: Temporary auth token (2FA flow)
- **Generation**: System automatically generates random keys

#### Cookie Secret
- **Purpose**: Sign and verify HTTP cookies, prevent tampering
- **Use Cases**:
  - Session management
  - CSRF protection
  - Secure cookie encryption
- **Generation**: System automatically generates random keys

#### 42 OAuth Credentials
- **Purpose**: 42 Intra OAuth login
- **How to obtain**:
  1. Visit https://profile.intra.42.fr/oauth/applications
  2. Create new application
  3. Set Redirect URI to: `https://transcendence.42.fr/auth/callback`
  4. Get Client ID and Secret
- **Store to Vault**: Use methods above to configure
- **Backend reads**: Automatically loaded from Vault, falls back to environment variables if Vault unavailable

### View Secrets in Vault

```bash
export VAULT_TOKEN=<your root token>
bash scripts/vault/get.sh backend/jwt
bash scripts/vault/get.sh backend/oauth
bash scripts/vault/get.sh backend/cookie
```

### Manually Unseal Vault (if needed)

```bash
docker exec vault vault operator unseal <unseal-key>
```

## 🚀 Quick Start

```bash
# First startup or complete rebuild
make fclean-app
make up-app

# Everything will complete automatically!
```

## ✅ Verify Vault is Working

### 1. Check Vault container status
```bash
docker compose ps vault
```

### 2. Check if Vault is unsealed
```bash
docker exec vault vault status
```

### 3. View Backend logs to confirm Vault connection
```bash
docker compose logs backend | grep -i vault
```

You should see:
```
✅ Vault connected successfully - secrets will be loaded from Vault
```

## 🔒 Security Notes

### Development Environment (Current configuration)
- ✅ VAULT_REQUIRED=false (fallback to environment variables if Vault unavailable)
- ✅ Self-signed certificate (VAULT_SKIP_VERIFY=true)
- ⚠️  Root Token saved in `.secrets/vault-keys.txt`

### Production Environment (Recommended)
- 🔐 Set `VAULT_REQUIRED=true` in .env.local
- 🔐 Use real CA-signed certificates
- 🔐 Use tokens with limited permissions (apply policies/)
- 🔐 Properly protect unseal keys (use Vault's auto-unseal)
- 🔐 Do not commit `.secrets/` directory to git

## 🐛 Troubleshooting

### Vault container fails to start
```bash
docker compose logs vault
```

### Backend cannot connect to Vault
Check if VAULT_TOKEN in .env.local is correctly set

### Vault sealed (locked)
The automatic script will automatically unseal on startup. If manually needed:
```bash
bash containers/application/tools/auto-vault-init.sh
```

## 📝 Issues Fixed

1. ✅ OAuth path mismatch (changed from `42oauth` to `oauth`)
2. ✅ Missing COOKIE_SECRET environment variable
3. ✅ Missing vault-config.hcl configuration file
4. ✅ Missing Vault TLS certificate
5. ✅ Backend can access Vault secrets
6. ✅ Fully automated initialization process

## 🎉 Current Status

- ✅ Vault is running and unsealed
- ✅ Backend is connected to Vault
- ✅ JWT and Cookie secrets loaded from Vault
- ✅ OAuth placeholder created (can be updated manually)
- ✅ Web UI accessible: https://localhost:8200

---

**Generated**: 2026-01-22
**Root Token**: See `.secrets/vault-keys.txt`
