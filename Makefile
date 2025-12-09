NAME 			:= ft_transcendence
UNAME			= $(uname -a)
PROJECT_ROOT	:= $(PWD)
APP				:= containers/application
OPS				:= containers/operation
DOCKER_APP_ENV	:= $(APP)/.env.local
DOCKER_OPS_ENV	:= $(OPS)/.env.local
export DATA_DIR := $(PWD)/$(APP)/sqlite/data


# Orthodox recipes
all: init-app init-ops up-app up-ops

init-app:
	@cp -n $(APP)/.env.example $(APP)/.env.local || true

up-app: init-app
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


init-ops:
	@cp -n $(OPS)/.env.example $(OPS)/.env.local || true

up-ops: init-ops
	@docker compose --env-file $(DOCKER_OPS_ENV) -f $(OPS)/compose.yaml up --build -d

down-ops:
	@docker compose --env-file $(DOCKER_OPS_ENV) -f $(OPS)/compose.yaml down

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

