# Sistema de Permissões Padrão - Guia Completo

## 📋 Índice

1. [Introdução](#introdução)
2. [Arquitetura de Permissões](#arquitetura-de-permissões)
3. [Permissões do Sistema](#permissões-do-sistema)
4. [Recursos Protegidos](#recursos-protegidos)
5. [Configuração Automática](#configuração-automática)
6. [Matriz de Permissões por Módulo](#matriz-de-permissões-por-módulo)
7. [Grupos Padrão e Hierarquia](#grupos-padrão-e-hierarquia)
8. [Configuração Manual](#configuração-manual)
9. [Troubleshooting](#troubleshooting)

---

## Introdução

O sistema de autorização multi-tenant implementa **4 camadas de segurança** progressivas com configuração automática de permissões padrão. Todas as permissões são automaticamente configuradas quando os módulos são inicializados (`OnModuleInit`).

### Filosofia do Sistema

**Camadas de Autorização:**

```
🔓 CAMADA 1A: Permissões por Cargo (OR Logic) - "Função na empresa"
🔓 CAMADA 1B: Permissões Individuais (OR Logic) - "Poderes especiais"
🔒 CAMADA 2A: Constraints por Cargo+Operação (AND Logic) - "Compliance por função"
🔒 CAMADA 2B: Constraints por Usuário+Operação (AND Logic) - "Compliance individual"

AUTORIZAÇÃO = (1A OR 1B) AND 2A AND 2B
```

---

## Arquitetura de Permissões

### Entidades Principais

#### 🔑 Permissões do Sistema (`system_permissions`)

Catálogo global de todas as operações possíveis no sistema.

#### 🏷️ Recursos Protegidos (`system_resources`)

Endpoints e funcionalidades que requerem autorização.

#### 🔗 Grants de Permissão (`permission_grants_resource`)

Conecta permissões a recursos por tenant (business partner).

#### 👥 Permissões de Grupo (`bank_users_groups_permissions`)

Associa permissões aos grupos de usuários (RBAC).

#### 👤 Permissões Individuais (`user_permissions`)

Permissões específicas atribuídas diretamente aos usuários.

---

## Permissões do Sistema

### Hierarquia de Permissões

```typescript
export enum BankUserPermissions {
  // 🔵 SELF - Ações próprias do usuário
  SELF_CREATE = 'self:create',
  SELF_READ = 'self:read',
  SELF_UPDATE = 'self:update',
  SELF_DELETE = 'self:delete',
  SELF_EXECUTE = 'self:execute',
  SELF_READ_ONE = 'self:read_one',

  // 🟢 GROUP - Ações no âmbito do grupo
  GROUP_CREATE = 'group:create',
  GROUP_READ = 'group:read',
  GROUP_UPDATE = 'group:update',
  GROUP_DELETE = 'group:delete',
  GROUP_EXECUTE = 'group:execute',
  GROUP_READ_ONE = 'group:read_one',

  // 🟡 ADMIN - Ações administrativas do parceiro
  ADMIN_CREATE = 'admin:create',
  ADMIN_READ = 'admin:read',
  ADMIN_UPDATE = 'admin:update',
  ADMIN_DELETE = 'admin:delete',
  ADMIN_EXECUTE = 'admin:execute',
  ADMIN_READ_ONE = 'admin:read_one',

  // 🔴 WISIEX_ADMIN - Ações administrativas da plataforma
  WISIEX_ADMIN_CREATE = 'wisiex_admin:create',
  WISIEX_ADMIN_READ = 'wisiex_admin:read',
  WISIEX_ADMIN_UPDATE = 'wisiex_admin:update',
  WISIEX_ADMIN_DELETE = 'wisiex_admin:delete',
  WISIEX_ADMIN_EXECUTE = 'wisiex_admin:execute',
  WISIEX_ADMIN_READ_ONE = 'wisiex_admin:read_one',
}
```

### Distribuição de Permissões por Tipo de Grupo

#### 🔴 WISIEX\_\*\_ADMIN (Super Administradores)

- **Todas as permissões** (`Object.values(BankUserPermissions)`)
- Acesso completo a todos os recursos do sistema
- Gerenciamento de todos os tenants

#### 🟡 PARTNER\_\*\_ADMIN (Administradores do Parceiro)

- **Todas exceto `wisiex_admin:*`** (filtro: `!permission.startsWith('wisiex_admin')`)
- Gerenciamento completo dentro do seu tenant
- Não podem acessar configurações da plataforma

#### 🟢 \*\_CUSTOMER (Usuários Finais)

- **Apenas `self:*`** (filtro: `permission.startsWith('self')`)
- Ações limitadas aos próprios recursos
- Interface de usuário final

---

## Recursos Protegidos

### Categorias de Recursos

#### 👥 Gestão de Grupos de Usuários Bancários

```typescript
BankUsersGroupsCreate = 'bank-users-groups.create';
BankUsersGroupsRead = 'bank-users-groups.read';
BankUsersGroupsUpdate = 'bank-users-groups.update';
BankUsersGroupsDelete = 'bank-users-groups.delete';
BankUsersGroupsFindById = 'bank-users-groups.findById';
```

#### 🔑 Permissões de Grupos

```typescript
BankUsersGroupsPermissionsCreate = 'bank-users-groups-permissions.create';
BankUsersGroupsPermissionsRead = 'bank-users-groups-permissions.read';
BankUsersGroupsPermissionsUpdate = 'bank-users-groups-permissions.update';
BankUsersGroupsPermissionsDelete = 'bank-users-groups-permissions.delete';
BankUsersGroupsPermissionsFindByGroupId =
  'bank-users-groups-permissions.findByGroupId';
BankUsersGroupsPermissionsFindByPermissionId =
  'bank-users-groups-permissions.findByPermissionId';
```

#### 🔗 Grants de Permissão de Recursos

```typescript
PermissionGrantsResourceCreate = 'permission-grants-resource.create';
PermissionGrantsResourceRead = 'permission-grants-resource.read';
PermissionGrantsResourceUpdate = 'permission-grants-resource.update';
PermissionGrantsResourceDelete = 'permission-grants-resource.delete';
```

#### 👤 Permissões de Usuários

```typescript
UserPermissionsCreate = 'user-permissions.create';
UserPermissionsRead = 'user-permissions.read';
UserPermissionsUpdate = 'user-permissions.update';
UserPermissionsDelete = 'user-permissions.delete';
UserPermissionsFindByUser = 'user-permissions.findByUser';
```

#### 🔒 Constraints de Permissão do Sistema

```typescript
SystemPermissionConstraintsCreate = 'system-permission-constraints.create';
SystemPermissionConstraintsRead = 'system-permission-constraints.read';
SystemPermissionConstraintsUpdate = 'system-permission-constraints.update';
SystemPermissionConstraintsDelete = 'system-permission-constraints.delete';
SystemPermissionConstraintsFindById = 'system-permission-constraints.findById';
SystemPermissionConstraintsFindByPartnerId =
  'system-permission-constraints.findByPartnerId';
```

#### 🔒 Constraints de Grupos de Usuários Bancários

```typescript
BankUsersGroupsConstraintsCreate = 'bank-users-groups-constraints.create';
BankUsersGroupsConstraintsRead = 'bank-users-groups-constraints.read';
BankUsersGroupsConstraintsUpdate = 'bank-users-groups-constraints.update';
BankUsersGroupsConstraintsDelete = 'bank-users-groups-constraints.delete';
BankUsersGroupsConstraintsFindById = 'bank-users-groups-constraints.findById';
BankUsersGroupsConstraintsFindByGroupId =
  'bank-users-groups-constraints.findByGroupId';
BankUsersGroupsConstraintsFindByConstraintId =
  'bank-users-groups-constraints.findByConstraintId';
```

#### 🔒 Constraints Obrigatórios de Grupo

```typescript
GROUP_REQUIRED_CONSTRAINTS_CREATE = 'group-required-constraints.create';
GROUP_REQUIRED_CONSTRAINTS_READ = 'group-required-constraints.read';
GROUP_REQUIRED_CONSTRAINTS_UPDATE = 'group-required-constraints.update';
GROUP_REQUIRED_CONSTRAINTS_DELETE = 'group-required-constraints.delete';
GROUP_REQUIRED_CONSTRAINTS_FIND_BY_ID = 'group-required-constraints.findById';
GROUP_REQUIRED_CONSTRAINTS_FIND_BY_GROUP_ID =
  'group-required-constraints.findByGroupId';
GROUP_REQUIRED_CONSTRAINTS_FIND_BY_RESOURCE_ID =
  'group-required-constraints.findByResourceId';
GROUP_REQUIRED_CONSTRAINTS_FIND_BY_CONSTRAINT_ID =
  'group-required-constraints.findByConstraintId';
```

#### 🔒 Constraints de Usuários

```typescript
USER_CONSTRAINTS_CREATE = 'user-constraints.create';
USER_CONSTRAINTS_READ = 'user-constraints.read';
USER_CONSTRAINTS_UPDATE = 'user-constraints.update';
USER_CONSTRAINTS_DELETE = 'user-constraints.delete';
USER_CONSTRAINTS_FIND_BY_USER_ID = 'user-constraints.findByUserId';
USER_CONSTRAINTS_FIND_BY_CONSTRAINT_ID = 'user-constraints.findByConstraintId';
USER_CONSTRAINTS_FIND_BY_GRANTED_BY = 'user-constraints.findByGrantedBy';
```

#### 🔒 Constraints Obrigatórios de Usuários

```typescript
USER_REQUIRED_CONSTRAINTS_CREATE = 'user-required-constraints.create';
USER_REQUIRED_CONSTRAINTS_READ = 'user-required-constraints.read';
USER_REQUIRED_CONSTRAINTS_UPDATE = 'user-required-constraints.update';
USER_REQUIRED_CONSTRAINTS_DELETE = 'user-required-constraints.delete';
USER_REQUIRED_CONSTRAINTS_FIND_BY_USER_ID =
  'user-required-constraints.findByUserId';
USER_REQUIRED_CONSTRAINTS_FIND_BY_RESOURCE_ID =
  'user-required-constraints.findByResourceId';
USER_REQUIRED_CONSTRAINTS_FIND_BY_CONSTRAINT_ID =
  'user-required-constraints.findByConstraintId';
USER_REQUIRED_CONSTRAINTS_FIND_BY_APPLIED_BY =
  'user-required-constraints.findByAppliedBy';
```

---

## Configuração Automática

### Processo de Inicialização

Cada módulo implementa `OnModuleInit` e configura automaticamente as permissões padrão:

```typescript
async onModuleInit() {
  await Promise.all([
    this.permissionGrantsResourceService.createForAllPartnerByDefault({
      resourceName: Resources.NomeDoRecurso,
      permissionsNames: [BankUserPermissions.PERMISSAO_REQUERIDA],
    }),
    // ... outros recursos
  ]);
}
```

### Serviço de Configuração Padrão

O `DefaultConfigService` orquestra toda a configuração:

```typescript
@Injectable()
export class DefaultConfigService implements OnModuleInit {
  async onModuleInit() {
    // 1. Criar grupos obrigatórios
    await this.groupsManagementService.ensureRequiredGroupsExist();

    // 2. Configurar permissões dos grupos
    await this.groupsPermissionsManagementService.ensureRequiredGroupsPermissionsExist();
  }
}
```

### Gestão Automática de Permissões de Grupos

O `GroupsPermissionsManagementService` configura automaticamente as permissões baseado em padrões de nomenclatura:

```typescript
private getGroupPermissionConfigs(): GroupPermissionConfig[] {
  return [
    {
      pattern: /^WISIEX_.*_ADMIN$/,
      permissions: DefaultGroupsPermissionsConfig.getWisiexAdminPermissions(),
      type: 'WISIEX_ADMIN',
    },
    {
      pattern: /^PARTNER_.*_ADMIN$/,
      permissions: DefaultGroupsPermissionsConfig.getPartnerAdminPermissions(),
      type: 'PARTNER_ADMIN',
    },
    {
      pattern: /^.*_CUSTOMER$/,
      permissions: DefaultGroupsPermissionsConfig.getPartnerCustomerPermissions(),
      type: 'CUSTOMER',
    },
  ];
}
```

---

## Matriz de Permissões por Módulo

### 🎯 Legend de Símbolos

- 🔴 **WISIEX_ADMIN** - Administradores da plataforma
- 🟡 **ADMIN** - Administradores do parceiro
- 🟢 **GROUP** - Nível de grupo
- 🔵 **SELF** - Nível individual

### Bank Users Groups Constraints

| Recurso        | CREATE                 | READ                                   | UPDATE                 | DELETE                 | FIND_BY_ID                             |
| -------------- | ---------------------- | -------------------------------------- | ---------------------- | ---------------------- | -------------------------------------- |
| **Permissões** | 🔴 WISIEX_ADMIN_CREATE | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ | 🔴 WISIEX_ADMIN_UPDATE | 🔴 WISIEX_ADMIN_DELETE | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ |

### Bank Users Groups Permissions

| Recurso        | CREATE                 | READ                                   | UPDATE                 | DELETE                 | FIND_BY_GROUP_ID                       | FIND_BY_PERMISSION_ID                    |
| -------------- | ---------------------- | -------------------------------------- | ---------------------- | ---------------------- | -------------------------------------- | ---------------------------------------- |
| **Permissões** | 🔴 WISIEX_ADMIN_CREATE | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ | 🔴 WISIEX_ADMIN_UPDATE | 🔴 WISIEX_ADMIN_DELETE | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ | 🔴 WISIEX_ADMIN_DELETE<br/>🟡 ADMIN_READ |

### Bank Users Groups

| Recurso        | CREATE                 | READ                                   | UPDATE                 | DELETE                 | FIND_BY_ID                             |
| -------------- | ---------------------- | -------------------------------------- | ---------------------- | ---------------------- | -------------------------------------- |
| **Permissões** | 🔴 WISIEX_ADMIN_CREATE | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ | 🔴 WISIEX_ADMIN_UPDATE | 🔴 WISIEX_ADMIN_DELETE | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ |

### Group Required Constraints

| Recurso        | CREATE                                 | READ                                   | UPDATE                 | DELETE                 | FIND_BY_ID                               | FIND_BY_GROUP_ID                       | FIND_BY_RESOURCE_ID                    | FIND_BY_CONSTRAINT_ID                  |
| -------------- | -------------------------------------- | -------------------------------------- | ---------------------- | ---------------------- | ---------------------------------------- | -------------------------------------- | -------------------------------------- | -------------------------------------- |
| **Permissões** | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ | 🔴 WISIEX_ADMIN_UPDATE | 🔴 WISIEX_ADMIN_DELETE | 🔴 WISIEX_ADMIN_DELETE<br/>🟡 ADMIN_READ | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ |

### Permission Grants Resource

| Recurso        | CREATE                 | READ                                   | UPDATE                 | DELETE                 |
| -------------- | ---------------------- | -------------------------------------- | ---------------------- | ---------------------- |
| **Permissões** | 🔴 WISIEX_ADMIN_CREATE | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ | 🔴 WISIEX_ADMIN_UPDATE | 🔴 WISIEX_ADMIN_DELETE |

### System Permission Constraints

| Recurso        | CREATE                 | READ                                   | UPDATE                 | DELETE                 |
| -------------- | ---------------------- | -------------------------------------- | ---------------------- | ---------------------- |
| **Permissões** | 🔴 WISIEX_ADMIN_CREATE | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ | 🔴 WISIEX_ADMIN_UPDATE | 🔴 WISIEX_ADMIN_DELETE |

### User Constraints

| Recurso        | CREATE                 | READ                                   | UPDATE                 | DELETE                 | FIND_BY_USER_ID                        | FIND_BY_CONSTRAINT_ID                  | FIND_BY_GRANTED_BY                     |
| -------------- | ---------------------- | -------------------------------------- | ---------------------- | ---------------------- | -------------------------------------- | -------------------------------------- | -------------------------------------- |
| **Permissões** | 🔴 WISIEX_ADMIN_CREATE | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ | 🔴 WISIEX_ADMIN_UPDATE | 🔴 WISIEX_ADMIN_DELETE | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ |

### User Permissions

| Recurso        | CREATE                 | READ                                   | UPDATE                 | DELETE                 | FIND_BY_USER                           |
| -------------- | ---------------------- | -------------------------------------- | ---------------------- | ---------------------- | -------------------------------------- |
| **Permissões** | 🔴 WISIEX_ADMIN_CREATE | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ | 🔴 WISIEX_ADMIN_UPDATE | 🔴 WISIEX_ADMIN_DELETE | 🔴 WISIEX_ADMIN_READ<br/>🟡 ADMIN_READ |

---

## Grupos Padrão e Hierarquia

### Nomenclatura de Grupos

#### Grupos WISIEX (Plataforma)

```
WISIEX_SYSTEM_ADMIN     - Super administrador da plataforma
WISIEX_SUPPORT_ADMIN    - Suporte técnico da plataforma
WISIEX_SECURITY_ADMIN   - Administrador de segurança da plataforma
```

#### Grupos PARTNER (Parceiro/Tenant)

```
PARTNER_SYSTEM_ADMIN    - Administrador do sistema do parceiro
PARTNER_FINANCE_ADMIN   - Administrador financeiro do parceiro
PARTNER_SUPPORT_ADMIN   - Suporte do parceiro
```

#### Grupos CUSTOMER (Usuários Finais)

```
VIP_CUSTOMER           - Cliente VIP
PREMIUM_CUSTOMER       - Cliente premium
BASIC_CUSTOMER         - Cliente básico
```

### Processo de Criação Automática

O `GroupsManagementService` garante que grupos obrigatórios existam:

```typescript
async ensureRequiredGroupsExist(): Promise<GroupManagementResult> {
  // 1. Buscar parceiros e grupos existentes
  const [allPartners, allGroups] = await Promise.all([
    this.getAllPartners(),
    this.getAllGroups(),
  ]);

  // 2. Detectar grupos faltantes
  const missingGroups = this.detectMissingGroups(
    allRequiredGroups,
    existingGroups,
    partnerMap,
  );

  // 3. Criar grupos faltantes
  if (missingGroups.length > 0) {
    await this.createMissingGroups(missingGroups);
  }
}
```

---

## Configuração Manual

### Adicionando Novos Recursos

1. **Definir o Recurso:**

```typescript
// Em src/authorization/resources/resources.ts
export enum Resources {
  // ...recursos existentes
  NovoRecursoCreate = 'novo-recurso.create',
  NovoRecursoRead = 'novo-recurso.read',
  // ...
}
```

2. **Configurar Permissões no Módulo:**

```typescript
// No módulo específico
async onModuleInit() {
  await Promise.all([
    this.permissionGrantsResourceService.createForAllPartnerByDefault({
      resourceName: Resources.NovoRecursoCreate,
      permissionsNames: [BankUserPermissions.WISIEX_ADMIN_CREATE],
    }),
    // ...outras configurações
  ]);
}
```

### Adicionando Novas Permissões

1. **Definir a Permissão:**

```typescript
// Em src/authorization/permissions/bank-user-permissions.ts
export enum BankUserPermissions {
  // ...permissões existentes
  NOVA_PERMISSAO = 'nova:permissao',
}
```

2. **A permissão será automaticamente:**
   - Inserida na tabela `system_permissions` pelo `PrismaService.checkPermissions()`
   - Atribuída aos grupos conforme padrões definidos em `GroupsPermissionsManagementService`

---

## Troubleshooting

### Problemas Comuns

#### ❌ Permissão Negada para Recurso

**Diagnóstico:**

```sql
-- Verificar se o usuário tem permissão
SELECT * FROM authorization_check_view
WHERE user_id = 'uuid-do-usuario'
AND resource_name = 'nome-do-recurso';
```

**Possíveis Causas:**

1. Usuário não está no grupo correto
2. Grupo não tem a permissão necessária
3. Recurso não está configurado no `permission_grants_resource`
4. Constraints bloqueando o acesso

#### ❌ Recurso Não Encontrado

**Diagnóstico:**

```sql
-- Verificar se o recurso existe
SELECT * FROM system_resources
WHERE name = 'nome-do-recurso';

-- Verificar grants
SELECT * FROM permission_grants_resource
WHERE resource_id = 'uuid-do-recurso';
```

**Solução:**

1. Verificar se o módulo implementa `OnModuleInit`
2. Verificar se `createForAllPartnerByDefault` está sendo chamado
3. Reinicializar aplicação para executar configuração

#### ❌ Grupo Sem Permissões

**Diagnóstico:**

```sql
-- Verificar permissões do grupo
SELECT g.name as group_name, p.name as permission_name
FROM bank_users_groups g
JOIN bank_users_groups_permissions gp ON g.id = gp.group_id
JOIN system_permissions p ON gp.system_permission_id = p.id
WHERE g.name = 'NOME_DO_GRUPO';
```

**Solução:**

1. Verificar se o nome do grupo segue padrões em `getGroupPermissionConfigs()`
2. Executar `GroupsPermissionsManagementService.ensureRequiredGroupsPermissionsExist()`

### Logs de Diagnóstico

O sistema registra logs detalhados durante a inicialização:

```
DefaultConfigService: Groups management completed successfully
- partnersFound: 3
- groupsFound: 12
- missingGroupsDetected: 2
- groupsCreated: 2

Groups permissions management completed
- totalGroups: 14
- permissionsCreated: 45
- groupsProcessed: 14
```

### Forçar Reconfiguração

Para forçar uma reconfiguração completa:

```typescript
// Via REPL ou endpoint de manutenção
await app.get(DefaultConfigService).configDefaults();
```

---

## Conclusão

O sistema de permissões padrão fornece:

✅ **Configuração Automática** - Zero configuração manual necessária  
✅ **Hierarquia Clara** - Níveis bem definidos de acesso  
✅ **Multi-Tenant** - Isolamento completo entre parceiros  
✅ **Escalabilidade** - Suporte a novos recursos via padrões  
✅ **Auditabilidade** - Logs completos de todas as operações  
✅ **Performance** - Queries otimizadas com CTEs

O sistema está pronto para produção e se adapta automaticamente conforme novos módulos e funcionalidades são adicionados.
