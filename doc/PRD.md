# PRD.md (Draft)

## 1. プロジェクト概要

**プロジェクト名:** ft_transcendence
**目的:**
ブラウザでプレイ可能なリアルタイム対戦型「Pong」ゲームを開発する。
ユーザーはシンプルなUIを通じてトーナメント形式で対戦可能とし、拡張モジュールにより機能を追加していく。

## 2. スコープ

### 必須要件 (Mandatory Part)

* **ゲーム機能**

  * ブラウザ上でPongをプレイ可能
  * ローカル2人対戦（同じキーボード）
  * トーナメント機能（参加者エイリアス入力、マッチメイキング、次試合アナウンス）
  * 全プレイヤー共通ルール（パドル速度等）

* **フロントエンド**

  * **TypeScript** を使用
  * **SPA (Single Page Application)**
  * ブラウザの **Back/Forwardボタン対応**
  * **Firefox最新版** で動作確認必須

* **バックエンド**

  * 任意
  * 実装する場合は **純粋なPHP**（フレームワーク禁止）
  * DBを利用する場合は **Database module** に従う

* **インフラ**

  * **Docker** でワンコマンド起動
  * rootless環境制約を考慮（bind-mount禁止など）

* **セキュリティ**

  * パスワードはハッシュ化（強固なアルゴリズム）
  * XSS / SQL Injection 防御
  * HTTPS必須 (wss利用など)
  * フォーム入力バリデーション（フロント or サーバー）

---

### 将来的なモジュール拡張例

* **User Management**: 標準ユーザー管理、OAuthログイン
* **Gameplay**: Remote play, Multiplayer, Live chat, 別ゲーム追加
* **AI**: AI対戦相手、統計ダッシュボード
* **Security**: JWT + 2FA, GDPR対応, WAF + Vault
* **DevOps**: Microservices化, ELKログ管理, Prometheus監視
* **Graphics**: 3D化（Babylon.js）
* **Accessibility**: 多言語対応, SSR, 視覚障害者対応
* **Server-Side Pong**: API駆動のPong, CLIプレイヤー

---

## 3. 非スコープ

* 即席で全機能を提供する外部ライブラリ・フレームワークの利用
* 完成済みPongゲームの組み込み
* Gitリポジトリに認証情報や.envを含めること

---

## 4. 成功基準 (Definition of Done)

* SPAがDockerワンコマンドで起動できる
* ブラウザでPongをプレイ可能
* トーナメント機能が動作する
* HTTPSでセキュアにアクセス可能
* 評価時にライブラリ利用理由を説明できる

---

## 5. 想定ユーザー

* **42学生**（チーム開発 & ピアレビュー前提）
* Webブラウザ（Firefox最新版）を利用するプレイヤー

---

## 6. リスク・制約

* rootless Docker環境での制約
* 評価時に仕様変更リクエストが入る可能性あり
* 緑字の技術選択（PHP / TS / DB / Frameworkなど）がバージョンで変わる


---

## 7. モジュールの選択 

* WEB = 30
  * Backend: Node.js + Fastify (Major)
  * Frontend: TypeScript + Tailwind CSS (Minor)
  * Use a database for the backend -and more. (Minor)
    * SQLite
  * Store the score of a tournament in the Blockchain. (Major)
    * Solidity on Avalanch Testnet.

* User Management = 20
  * Standard user management, authentication and users across tournaments. (Major)
  * Implement remote authentication. (Major)

* Gameplay and user experience = 10
  * Live Chat. (Major)

* AI-Algo = 

* Cybersecurity = 20
  * Implement WAF/ModSecurity with Hardened Configuration and HashiCorp Vault for Secrets Management. (Major)
  * Implement Two-Factor Authentication (2FA) and JWT. (Major)

* Devops = 15
  * Infrastructure Setup with ELK (Elasticsearch, Logstash, Kibana) for Log Management. (Major)
  * Monitoring system. (Minor)

