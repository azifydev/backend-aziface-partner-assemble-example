# Assemble

**Backend Aziface Partner** - Backend de exemplo para simular a integração do parceiro com ASSEMBLE.

## � Início Rápido

```bash
# Setup config node
$ nvm use

# Instalar dependências
$ pnpm install

# Iniciar containers (database)
$ docker compose up -d

# Executar os migrations
$ db:migrate:deploy

# Gerar os schemas prisma
$ pnpm db:generate

# Executar em modo desenvolvimento
$ pnpm run start:dev

# Acessar documentação da API
$ open http://localhost:60000/api-docs
```

## ⚡ Descrição

Este backend foi desenvolvido para exemplificar a utilização dos serviços de biometria do ASSEMBLE, servindo como referência para integração de sistemas parceiros.

## 🛠️ Tecnologias Principais

- **Framework**: NestJS + Express
- **Linguagem**: TypeScript
- **Banco de Dados**: Prisma ORM
- **Documentação**: Swagger/OpenAPI
- **Autenticação**: JWT + API Keys
- **Qualidade**: ESLint
- **Deploy**: PM2
## 📖 Links Importantes

- **[🌐 Swagger UI](http://localhost:60000/api-docs)** - Interface interativa da API
