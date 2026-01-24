FROM alpine:latest as certs
RUN apk add --no-cache openssl && \
    mkdir -p /certs && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /certs/prometheus.key \
    -out /certs/prometheus.crt \
    -subj "/C=JP/ST=Tokyo/L=Tokyo/O=42/CN=localhost" && \
    chmod 644 /certs/prometheus.key /certs/prometheus.crt

FROM prom/prometheus:v3.9.1

COPY --from=certs --chown=nobody:nobody /certs /etc/prometheus/certs
COPY prometheus.yml /etc/prometheus/prometheus.yml
COPY web-config.yml /etc/prometheus/web-config.yml

EXPOSE 9090

CMD ["--config.file=/etc/prometheus/prometheus.yml", \
     "--web.config.file=/etc/prometheus/web-config.yml"]
