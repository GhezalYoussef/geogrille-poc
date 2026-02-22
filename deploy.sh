#!/bin/bash
set -e

# ─── Configuration ────────────────────────────────────────────────────────────
SERVER_IP="89.167.34.22"
SERVER_USER="root"
SERVER_DIR="/root/geogrille-poc"
COMPOSE_FILE="docker-compose.prod.yml"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✔] $1${NC}"; }
warn() { echo -e "${YELLOW}[!] $1${NC}"; }
fail() { echo -e "${RED}[✘] $1${NC}"; exit 1; }

ssh_cmd() {
  ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "$@"
}

# ─── 1. Vérification locale ────────────────────────────────────────────────────
echo ""
echo "=========================================="
echo "  GeoGrille — Déploiement Production"
echo "=========================================="
echo ""

# Vérifier qu'on est dans le bon répertoire
[ -f "docker-compose.prod.yml" ] || fail "Lance ce script depuis la racine du projet"

# ─── 2. Build frontend ─────────────────────────────────────────────────────────
log "Build Angular..."
cd geogrille-front
npm install --silent
npm run build -- --configuration production
cd ..
log "Frontend buildé avec succès"

# ─── 3. Build backend ──────────────────────────────────────────────────────────
log "Build Spring Boot..."
cd geogrille-back
mvn package -DskipTests -q
cd ..
log "Backend buildé avec succès"

# ─── 4. Git push ───────────────────────────────────────────────────────────────
log "Push Git..."
git add -A
if git diff --cached --quiet; then
  warn "Aucune modification à commiter"
else
  echo -n "Message de commit (ou Entrée pour message auto) : "
  read -r COMMIT_MSG
  COMMIT_MSG="${COMMIT_MSG:-deploy: $(date '+%Y-%m-%d %H:%M')}"
  git commit -m "$COMMIT_MSG"
fi
git push
log "Code poussé sur GitHub"

# ─── 5. Déploiement sur le serveur ─────────────────────────────────────────────
log "Connexion au serveur ${SERVER_IP}..."

ssh_cmd "
  set -e
  echo '→ Mise à jour du code...'
  if [ ! -d '${SERVER_DIR}' ]; then
    git clone https://github.com/GhezalYoussef/geogrille-poc.git ${SERVER_DIR}
  fi
  cd ${SERVER_DIR}
  git pull

  echo '→ Build et redémarrage des conteneurs...'
  docker compose -f ${COMPOSE_FILE} up -d --build --remove-orphans

  echo '→ Nettoyage des images inutilisées...'
  docker image prune -f

  echo '→ État des conteneurs :'
  docker compose -f ${COMPOSE_FILE} ps
"

# ─── 6. Résumé ─────────────────────────────────────────────────────────────────
echo ""
log "Déploiement terminé !"
echo -e "  ${GREEN}→ Application disponible sur : http://${SERVER_IP}${NC}"
echo ""
