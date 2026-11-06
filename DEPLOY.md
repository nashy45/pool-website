# Deploying Pool's Arena to EC2 (poolsarena.com)

Server: EC2 `52.28.169.220`. Domain: `poolsarena.com`.
Stack: Docker Compose with **app** (Node/Express + SQLite) and **caddy** (reverse proxy, automatic HTTPS).

## 1. DNS (at the poolsarena.com registrar)

| Type | Name | Value |
|---|---|---|
| A | `@` | `52.28.169.220` |
| A | `www` | `52.28.169.220` |

Remove any parking or forwarding records. Check with `nslookup poolsarena.com`.
> Tip: give the instance an **Elastic IP** so the address doesn't change when it restarts.

## 2. AWS security group (inbound)

| Port | Source | Why |
|---|---|---|
| 22 | your IP | SSH |
| 80 | 0.0.0.0/0 | HTTP + Let's Encrypt validation |
| 443 | 0.0.0.0/0 | HTTPS |

## 3. Install Docker on the instance (one time)

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER && newgrp docker
docker compose version
```
(On Amazon Linux 2023: `sudo dnf install -y docker git && sudo systemctl enable --now docker`, then install the compose plugin from the Docker docs.)

## 4. Get the code and configure it

```bash
git clone <your-repo-url> pool-website && cd pool-website
cp .env.example .env
nano .env
```
Set at least:
- `JWT_SECRET`: output of `openssl rand -hex 32`
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`: the owner's first login
- `SITE_ADDRESS=poolsarena.com, www.poolsarena.com`
- `PUBLIC_URL=https://poolsarena.com`

> If DNS isn't pointing at the server yet, use `SITE_ADDRESS=:80` and browse to `http://52.28.169.220`. Switch it back and run step 5 again once DNS is ready.

## 5. Start everything (the one command)

```bash
docker compose up -d --build
```

On first start the app creates the database, seeds the menu and tables, and creates the owner account. Caddy gets the HTTPS certificate (this takes a few seconds once DNS resolves).

- Site: https://poolsarena.com
- Staff: https://poolsarena.com/staff/login

## Day-to-day

```bash
docker compose ps                 # status (app should be "healthy")
docker compose logs -f app        # app logs
docker compose logs -f caddy      # proxy / certificate logs
docker compose restart app        # restart
git pull && docker compose up -d --build   # deploy an update (data is kept)
```

## Data & backups

Everything persistent (SQLite DB, uploaded images, QR codes) is in the `app-data` Docker volume, mounted at `/data`.

```bash
# backup
docker compose cp app:/data ./backup-$(date +%F)
# restore (stop app first)
docker compose stop app && docker compose cp ./backup-YYYY-MM-DD/. app:/data && docker compose start app
```

`docker compose down` keeps the data. **`docker compose down -v` deletes it.**

## Troubleshooting

- **Certificate errors / site not loading over HTTPS:** check `docker compose logs caddy`. Usually DNS isn't pointing at the server yet, or port 80/443 is closed in the security group.
- **App keeps restarting:** check `docker compose logs app`. "FATAL: set a strong JWT_SECRET" means `.env` still has the placeholder.
- **Can't log in:** the owner is only auto-created when no accounts exist. Add one with `docker compose exec app npm run create-admin`.
