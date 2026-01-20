# Database Admin Policy
# 数据库管理员只能访问数据库相关密钥

# 允许读取数据库凭证
path "secret/data/database/credentials" {
  capabilities = ["read"]
}

# 允许读取数据库连接配置
path "secret/data/database/connection" {
  capabilities = ["read"]
}

# 禁止访问后端密钥
# path "secret/data/backend/*" - 默认禁止
