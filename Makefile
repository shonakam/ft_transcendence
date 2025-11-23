NAME 			:= ft_transcendence
UNAME			= $(uname -a)
PROJECT_ROOT	:= $(PWD)
APP				:= containers/application
OPS				:= containers/operation
DOCKER_APP_ENV	:= $(APP)/.env.local
export DATA_DIR := $(PWD)/$(APP)/sqlite/data


# Orthodox recipes
all: init up-app up-ops

init:
	@cp -n $(APP)/.env.example $(APP)/.env.local || true

up-app: init
	@bash $(APP)/tools/certs.sh
	@docker compose --env-file $(DOCKER_APP_ENV) -f $(APP)/compose.yml up --build
	@bash $(APP)/tools/hosts.sh create

down-app:
	@docker compose --env-file $(DOCKER_APP_ENV) -f $(APP)/compose.yml down
	@bash $(APP)/tools/hosts.sh delete

clean-app: # TODO: Implementation pending 

fclean-app:
	@docker compose --env-file $(DOCKER_APP_ENV) -f $(APP)/compose.yml down --rmi local -v
	@rm -rf $(APP)/*/node_modules
	@bash $(APP)/tools/hosts.sh delete

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

