# Frontend Policy (if needed)
# 前端通常不直接访问 Vault，但如果需要可以设置只读公开配置

# 只允许读取公开配置（非敏感）
path "secret/data/frontend/config" {
  capabilities = ["read"]
}

# 禁止访问任何敏感密钥
# path "secret/data/backend/*" - 默认禁止
# path "secret/data/database/*" - 默认禁止
