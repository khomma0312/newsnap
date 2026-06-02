.PHONY: up down restart logs \
        be-up fe-up \
        install fe-install be-install \
        db-migrate db-generate db-studio \
        test fe-test be-test \
        build fe-build

# ----------------------------------------
# 起動・停止
# ----------------------------------------
up:
	tmux new-session -d -s newsnap -n backend 'cd $(CURDIR)/backend && docker compose up; read'
	tmux new-window -t newsnap -n frontend 'cd $(CURDIR)/frontend && npm run dev; read'
	tmux select-window -t newsnap:backend
	tmux attach -t newsnap

be-up:
	cd backend && docker compose up -d

fe-up:
	cd frontend && npm run dev

down:
	tmux kill-session -t newsnap 2>/dev/null || true

restart:
	cd backend && docker compose restart backend

logs:
	cd backend && docker compose logs -f backend

# ----------------------------------------
# インストール
# ----------------------------------------
install: fe-install be-install

fe-install:
	cd frontend && npm install

be-install:
	cd backend && npm install

# ----------------------------------------
# DB
# ----------------------------------------
db-migrate:
	cd backend && docker compose exec backend npm run db:migrate

db-generate:
	cd backend && docker compose exec backend npm run db:generate

# ----------------------------------------
# テスト
# ----------------------------------------
test: fe-test be-test

fe-test:
	cd frontend && npm test

be-test:
	cd backend && npm test

# ----------------------------------------
# ビルド
# ----------------------------------------
build: fe-build

fe-build:
	cd frontend && npm run build
