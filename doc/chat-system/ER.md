# チャットシステム ER図・テーブル設計

## 1. ER図 (Mermaid)

```{mermaid}
erDiagram
    users ||--o{ chat_room_members : "is member of"
    users ||--o{ chat_messages : "sends"
    users ||--o{ user_blocks : "blocks / is blocked"

    chat_rooms ||--|{ chat_room_members : "contains"
    chat_rooms ||--o{ chat_messages : "has"

    users {
        TEXT id PK "UUID"
        TEXT email "Unique"
        TEXT username "Unique"
    }

    chat_rooms {
        TEXT id PK "UUID"
        TEXT name "Room Name"
        TEXT type "global / dm"
        INTEGER createdAt "Unix Time"
    }

    chat_room_members {
        TEXT id PK "UUID"
        TEXT room_id FK "References chat_rooms(id)"
        TEXT user_id FK "References users(id)"
        INTEGER createdAt "Unix Time"
    }

    chat_messages {
        TEXT id PK "UUID"
        TEXT room_id FK "References chat_rooms(id)"
        TEXT sender_id FK "References users(id)"
        TEXT content "Message text / Invite data"
        TEXT message_type "'text' | 'invitation'"
        INTEGER createdAt "Unix Time"
    }

    user_blocks {
        TEXT id PK "UUID"
        TEXT blocker_id FK "References users(id)"
        TEXT blocked_id FK "References users(id)"
        INTEGER createdAt "Unix Time"
    }
```

## 2. テーブル定義詳細

### 2.1 chat_rooms
| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| id | TEXT | PRIMARY KEY | ルームの一意識別子 (UUID) |
| name | TEXT | - | ルームの表示名（グローバルチャット用など） |
| type | TEXT | NOT NULL | 'global' または 'dm' |
| createdAt | INTEGER | NOT NULL | 作成日時 (Unix Time) |

### 2.2 chat_room_members
| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| id | TEXT | PRIMARY KEY | 一意識別子 (UUID) |
| room_id | TEXT | FK, NOT NULL | `chat_rooms.id` を参照 |
| user_id | TEXT | FK, NOT NULL | `users.id` を参照 |
| createdAt | INTEGER | NOT NULL | 参加/作成日時 (Unix Time) |

- **制約**: `UNIQUE(room_id, user_id)`
- **外部キー**: `ON DELETE CASCADE` 推奨

### 2.3 chat_messages
| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| id | TEXT | PRIMARY KEY | メッセージ一意識別子 (UUID) |
| room_id | TEXT | FK, NOT NULL | `chat_rooms.id` を参照 |
| sender_id | TEXT | FK, NOT NULL | `users.id` を参照 |
| content | TEXT | NOT NULL | メッセージ本文または招待パラメータ |
| message_type | TEXT | NOT NULL | 'text' または 'invitation' |
| createdAt | INTEGER | NOT NULL | 送信日時 (Unix Time) |

### 2.4 user_blocks
| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| id | TEXT | PRIMARY KEY | 一意識別子 (UUID) |
| blocker_id | TEXT | FK, NOT NULL | ブロックを実行したユーザーID |
| blocked_id | TEXT | FK, NOT NULL | ブロックされたユーザーID |
| createdAt | INTEGER | NOT NULL | 実行日時 (Unix Time) |

- **制約**: `UNIQUE(blocker_id, blocked_id)`
