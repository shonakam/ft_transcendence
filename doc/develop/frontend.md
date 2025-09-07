# transcendence-frontend

このプロジェクトは、フレームワークを使用せず、純粋なTypeScriptとTailwind CSSで構築されたSPA（シングルページアプリケーション）です。

アーキテクチャは、関心の分離と高いメンテナンス性を目指し、**Atomic Design**の考え方を取り入れたコンポーネントベースの設計を採用しています。

-----

## 🚀 思想 (Architectural Concepts)

  * **フレームワークレス**: VueやReactなどの外部フレームワークに依存せず、ブラウザ標準のAPIとTypeScriptのみでUIとロジックを構築します。
  * **コンポーネントベース**: UIを再利用可能な部品（コンポーネント）に分割して管理します。
  * **Atomic Design**: コンポーネントを**Atoms / Molecules / Organisms**の階層で管理し、UIの再利用性と見通しの良さを向上させます。
  * **関心の分離**: UI（Components）、ページ構成（Pages）、画面遷移（Router）、状態管理（Store）、API通信（Services）の各役割をディレクトリレベルで明確に分離します。

-----

## 📂 ディレクトリ構成 (Directory Structure)

```plaintext
/
├── dist/                     # ビルド後のファイルが出力される場所                # index.htmlや画像など
│   └── index.html
├── src/
│   ├── components/           # Atomic Designに基づくUIコンポーネント
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── organisms/
│   │
│   ├── pages/                # 各ページを構成するファイル
│   │
│   ├── router/               # 画面遷移を管理するルーター
│   │
│   ├── services/             # API通信など
│   │
│   ├── store/                # 状態管理
│   │
│   ├── types/                # 型定義
│   │
│   └── main.ts               # アプリケーションのエントリーポイント
│
├── package.json
└── tsconfig.json
```

-----

## 🔧 各ファイルの役割 (How It Works)

  * **`src/components/`**: UIを構成する再利用可能な部品です。各コンポーネントは、HTML要素を生成して返す責務を持ちます。

      * **Atoms**: `Button.ts`, `Input.ts`など、これ以上分割できない最小単位。
      * **Molecules**: Atomsを組み合わせた小さな部品（例：検索フォーム）。
      * **Organisms**: MoleculesやAtomsを組み合わせた大きなセクション（例：ヘッダー）。

  * **`src/pages/`**: コンポーネントを組み合わせて、ユーザーに表示される1つの画面を構成します。

  * **`src/router/`**: URLの変更を検知し、対応する`Page`を呼び出して画面を描画する、SPAの心臓部です。

  * **`src/main.ts`**: アプリケーションの起動ファイルです。ルーターを初期化し、最初のページを描画します。

-----

## 🏁 はじめに (Getting Started)

### 1\. 依存関係のインストール

```bash
npm install
```

### 2\. 開発サーバーの起動

```bash
npm run dev
```