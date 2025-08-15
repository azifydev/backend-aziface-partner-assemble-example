Collecting workspace information# Gerenciamento de Banco de Dados com Prisma

## Índice

1. Visão Geral
2. Estrutura do Projeto
3. Configuração Inicial
4. Lifecycle de Desenvolvimento
5. Comandos Principais
6. Fluxo de Trabalho
7. Seeds e Dados Iniciais
8. Boas Práticas
9. Troubleshooting

## Visão Geral

O projeto utiliza o **Prisma** como ORM (Object-Relational Mapping) para gerenciar o banco de dados MySQL. O Prisma oferece:

- 🔄 **Migrations**: Controle de versão para mudanças no banco
- 📝 **Schema**: Definição declarativa da estrutura do banco
- 🔧 **Type-safe Client**: Cliente TypeScript gerado automaticamente
- 🌱 **Seeding**: População de dados iniciais

## Estrutura do Projeto

```
prisma/
├── migrations/          # Histórico de alterações do banco
├── seed/               # Scripts de população de dados
│   ├── index.ts        # Executor principal de seeds
│   └── 1-baseline-setup.seed.sql  # Dados iniciais
├── schema.prisma       # Definição do schema do banco
database/
└── ddl.sql            # Estrutura inicial do banco
```

## Configuração Inicial

### 1. Variáveis de Ambiente

Certifique-se de que o arquivo .env contém:

```bash
DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_do_banco"
```

### 2. Configuração do Prisma

O schema.prisma define:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### 3. Script de Seed

Configurado em package.json:

```json
"prisma": {
  "seed": "tsx prisma/seed/index.ts"
}
```

## Lifecycle de Desenvolvimento

### 🚀 Fluxo Completo de Desenvolvimento

O fluxo de desenvolvimento com Prisma segue uma sequência lógica que varia dependendo do tipo de alteração que você está fazendo:

**Setup Inicial (Novo Desenvolvedor):**

1. **Baixou o Projeto** → Aplicar todas as migrations existentes

   ```bash
   npm run db:migrate:deploy
   ```

2. **Aplicar Migrations** → Gerar o client TypeScript atualizado

   ```bash
   npm run db:generate
   ```

3. **Gerar Client TypeScript** → Popular o banco com dados iniciais (seeds)

   ```bash
   npm run db:seed
   ```

4. **Popular com Seeds** → Iniciar desenvolvimento local
   ```bash
   npm run dev
   ```

**Durante o Desenvolvimento Local:**
Dependendo do tipo de alteração que você precisa fazer, o fluxo varia:

- **Para alterações manuais no banco:** Execute um pull do banco para sincronizar o schema.prisma, depois gere o client TypeScript e volte ao desenvolvimento

  ```bash
  npm run db:pull && npm run db:generate
  ```

- **Para alterações no schema Prisma:** Gere o client TypeScript diretamente e continue o desenvolvimento

  ```bash
  npm run db:generate
  ```

- **Quando finalizar o desenvolvimento:** Crie uma migration para documentar as alterações e suba um PR

  ```bash
  npm run db:migrate:dev
  ```

- **Quando precisar resetar o ambiente:** Execute um reset completo do banco e reaplique as migrations
  ```bash
  npm run db:migrate:reset
  ```

**Fluxos Específicos:**

- Alterações manuais no banco sempre requerem um `db:pull` seguido de `db:generate`

  ```bash
  npm run db:pull && npm run db:generate
  ```

- Alterações no schema.prisma requerem apenas `db:generate`

  ```bash
  npm run db:generate
  ```

- Ao finalizar qualquer desenvolvimento, sempre crie uma migration com `db:migrate:dev`

  ```bash
  npm run db:migrate:dev
  ```

- Em caso de problemas ou corrupção, use `db:migrate:reset` para recomeçar
  ```bash
  npm run db:migrate:reset && npm run db:seed
  ```

Este fluxo garante que o schema, as migrations e o client TypeScript estejam sempre sincronizados, independentemente de como as alterações foram feitas.

### 📋 Cenários Específicos

#### **Cenário 1: Setup Inicial (Novo Desenvolvedor)**

```bash
# 1. Aplicar todas as migrations existentes
npm run db:migrate:deploy

# 2. Gerar client TypeScript
npm run db:generate

# 3. Popular banco com dados iniciais
npm run db:seed
```

#### **Cenário 2: Alteração Manual no Banco**

```bash
# 1. Sincronizar schema.prisma com o banco
npm run db:pull

# 2. Atualizar client TypeScript
npm run db:generate
```

#### **Cenário 3: Alteração no Schema Prisma**

```bash
# 1. Atualizar client TypeScript
npm run db:generate

# 2. Testar localmente
npm run dev
```

#### **Cenário 4: Finalizar Desenvolvimento**

```bash
# 1. Criar migration baseada nas alterações
npm run db:migrate:dev

# 2. Revisar arquivos gerados em prisma/migrations/
# 3. Commitar e subir PR
```

#### **Cenário 5: Reset do Ambiente**

```bash
# 1. Resetar banco completamente
npm run db:migrate:reset

# 2. Popular novamente
npm run db:seed
```

## Comandos Principais

### Migrations

| Comando                     | Descrição                   | Quando Usar                    |
| --------------------------- | --------------------------- | ------------------------------ |
| `npm run db:migrate:deploy` | Aplica migrations pendentes | Setup inicial, deploy produção |
| `npm run db:migrate:dev`    | Cria nova migration         | Finalizar desenvolvimento      |
| `npm run db:migrate:reset`  | Reset completo do banco     | Ambiente corrompido            |
| `npm run db:migrate:status` | Status das migrations       | Verificar estado atual         |

### Schema e Client

| Comando               | Descrição                   | Quando Usar                 |
| --------------------- | --------------------------- | --------------------------- |
| `npm run db:pull`     | Sincroniza schema com banco | Alterações manuais no banco |
| `npm run db:generate` | Gera client TypeScript      | Após alterações no schema   |
| `npm run db:push`     | Aplica schema sem migration | Desenvolvimento rápido      |

### Utilitários

| Comando               | Descrição                 | Quando Usar          |
| --------------------- | ------------------------- | -------------------- |
| `npm run db:seed`     | Popula dados iniciais     | Setup, reset, testes |
| `npm run db:studio`   | Interface visual do banco | Debug, exploração    |
| `npm run db:format`   | Formata schema.prisma     | Manter consistência  |
| `npm run db:validate` | Valida schema.prisma      | CI/CD, verificações  |

## Fluxo de Trabalho

### 🔄 Desenvolvimento Diário

```bash
# Morning routine
npm run db:migrate:deploy  # Sincronizar com equipe
npm run db:generate        # Atualizar types

# Durante desenvolvimento
npm run db:generate        # Após alterações no schema
npm run db:studio          # Para debug visual

# Fim do dia
npm run db:migrate:dev     # Finalizar alterações
git add prisma/migrations/
git commit -m "feat: add new table for X"
```

### 🚀 Deploy e Produção

```bash
# Em produção
npm run db:migrate:deploy  # Aplicar migrations
npm run db:generate        # Gerar client atualizado
```

### 🧪 Ambiente de Testes

```bash
# Setup de testes
npm run db:migrate:reset   # Reset completo
npm run db:seed           # Dados de teste
npm test                  # Executar testes
```

## Seeds e Dados Iniciais

### Estrutura de Seeds

O sistema utiliza seeds SQL organizados numericamente:

```typescript
// prisma/seed/index.ts
async function runSeeds(specificSeedNumber?: number) {
  const seedFiles = files
    .filter((file) => file.endsWith('.seed.sql'))
    .sort((a, b) => {
      const numA = parseInt(a.split('-')[0]);
      const numB = parseInt(b.split('-')[0]);
      return numA - numB;
    });
}
```

### Seeds Disponíveis

- **1-baseline-setup.seed.sql**: Configuração inicial completa
  - Business partners
  - Usuários do sistema
  - Grupos e permissões
  - Constraints e recursos

### Executando Seeds

```bash
# Executar todas as seeds
npm run db:seed

# Executar seed específica
npm run db:seed 1

# Via código
npm run db:seed -- 1
```

### Exemplo de Seed SQL

```sql
-- Parceiros de negócio
INSERT INTO business_partners (id, name, external_id_maestro, created_at) VALUES
('40916c27-414d-11f0-be93-0242ac1d0002', 'Teste dos Devs', 'DEV001', '2025-06-06 13:20:04');

-- Usuários do sistema
INSERT INTO system_users (id, name, external_id, created_at) VALUES
('57b1c947-4171-11f0-be93-0242ac1d0002', 'João Silva', 'joao.silva@testedosdevs.com', '2025-06-06 13:20:04');

-- Grupos de usuários
INSERT INTO bank_users_groups (id, name, partner_id, created_at) VALUES
('57b26f53-4171-11f0-be93-0242ac1d0002', 'SYSTEM_ADMIN', '40916c27-414d-11f0-be93-0242ac1d0002', '2025-06-06 13:20:04');
```

## Boas Práticas

### 📝 Convenções de Nomenclatura

```sql
-- ✅ Bom: Nomes descritivos
bank_users_groups_permissions

-- ❌ Evitar: Abreviações
bugp_table
```

### 🔄 Lifecycle das Migrations

1. **Desenvolvimento**: Use `db:migrate:dev` para criar migrations
2. **Review**: Sempre revisar SQL gerado antes do commit
3. **Deploy**: Use `db:migrate:deploy` em produção
4. **Rollback**: Se necessário, criar migration reversa

### 🛡️ Segurança e Backup

```bash
# Antes de mudanças grandes
mysqldump -u user -p database > backup.sql

# Testar em ambiente isolado
DATABASE_URL="mysql://..." npm run db:migrate:deploy
```

### 📊 Monitoramento

```bash
# Verificar status
npm run db:migrate:status

# Validar schema
npm run db:validate

# Examinar estrutura
npm run db:studio
```

## Troubleshooting

### 🚨 Problemas Comuns

#### **Migration Failed**

```bash
# Verificar status
npm run db:migrate:status

# Resolver manualmente
npm run db:migrate:resolve --applied 20240101000000_migration_name

# Em último caso
npm run db:migrate:reset
```

#### **Schema Desatualizado**

```bash
# Sincronizar com banco
npm run db:pull

# Regenerar client
npm run db:generate
```

#### **Client TypeScript Desatualizado**

```bash
# Regenerar completamente
rm -rf node_modules/.prisma
npm run db:generate
```

#### **Seeds Falhando**

```bash
# Executar seed específica
npm run db:seed 1

# Debug no código
tsx prisma/seed/index.ts 1
```

### 🔍 Debug e Logs

```typescript
// Habilitar logs do Prisma
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### 📈 Performance

```bash
# Analisar queries lentas
npm run db:studio

# Verificar índices
EXPLAIN SELECT * FROM bank_users WHERE partner_id = 'uuid';
```

---

## Comandos Rápidos de Referência

```bash
# Setup inicial
npm run db:migrate:deploy && npm run db:generate && npm run db:seed

# Desenvolvimento
npm run db:generate  # Após mudanças no schema
npm run db:migrate:dev  # Finalizar alterações

# Reset completo
npm run db:migrate:reset && npm run db:seed

# Debug
npm run db:studio  # Interface visual
npm run db:migrate:status  # Status das migrations
```

Para mais detalhes sobre autorização e permissões, consulte a documentação de autorização.

Para informações sobre testes com Prisma, veja o guia de testes.
