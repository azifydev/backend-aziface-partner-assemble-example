# Assemble

**Bank as a Service API** - Sistema completo de serviços bancários construído com NestJS e TypeScript.

## � Início Rápido

```bash
# Instalar dependências
$ pnpm install

# Executar em modo desenvolvimento
$ pnpm run start:dev

# Acessar documentação da API
$ open http://localhost:30000/api-docs
```

## 📚 Documentação

### Para Não-Desenvolvedores

- **[📋 Documentação para Produto](documentacao-produto.html)** - Visão de negócio, casos de uso e valor estratégico

### Para Desenvolvedores

- **[🏗️ Arquitetura do Projeto](project-architecture.html)** - Estrutura e padrões arquiteturais
- **[💻 Guia de Desenvolvimento](development-guide.html)** - Setup, scripts e fluxo de trabalho
- **[🌐 Documentação da API](api-documentation.html)** - Endpoints, Swagger e exemplos
- **[🔐 Autenticação](authentication.html)** - Sistema de auth completo
- **[🔑 Autorização](authorization.html)** - Controle de acesso e permissões
- **[🧪 Testing](testing.html)** - Estratégias e execução de testes
- **[Code Coverage](code-coverage.html)** - Relatórios e métricas de cobertura
- **[🗄️ Database Management](database-management.html)** - Prisma, migrações e seeds

### Sandbox
- **[📋 Documentação para Sandbox](https://assemblesandbox.azify.dev/docs-static/sandbox-parceiros.html)** - Orientações para integração e utilização do Assemble Sandbox

### Fluxos e Configuração

- **[🎯 Guia de Configuração Inicial](guia-configuracao-inicial.html)** - Configuração basica do parceiro no sistema
- **[Fluxo de Cadastro de Cliente](customer-creation-flow.html)** - Detalhamento do processo de clientes
- **[Fluxo de Onboarding](onboarding-flow.html)** - Detalhamento do processo de onboarding
- **[Fluxo de Webhook e Notificações](sistema-webhooks.html)** - Integração com webhooks e notificações

- **[📊 Diagramas do Projeto](diagrams/index.html)** - Visualizações interativas

### Qualidade e Métricas

- **[📊 Code Coverage Report](./coverage/)** - Relatório de cobertura de testes
- **[🔍 SonarQube Integration](documentation/sonarqube-integration.md)** - Análise de qualidade de código

## ⚡ Descrição

API de serviços bancários construída com [NestJS](https://github.com/nestjs/nest) framework em TypeScript, oferecendo funcionalidades completas de BaaS (Bank as a Service).

## 🛠️ Tecnologias Principais

- **Framework**: NestJS + Express
- **Linguagem**: TypeScript
- **Banco de Dados**: Prisma ORM
- **Documentação**: Swagger/OpenAPI + TypeDoc
- **Autenticação**: JWT + API Keys
- **Testes**: Jest + Supertest
- **Qualidade**: SonarQube + ESLint
- **Deploy**: PM2 + Docker

## 🔍 Análise de Qualidade

```bash
# Iniciar SonarQube localmente
./scripts/setup-sonar.sh

# Executar análise local
pnpm run sonar:local

# Acessar dashboard
open http://localhost:9000
```

## 📖 Links Importantes

- **[🌐 Swagger UI](http://localhost:30000/api-docs)** - Interface interativa da API
- **[📚 Documentação Completa](docs/index.html)** - TypeDoc gerado automaticamente
- **[� Coverage Report](coverage/index.html)** - Relatório de cobertura de código
- **[�🐙 Repositório](https://github.com/your-repo/assemble)** - Código fonte no GitHub

---

_Para informações detalhadas sobre setup, arquitetura e desenvolvimento, consulte os links de documentação acima._
