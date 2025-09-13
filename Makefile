NAME 	:= ft_transcendence
UNAME	= $(uname -a)
APP		:= containers/application
OPS		:= containers/operation

# Orthodox recipes
all: app-up ops-up

app-up:
	@docker compose -f $(APP)/compose.yml up --build

app-down:
	@docker compose -f $(APP)/compose.yml down

app-clean: # TODO: Implementation pending 

app-fclean:
	@docker compose -f $(APP)/compose.yml down --rmi local -v
	@rm -rf $(APP)/*/node_modules

ops-up: # TODO: Implementation pending 

ops-down: # TODO: Implementation pending 

ops-clean: # TODO: Implementation pending 

ops-fclean: # TODO: Implementation pending 

.PHONEY: app-up app-down app-clean app-fclean ops-up ops-down ops-clean ops-fclean

# --- Development Helpers ---
app-logs:
	@docker compose -f $(APP)/compose.yml logs -f

ops-logs:
	@docker compose -f $(OPS)/compose.yml logs -f

shell-backend:
	@docker compose -f $(APP)/compose.yml exec backend sh

shell-frontend:
	@docker compose -f $(APP)/compose.yml exec frontend sh

