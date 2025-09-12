NAME 	:= ft_transcendence
UNAME	= $(uname -a)
APP		:= containers/application
OPS		:= containers/operation


.PHONEY: up
up:
	@docker compose -f containers/compose.yml up --build

.PHONEY: down
down:
	@docker compose -f containers/compose.yml down

.PHONEY: clean
clean: 

.PHONEY: fclean
fclean:
	@docker compose -f containers/compose.yml down --rmi local -v
	@rm -rf containers/*/containers/frontend/node_modules


