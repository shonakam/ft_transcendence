FROM owasp/modsecurity-crs:3.3.7-nginx-202511100111

USER root

RUN rm -f /etc/nginx/templates/conf.d/default.conf.template
RUN rm -f /etc/nginx/conf.d/default.conf

COPY --chown=nginx:nginx ./conf.d/ft_routing.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx ./rules/99_ft_custom.conf /opt/owasp-crs/rules/

USER nginx