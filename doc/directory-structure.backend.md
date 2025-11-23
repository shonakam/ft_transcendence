# ft_transcendence — Directory Structure

## 1. コアレイヤーの責務と依存関係

### 🔐 依存性ルール
依存関係は **外側 → 内側** に向かう一方向のみ。  
内側の層は外側を一切知らない。

例:  
- `usecase` は `infra` を知らない  
- `adapter` は `usecase` を知る  
- `domain` は何にも依存しない（アプリケーションの核）

---

## 2. バックエンド (src/) 全体構造

```
src/
├── adapter/ # Interfaces（最外層）
├── usecase/ # Application（ユースケース）
├── domain/ # Domain（ビジネスルール）
└── infra/ # Infrastructure（技術的詳細）
```

### 2.1. domain 層（最内層：ビジネスコア）

| パス | 内容 | 責務 |
|------|------|------|
| `domain/{app}/entity/` | User.ts など | ID を持つエンティティ。状態と遷移ロジックを保持 |
| `domain/{app}/vo/` | UserId.ts, Email.ts, AccessToken.ts | 不変性を持った ValueObject。バリデーションもここ |
| `domain/{app}/repository/` | UserRepository.ts | Repository インターフェイスの定義 |
| `domain/auth/vo/` | AuthCode.ts, RefreshToken.ts | 認証専用の VO |

**依存なし（唯一の純粋層）**

---

### 2.2. infra 層（技術的な実装詳細）

| パス | 内容 | 責務 |
|------|------|------|
| `infra/sqlite/db.ts` | SQLite 接続管理、スキーマ初期化 | DB接続とライフサイクル管理 |
| `infra/sqlite/repository/` | UserRepositorySqlite.ts | Repository の SQLite 実装 |
| `infra/redis/redis.ts` | Redis 接続のシングルトン管理 | Redis クライアント管理 |
| `infra/redis/repository/` | VolatileDataRepositoryRedis.ts | セッション・トークンなど揮発データの CRUD |
| `infra/http/` | httpClient.ts | 外部 API / OIDC との通信基盤 |

依存できる層：**Domain**

---

### 2.3. usecase 層（アプリケーションフロー）

| パス | 内容 | 責務 |
|------|------|------|
| `usecase/auth/` | LoginUseCase, RefreshUseCase, TokenService | 認証フロー、セッション管理、トークン生成 |
| `usecase/user/` | CreateUserUseCase, DeleteUserUseCase | ユーザー CRUD のフロー制御 |

依存できる層：**Domain, Infrastructure**

---

### 2.4. adapter 層（外側インターフェース）

| パス | 内容 | 責務 |
|------|------|------|
| `adapter/controller/` | UserController, AuthController | HTTP リクエスト → VO変換、レスポンス返却 |
| `adapter/auth/` | authPreHandler.ts | JWT 検証、401 の生成 |
| `adapter/router/` | index.ts | Fastify のルーティング設定 |

依存できる層：**Usecase**

---

### 3. その他のディレクトリ

| パス | 責務 |
|------|------|
| `container/` | DI コンテナ。Usecase に Repository/Service を紐づけ |
| `utils/` | 汎用関数（uuid, unixtime など） |
| `tools/` | DBスキーマや証明書作成スクリプト等（initialize_schema.sqlなど） |

---
