# Volatile Data Structure (Redis Key Structure)

## 1. 命名規則（Key Naming Convention）

Redisキーは、衝突を防ぎ、監査と運用を容易にするため、以下の形式で統一します。

`{Prefix}:{Identifier}:{Field}`

## 2. コアキーの定義

### 2.1 認証セッション (Authentication Sessions) / 2FA (二要素認証)
* **構造:** 1ユーザーにつき1つのアクティブセッションを管理。パスワード検証からTOTPコード検証までの間、ユーザーを識別するために使用。

| 目的 | キーの形式 | 値の型 | TTL (有効期間) | 役割 |
| :--- | :--- | :--- | :--- | :--- |
| リフレッシュトークン | `session:refresh:{user_id}` | String (RefreshToken) | 30日 (スライディング) | リフレッシュトークンの状態管理 |
| 2FA検証セッション | `2fa:totp:{temporary_token_id}` | String (User ID) | 15分 (一時的なセッション) | 2FA TOTP検証 |
| 2FA検証セッション | `2fa:email:{temporary_token_id}` | String (User ID) | 15分 (一時的なセッション) | 2FA TOTP検証 |


### 2.2 ゲームセッション (Game Sessions)

* **役割:** リアルタイムでの状態更新、ソケットIDのマッピング。

| 目的 | キーの形式 | 値の型 | TTL (有効期間) | 役割 |
| :--- | :--- | :--- | :--- |
| オンライン状態 | `login-status:{user_id}` | String ('online') | - (接続が切れたら削除) |
| ゲームルーム状態 | `game-status:{channel_id}` | Hash (プレイヤー、スコア) | ゲーム終了まで |
| ソケットIDマッピング | `game-socket:{channel_id}` | String (WebSocket ID) | - (接続が切れたら削除) |
| チャットIDマッピング | `chat-socket:{channel_id}` | String (WebSocket ID) | - (接続が切れたら削除) |

## 3. Pub/Subの定義 (リアルタイムイベント)

| チャネル名 | 送信するデータ | 送信元 | 目的 |
| :--- | :--- | :--- | :--- |
| `event:broadcast` | `{ "type": "message", "room": "chat_general", ... }` | サーバーインスタンス | チャットやゲームの状態変更を全インスタンスに通知し、WebSocket経由でクライアントに配信する。 |
| `socket:disconnect` | `{ "user_id": "uuid" }` | サーバーインスタンス | ユーザー切断イベントを通知し、他のサーバーにオンライン状態の更新を促す。 |
