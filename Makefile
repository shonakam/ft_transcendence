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

fclean: fclean-app fclean-ops prune

create-network:
	@docker network inspect transcendence-network >/dev/null 2>&1 || \
	docker network create transcendence-network

# 完全クリーンアップ（未使用のDocker リソースも削除）
prune:
	@echo "Pruning unused Docker resources..."
	@docker image prune -f
	@docker volume prune -f
	@docker network prune -f

# -----------------
# PRODUCTION TARGET
# -----------------
prod: create-network init-app
	@bash $(APP)/tools/certs.sh
	@bash $(APP)/tools/gen-vault-cert.sh
	@echo "Building frontend for production..."
	@docker compose -f $(APP)/compose.prod.yml build frontend
	@echo "Starting application in production mode..."
	@docker compose --env-file $(DOCKER_APP_ENV) -f $(APP)/compose.prod.yml up -d --remove-orphans
	@bash $(APP)/tools/auto-vault-init.sh
	@bash $(APP)/tools/hosts.sh create
	@ $(make) up-ops

## Application Recipes
init-app:
	@if [ ! -f $(APP)/.env.local ]; then \
		cp $(APP)/.env.example $(APP)/.env.local; \
		JWT_ACCESS=$$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"); \
		JWT_REFRESH=$$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"); \
		JWT_TMP=$$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"); \
		COOKIE=$$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"); \
		sed -i '' "s|^JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=\"$$JWT_ACCESS\"|" $(APP)/.env.local; \
		sed -i '' "s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=\"$$JWT_REFRESH\"|" $(APP)/.env.local; \
		sed -i '' "s|^JWT_TMP_AUTH_SECRET=.*|JWT_TMP_AUTH_SECRET=\"$$JWT_TMP\"|" $(APP)/.env.local; \
		sed -i '' "s|^COOKIE_SECRET=.*|COOKIE_SECRET=\"$$COOKIE\"|" $(APP)/.env.local; \
		echo "Generated JWT secrets in .env.local"; \
	fi

up-app: create-network init-app
	@bash $(APP)/tools/certs.sh
	@bash $(APP)/tools/gen-vault-cert.sh
	@docker compose --env-file $(DOCKER_APP_ENV) -f $(APP)/compose.yml up --build -d --remove-orphans
	@bash $(APP)/tools/auto-vault-init.sh
	@bash $(APP)/tools/hosts.sh create

down-app:
	@docker compose --env-file $(DOCKER_APP_ENV) -f $(APP)/compose.yml down
	@bash $(APP)/tools/hosts.sh delete

clean-app: # TODO: Implementation pending

fclean-app:
	@docker compose --env-file $(DOCKER_APP_ENV) -f $(APP)/compose.yml down --rmi local -v --remove-orphans
	@rm -rf $(APP)/*/node_modules
	@bash $(APP)/tools/hosts.sh delete

re-app: fclean-app up-app

init-ops:
	@cp -n $(OPS)/.env.example $(OPS)/.env.local || true

up-ops: create-network init-ops
	@docker compose --env-file $(DOCKER_OPS_ENV) -f $(OPS)/compose.yml up --build -d --remove-orphans
	@curl -k -sf -o /dev/null -u "elastic:changeme" \
		-X POST "https://localhost:5601/api/saved_objects/_import?overwrite=true" \
		-H "kbn-xsrf: true" --form file=@containers/operation/elk/kibana/kibana_setup.ndjson \
		|| echo "Warning: Kibana import failed"

down-ops:
	@docker compose --env-file $(DOCKER_OPS_ENV) -f $(OPS)/compose.yml down

clean-ops: # TODO: Implementation pending

fclean-ops:
	@docker compose --env-file $(DOCKER_OPS_ENV) -f $(OPS)/compose.yml down --rmi local -v --remove-orphans

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
