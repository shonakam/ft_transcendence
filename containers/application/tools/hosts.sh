#!/usr/bin/env bash

set -eu # エラーが発生したらスクリプトを終了

SED_INPLACE_OPT=""
if [[ "$(uname)" == "Darwin" ]]; then # macOSの場合
    SED_INPLACE_OPT="''"
fi

function delete_host {
    echo "Info: /etc/hosts から transcenders.42.fr 関連のエントリを削除します。"
    sudo sed -i $SED_INPLACE_OPT '/.42.fr/d' /etc/hosts
    echo "Success: .42.fr 関連のエントリが削除されました。"
}

function create_host {
    delete_host
    NGINX_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' inception-nginx 2>/dev/null || echo "127.0.0.1")

    if [ -z "$NGINX_IP" ]; then
        echo "Warning: NginxコンテナのIPアドレスを取得できませんでした。デフォルトで 127.0.0.1 を使用します。"
        NGINX_IP="127.0.0.1"
    fi
    NGINX_IP="127.0.0.1"

    echo "Info: /etc/hosts にエントリを追加します。IP: ${NGINX_IP}"

    HOSTNAMES=("transcenders.42.fr" "www.transcenders.42.fr")
    COMMENT_LINE="# Inception setup for transcenders.42.fr"

    if ! grep -q "$COMMENT_LINE" /etc/hosts; then
        echo "$COMMENT_LINE" | sudo tee -a /etc/hosts > /dev/null
    fi

    for HOSTNAME in "${HOSTNAMES[@]}"; do
        if ! grep -q "${NGINX_IP}[[:space:]]*${HOSTNAME}" /etc/hosts; then
            echo "${NGINX_IP}    ${HOSTNAME}" | sudo tee -a /etc/hosts > /dev/null
            echo "Info: ${HOSTNAME} を /etc/hosts に追加しました。"
        else
            echo "Info: ${HOSTNAME} は /etc/hosts に既に存在します。"
        fi
    done

    echo "Success: ホストエントリの作成が完了しました。"
}


# スクリプトの実行ロジック
if [ $# -ne 1 ]; then
    echo "Usage: $0 [create|delete]"
    exit 1
elif [ "$1" == "create" ]; then # 文字列比較は "" で囲むのが安全
    create_host
    echo "Created Hosts" # このメッセージは関数内で出力されるので、重複を避けるため削除しても良い
elif [ "$1" == "delete" ]; then # 文字列比較は "" で囲むのが安全
    delete_host
    echo "Deleted Hosts" # このメッセージは関数内で出力されるので、重複を避けるため削除しても良い
else
    echo "Usage: $0 [create|delete]"
    exit 1
fi
