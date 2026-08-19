#!/usr/bin/env bash
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
    echo "Run as root: sudo $0" >&2
    exit 1
fi

export DEBIAN_FRONTEND=noninteractive

. /etc/os-release

if [[ "${ID}" != "ubuntu" ]] || [[ "${VERSION_ID}" != "24.04" && "${VERSION_CODENAME}" != "noble" ]]; then
    echo "This script targets Ubuntu 24.04 (noble). Detected: ${PRETTY_NAME:-unknown}" >&2
    exit 1
fi

apt-get update
apt-get install -y --no-install-recommends ca-certificates curl

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod 644 /etc/apt/keyrings/docker.asc

arch="$(dpkg --print-architecture)"
codename="${UBUNTU_CODENAME:-$VERSION_CODENAME}"

echo "deb [arch=${arch} signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${codename} stable" \
    > /etc/apt/sources.list.d/docker.list

apt-get update
apt-get install -y --no-install-recommends \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin

systemctl enable --now docker

target_user="${SUDO_USER:-}"
if [[ -n "${target_user}" && "${target_user}" != "root" ]]; then
    usermod -aG docker "${target_user}"
    echo "Added ${target_user} to the docker group. Log out and back in before using Docker."
fi

echo
echo "Docker is installed. On the Oracle Security List / NSG allow ingress 22, 80, and 443."
echo "DNS: A record sale -> this instance public IP (portfolio stays on victorsf.com)."
echo "From the app root:"
echo "  cp deploy/oracle/.env.example .env"
echo "  php artisan key:generate   # or set APP_KEY on another machine and paste it"
echo "  docker compose -f deploy/oracle/compose.yaml --env-file .env up -d --build"
echo "More sites later: attach the other compose to the Docker network named edge,"
echo "add a file under deploy/oracle/sites/*.caddy, then reload Caddy."
