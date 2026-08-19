# Publicação: Oracle Cloud + Cloudflare

Este guia descreve como publicar o SellPlataform na Oracle Cloud Infrastructure (OCI), com DNS e proxy na Cloudflare, usando os arquivos em `deploy/oracle`.

Para publicar no **Render** em vez desta VM, use [`deploy/render/README.md`](../render/README.md) e o `render.yaml` na raiz do repositório.

Domínio de produção previsto: **https://sale.victorsf.com**  
O site principal (`victorsf.com`) permanece no arranjo atual; só o subdomínio `sale` aponta para esta VM.

---

## Visão geral

```
Visitante
    │
    │  HTTPS
    ▼
Cloudflare (DNS + opcionalmente proxy)
    │
    │  HTTPS (Full / Full strict)  →  IP público da VM
    ▼
Oracle Cloud  ·  Ubuntu 24.04
    │
    │  portas 80 / 443
    ▼
Caddy
    │  PHP-FPM (app:9000)
    ▼
Laravel (PHP 8.5)
    ├── Postgres
    ├── Redis
    └── RabbitMQ  →  worker `queue` + `scheduler`
```

O Compose sobe:

| Serviço     | Função                                      |
|-------------|---------------------------------------------|
| `caddy`     | TLS, HTTP/3, arquivos estáticos, FastCGI    |
| `app`       | PHP-FPM, migrate e caches no boot           |
| `queue`     | `php artisan queue:work rabbitmq`           |
| `scheduler` | `php artisan schedule:work`                 |
| `pgsql`     | Banco                                         |
| `redis`     | Cache e sessão                                |
| `rabbitmq`  | Fila                                          |

A rede Docker `edge` existe para, no futuro, outros containers (portfólio, etc.) usarem o mesmo Caddy sem publicar 80/443 de novo.

---

## 1. Criar a instância na Oracle

1. Acesse [cloud.oracle.com](https://cloud.oracle.com) e escolha a região (ex.: São Paulo / Vinhedo).
2. **Compute → Instances → Create instance**.
3. Sugestão Always Free (Ampere):
   - Imagem: **Ubuntu 24.04**
   - Shape: **VM.Standard.A1.Flex** (1–2 OCPU, 6–12 GB de RAM são suficientes)
   - Rede: VCN padrão com **IP público**
   - SSH: cole a chave pública (`~/.ssh/id_ed25519.pub`)
4. Crie a instância e anote o **IP público**.

### Firewall da Oracle (obrigatório)

Há duas camadas. Sem as duas, 80/443 não respondem.

**A. Security List ou Network Security Group da VCN**

Ingresso (source `0.0.0.0/0`):

| Porta | Protocolo | Uso        |
|-------|-----------|------------|
| 22    | TCP       | SSH        |
| 80    | TCP       | HTTP / ACME |
| 443   | TCP       | HTTPS      |
| 443   | UDP       | HTTP/3     |

**B. iptables na VM (imagens Oracle costumam bloquear por padrão)**

Depois do SSH:

```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT -p udp --dport 443 -j ACCEPT
sudo netfilter-persistent save   # se o pacote estiver instalado
```

Se `ufw` estiver ativo: `sudo ufw allow 80,443/tcp && sudo ufw allow 443/udp`.

---

## 2. DNS na Cloudflare (antes do primeiro up)

No painel da zona **victorsf.com**:

1. **DNS → Records → Add record**
2. Tipo **A**
3. Name: `sale`
4. IPv4: IP público da VM Oracle
5. Proxy:
   - **Cinza (DNS only)** na primeira emissão de certificado Let’s Encrypt
   - Depois pode ligar o **laranja (Proxied)**

Deixe `victorsf.com` e `www` como estão (portfólio). Só `sale` deve apontar para esta VM.

Confira a propagação:

```bash
dig +short sale.victorsf.com
```

Deve retornar o IP da Oracle.

### SSL/TLS na Cloudflare (quando o proxy laranja estiver ligado)

Em **SSL/TLS**:

| Modo              | Usar? | Motivo |
|-------------------|-------|--------|
| Off / Flexible    | Não   | Flexible fala HTTP com a origem; quebra cookies seguros e o Caddy em 443 |
| **Full**          | Sim   | Cloudflare fala HTTPS com o Caddy |
| **Full (strict)** | Ideal | Exige certificado válido no Caddy (Let’s Encrypt atende) |

Recomendações extras:

- **Always Use HTTPS**: ligado
- **Não cachear HTML** da aplicação (padrão da Cloudflare já não cacheia HTML autenticado; evite “Cache Everything”)
- Não crie registro proxied para a porta 22

---

## 3. Preparar o servidor

SSH:

```bash
ssh ubuntu@SEU_IP_PUBLICO
```

No repositório, o script instala Docker no Ubuntu 24.04:

```bash
sudo bash deploy/oracle/bootstrap-ubuntu.sh
```

Faça logout e login de novo (grupo `docker`). Confirme:

```bash
docker version
docker compose version
```

Clone o projeto (SSH no GitHub já configurado na sua máquina; na VM, use HTTPS ou uma deploy key):

```bash
git clone git@github.com:SEU_USUARIO/SellPlataform.git
cd SellPlataform
```

---

## 4. Ambiente de produção

Na raiz do repositório:

```bash
cp deploy/oracle/.env.example .env
```

Edite `.env` (não commitar):

- `APP_KEY` — gere fora da VM ou na VM com PHP: `docker run --rm php:8.5-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)), PHP_EOL;"`
- `APP_URL=https://sale.victorsf.com`
- `APP_DOMAIN=sale.victorsf.com`
- `SESSION_DOMAIN=sale.victorsf.com`
- `DB_PASSWORD` e `RABBITMQ_PASSWORD` — senhas fortes
- `CADDY_EMAIL` — e-mail para Let’s Encrypt
- `RESEND_API_KEY` — se for enviar e-mail de verdade

O Compose lê esse `.env` na raiz (`env_file: ../../.env` a partir de `deploy/oracle`).

---

## 5. Primeiro deploy

Com DNS **cinza** (DNS only) e portas 80/443 abertas:

```bash
docker compose -f deploy/oracle/compose.yaml --env-file .env up -d --build
```

O que acontece:

1. Build da imagem PHP (Composer `--no-dev`, `npm run build`, Wayfinder).
2. Sobe Postgres, Redis e RabbitMQ.
3. O `app` espera o banco, cria `storage:link`, roda `migrate --force` e cacheia config/rotas/views/events.
4. Caddy pede certificado Let’s Encrypt para `sale.victorsf.com` e passa o PHP para `app:9000`.

Acompanhe:

```bash
docker compose -f deploy/oracle/compose.yaml --env-file .env ps
docker compose -f deploy/oracle/compose.yaml --env-file .env logs -f caddy app
```

Teste:

```bash
curl -I https://sale.victorsf.com
```

Quando o HTTPS local na origem estiver ok, na Cloudflare ligue o **proxy laranja** e o modo **Full (strict)**.

---

## 6. Atualizar (novo código)

Na VM, na raiz do repo:

```bash
git pull
docker compose -f deploy/oracle/compose.yaml --env-file .env up -d --build
```

O entrypoint do `app` (`RUN_BOOTSTRAP=true`) roda `migrate` de novo. Worker e scheduler **não** migram (`RUN_BOOTSTRAP=false`).

Rollback: `git checkout` no commit anterior e o mesmo `up -d --build`.

---

## 7. Outros sites no mesmo Caddy

1. DNS A do outro host → o mesmo IP da Oracle.
2. O outro Compose **não** publica 80/443; o serviço entra na rede Docker `edge`.
3. Copie `deploy/oracle/sites/extra.caddy.example` para um arquivo `*.caddy` (não use o nome `extra.caddy.example`; o Caddy importa `*.caddy`).
4. Recarregue o Caddy:

```bash
docker compose -f deploy/oracle/compose.yaml --env-file .env exec caddy caddy reload --config /etc/caddy/Caddyfile
```

---

## 8. Operação do dia a dia

```bash
# logs
docker compose -f deploy/oracle/compose.yaml --env-file .env logs -f queue

# artisan
docker compose -f deploy/oracle/compose.yaml --env-file .env exec app php artisan about

# jobs falhos
docker compose -f deploy/oracle/compose.yaml --env-file .env exec app php artisan queue:failed
```

Fila: convites e e-mails usam RabbitMQ. Sem o container `queue` saudável, as notificações não saem.

---

## 9. Problemas comuns

| Sintoma | Causa típica |
|---------|----------------|
| Timeout na porta 80/443 | Security List/NSG ou iptables da Oracle |
| Caddy não emite certificado | DNS ainda não aponta para a VM, proxy laranja cedo demais, ou porta 80 fechada |
| 525 SSL handshake failed (Cloudflare) | Proxy laranja + Flexible, ou Caddy sem cert na 443 |
| 502 Bad Gateway | `app` ainda não passou no healthcheck (`/tmp/app-ready`) |
| Migrate falha no boot | senha/banco no `.env` diferente do `pgsql` |
| Sessão / CSRF quebrados | `APP_URL` ou `SESSION_DOMAIN` sem `sale.victorsf.com`, ou SSL Flexible |
| E-mail não chega | `RESEND_API_KEY` vazio ou worker `queue` parado |

Certificado na primeira vez: deixe o registro **DNS only**, espere o Caddy logar sucesso do ACME, depois ative o laranja.

---

## 10. Segurança

- Não commitar `.env`.
- `APP_DEBUG=false` em produção.
- Trocar todas as senhas do `.env.example`.
- SSH só com chave; evite senha no `ubuntu`.
- RabbitMQ de produção **não** publica a UI 15672 (a imagem é `rabbitmq:4-alpine`, sem management).
- Postgres e Redis só na rede `oracle`, sem portas no host.

---

## Arquivos deste deploy

| Caminho | Papel |
|---------|--------|
| `deploy/oracle/bootstrap-ubuntu.sh` | Docker no Ubuntu 24.04 |
| `deploy/oracle/compose.yaml` | Stack de produção |
| `deploy/oracle/Dockerfile` | Imagens `app` e `caddy` |
| `deploy/oracle/entrypoint.sh` | storage, migrate, caches |
| `deploy/oracle/Caddyfile` | `sale.victorsf.com` → PHP-FPM |
| `deploy/oracle/sites/` | Sites extras no mesmo Caddy |
| `deploy/oracle/.env.example` | Modelo do `.env` de produção |
