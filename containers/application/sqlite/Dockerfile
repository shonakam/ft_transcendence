FROM alpine:3.20

RUN apk add --no-cache sqlite
RUN mkdir -p /var/lib/sqlite

VOLUME ["/var/lib/sqlite"]

CMD ["tail", "-f", "/dev/null"]
