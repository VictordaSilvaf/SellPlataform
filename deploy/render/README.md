# Publicação: Render

Este fluxo é **independente** da Oracle (`deploy/oracle`). Aqui o Render termina o TLS, injeta `$PORT`, e o container sobe Nginx + PHP-FPM juntos.

Fila: **Redis** (Key Value do Render), não RabbitMQ.

Domínio típico: `https://sellplataform-web.onrender.com` (o nome exato aparece no dashboard).

---

## Visão geral

```
Visitante
    │ HTTPS
    ▼
Render (proxy + TLS)  →  Cloudflare opcional (CNAME + Full/strict)
    │  $PORT (ex.: 10000)
    ▼
Nginx + PHP-FPM (mesmo container)
    ├── Postgres (addon)
    ├── Redis (cache, sessão, fila)
    ├── Worker `queue:work redis`
    └── Cron `schedule:run` a cada minuto
```

| Serviço no Blueprint | Função |
|----------------------|--------|
| `sellplataform-web` | HTTP, migrate no boot |
| `sellplataform-queue` | Jobs (e-mails, convites) |
| `sellplataform-scheduler` | `artisan schedule:run` |
| `sellplataform-db` | Postgres |
| `sellplataform-kv` | Redis interno |

---

## 1. Blueprint

1. Suba o repositório no GitHub.
2. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
3. Selecione o repo. O Render lê o `render.yaml` na **raiz**.
4. Quando pedir `APP_KEY`, cole a saída de:

```bash
php -r "echo 'base64:'.base64_encode(random_bytes(32)), PHP_EOL;"
```

5. Cole a `RESEND_API_KEY` (ou deixe vazio só para testar sem e-mail).

O `APP_URL` pode ficar em branco no primeiro boot: o entrypoint usa `RENDER_EXTERNAL_URL`. Depois, no dashboard, defina `APP_URL=https://SEU-SERVICO.onrender.com` e faça um **Manual Deploy**.

---

## 2. Variáveis

O grupo `sellplataform-app` injeta `DB_URL` e `REDIS_URL` (Laravel lê `DB_URL`, não `DATABASE_URL`).

`QUEUE_CONNECTION=redis` — não use RabbitMQ neste ambiente.

`SESSION_DOMAIN` vazio: cookie no host do Render. Com domínio próprio, use o host (`sale.victorsf.com`) sem `https://`.

---

## 3. Disco e arquivos

O filesystem do Web Service é **efêmero**. Sem disco persistente, `storage/` some no redeploy.

No serviço web: **Disk** → montar em `/var/www/html/storage` (plano pago). Sem disco, evite uploads ou use S3 depois (`FILESYSTEM_DISK`).

---

## 4. Cloudflare (opcional)

1. CNAME `sale` → `sellplataform-web.onrender.com` (ou o hostname que o Render mostrar).
2. Proxy laranja, SSL **Full** ou **Full (strict)**.
3. `APP_URL` e, se precisar, `SESSION_DOMAIN` iguais ao domínio público.
4. No Render, adicione o custom domain e o certificado (HTTP-01).

Não use o Caddy da Oracle neste fluxo: o TLS fica no Render (e no Cloudflare na borda).

---

## 5. Atualizar

Push na branch ligada ao Blueprint. O Render reconstrói a imagem (`deploy/render/Dockerfile`).

O web roda `migrate --force` no start. Worker e cron **não** migram.

---

## 6. Problemas comuns

| Sintoma | Causa típica |
|---------|----------------|
| Deploy sobe e cai no health check | `APP_KEY` inválida, Postgres ainda não aceita conexão, ou Nginx não escutou `$PORT` |
| 502 | PHP-FPM não escuta `127.0.0.1:9000` |
| Login/CSRF em HTTP | `APP_URL` sem `https://` ou cookie inseguro |
| Convite não chega | Worker parado ou `RESEND_API_KEY` vazia |
| Filas vazias com jobs na Oracle | Este ambiente usa Redis, não RabbitMQ |

---

## Arquivos

| Caminho | Papel |
|---------|--------|
| `render.yaml` | Blueprint (raiz do repo) |
| `deploy/render/Dockerfile` | Imagem web/worker/cron |
| `deploy/render/entrypoint.sh` | storage, migrate, Nginx+FPM ou queue |
| `deploy/render/nginx.conf.template` | HTTP em `$PORT` |
| `deploy/render/.env.example` | Referência das variáveis |
