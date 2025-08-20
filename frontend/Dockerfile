# Stage 1: ビルド
FROM node:18-alpine AS builder

WORKDIR /app

# 依存関係インストール
COPY package*.json ./
RUN npm install
RUN npm install -g typescript

# 設定ファイルコピー
COPY tsconfig.json ./

# ソースコードコピー
COPY srcs/ ./srcs/

# TypeScript コンパイル
RUN npx tsc

# デバッグ：ビルド結果確認
RUN echo "=== ビルド後の確認 ==="
RUN ls -la
RUN ls -la dist/
RUN find dist/ -name "*.js"

# HTMLファイルをコピー
RUN cp srcs/index.html dist/index.html
RUN cp srcs/pong/pong_page.html dist/pong.html
RUN cp srcs/pong/pong_page.css dist/pong_page.css

# 最終確認
RUN echo "=== 最終ファイル確認 ==="
RUN ls -la dist/

# Stage 2: nginx
FROM nginx:alpine

# nginxデフォルト設定を削除
RUN rm /etc/nginx/conf.d/default.conf

# ビルド結果をコピー
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# nginx 設定
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
