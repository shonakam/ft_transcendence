#!/usr/bin/env bash

HOST_IP="127.0.0.1"
HOSTNAMES=("transcendence.42.fr" "www.transcendence.42.fr")
COMMENT_LINE="# ft_transcendence setup for transcendence.42.fr"

set -eu # エラーが発生したらスクリプトを終了

SED_INPLACE_OPT=""
if [[ "$(uname)" == "Darwin" ]]; then # macOSの場合
    SED_INPLACE_OPT="''"
fi

function delete_host {
    echo "Info: /etc/hosts から transcendence.42.fr 関連のエントリを削除します。"
    sudo sed -i $SED_INPLACE_OPT '/.42.fr/d' /etc/hosts
    echo "Success: .42.fr 関連のエントリが削除されました。"
}

function create_host {
    delete_host

    echo "Info: /etc/hosts にエントリを追加します。IP: ${HOST_IP}"

    if ! grep -q "$COMMENT_LINE" /etc/hosts; then
        echo "$COMMENT_LINE" | sudo tee -a /etc/hosts > /dev/null
    fi

    for HOSTNAME in "${HOSTNAMES[@]}"; do
        if ! grep -q "${HOST_IP}[[:space:]]*${HOSTNAME}" /etc/hosts; then
            echo "${HOST_IP}    ${HOSTNAME}" | sudo tee -a /etc/hosts > /dev/null
            echo "Info: ${HOSTNAME} を /etc/hosts に追加しました。"
        else
            echo "Info: ${HOSTNAME} は /etc/hosts に既に存在します。"
        fi
    done

    echo "Success: ホストエントリの作成が完了しました。"
}

if [ $# -ne 1 ]; then
    echo "Usage: $0 [create|delete]"
    exit 1
elif [ "$1" == "create" ]; then
    create_host
    echo "Created Hosts"
elif [ "$1" == "delete" ]; then
    delete_host
    echo "Deleted Hosts"
else
    echo "Usage: $0 [create|delete]"
    exit 1
fi
