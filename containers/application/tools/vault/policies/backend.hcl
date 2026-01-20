# Backend Service Policy
# 只允许后端读取其自身需要的密钥，不能访问其他服务的密钥

# 允许读取 JWT secrets
path "secret/data/backend/jwt" {
  capabilities = ["read"]
}

# 允许读取 OAuth credentials
path "secret/data/backend/oauth" {
  capabilities = ["read"]
}

# 允许读取 cookie secret
path "secret/data/backend/cookie" {
  capabilities = ["read"]
}

# 允许读取 session secret
path "secret/data/backend/session" {
  capabilities = ["read"]
}

# 禁止访问数据库管理员密钥
# path "secret/data/database/*" - 默认禁止（未授权即禁止）

# 禁止访问其他服务的密钥
# path "secret/data/frontend/*" - 默认禁止
# path "secret/data/admin/*" - 默认禁止
