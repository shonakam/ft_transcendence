FROM grafana/grafana:nightly

COPY ./provisioning/datasource.yml /etc/grafana/provisioning/datasources/datasource.yml
COPY ./provisioning/dashboard.yml /etc/grafana/provisioning/dashboards/dashboard.yml
COPY ./dashboards/ /var/lib/grafana/dashboards/
