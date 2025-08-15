# 🚀 Guia Completo de Configuração Inicial do Sistema Assemble

## 📋 Índice

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Pré-requisitos](#pré-requisitos)
3. [Fluxo 1: Cadastro de Cliente e Onboarding](#fluxo-1-cadastro-de-cliente-e-onboarding)
4. [Detalhamento dos Endpoints](#detalhamento-dos-endpoints)
5. [Sistema de Permissões](#sistema-de-permissões)
6. [Testes de Validação](#testes-de-validação)
7. [Troubleshooting](#troubleshooting)

---

## Visão Geral do Sistema

O **Assemble** é um sistema de autorização multi-tenant RBAC (Role-Based Access Control) que permite a gestão de múltiplos parceiros bancários com isolamento completo de dados e configurações personalizadas de permissões.

### Arquitetura de 4 Camadas de Segurança

```
🔓 CAMADA 1A: Permissões por Cargo (OR Logic) - "Função na empresa"
🔓 CAMADA 1B: Permissões Individuais (OR Logic) - "Poderes especiais"
🔒 CAMADA 2A: Constraints por Cargo+Operação (AND Logic) - "Compliance por função"
🔒 CAMADA 2B: Constraints por Usuário+Operação (AND Logic) - "Compliance individual"

AUTORIZAÇÃO = (1A OR 1B) AND 2A AND 2B
```

### Entidades Principais

- **Business Partners**: Tenants (bancos/fintechs)
- **System Users**: Identidades globais no sistema
- **Bank Users**: Usuários específicos por tenant
- **Bank Users Groups**: Grupos/cargos por tenant
- **System Permissions**: Catálogo de permissões
- **System Resources**: Recursos protegidos
- **Constraints**: Regras condicionais de compliance

---

## Pré-requisitos

### Configuração do Ambiente

```bash
# Variáveis de ambiente necessárias
DATABASE_URL="mysql://user:password@localhost:3306/assemble"
API_HOST="http://localhost:30000"
```

### Credenciais Padrão (Local)

```yaml
# Configuração Local (Environment Variables)
base_url: http://localhost:30000
apiKey: 379eebde-8784-4437-a968-f568cb3c2ef1
wisiexAdminPassword: your-default-partner-admin-secret-here-change-in-production
partnerAdminPassword: xptopsw123@
customerUserPassword: defaultUserPassowrd
```

---

## Fluxo 1: Cadastro de Cliente e Onboarding

Este é o fluxo principal para configurar um novo parceiro bancário no sistema, criar usuários administrativos e realizar os primeiros testes de permissionamento.

### Resumo dos Passos

1. **Criar o Parceiro (Business Partner)**
2. **Criar Chave de API do Parceiro**
3. **Configurar Usuário Administrativo do Parceiro**
4. **Realizar Login como Administrador do Parceiro**
5. **Validar Permissões (Opcional)**

---

## Detalhamento dos Endpoints

### **Passo 1: Criar o Parceiro**

**Endpoint:** `POST /business-partners`

**Headers:**

```http
x-api-key: 379eebde-8784-4437-a968-f568cb3c2ef1
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Banco Exemplo S.A.",
  "externalIdMaestro": "BANCO_EXEMPLO_001",
  "credentialsMaestro": {
    "clientId": "banco_exemplo_client",
    "clientSecret": "banco_exemplo_secret",
    "environment": "sandbox"
  },
  "credentialsWatchman": {
    "apiKey": "watchman_api_key_exemplo",
    "endpoint": "https://api.watchman.exemplo.com",
    "environment": "sandbox"
  }
}
```

**Resposta Esperada:**

```json
{
  "id": "4c4ece0f-42dd-11f0-b5f6-2244e3bdcc12",
  "name": "Banco Exemplo S.A.",
  "externalIdMaestro": "BANCO_EXEMPLO_001",
  "createdAt": "2025-06-17T10:00:00.000Z"
}
```

### **Passo 2: Criar Chave de API do Parceiro**

**Endpoint:** `POST /partner-api-keys`

**Headers:**

```http
x-api-key: 379eebde-8784-4437-a968-f568cb3c2ef1
Content-Type: application/json
```

**Body:**

```json
{
  "partnerId": "4c4ece0f-42dd-11f0-b5f6-2244e3bdcc12"
}
```

**Resposta Esperada:**

```json
{
  "id": "key-uuid-example",
  "partnerId": "4c4ece0f-42dd-11f0-b5f6-2244e3bdcc12",
  "apiKey": "b03014d8-0185-4a22-9a9a-0cd83b142a9b",
  "createdAt": "2025-06-17T10:01:00.000Z"
}
```

### **Passo 3: Criar Usuário Administrativo do Parceiro**

**Endpoint:** `POST /partner-system-user/setup`

**Headers:**

```http
x-api-key: b03014d8-0185-4a22-9a9a-0cd83b142a9b
Content-Type: application/json
```

**Body:**

```json
{
  "systemUser": {
    "name": "Administrador Banco Exemplo",
    "email": "admin@bancoexemplo.com.br",
    "externalId": "admin_banco_exemplo_001"
  },
  "authentication": {
    "externalSecret": "xptopsw123@"
  },
  "bankUser": {
    "groupName": "PARTNER_BANCO_EXEMPLO_ADMIN"
  }
}
```

**Resposta Esperada:**

```json
{
  "systemUserId": "75950dd0-42e4-11f0-b5f6-2244e3bdcc12",
  "bankUserId": "bank-user-uuid",
  "groupId": "75960584-42e4-11f0-b5f6-2244e3bdcc12",
  "message": "Partner admin user successfully created"
}
```

### **Passo 4: Login como Administrador do Parceiro**

**Endpoint:** `POST /auth/login`

**Headers:**

```http
x-api-key: b03014d8-0185-4a22-9a9a-0cd83b142a9b
Content-Type: application/json
```

**Body:**

```json
{
  "assembleUserId": "75950dd0-42e4-11f0-b5f6-2244e3bdcc12",
  "externalSecret": "xptopsw123@"
}
```

**Resposta Esperada:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "75950dd0-42e4-11f0-b5f6-2244e3bdcc12",
    "name": "Administrador Banco Exemplo",
    "email": "admin@bancoexemplo.com.br",
    "partnerId": "4c4ece0f-42dd-11f0-b5f6-2244e3bdcc12"
  }
}
```

---

## Sistema de Permissões

### Configuração Automática de Permissões

O sistema configura automaticamente permissões baseadas em padrões de nomenclatura dos grupos:

#### **🔴 WISIEX\_\*\_ADMIN (Super Administradores)**

- **Todas as permissões** do sistema
- Acesso completo a todos os recursos
- Gerenciamento de todos os tenants

**Permissões Incluídas:**

```typescript
// Todas as permissões disponíveis
Object.values(BankUserPermissions);
```

#### **🟡 PARTNER\_\*\_ADMIN (Administradores do Parceiro)**

- **Todas exceto `wisiex_admin:*`**
- Gerenciamento completo dentro do seu tenant
- Não podem acessar configurações da plataforma

**Permissões Incluídas:**

```typescript
// Filtro: !permission.startsWith('wisiex_admin')
[
  'bank_users_groups:create',
  'bank_users_groups:read',
  'bank_users_groups:update',
  'bank_users_groups:delete',
  'bank_users:create',
  'bank_users:read',
  'bank_users:update',
  'bank_users:delete',
  'user_permissions:create',
  'user_permissions:read',
  'user_permissions:update',
  'user_permissions:delete',
  // ... outras permissões não-wisiex
];
```

#### **🟢 \*\_CUSTOMER (Usuários Finais)**

- **Apenas `self:*`**
- Ações limitadas aos próprios recursos
- Interface de usuário final

**Permissões Incluídas:**

```typescript
// Filtro: permission.startsWith('self')
['self:read_one', 'self:update', 'self:read_permissions'];
```

### Matriz de Recursos e Permissões

| Recurso                | CREATE | READ   | UPDATE | DELETE | ESPECIAIS       |
| ---------------------- | ------ | ------ | ------ | ------ | --------------- |
| **Bank Users Groups**  | 🔴🟡   | 🔴🟡🟢 | 🔴🟡   | 🔴🟡   | findById        |
| **Bank Users**         | 🔴🟡   | 🔴🟡🟢 | 🔴🟡   | 🔴🟡   | -               |
| **User Permissions**   | 🔴🟡   | 🔴🟡🟢 | 🔴🟡   | 🔴🟡   | findByUser      |
| **Permission Grants**  | 🔴     | 🔴🟡   | 🔴     | 🔴     | -               |
| **System Constraints** | 🔴     | 🔴🟡   | 🔴     | 🔴     | findByPartnerId |

**Legenda:**

- 🔴 WISIEX_ADMIN
- 🟡 PARTNER_ADMIN
- 🟢 CUSTOMER

---

## Testes de Validação

### **Passo 5: Testes de Permissionamento (Opcional)**

#### **5.1 Buscar Todos os System Users (Como Wisiex Admin)**

**Endpoint:** `GET /admin-system-users`

**Headers:**

```http
x-api-key: 379eebde-8784-4437-a968-f568cb3c2ef1
```

**Resultado Esperado:** ✅ **Sucesso** - Lista todos os usuários do sistema

#### **5.2 Login como Wisiex Admin**

**Endpoint:** `POST /auth/login`

**Body:**

```json
{
  "assembleUserId": "0dbc335e-4b85-11f0-b9a7-baaa576eeff6",
  "externalSecret": "your-default-partner-admin-secret-here-change-in-production"
}
```

**Resultado Esperado:** ✅ **Sucesso** - Token de autenticação

#### **5.3 Buscar Grupos do Parceiro (Como Partner Admin)**

**Endpoint:** `GET /bank-users-groups`

**Headers:**

```http
Authorization: Bearer {token_do_partner_admin}
x-api-key: b03014d8-0185-4a22-9a9a-0cd83b142a9b
```

**Resultado Esperado:** ✅ **Sucesso** - Lista grupos do tenant

#### **5.4 Criar System User do Grupo Customer**

**Endpoint:** `POST /bank-users`

**Body:**

```json
{
  "systemUser": {
    "name": "Cliente Final Exemplo",
    "email": "cliente@exemplo.com",
    "externalId": "cliente_exemplo_001"
  },
  "groupName": "BANCO_EXEMPLO_CUSTOMER"
}
```

**Resultado Esperado:** ✅ **Sucesso** - Usuário cliente criado

#### **5.5 Login como Cliente**

**Endpoint:** `POST /auth/login`

**Body:**

```json
{
  "assembleUserId": "{customer_user_id}",
  "externalSecret": "defaultUserPassowrd"
}
```

**Resultado Esperado:** ✅ **Sucesso** - Token de cliente

#### **5.6 Testes de Endpoints de Permissão**

**Endpoints de Teste:**

- `GET /permission-tests/wisiex-admin` - ✅ Apenas Wisiex Admin
- `GET /permission-tests/admin` - ✅ Wisiex Admin e Partner Admin
- `GET /permission-tests/customer` - ✅ Todos os tipos de usuário

---

## Cenários de Onboarding

### **Processo de Onboarding de Cliente**

O sistema suporta diferentes tipos de onboarding baseados no tipo de cliente:

#### **Estados do Onboarding:**

```typescript
enum StepsOnboarding {
  MISSING_ACCOUNT_CONFIRMATION = 'MISSING_ACCOUNT_CONFIRMATION',
  ONBOARDING_SENT = 'ONBOARDING_SENT',
  MAESTRO_ONBOARDING_CREATED = 'MAESTRO_ONBOARDING_CREATED',
  MAESTRO_ONBOARDING_SUBMITTED = 'MAESTRO_ONBOARDING_SUBMITTED',
  MAESTRO_ACCOUNT_CREATED = 'MAESTRO_ACCOUNT_CREATED',
  WATCHMAN_CONFIRMED = 'WATCHMAN_CONFIRMED',
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  USER_ENABLED = 'USER_ENABLED',
  ONBOARDING_FAILED = 'ONBOARDING_FAILED',
}
```

#### **Fluxo de Estados:**

```
1. MISSING_ACCOUNT_CONFIRMATION
   ↓ (Criar onboarding no Maestro)
2. MAESTRO_ONBOARDING_CREATED
   ↓ (Submeter onboarding)
3. MAESTRO_ONBOARDING_SUBMITTED
   ↓ (Verificar/criar conta)
4. MAESTRO_ACCOUNT_CREATED
   ↓ (Confirmar no Watchman)
5. WATCHMAN_CONFIRMED
   ↓ (Criar conta final)
6. ACCOUNT_CREATED
   ↓ (Habilitar usuário)
7. USER_ENABLED ✅
```

### **Endpoints de Onboarding**

#### **Buscar Status do Onboarding**

**Endpoint:** `GET /onboardings/{userType}/{bankUserId}`

**Parâmetros:**

- `userType`: `individual` ou `business`
- `bankUserId`: ID do usuário bancário

#### **Atualizar Dados do Onboarding**

**Endpoint:** `PUT /onboardings/{userType}/{bankUserId}`

**Body:** Dados específicos do tipo de onboarding

#### **Análise de Documentos**

**Endpoint:** `PUT /onboardings/document-analysis/{userType}/{bankUserId}`

#### **Completar Onboarding**

**Endpoint:** `POST /onboardings/{userType}/{bankUserId}/complete`

---

## Estrutura do Banco de Dados

### **Tabelas Principais para Configuração Inicial**

#### **business_partners**

```sql
CREATE TABLE business_partners (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) UNIQUE NOT NULL,
  external_id_maestro VARCHAR(255) UNIQUE NOT NULL,
  credentials_maestro JSON NOT NULL,
  credentials_watchman JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

#### **business_partner_api_key**

```sql
CREATE TABLE business_partner_api_key (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  partner_id CHAR(36) NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (partner_id) REFERENCES business_partners(id)
);
```

#### **system_users**

```sql
CREATE TABLE system_users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  external_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

#### **bank_users**

```sql
CREATE TABLE bank_users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  partner_id CHAR(36) NOT NULL,
  group_id CHAR(36),
  external_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES system_users(id),
  FOREIGN KEY (partner_id) REFERENCES business_partners(id),
  FOREIGN KEY (group_id) REFERENCES bank_users_groups(id)
);
```

#### **bank_users_groups**

```sql
CREATE TABLE bank_users_groups (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  partner_id CHAR(36) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (partner_id) REFERENCES business_partners(id)
);
```

---

## Troubleshooting

### **Problemas Comuns**

#### **1. Erro de API Key Inválida**

**Erro:**

```json
{
  "statusCode": 401,
  "message": "Invalid API key",
  "error": "Unauthorized"
}
```

**Solução:**

- Verificar se a API key está correta no header `x-api-key`
- Para operações iniciais, usar a API key global: `379eebde-8784-4437-a968-f568cb3c2ef1`
- Para operações do parceiro, usar a API key específica do parceiro

#### **2. Erro de Permissão Negada**

**Erro:**

```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "You do not have permission to access this resource"
}
```

**Solução:**

- Verificar se o usuário tem as permissões necessárias
- Confirmar se o grupo do usuário foi configurado corretamente
- Verificar se as permissões foram atribuídas ao grupo

#### **3. Erro de Tenant/Partner Não Encontrado**

**Erro:**

```json
{
  "statusCode": 404,
  "message": "Business partner not found",
  "error": "Not Found"
}
```

**Solução:**

- Verificar se o partner_id está correto
- Confirmar se o parceiro foi criado com sucesso
- Verificar se não foi soft-deleted (deleted_at IS NULL)

#### **4. Erro de Usuário Já Existente**

**Erro:**

```json
{
  "statusCode": 400,
  "message": "User already exists",
  "error": "Bad Request"
}
```

**Solução:**

- Usar um external_id único
- Verificar se o email não está em uso
- Considerar usar update em vez de create

### **Validação de Configuração**

#### **Script de Verificação**

```bash
#!/bin/bash

BASE_URL="http://localhost:30000"
API_KEY="379eebde-8784-4437-a968-f568cb3c2ef1"

echo "🔍 Verificando configuração inicial..."

# 1. Verificar health check
echo "1️⃣ Health Check..."
curl -s "$BASE_URL/health" | jq .

# 2. Verificar system users
echo "2️⃣ System Users..."
curl -s -H "x-api-key: $API_KEY" "$BASE_URL/admin-system-users" | jq length

# 3. Verificar business partners
echo "3️⃣ Business Partners..."
curl -s -H "x-api-key: $API_KEY" "$BASE_URL/business-partners" | jq length

echo "✅ Verificação concluída!"
```

### **Logs e Monitoramento**

#### **Logs Importantes**

- `logs/combined.log` - Logs gerais da aplicação
- `logs/error.log` - Logs de erro
- `logs/out.log` - Logs de saída

#### **Métricas de Performance**

- Tempo de resposta dos endpoints de autenticação
- Taxa de sucesso nas operações de permissionamento
- Latência das consultas de autorização

---

## Próximos Passos

### **Após Configuração Inicial**

1. **Configurar Grupos Adicionais**

   - Criar grupos específicos por função (ex: ATENDENTE, GERENTE)
   - Configurar permissões granulares

2. **Implementar Constraints**

   - Configurar regras de compliance
   - Definir constraints por operação

3. **Configurar Onboarding Personalizado**

   - Adaptar fluxos por tipo de cliente
   - Integrar com APIs externas (Maestro/Watchman)

4. **Monitoramento e Auditoria**
   - Implementar logs de auditoria
   - Configurar alertas de segurança

### **Recursos Avançados**

- **Multi-Environment**: Configuração para dev/staging/prod
- **Backup e Recovery**: Estratégias de backup
- **Performance Tuning**: Otimização de queries
- **Security Hardening**: Práticas de segurança avançadas

---

## Contato e Suporte

Para dúvidas ou problemas na configuração inicial:

- **Documentação Técnica**: `/docs/authorization.html`
- **API Reference**: `/docs/swagger/`
- **Issue Tracking**: Utilizar sistema de tickets interno

---
