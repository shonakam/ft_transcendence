NAME 			:= ft_transcendence
UNAME			= $(uname -a)
PROJECT_ROOT	:= $(PWD)
APP				:= containers/application
OPS				:= containers/operation
DOCKER_APP_ENV	:= $(APP)/.env.example # Please change it to '.env.local'
export DATA_DIR := $(PWD)/$(APP)/sqlite/data


# Orthodox recipes
all: app-up ops-up

up-app:
	@docker compose --env-file $(DOCKER_APP_ENV) -f $(APP)/compose.yml up --build

down-app:
	@docker compose --env-file $(DOCKER_APP_ENV) -f $(APP)/compose.yml down

clean-app: # TODO: Implementation pending 

fclean-app:
	@docker compose --env-file $(DOCKER_APP_ENV) -f $(APP)/compose.yml down --rmi local -v
	@rm -rf $(APP)/*/node_modules

up-ops: # TODO: Implementation pending 

down-ops: # TODO: Implementation pending 

clean-ops: # TODO: Implementation pending 

fclean-ops: # TODO: Implementation pending 

.PHONEY:

# --- Development Helpers ---
app-logs:
	@docker compose -f $(APP)/compose.yml logs -f

ops-logs:
	@docker compose -f $(OPS)/compose.yml logs -f

shell-backend:
	@docker compose -f $(APP)/compose.yml exec backend sh

shell-frontend:
	@docker compose -f $(APP)/compose.yml exec frontend sh

