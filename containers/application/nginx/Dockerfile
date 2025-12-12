FROM owasp/modsecurity-crs:3.3.7-nginx-202511100111

RUN mkdir -p /etc/nginx/conf.d/
RUN mkdir -p /opt/owasp-crs/rules/

COPY ./conf.d/ft_routing.conf /etc/nginx/conf.d/
COPY ./rules/99_ft_custom.conf /opt/owasp-crs/rules/
