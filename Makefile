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
	@docker compose --env-file $(DOCKER_APP_ENV) -f $(APP)/compose.yaml up --build -d
	@bash $(APP)/tools/hosts.sh create

down-app:
	@docker compose --env-file $(DOCKER_APP_ENV) -f $(APP)/compose.yaml down
	@bash $(APP)/tools/hosts.sh delete

clean-app: # TODO: Implementation pending

fclean-app:
	@docker compose --env-file $(DOCKER_APP_ENV) -f $(APP)/compose.yaml down --rmi local -v
	@rm -rf $(APP)/*/node_modules
	@bash $(APP)/tools/hosts.sh delete

up-ops: # TODO: Implementation pending

down-ops: # TODO: Implementation pending

clean-ops: # TODO: Implementation pending

fclean-ops: # TODO: Implementation pending

.PHONEY:

# --- Development Helpers ---
app-logs:
	@docker compose -f $(APP)/compose.yaml logs -f

ops-logs:
	@docker compose -f $(OPS)/compose.yaml logs -f

shell-backend:
	@docker compose -f $(APP)/compose.yaml exec backend sh

shell-frontend:
	@docker compose -f $(APP)/compose.yaml exec frontend sh

shell-blockchain:
	@docker build -f $(APP)/blockchain/Dockerfile -t ft-blockchain $(APP)/blockchain
	@docker run --rm -it -p 8545:8545 ft-blockchain bash

PRIVATE_KEY := $(shell grep '^WALLET_PRIVATE=' $(APP)/.env.local | cut -d '=' -f2)
FUJI_RPC_URL := $(shell grep '^FUJI_RPC_URL=' $(APP)/.env.local | cut -d '=' -f2)
deploy-contract-fuji:
	@docker run --rm -it -e FUJI_PRIVATE_KEY=$(PRIVATE_KEY) -e FUJI_RPC_URL=$(FUJI_RPC_URL) \
 		ft-blockchain npm run deploy:fuji
# 	@docker run --rm -it -e PRIVATE_KEY=$$PRIVATE_KEY ft-blockchain npm run deploy:hardhat
