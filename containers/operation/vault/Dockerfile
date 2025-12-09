# https://developer.hashicorp.com/vault/docs/configuration
FROM hashicorp/vault:latest

COPY ./tools/entrypoint.sh /entrypoint.sh
COPY ./secrets.json /secrets.json

RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]
