# Atto Deploy

Your self-hosted Deno Deploy alternative.

## Run

```bash
export DEPLOY_CONFIG_DOMAIN=example.com
deno run --allow-all --unstable https://github.com/oott123/atto-deploy/raw/master/src/mod.ts
```

Config your dns:

```
localhost.example.com TXT https://github.com/oott123/atto-deploy/raw/master/src/worker.ts
```
