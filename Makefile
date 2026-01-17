NAME 		:= ft_transcendence
UNAME		= $(uname -a)
PROJECT_ROOT	:= $(PWD)
APP		:= containers/application
OPS		:= containers/operation
DOCKER_APP_ENV	:= $(APP)/.env.local
DOCKER_OPS_ENV	:= $(OPS)/.env.local
export DATA_DIR := $(PWD)/$(APP)/sqlite/data

# Orthodox recipes
all: init-app up-app init-ops up-ops

re: re-ops re-app

down: down-ops down-app

## Application Recipes
init-app:
	@cp -n $(APP)/.env.example $(APP)/.env.local || true

up-app: init-app
	@bash $(APP)/tools/certs.sh
	@docker compose --env-file $(DOCKER_APP_ENV) -f $(APP)/compose.yml up --build -d --remove-orphans
	@bash $(APP)/tools/hosts.sh create

down-app:
	@docker compose --env-file $(DOCKER_APP_ENV) -f $(APP)/compose.yml down
	@bash $(APP)/tools/hosts.sh delete

clean-app: # TODO: Implementation pending

fclean-app:
	@docker compose --env-file $(DOCKER_APP_ENV) -f $(APP)/compose.yml down --rmi local -v
	@rm -rf $(APP)/*/node_modules
	@bash $(APP)/tools/hosts.sh delete

re-app: fclean-app up-app

init-ops:
	@cp -n $(OPS)/.env.example $(OPS)/.env.local || true

up-ops: init-ops
	@docker compose --env-file $(DOCKER_OPS_ENV) -f $(OPS)/compose.yml up --build -d --remove-orphans
	@curl -u "elastic:changeme" \
		-X POST "http://localhost:5601/api/saved_objects/_import" \
		-H "kbn-xsrf: true" --form file=@containers/operation/elk/kibana/kibana_setup.ndjson

down-ops:
	@docker compose --env-file $(DOCKER_OPS_ENV) -f $(OPS)/compose.yml down

clean-ops: # TODO: Implementation pending

fclean-ops:
	@docker compose --env-file $(DOCKER_OPS_ENV) -f $(OPS)/compose.yml down --rmi local -v

re-ops: fclean-ops up-ops

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

shell-grafana:
	@docker compose --env-file $(DOCKER_OPS_ENV) -f $(OPS)/compose.yml exec grafana bash
