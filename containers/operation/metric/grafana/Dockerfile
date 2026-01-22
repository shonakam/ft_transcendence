FROM alpine:latest as certs
RUN apk add --no-cache openssl && \
    mkdir -p /certs && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /certs/grafana.key \
    -out /certs/grafana.crt \
    -subj "/C=JP/ST=Tokyo/L=Tokyo/O=42/CN=localhost" && \
    chmod 644 /certs/grafana.key /certs/grafana.crt

FROM grafana/grafana:nightly

COPY --from=certs --chown=472:0 /certs /etc/grafana/certs

COPY ./provisioning/datasource.yml /etc/grafana/provisioning/datasources/datasource.yml
COPY ./provisioning/dashboard.yml /etc/grafana/provisioning/dashboards/dashboard.yml
COPY ./dashboards/ /var/lib/grafana/dashboards/
COPY ./grafana.ini /etc/grafana/grafana.ini
