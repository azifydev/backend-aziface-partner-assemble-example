Collecting workspace information# Sistema de Autorização Multi-Tenant RBAC - Guia Completo

## 📋 Índice

1. Introdução e Conceitos Fundamentais
2. Arquivos Relevantes e Adição de Features
3. Arquitetura do Sistema
4. Configuração Inicial e Primeiros Passos
5. Gestão de Identidades e Organizações
6. Sistema de Permissões (Camadas 1A e 1B)
7. Recursos Protegidos e Matriz de Autorização
8. Sistema de Constraints (Camadas 2A e 2B)
9. Regras Condicionais Avançadas
10. Cenários Práticos e Implementação
11. Performance e Troubleshooting

---

## Introdução e Conceitos Fundamentais

### O que é um Sistema de Autorização Multi-Tenant?

Imagine um **conglomerado bancário** que oferece serviços para múltiplas instituições financeiras. Cada banco (tenant) opera independentemente com suas próprias regras, funcionários e políticas de segurança, mas todos compartilham a mesma infraestrutura tecnológica central.

**Analogia Bancária:** É como um sistema do Banco Central que serve múltiplos bancos:

- **Banco do Brasil:** Tem políticas específicas de compliance
- **Itaú:** Tem validações particulares de KYC
- **Nubank:** Tem regras próprias de tecnologia

### Arquitetura de 4 Camadas de Segurança

O sistema implementa verificação em **4 camadas** progressivas, como um cofre bancário com múltiplas fechaduras:

```
🔓 CAMADA 1A: Permissões por Cargo (OR Logic) - "Função na empresa"
🔓 CAMADA 1B: Permissões Individuais (OR Logic) - "Poderes especiais"
🔒 CAMADA 2A: Constraints por Cargo+Operação (AND Logic) - "Compliance por função"
🔒 CAMADA 2B: Constraints por Usuário+Operação (AND Logic) - "Compliance individual"

AUTORIZAÇÃO = (1A OR 1B) AND 2A AND 2B
```

**Exemplo Prático:**

- **Camada 1:** Você é um **gerente autorizado** (permissão básica via cargo)
- **Camada 2:** Para transferências > R$ 100k precisa de **biometria + aprovação dupla** (constraints condicionais)

### Estrutura do Banco de Dados

O sistema é construído sobre uma fundação multi-tenant sólida:

```sql
-- Tenant raiz - isolamento total
business_partners (id, name, external_id_maestro)
business_partner_api_key (partner_id, api_key)

-- Identidades globais
system_users (id, name, external_id)
authentication (user_id, secret, partner_id)

-- Organização por tenant
bank_users_groups (id, name, partner_id)
bank_users (user_id, partner_id, group_id)

-- Permissões (Camada 1)
system_permissions (id, name, description)
bank_users_groups_permissions (group_id, system_permission_id)
user_permissions (user_id, system_permission_id, partner_id)

-- Recursos protegidos
system_resources (id, name, description)
permission_grants_resource (resource_id, permission_id, partner_id)

-- Constraints (Camada 2)
system_permission_constraints (id, name, partner_id)
bank_users_groups_constraints (group_id, constraint_id)
user_constraints (user_id, constraint_id, partner_id)
group_required_constraints (group_id, resource_id, constraint_id)
user_required_constraints (user_id, resource_id, constraint_id)
```

---

## 2. Arquivos Relevantes e Adição de Features

### 📁 Estrutura de Arquivos do Sistema de Autorização

O sistema de autorização está organizado em módulos específicos que trabalham em conjunto. Aqui está um mapa dos arquivos mais importantes:

#### 🔧 **Configuração Default (`src/authorization/default-config/`)**

**Arquivos Principais:**

- `default-config.service.ts` - Orquestrador principal da configuração inicial
- `default-resource-permission-grants.service.ts` - Criação automática de grants de permissão
- `config/default-groups.config.ts` - Define grupos padrão (Admin, Customer)
- `config/default-groups-permissions.config.ts` - Define permissões por grupo
- `config/default-permissions-grants-resource.config.ts` - Mapeia recursos para permissões

**Função:** Automatiza a criação de grupos, permissões e recursos quando um novo tenant é adicionado.

#### 🏢 **Gestão de Grupos (`src/bank-users-groups/`)**

**Arquivos Principais:**

- `groups-management.service.ts` - Criação e verificação de grupos obrigatórios
- `groups-permissions-management.service.ts` - Associação de permissões aos grupos
- `bank-users-groups.service.ts` - CRUD de grupos
- `bank-users-groups.controller.ts` - Endpoints REST

**Função:** Gerencia os grupos organizacionais e suas permissões (Camada 1A).

#### 🔐 **Sistema de Autorização (`src/authorization/`)**

**Arquivos Principais:**

- `authorization.service.ts` - Lógica principal de verificação de autorização
- `authorization.guard.ts` - Guard do NestJS para proteção de rotas
- `authorize.decorator.ts` - Decorator para marcar rotas protegidas
- `permissions/bank-user-permissions.ts` - Enum de todas as permissões
- `resources/resources.ts` - Enum de todos os recursos protegidos

**Função:** Implementa a verificação das 4 camadas de autorização.

### 🚀 **Como Adicionar uma Nova Feature**

#### **Passo 1: Definir Novos Recursos**

1. **Adicione o novo recurso em `resources/resources.ts`:**

```typescript
export enum Resources {
  // ...existing resources...

  // Nova Feature - Transferências Bancárias
  BankTransfersCreate = 'bank-transfers.create',
  BankTransfersRead = 'bank-transfers.read',
  BankTransfersUpdate = 'bank-transfers.update',
  BankTransfersDelete = 'bank-transfers.delete',
  BankTransfersApprove = 'bank-transfers.approve',
}
```

2. **Registre o recurso no banco de dados:**


O registro  acontece automaticamente na próxima execução do serviço de configuração default.

#### **Passo 2: Configurar Permissões Default**

1. **Atualize `default-permissions-grants-resource.config.ts`:**

```typescript
export const DEFAULT_PERMISSIONS_GRANTS_RESOURCE: Record<
  keyof typeof Resources,
  BankUserPermissions[]
> = {
  // ...existing mappings...

  BankTransfersCreate: [
    BankUserPermissions.SELF_CREATE,
    BankUserPermissions.GROUP_CREATE,
    BankUserPermissions.ADMIN_CREATE,
  ],
  BankTransfersApprove: [
    BankUserPermissions.ADMIN_EXECUTE,
    BankUserPermissions.WISIEX_ADMIN_EXECUTE,
  ],
};
```

2. **Considere se novos grupos são necessários em `default-groups.config.ts`:**

```typescript
export class DefaultGroupsConfig {
  // ...existing methods...

  public static buildTransferOperator(
    partnerName: string,
    partnerId: string,
  ): BankUsersGroup {
    const formattedName = `${partnerName}_TRANSFER_OPERATOR`
      .replaceAll(/\s+/g, '_')
      .toUpperCase();
    return new BankUsersGroup({
      name: formattedName,
      partner_id: partnerId,
    });
  }
}
```

#### **Passo 3: Proteger os Endpoints**

1. **Aplicar o decorator `@Authorize` no controller:**

```typescript
import { Authorize } from 'src/authorization/authorize/authorize.decorator';
import { Resources } from 'src/authorization/resources/resources';

@Controller('bank-transfers')
export class BankTransfersController {
  @Post()
  @Authorize(Resources.BankTransfersCreate)
  async create(@Body() data: CreateTransferDto) {
    // implementação
  }

  @Put(':id/approve')
  @Authorize(Resources.BankTransfersApprove)
  async approve(@Param('id') id: string) {
    // implementação
  }
}
```

2. **Configurar o AuthorizationGuard globalmente (já configurado):**

```typescript
// app.module.ts já tem esta configuração
providers: [
  {
    provide: APP_GUARD,
    useClass: AuthorizationGuard,
  },
];
```

#### **Passo 4: Implementar Constraints (Camada 2)**

1. **Se a feature precisar de validações condicionais, crie constraints:**

```sql
-- Exemplo: Transferências acima de R$ 10.000 precisam de aprovação dupla
INSERT INTO system_permission_constraints (id, name, partner_id) VALUES
(uuid_generate_v4(), 'HIGH_VALUE_TRANSFER_APPROVAL', 'partner-uuid');
```

2. **Associe constraints aos grupos/usuários conforme necessário:**

```sql
-- Grupo de operadores precisa desta constraint para transferências
INSERT INTO group_required_constraints (group_id, resource_id, constraint_id)
SELECT g.id, r.id, c.id
FROM bank_users_groups g, system_resources r, system_permission_constraints c
WHERE g.name LIKE '%_TRANSFER_OPERATOR'
  AND r.name = 'bank-transfers.create'
  AND c.name = 'HIGH_VALUE_TRANSFER_APPROVAL';
```

#### **Passo 5: Executar Configuração Default**

1. **A configuração default será executada automaticamente no próximo restart da aplicação**

2. **Ou execute manualmente via endpoint:**

```bash
# Força recriação da configuração default
curl -X POST http://localhost:30000/default-config/reset \
  -H "x-api-key: admin_api_key"
```

### 🔍 **Fluxo de Verificação de Autorização**

Quando um usuário tenta acessar um endpoint protegido:

```mermaid
graph TD
    A[Request] --> B[AuthorizationGuard]
    B --> C{Resource Defined?}
    C -->|No| D[Allow Access]
    C -->|Yes| E[AuthorizationService.isAuthorized]
    E --> F[Check Layer 1A: Group Permissions]
    E --> G[Check Layer 1B: User Permissions]
    E --> H[Check Layer 2A: Group Constraints]
    E --> I[Check Layer 2B: User Constraints]
    F --> J{(1A OR 1B) AND 2A AND 2B?}
    G --> J
    H --> J
    I --> J
    J -->|Yes| K[Allow Access]
    J -->|No| L[Deny Access]
```

### 📝 **Checklist para Nova Feature**

- [ ] ✅ Recursos definidos em `resources.ts`
- [ ] ✅ Recursos registrados no banco (`system_resources`)
- [ ] ✅ Mapeamento em `default-permissions-grants-resource.config.ts`
- [ ] ✅ Novos grupos criados (se necessário) em `default-groups.config.ts`
- [ ] ✅ Permissões dos grupos atualizadas em `default-groups-permissions.config.ts`
- [ ] ✅ Decorator `@Authorize` aplicado nos endpoints
- [ ] ✅ Constraints criadas (se necessário)
- [ ] ✅ Configuração default executada
- [ ] ✅ Testes de autorização implementados

### 🛠️ **Arquivos de Teste Relevantes**

Para garantir que sua feature funciona corretamente:

- `test/authorization.e2e-spec.ts` - Testes end-to-end de autorização
- `src/authorization/authorization.service.spec.ts` - Testes unitários do serviço
- `test/permission-tests/` - Cenários específicos de permissões

---

## Arquitetura do Sistema

### Entidades Principais e suas Funções

#### 🏛️ Business Partners (Tenants)

**Conceito:** Cada tenant é um universo isolado
**Implementação:** `business_partners` é a raiz do isolamento
**API:** `/business-partners` para gestão

```sql
-- Exemplo: Diferentes bancos com regras próprias
INSERT INTO business_partners (id, name) VALUES
('banco-a-uuid', 'Banco Tradicional S.A.'),
('fintech-b-uuid', 'FinTech Inovadora Ltda.');
```

#### 👨‍💼 Sistema de Identidades

**Conceito:** Usuários globais vinculados a tenants específicos
**Implementação:** `system_users` + `bank_users`
**API:** `/system-users` + `/bank-users`

```bash
# Criar identidade global
curl -X POST http://localhost:30000/system-users \
  -H "Content-Type: application/json" \
  -d '{"name": "João Silva", "externalId": "joao@empresa.com"}'

# Vincular ao tenant específico
curl -X POST http://localhost:30000/bank-users \
  -H "x-api-key: tenant_api_key" \
  -d '{"systemUser": {...}, "bankUser": {"groupId": "cargo-uuid"}}'
```

#### 🏢 Grupos Organizacionais

**Conceito:** Cargos/departamentos dentro de cada tenant
**Implementação:** `bank_users_groups` com isolamento por `partner_id`
**API:** `/bank-users-groups`

```sql
-- Mesmo nome, tenants diferentes, regras independentes
INSERT INTO bank_users_groups (name, partner_id) VALUES
('GERENTE', 'banco-a-uuid'),  -- Gerente do Banco A
('GERENTE', 'fintech-b-uuid'); -- Gerente da FinTech B
```

---

## Configuração Inicial e Primeiros Passos

### Passo 1: Registrar Nova Instituição

**Objetivo:** Criar um novo tenant no sistema
**Banco de Dados:** Inserir em `business_partners`
**API:** `/partner-api-keys`

```bash
# ⚠️ Operação de nível SISTEMA (requer chave master)
curl -X POST http://localhost:30000/partner-api-keys \
  -H "x-api-key: SISTEMA_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "partnerId": "nova-empresa-uuid",
    "description": "Chave API para Nova Empresa Ltda"
  }'
```

**Resultado do Banco:**

```sql
-- Criado automaticamente em business_partners
INSERT INTO business_partners (id, name) VALUES
('nova-empresa-uuid', 'Nova Empresa Ltda');

-- Chave API gerada
INSERT INTO business_partner_api_key (partner_id, api_key) VALUES
('nova-empresa-uuid', 'nova_empresa_api_key_xyz123');
```

### Passo 2: Criar Primeiro Administrador

**Objetivo:** Estabelecer usuário com poderes administrativos
**Banco de Dados:** `system_users` + `bank_users` + `authentication`
**API:** `/partner-system-user/setup`

```bash
curl -X POST http://localhost:30000/partner-system-user/setup \
  -H "x-api-key: nova_empresa_api_key_xyz123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carlos Administrador",
    "email": "carlos.admin@novaempresa.com",
    "password": "senhaSegura123",
    "groupName": "ADMIN_GERAL"
  }'
```

**Operações no Banco:**

```sql
-- 1. Criar identidade global
INSERT INTO system_users (id, name, external_id) VALUES
('user-carlos-uuid', 'Carlos Administrador', 'carlos.admin@novaempresa.com');

-- 2. Criar grupo administrativo
INSERT INTO bank_users_groups (id, name, partner_id) VALUES
('admin-group-uuid', 'ADMIN_GERAL', 'nova-empresa-uuid');

-- 3. Vincular usuário ao tenant e grupo
INSERT INTO bank_users (user_id, partner_id, group_id, external_id) VALUES
('user-carlos-uuid', 'nova-empresa-uuid', 'admin-group-uuid', 'CARLOS001');

-- 4. Configurar autenticação
INSERT INTO authentication (user_id, secret, partner_id) VALUES
('user-carlos-uuid', 'hashed_password', 'nova-empresa-uuid');
```

### Passo 3: Login e Obtenção de Token

**Objetivo:** Autenticar e obter token JWT para operações
**API:** `/auth/login`

```bash
curl -X POST http://localhost:30000/auth/login \
  -H "x-api-key: nova_empresa_api_key_xyz123" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos.admin@novaempresa.com",
    "password": "senhaSegura123"
  }'
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-carlos-uuid",
    "name": "Carlos Administrador",
    "partnerId": "nova-empresa-uuid"
  }
}
```

---

## Gestão de Identidades e Organizações

### Criando Estrutura Organizacional

**Objetivo:** Definir departamentos/cargos do tenant
**Banco de Dados:** `bank_users_groups`
**API:** `/bank-users-groups`

```bash
# Criar departamento Financeiro
curl -X POST http://localhost:30000/bank-users-groups \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "FINANCEIRO",
    "description": "Departamento de análise e operações financeiras"
  }'

# Criar departamento Atendimento
curl -X POST http://localhost:30000/bank-users-groups \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ATENDIMENTO",
    "description": "Caixas e atendentes de linha de frente"
  }'
```

### Contratando Novos Funcionários

**Objetivo:** Adicionar usuários aos departamentos
**API:** `/bank-users`

```bash
# Contratar analista financeiro
curl -X POST http://localhost:30000/bank-users \
  -H "x-api-key: nova_empresa_api_key_xyz123" \
  -H "Content-Type: application/json" \
  -d '{
    "systemUser": {
      "name": "Ana Analista",
      "externalId": "ana.analista@novaempresa.com"
    },
    "bankUser": {
      "externalId": "ANA001",
      "groupId": "financeiro-group-uuid"
    },
    "authentication": {
      "password": "senhaSeguraAna456"
    }
  }'
```

**Operações no Banco:**

```sql
-- Vinculação completa usuário → tenant → grupo
INSERT INTO system_users (id, name, external_id) VALUES
('user-ana-uuid', 'Ana Analista', 'ana.analista@novaempresa.com');

INSERT INTO bank_users (user_id, partner_id, group_id, external_id) VALUES
('user-ana-uuid', 'nova-empresa-uuid', 'financeiro-group-uuid', 'ANA001');

INSERT INTO authentication (user_id, secret, partner_id) VALUES
('user-ana-uuid', 'hashed_password_ana', 'nova-empresa-uuid');
```

---

## Sistema de Permissões

### Camada 1A: Permissões por Grupo (RBAC Tradicional)

**Conceito:** Definir o que cada cargo pode fazer
**Banco de Dados:** `system_permissions` + `bank_users_groups_permissions`
**API:** `/bank-users-groups-permissions`

#### Definindo Operações Disponíveis

```sql
-- Catálogo global de operações
INSERT INTO system_permissions (id, name, description) VALUES
('perm-user-manage', 'user:manage', 'Gerenciar usuários do sistema'),
('perm-financial-transfer', 'financial:transfer', 'Executar transferências financeiras'),
('perm-reports-view', 'reports:view', 'Visualizar relatórios gerenciais'),
('perm-admin-override', 'admin:override', 'Sobrescrever validações do sistema');
```

#### Atribuindo Permissões aos Grupos

```bash
# FINANCEIRO pode fazer transferências
curl -X POST http://localhost:30000/bank-users-groups-permissions \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "systemPermissionId": "perm-financial-transfer",
    "groupId": "financeiro-group-uuid"
  }'

# ADMIN_GERAL pode gerenciar usuários
curl -X POST http://localhost:30000/bank-users-groups-permissions \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "systemPermissionId": "perm-user-manage",
    "groupId": "admin-group-uuid"
  }'
```

**Resultado no Banco:**

```sql
-- Permissões por grupo
INSERT INTO bank_users_groups_permissions (system_permission_id, group_id) VALUES
('perm-financial-transfer', 'financeiro-group-uuid'),
('perm-user-manage', 'admin-group-uuid'),
('perm-admin-override', 'admin-group-uuid');
```

### Camada 1B: Permissões Individuais (Exceções)

**Conceito:** Permissões especiais para usuários específicos
**Banco de Dados:** `user_permissions`
**API:** `/user-permissions`

```bash
# Ana Analista ganha permissão temporária de gestão (30 dias)
curl -X POST http://localhost:30000/user-permissions \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "systemPermissionId": "perm-user-manage",
    "userId": "user-ana-uuid",
    "grantedReason": "Substituição temporária do gestor durante férias",
    "expiresAt": "2025-07-09T09:00:00Z"
  }'
```

**Resultado no Banco:**

```sql
INSERT INTO user_permissions (
  system_permission_id, user_id, partner_id,
  granted_reason, expires_at
) VALUES (
  'perm-user-manage', 'user-ana-uuid', 'nova-empresa-uuid',
  'Substituição temporária do gestor durante férias', '2025-07-09 09:00:00'
);
```

---

## Recursos Protegidos e Matriz de Autorização

### Definindo Recursos do Sistema

**Conceito:** Endpoints e funcionalidades que requerem autorização
**Banco de Dados:** `system_resources`

```sql
-- Catálogo de recursos protegidos
INSERT INTO system_resources (id, name, description) VALUES
('res-api-users', '/api/users', 'Endpoint de gestão de usuários'),
('res-api-transfers', '/api/transfers', 'Endpoint de transferências'),
('res-function-reports', 'reports.generate', 'Funcionalidade de geração de relatórios'),
('res-admin-config', '/api/admin/config', 'Configurações administrativas');
```

### Configurando a Matriz de Autorização

**Conceito:** Conectar permissões aos recursos por tenant
**Banco de Dados:** `permission_grants_resource`
**API:** `/permission-grants-resource`

```bash
# Para acessar /api/transfers é necessário ter financial:transfer
curl -X POST http://localhost:30000/permission-grants-resource \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": "res-api-transfers",
    "permissionId": "perm-financial-transfer"
  }'

# Para acessar /api/users é necessário ter user:manage
curl -X POST http://localhost:30000/permission-grants-resource \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": "res-api-users",
    "permissionId": "perm-user-manage"
  }'
```

**Resultado no Banco:**

```sql
-- Matriz configurável por tenant
INSERT INTO permission_grants_resource (resource_id, permission_id, partner_id) VALUES
('res-api-transfers', 'perm-financial-transfer', 'nova-empresa-uuid'),
('res-api-users', 'perm-user-manage', 'nova-empresa-uuid'),
('res-admin-config', 'perm-admin-override', 'nova-empresa-uuid');
```

### Verificando Acesso Básico

```bash
# Listar configurações de acesso do tenant
curl -X GET http://localhost:30000/permission-grants-resource \
  -H "Authorization: Bearer JWT_TOKEN"
```

**Response:**

```json
[
  {
    "id": "grant-uuid",
    "resource": {
      "name": "/api/transfers",
      "description": "Endpoint de transferências"
    },
    "permission": {
      "name": "financial:transfer",
      "description": "Executar transferências financeiras"
    },
    "partnerId": "nova-empresa-uuid"
  }
]
```

---

## Sistema de Constraints

### Camada 2: Validações Adicionais de Segurança

**Conceito:** Além da permissão, exigir validações extras
**Banco de Dados:** `system_permission_constraints`

### Criando Constraints por Tenant

**API:** `/system-permission-constraints`

```bash
# Constraint de autenticação multi-fator
curl -X POST http://localhost:30000/system-permission-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "mfa:validated",
    "description": "Autenticação multi-fator validada"
  }'

# Constraint de aprovação dupla
curl -X POST http://localhost:30000/system-permission-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "dual:approval",
    "description": "Aprovação de dois funcionários obrigatória"
  }'

# Constraint de horário bancário
curl -X POST http://localhost:30000/system-permission-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "business-hours:only",
    "description": "Operação permitida apenas em horário comercial"
  }'
```

**Resultado no Banco:**

```sql
-- Constraints específicos por tenant
INSERT INTO system_permission_constraints (id, name, description, partner_id) VALUES
('const-mfa', 'mfa:validated', 'Autenticação multi-fator validada', 'nova-empresa-uuid'),
('const-dual', 'dual:approval', 'Aprovação dupla obrigatória', 'nova-empresa-uuid'),
('const-hours', 'business-hours:only', 'Apenas horário comercial', 'nova-empresa-uuid');
```

### Camada 2A: Constraints por Grupo

**Conceito:** Grupos possuem determinadas validações
**Banco de Dados:** `bank_users_groups_constraints`
**API:** `/bank-users-groups-constraints`

```bash
# FINANCEIRO possui MFA configurado
curl -X POST http://localhost:30000/bank-users-groups-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "financeiro-group-uuid",
    "constraintId": "const-mfa"
  }'

# ADMIN_GERAL possui aprovação dupla configurada
curl -X POST http://localhost:30000/bank-users-groups-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "admin-group-uuid",
    "constraintId": "const-dual"
  }'
```

### Camada 2B: Constraints Individuais

**Conceito:** Usuários específicos com validações extras
**Banco de Dados:** `user_constraints`
**API:** `/user-constraints`

```bash
# Carlos Admin ganha constraint especial temporário
curl -X POST http://localhost:30000/user-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-carlos-uuid",
    "constraintId": "const-hours",
    "grantedReason": "Restrição de horário para operações críticas",
    "expiresAt": "2025-12-31T23:59:59Z"
  }'
```

---

## Regras Condicionais Avançadas

### Constraints Condicionais por Grupo

**Conceito:** SE grupo X quer acessar recurso Y, ENTÃO precisa constraint Z
**Banco de Dados:** `group_required_constraints`
**API:** `/group-required-constraints`

```bash
# SE FINANCEIRO quer acessar /api/transfers, ENTÃO precisa MFA
curl -X POST http://localhost:30000/group-required-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "financeiro-group-uuid",
    "resourceId": "res-api-transfers",
    "constraintId": "const-mfa"
  }'

# SE ADMIN_GERAL quer acessar config, ENTÃO precisa aprovação dupla
curl -X POST http://localhost:30000/group-required-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "admin-group-uuid",
    "resourceId": "res-admin-config",
    "constraintId": "const-dual"
  }'
```

### Constraints Condicionais Individuais

**Conceito:** SE usuário X quer acessar recurso Y, ENTÃO precisa constraint Z
**Banco de Dados:** `user_required_constraints`
**API:** `/user-required-constraints`

```bash
# SE Carlos especificamente quer acessar config, ENTÃO precisa horário comercial
curl -X POST http://localhost:30000/user-required-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-carlos-uuid",
    "resourceId": "res-admin-config",
    "constraintId": "const-hours",
    "appliedReason": "Restrição adicional para operações críticas de sistema"
  }'
```

**Resultado no Banco:**

```sql
-- Regras condicionais armazenadas
INSERT INTO group_required_constraints (group_id, resource_id, constraint_id, partner_id) VALUES
('financeiro-group-uuid', 'res-api-transfers', 'const-mfa', 'nova-empresa-uuid'),
('admin-group-uuid', 'res-admin-config', 'const-dual', 'nova-empresa-uuid');

INSERT INTO user_required_constraints (user_id, resource_id, constraint_id, partner_id, applied_reason) VALUES
('user-carlos-uuid', 'res-admin-config', 'const-hours', 'nova-empresa-uuid', 'Restrição adicional para operações críticas');
```

---

## Cenários Práticos e Implementação

### Cenário 1: Configuração de uma FinTech

**Objetivo:** Configurar uma startup financeira com regras específicas

#### 1. Estrutura Organizacional

```bash
# Criar grupos específicos da FinTech
curl -X POST http://localhost:30000/bank-users-groups \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"name": "DEVELOPERS", "description": "Equipe de desenvolvimento"}'

curl -X POST http://localhost:30000/bank-users-groups \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"name": "RISK_ANALYSTS", "description": "Analistas de risco"}'

curl -X POST http://localhost:30000/bank-users-groups \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"name": "CUSTOMER_SUCCESS", "description": "Sucesso do cliente"}'
```

#### 2. Permissões por Grupo

```bash
# DEVELOPERS podem gerenciar sistema
curl -X POST http://localhost:30000/bank-users-groups-permissions \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"systemPermissionId": "perm-admin-override", "groupId": "developers-uuid"}'

# RISK_ANALYSTS podem fazer análises financeiras
curl -X POST http://localhost:30000/bank-users-groups-permissions \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"systemPermissionId": "perm-financial-transfer", "groupId": "risk-uuid"}'
```

#### 3. Constraints Específicos da FinTech

```bash
# Constraint de certificação de desenvolvedor
curl -X POST http://localhost:30000/system-permission-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"name": "dev:certified", "description": "Desenvolvedor certificado"}'

# Constraint de limite de API
curl -X POST http://localhost:30000/system-permission-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"name": "api:rate-limit", "description": "Limite de taxa de API validado"}'
```

#### 4. Regras Condicionais

```bash
# SE DEVELOPERS quer acessar config, ENTÃO precisa certificação
curl -X POST http://localhost:30000/group-required-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{
    "groupId": "developers-uuid",
    "resourceId": "res-admin-config",
    "constraintId": "dev-certified-uuid"
  }'
```

### Cenário 2: Banco Tradicional com Alta Segurança

**Objetivo:** Implementar múltiplas camadas de segurança

#### 1. Constraints Bancários Rigorosos

```bash
# Validação biométrica
curl -X POST http://localhost:30000/system-permission-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"name": "biometric:required", "description": "Validação biométrica obrigatória"}'

# KYC completo
curl -X POST http://localhost:30000/system-permission-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"name": "kyc:validated", "description": "KYC completo validado"}'

# Aprovação de supervisor
curl -X POST http://localhost:30000/system-permission-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"name": "supervisor:approval", "description": "Aprovação de supervisor necessária"}'
```

#### 2. Múltiplas Validações por Operação

```bash
# Transferências > R$ 100k precisam de biometria + KYC + supervisor
curl -X POST http://localhost:30000/group-required-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"groupId": "gerentes-uuid", "resourceId": "transfers-high-value", "constraintId": "biometric-uuid"}'

curl -X POST http://localhost:30000/group-required-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"groupId": "gerentes-uuid", "resourceId": "transfers-high-value", "constraintId": "kyc-uuid"}'

curl -X POST http://localhost:30000/group-required-constraints \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"groupId": "gerentes-uuid", "resourceId": "transfers-high-value", "constraintId": "supervisor-uuid"}'
```

---

## Performance e Troubleshooting

### Query CTE de Verificação de Autorização

O sistema utiliza uma query CTE otimizada que verifica todas as 4 camadas em <5ms:

```sql
WITH
-- CTE 1: Informações básicas do usuário
user_context AS (
    SELECT
        su.id as user_id,
        bu.partner_id,
        bu.group_id,
        bu.id as bank_user_id
    FROM system_users su
    INNER JOIN bank_users bu ON su.id = bu.user_id
    WHERE su.id = ${userId}
      AND su.deleted_at IS NULL
      AND bu.deleted_at IS NULL
),

-- CTE 2: Constantes da verificação (MODIFICADO para usar nome)
verification_constants AS (
    SELECT
        sr.id as resource_id,
        ${Prisma.raw(`'${formattedCheckTime}'`)} as check_time
    FROM system_resources sr
    WHERE sr.name = ${resourceName}
      AND sr.deleted_at IS NULL
),

-- CTE 3: Permissões via grupos (CAMADA 1A)
group_permissions AS (
    SELECT DISTINCT 1 as has_permission
    FROM user_context uc
    CROSS JOIN verification_constants vc
    INNER JOIN bank_users_groups bug ON uc.group_id = bug.id
    INNER JOIN bank_users_groups_permissions bugp ON bug.id = bugp.group_id
    INNER JOIN system_permissions sp ON bugp.system_permission_id = sp.id
    INNER JOIN permission_grants_resource pgr ON sp.id = pgr.permission_id
    INNER JOIN system_resources sr ON pgr.resource_id = sr.id
    WHERE sr.id = vc.resource_id
      AND bug.deleted_at IS NULL
      AND bugp.deleted_at IS NULL
      AND sp.deleted_at IS NULL
      AND pgr.deleted_at IS NULL
      AND sr.deleted_at IS NULL
      AND pgr.partner_id = uc.partner_id
),

-- CTE 4: Permissões diretas do usuário (CAMADA 1B)
direct_user_permissions AS (
    SELECT DISTINCT 1 as has_permission
    FROM user_context uc
    CROSS JOIN verification_constants vc
    INNER JOIN user_permissions up ON uc.user_id = up.user_id
    INNER JOIN system_permissions sp ON up.system_permission_id = sp.id
    INNER JOIN permission_grants_resource pgr ON sp.id = pgr.permission_id
    INNER JOIN system_resources sr ON pgr.resource_id = sr.id
    WHERE sr.id = vc.resource_id
      AND up.deleted_at IS NULL
      AND sp.deleted_at IS NULL
      AND pgr.deleted_at IS NULL
      AND sr.deleted_at IS NULL
      AND pgr.partner_id = uc.partner_id
      AND (up.expires_at IS NULL OR up.expires_at > vc.check_time)
),

-- CTE 5: Constraints obrigatórios do grupo para o recurso
group_required_constraints_count AS (
    SELECT
        COALESCE(COUNT(DISTINCT grc.constraint_id), 0) as required_count
    FROM user_context uc
    CROSS JOIN verification_constants vc
    LEFT JOIN group_required_constraints grc ON uc.group_id = grc.group_id
                                              AND grc.resource_id = vc.resource_id
                                              AND grc.partner_id = uc.partner_id
                                              AND grc.deleted_at IS NULL
    LEFT JOIN system_permission_constraints spc ON grc.constraint_id = spc.id
                                                  AND spc.partner_id = uc.partner_id
                                                  AND spc.deleted_at IS NULL
),

-- CTE 6: Constraints que o usuário possui (via grupo) dos requeridos
group_constraints_owned AS (
    SELECT
        COALESCE(COUNT(DISTINCT grc.constraint_id), 0) as owned_count
    FROM user_context uc
    CROSS JOIN verification_constants vc
    LEFT JOIN bank_users_groups bug ON uc.group_id = bug.id
                                     AND bug.deleted_at IS NULL
    LEFT JOIN bank_users_groups_constraints bugc ON bug.id = bugc.group_id
                                                   AND bugc.deleted_at IS NULL
    LEFT JOIN system_permission_constraints spc ON bugc.constraint_id = spc.id
                                                  AND spc.partner_id = uc.partner_id
                                                  AND spc.deleted_at IS NULL
    LEFT JOIN group_required_constraints grc ON spc.id = grc.constraint_id
                                               AND uc.group_id = grc.group_id
                                               AND grc.resource_id = vc.resource_id
                                               AND grc.partner_id = uc.partner_id
                                               AND grc.deleted_at IS NULL
),

-- CTE 7: Constraints obrigatórios específicos do usuário para o recurso
user_required_constraints_count AS (
    SELECT
        COALESCE(COUNT(DISTINCT urc.constraint_id), 0) as required_count
    FROM user_context uc
    CROSS JOIN verification_constants vc
    LEFT JOIN user_required_constraints urc ON uc.user_id = urc.user_id
                                             AND urc.resource_id = vc.resource_id
                                             AND urc.partner_id = uc.partner_id
                                             AND urc.deleted_at IS NULL
                                             AND (urc.expires_at IS NULL OR urc.expires_at > vc.check_time)
    LEFT JOIN system_permission_constraints spc ON urc.constraint_id = spc.id
                                                  AND spc.partner_id = uc.partner_id
                                                  AND spc.deleted_at IS NULL
),

-- CTE 8: Constraints que o usuário realmente possui dos obrigatórios específicos
user_constraints_owned AS (
    SELECT
        COALESCE(COUNT(DISTINCT urc.constraint_id), 0) as owned_count
    FROM user_context uc
    CROSS JOIN verification_constants vc
    LEFT JOIN user_required_constraints urc ON uc.user_id = urc.user_id
                                             AND urc.resource_id = vc.resource_id
                                             AND urc.partner_id = uc.partner_id
                                             AND urc.deleted_at IS NULL
                                             AND (urc.expires_at IS NULL OR urc.expires_at > vc.check_time)
    LEFT JOIN user_constraints uc_owned ON urc.constraint_id = uc_owned.constraint_id
                                         AND urc.user_id = uc_owned.user_id
                                         AND urc.partner_id = uc_owned.partner_id
                                         AND uc_owned.deleted_at IS NULL
                                         AND (uc_owned.expires_at IS NULL OR uc_owned.expires_at > vc.check_time)
    LEFT JOIN system_permission_constraints spc ON uc_owned.constraint_id = spc.id
                                                  AND spc.partner_id = uc.partner_id
                                                  AND spc.deleted_at IS NULL
),

-- CTE 9: Consolidação das verificações de permissão
permission_check AS (
    SELECT
        CASE
            WHEN EXISTS(SELECT 1 FROM group_permissions)
                OR EXISTS(SELECT 1 FROM direct_user_permissions)
            THEN 1
            ELSE 0
        END as has_base_permission
),

-- CTE 10: Consolidação das verificações de constraints
constraint_check AS (
    SELECT IF(COALESCE((SELECT required_count FROM group_required_constraints_count), 0) = 0
                  OR COALESCE((SELECT required_count FROM group_required_constraints_count), 0) =
                     COALESCE((SELECT owned_count FROM group_constraints_owned), 0),
                IF(COALESCE((SELECT required_count FROM user_required_constraints_count), 0) = 0
                       OR COALESCE((SELECT required_count FROM user_required_constraints_count), 0) =
                          COALESCE((SELECT owned_count FROM user_constraints_owned), 0), 1, 0), 0) as has_required_constraints
)

-- RESULTADO FINAL
SELECT
    IF(pc.has_base_permission = 1 AND cc.has_required_constraints = 1, 1, 0) as has_permission
FROM permission_check pc
CROSS JOIN constraint_check cc;
```

### Verificação de Permissões de Usuário

```bash
# Ver permissões de um grupo específico
curl -X GET http://localhost:30000/bank-users-groups-permissions/group/{groupId} \
  -H "Authorization: Bearer JWT_TOKEN"

# Ver permissões individuais de um usuário
curl -X GET http://localhost:30000/user-permissions/user/{userId} \
  -H "Authorization: Bearer JWT_TOKEN"

# Ver constraints de um grupo
curl -X GET http://localhost:30000/bank-users-groups-constraints/group/{groupId} \
  -H "Authorization: Bearer JWT_TOKEN"

# Ver constraints individuais
curl -X GET http://localhost:30000/user-constraints/by-user/{userId} \
  -H "Authorization: Bearer JWT_TOKEN"
```

### Códigos de Erro e Soluções

#### 401 - Não Autorizado

```json
{ "statusCode": 401, "message": "Unauthorized" }
```

**Causa:** Token JWT expirado ou inválido
**Solução:** Refazer login via `/auth/login`

#### 403 - Operação Negada

```json
{ "statusCode": 403, "message": "Forbidden" }
```

**Causa:** Usuário sem permissão ou constraint não atendido
**Solução:** Verificar permissões e constraints do usuário

#### 400 - Dados Inválidos

```json
{ "statusCode": 400, "message": ["groupId deve ser um UUID válido"] }
```

**Causa:** Formato incorreto dos dados
**Solução:** Validar UUIDs e estrutura JSON

### Boas Práticas

1. **Princípio do Menor Privilégio:** Conceda apenas permissões mínimas necessárias
2. **Use Grupos:** Prefira `bank_users_groups_permissions` sobre `user_permissions`
3. **Expire Temporários:** Use `expires_at` para permissões/constraints temporários
4. **Documente Justificativas:** Preencha `granted_reason` para auditoria
5. **Teste Incremental:** Configure e teste cada camada separadamente

### Fluxo Recomendado

1. ✅ Registrar tenant via `/partner-api-keys`
2. ✅ Criar admin via `/partner-system-user/setup`
3. ✅ Login via `/auth/login`
4. ✅ Criar grupos via `/bank-users-groups`
5. ✅ Configurar permissões via `/bank-users-groups-permissions`
6. ✅ Configurar matriz via `/permission-grants-resource`
7. ✅ Criar constraints via `/system-permission-constraints`
8. ✅ Configurar regras condicionais via `/group-required-constraints`
9. ✅ Adicionar usuários via `/bank-users`
10. ✅ Testar cenários de autorização

---
