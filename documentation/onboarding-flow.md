# Fluxos de Onboarding de Clientes - Visão Unificada dos Endpoints Específicos

## Visão Geral

Este documento detalha os fluxos completos dos 5 endpoints específicos do sistema Watchman responsáveis pelo processo de onboarding de clientes, desde o recebimento dos dados até a confirmação final da conta. O sistema processa tanto pessoas físicas (PF) quanto pessoas jurídicas (PJ), garantindo validações, análises de risco e conformidade regulatória.

**Sistemas Envolvidos:**

- **Assemble (Orquestrador)**: Gateway de entrada, autenticação e orquestração
- **Watchman (Core)**: Processamento principal de onboarding
- **BigDataCorp**: Validação de documentos e análise de dados
- **Cerebro**: Sistema de alertas e análises de risco
- **Bureau**: Verificação de informações externas
- **Sistemas Parceiros**: Integração via webhooks

**Garantias do Sistema:**

- Atomicidade nas transações de dados
- Consistência nos estados de cliente
- Durabilidade das informações críticas
- Isolamento entre processos de diferentes parceiros

## Arquitetura do Fluxo

```
[Sistema Parceiro/Assemble]
       ↓
   [Partner Auth]
       ↓
[PUT /customers/{type}/{taxpayer}/{bankUserId}] ──→ [SetCustomerServiceV2]
       ↓                                                    ↓
[POST /customers/{type}/biometric-process] ──→ [Biometric Process]
       ↓                                                    ↓
[POST /customers/{type}/send-or-validate/{userUuid}] ──→ [Validation Engine]
       ↓                                                    ↓
[GET /customers/{type}/{customerId}] ───────────────────→ [Customer Status]
       ↓                                                    ↓
[POST /customers/{type}/confirm/{userId}] ──────────────→ [Account Confirmation]
       ↓
[Webhook Notifications] ←─────── [SendWebhookJob] ←──── [Status Updates]
```

## Estados e Tipos de Cliente

### Estados do Cliente (CustomerStatusEnum)

- `REGISTERING`: Estado inicial durante coleta de dados
- `PROCESSING`: Processamento automático em andamento
- `PENDING_APPROVAL`: Aguardando aprovação manual
- `IN_ANALYSIS`: Em análise pelo backoffice
- `APPROVED`: Cliente aprovado e ativo
- `REPROVED`: Cliente reprovado
- `ON_HOLD`: Aguardando correções do cliente
- `BLOCKED`: Cliente bloqueado permanentemente
- `BLACKLISTED`: Cliente em lista negra
- `MISSING_ACCOUNT_CONFIRMATION`: Aguardando confirmação final

### Tipos de Cliente

- `INDIVIDUAL` (PF): Pessoas físicas
- `CORPORATE` (PJ): Pessoas jurídicas/empresas

### Transições de Estado

```
REGISTERING → PROCESSING → PENDING_APPROVAL → IN_ANALYSIS → APPROVED
    ↓              ↓              ↓               ↓            ↓
REPROVED ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ → MISSING_ACCOUNT_CONFIRMATION
    ↓                                                          ↓
ON_HOLD ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ → APPROVED
    ↓
BLACKLISTED/BLOCKED
```

## Fluxo Detalhado de Ponta a Ponta

### Fase 1: Entrada e Autenticação

#### 1.1 Recepção da Requisição (Assemble → Watchman)

**Endpoint**: `PUT /customers/{type}/{taxpayer}/{bankUserId}`

**Mapeamento Assemble → Watchman:**
- Assemble: `PUT /onboardings/individual/{bankUserId}` (updateOnboarding para PF)
- Watchman: `PUT /customers/{type}/{taxpayer}/{bankUserId}` (updateOnboarding)

**Estrutura da Requisição para PF (Pessoa Física):**

```json

{
  "registerName": "Fulano",
  "socialName": "Fulano",
  "taxpayer": "12345678900",
  "motherName": "Ciclano",
  "email": "fulano@email.com",
  "birthDate": "1990-01-01",
  "pep": "SELF",
  "phone": {
      "countryCode": "55",
      "number": "11987654321"
  },
  "address": {
      "address": "Rua Exemplo",
      "zipcode": "12345-678",
      "complement": "Apto 123",
      "city": "São Paulo",
      "state": "SP",
      "country": "Brasil",
      "buildingNumber": "870"
  },
  "declaredIncome": "FROM_ONE_THOUSAND_TO_TWO_THOUSAND"
}
```

#### 1.2 Autenticação e Autorização

**Watchman - Middleware**: `partnerAuthMiddleware`

- **Método**: Basic Authentication com clientId/clientSecret
- **Headers Obrigatórios**:
  - `Authorization: Basic <base64(clientId:clientSecret)>`
  - `x-partner-id`: ID do parceiro filho (opcional)

**Assemble - Guards Aplicados**:

- **JwtAuthGuard**: Valida token JWT e extrai informações do usuário e partner
- **AuthorizationGuard**: Verifica permissões baseadas em recursos (`OnboardingsUpdate`)

**Validações de Autenticação Watchman:**

```typescript
// Verificação do formato Basic Auth
if (type !== 'Basic') throw new AppError('UNAUTHORIZED', 401);

// Decodificação das credenciais
const [clientId, clientSecret] = Buffer.from(credentials, 'base64')
  .toString()
  .split(':');

// Validação do parceiro
const partner = await AuthPartnerService.execute({
  clientId,
  clientSecret,
  childrenId,
});
```

### Fase 2: Validações e Preparação

#### 2.1 Validações Iniciais (Watchman)

**Serviço**: `SetCustomerServiceV2.execute()`

**Validações Realizadas:**

1. **Validação do Parceiro**:

   ```typescript
   const partner = await Partner.findFirst({
     where: { id: partnerId, isEnabled: true },
   });
   ```

2. **Validação do Tipo de Cliente**:

   ```typescript
   const customerType = await getCustomerType(partnerId, slug);
   if (taxpayer.length !== customerType.lenTaxpayer) {
     throw new AppError('TAXPAYER_INVALID_LENGTH', 400);
   }
   ```

3. **Verificação de Cliente Existente**:
   ```typescript
   let customer = await findCustomerByTaxpayer(
     partnerId,
     taxpayer,
     referenceId,
   );
   ```

#### 2.2 Preparação dos Dados (Watchman)

**Processo de Flatten:**

```typescript
const inputFlatten = flattenObjectInput(props);
// Transforma: { personalData: { fullName: "João" } }
// Em: { "personalData.fullName": "João" }
```

**Versionamento de Dados:**

- Versão 1: Dados iniciais
- Versão N+1: Atualizações subsequentes
- Soft delete de versões anteriores

#### 2.3 Validações Assemble

**Serviço**: `OnboardingsService`

**Validação de Tipo de Usuário**:

- Verifica se `userType` está presente na requisição
- Valida se `userType` é um valor válido do enum `UserType`
- Lança `BadRequestException` para tipos inválidos

**Validação do body**:

- Verifica se há a existencia do biometricProcess no objeto de documnetation enviado dentro no body.

**Validação de Bank User**:

- Busca `bankUser` pelo `bankUserId` fornecido
- Verifica se bank user existe no sistema
- Confirma se bank user pertence ao partner autenticado

**Recuperação de Taxpayer**:

- Busca dados de taxpayer (CPF/CNPJ) na tabela `users_data`
- Taxpayer é necessário para identificação única no Watchman

### Fase 3: Processamento Principal

#### 3.1 Criação/Atualização do Cliente (Watchman)

```typescript
if (!customer) {
  customer = await Customer.create({
    data: {
      taxpayer,
      partnerId,
      typeId: customerType.id,
      status: CustomerStatusEnum.REGISTERING,
      uuid: referenceId ?? undefined,
    },
  });
} else {
  if (customer.status !== CustomerStatusEnum.REGISTERING) {
    await deleteAllCustomerData(customer.id);
  }
}
```

#### 3.2 Persistência de Dados do Cliente (Watchman)

```typescript
await setFieldsCustomer(customer.id, inputFlatten);
// Cria registros em CustomerData com:
// - key: chave do campo
// - value: valor do campo
// - property: propriedade mapeada
// - version: versão atual
// - source: CUSTOMER
```

#### 3.3 Atualização no Assemble

**Fluxo de Atualização (`updateOnboarding`)**:

1. **Validações Iniciais**: UserType, dados não vazios, bankUser, partner e verificação se não há documentation
2. **Controle de Processo**: Atualiza estado para `IN_PROCESS`
3. **Merge de Dados**: Combina dados existentes com novos dados via `OnboardingUtilService`
4. **Integração Watchman**: Chama `WatchmanService.updateOnboarding()`
5. **Validação de Resposta**: Verifica sucesso da operação

**Merge Inteligente de Dados**:

- Preserva dados existentes não alterados
- Substitui arrays específicos (legalRepresentatives, corporateOwners, etc.)
- Merge recursivo para objetos aninhados
- Remove propriedades técnicas (bureauInfo, status, timestamps, etc.)

### Fase 4: Envio do BiometricProcess

**Endpoint**: `POST /onboardings/{type}/biometric-process`

**Método usado**: `setBiometricProcessCode`

**Validações Realizadas:**

1. **Validação do body**:

   ```typescript
   if (!data || Object.keys(data).length === 0) {
        throw new BadRequestException('E_INVALID_DATA');
      }
   ```

2. **Verifica se o biometric process foi registrado**:

   ```typescript
   const userData = await this.getAzifaceProcess(data.biometricProcess);
    if (!userData) {
      throw new BadRequestException('E_BIOMETRIC_PROCESS_NOT_FOUND');
    }
   ```

3. **Verificação parceiro**:
   ```typescript
   if (userData.partnerId !== partner.id) {
        throw new BadRequestException('E_PARTNER_MISMATCH');
    }
   ```

**Estrutura da Requisição:**

```json
{
  "biometricProcess": "biometric-process-code"
}
```

### Fase 5: Validação e Envio

#### 5.1 Validação dos Dados (Watchman)

**Endpoint**: `POST /customers/{type}/send-or-validate/{userUuid}`

**Mapeamento Assemble → Watchman:**

- Assemble: `POST /onboardings/{userType}/{bankUserId}/complete` (setCompleteOnboarding)
- Watchman: `POST /customers/{type}/send-or-validate/{userUuid}` (sendOrValidateOnboarding)

**Ações Disponíveis:**

- `validate`: Apenas valida sem processar
- `send`: Valida e envia para processamento

**Processo de Validação:**

```typescript
// 1. Validação de Schema
if (customerType.schema) {
  const schema = eval(jsonSchemaToZod(JSON.parse(customerType.schema)));
  await schema.parseAsync(customerDataValues);
}

// 2. Validação de Arquivos
const validFiles = await isValidFiles(customer.id);

// 3. Validação de Documento (CPF/CNPJ)
const isValidTaxpayers = await checkTaxpayerStatus(
  customer.id,
  customer.taxpayer,
  country,
);

// 4. Verificação de Blacklist
const isBlacklisted = await checkCustomerInBlacklist(
  partnerId,
  customer.taxpayer,
);
```

#### 5.2 Transição de Estados (Watchman)

```typescript
let status = CustomerStatusEnum.PROCESSING;

if (
  customer.status === CustomerStatusEnum.REPROVED ||
  customer.status === CustomerStatusEnum.ON_HOLD
) {
  status = CustomerStatusEnum.PENDING_APPROVAL;
  // Remove análises antigas
  await prisma.customerAnalysis.updateMany({
    where: { customerId: customer.id, status: { in: ['REPROVED', 'ON_HOLD'] } },
    data: { deletedAt: new Date() },
  });
}
```

#### 5.3 Estados Finais no Assemble

**Fluxo de Conclusão (`setCompleteOnboarding`)**:

1. **Validação Final**: UserType e bankUser
2. **Envio para Validação**: Chama `WatchmanService.sendOrValidateOnboarding()`
3. **Tratamento de Falhas**: Atualiza estado para `ONBOARDING_FAILED` se necessário
4. **Sucesso**: Atualiza estado para `ONBOARDING_SENT`

**Estados Finais**:

- **ONBOARDING_SENT**: Processo enviado com sucesso para validação
- **ONBOARDING_FAILED**: Processo falhou com issues específicas

### Fase 8: Confirmação da Conta

#### 8.1 Confirmação Final (Watchman)

**Endpoint**: `POST /customers/{type}/confirm/{userId}`

**Método usado**: `confirmOnboarding`

**Estrutura da Requisição:**

```json
{
  "maestroId": "external-system-id"
}
```

#### 8.2 Processamento da Confirmação (Watchman)

```typescript
const findCustomer = await Customer.findFirst({
  where: {
    uuid: customerUuid,
    partnerId,
    status: CustomerStatusEnum.MISSING_ACCOUNT_CONFIRMATION,
  },
});

await Customer.update({
  where: { id: findCustomer.id },
  data: {
    status: CustomerStatusEnum.APPROVED,
    externalId: maestroId,
  },
});
```

### Fase 9: Sincronização e Webhooks

#### 9.1 Sistema de Webhooks (Watchman)

**Eventos Suportados:**

- `CUSTOMER_WAS_RECEIVED`: Cliente recebido
- `CUSTOMER_WAS_APPROVED`: Cliente aprovado
- `CUSTOMER_WAS_REPROVED`: Cliente reprovado
- `CUSTOMER_WAS_ON_HOLD`: Cliente em espera
- `BUSINESS_WAS_RECEIVED`: Empresa recebida
- `BUSINESS_WAS_APPROVED`: Empresa aprovada

#### 9.2 Estrutura do Webhook (Watchman)

```json
{
  "eventName": "CUSTOMER_WAS_RECEIVED",
  "partnerId": 123,
  "data": {
    "id": "customer-uuid",
    "taxpayer": "12345678900",
    "status": "PROCESSING",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### 9.3 Sistema de Retry (Watchman)

```typescript
// Configurações de retry
const MAX_RETRY = 30;
const FAILURE_THRESHOLD = 10;

// Fibonacci backoff para tentativas
let nextAttemptInMs = fibonacci(nAttempt) * 1000;

// Headers de segurança
const { nonce, signature, timestamp } = createHmacSignature(
  payload,
  webhook.secretKey,
);
```

#### 9.4 Controle de Estados e Auditoria (Assemble)

**Gerenciamento de Estados (`OnboardingProcessService`)**:

**Tabela de Controle**: `onboarding_process`

- `partner_id`: Identificador do partner
- `user_id`: Identificador do bank user
- `event_name`: Nome do evento/etapa
- `status`: Status atual do processo
- `uuid`: Identificador único do processo

**Rastreamento de Documentos**:

**Tabela de Documentos**: `onboarding_process_documents`

- Vinculada ao processo de onboarding
- Armazena UUID de documentos no Watchman
- Status de upload e processamento
- Auditoria de uploads realizados

### Fase 7: Consulta de Status

#### 7.1 Recuperação do Status (Watchman)

**Endpoint**: `GET /customers/{type}/{customerId}`

**Mapeamento Assemble → Watchman:**

- Assemble: `GET /onboardings/{userType}/{bankUserId}` (getOboardingByBankUserId)
- Watchman: `GET /customers/{type}/{customerId}` (getOnboardingByCustomer)

**Estrutura da Resposta:**

```json
{
  "success": true,
  "data": {
    "id": "customer-uuid",
    "status": "PROCESSING",
    "taxpayer": "12345678900",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "solicitations": [],
    "reason": null,
    "requestedChanges": [],
    "bureauInfo": {},
    "fieldsToFix": [],
    "personalData": {
      "fullName": "João Silva",
      "email": "joao@email.com"
    }
  }
}
```

#### 7.2 Processamento de Consulta (Watchman)

```typescript
if (customer.status === CustomerStatusEnum.REGISTERING) {
  return await GetCustomerOnboarding.execute(partnerId, uuid);
}

let response = transformKeyAndValueObject(customer?.customerDatas);
response = unflattenObject(response);
```

#### 7.3 Fluxo no Assemble

**Consulta de Dados (`getOboardingByBankUserId`)**:

1. Valida `userType` e `bankUserId`
2. Chama `WatchmanService.getOnboardingByCustomer()`
3. Retorna dados existentes do onboarding ou estrutura vazia

## Arquitetura de Dados

### Estrutura de Dados

#### Tabela Customer (Watchman)

```sql
CREATE TABLE customer (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  taxpayer VARCHAR(20) NOT NULL,
  partner_id INTEGER NOT NULL,
  type_id INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  external_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);
```

#### Tabela CustomerData (Watchman)

```sql
CREATE TABLE customer_data (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  key VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  property VARCHAR(255),
  property_type_id INTEGER,
  version INTEGER DEFAULT 1,
  source VARCHAR(50) DEFAULT 'CUSTOMER',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL
);
```

#### Tabela CustomerAnalysis (Watchman)

```sql
CREATE TABLE customer_analysis (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  analysis_id INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  reason_for_deny_id INTEGER,
  user_reply_id VARCHAR(255),
  args JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);
```

#### Tabelas Assemble

**onboarding_process**: Controle de estados do processo
**onboarding_process_documents**: Rastreamento de documentos
**users_data**: Dados de usuários (taxpayer)
**bank_users**: Usuários bancários
**business_partners**: Parceiros de negócio

### Relacionamentos de Dados

**Watchman:**

```
Partner (1) ──→ (N) Customer
Customer (1) ──→ (N) CustomerData
Customer (1) ──→ (N) CustomerAnalysis
Customer (1) ──→ (N) Solicitation
CustomerPropertyType (1) ──→ (N) CustomerData
```

**Assemble:**

```
business_partners (1) ←→ (N) bank_users ←→ (1) onboarding_process
                                ↓
                          (N) onboarding_process_documents
                                ↓
                             users_data (taxpayer)
```

### Estrutura de Dados de Onboarding

**Dados Básicos**:

```json
{
  "registerName": "Nome completo",
  "taxpayer": "12345678901",
  "email": "email@example.com",
  "phone": "+5511999999999"
}
```

**Documentação (Individual)**:

```json
{
  "documentation": {
    "biometricProcess": "biometric-process-code"
  }
}
```

**Estrutura Corporativa**:

```json
{
  "legalRepresentatives": [
    {
      "name": "Representante Legal",
      "taxpayer": "12345678901",
      "role": "CEO"
    }
  ],
  "corporateOwners": [
    {
      "name": "Empresa Sócia",
      "taxpayer": "12345678000195",
      "participation": 75.5
    }
  ]
}
```

## Observabilidade e Monitoramento

### Logs Estruturados

#### Logs de Entrada de Dados (Watchman)

```typescript
Logger.instance.info(`New customer received for partner: ${partner.name}`, {
  partnerId,
  customerType: slug,
  taxpayer: taxpayer.substring(0, 3) + '****', // Mascarado por segurança
});
```

#### Logs de Processamento (Watchman)

```typescript
Logger.instance.info(
  `Validating customer ${customer.uuid} with status ${customer.status}`,
  {
    validFiles,
    isValidTaxpayers,
    isBlacklisted,
  },
);
```

#### Logs de Webhook (Watchman)

```typescript
Logger.instance.info(
  `Sending webhook for customer ${customer.uuid} with status ${status}`,
  {
    eventName,
    partnerId,
    attempt: nAttempt,
  },
);
```

#### Logs do Assemble

- Todos os erros são capturados e logados com contexto
- IDs de correlação para rastreamento end-to-end
- Métricas de performance para cada integração

### Pontos de Monitoramento

1. **Métricas de Performance**:

   - Tempo de processamento por endpoint
   - Taxa de sucesso de validações
   - Latência de webhooks
   - **Latência de Integração**: Tempo de resposta do Watchman

2. **Métricas de Negócio**:

   - Volume de onboardings por parceiro
   - Taxa de aprovação vs reprovação
   - Tempo médio de processamento
   - **Estados do Processo**: Distribuição por status
   - **Volume de Documentos**: Uploads por período

3. **Alertas de Sistema**:
   - Falhas consecutivas de webhook (>10)
   - Volume anômalo de reprovações
   - Tempo de processamento elevado (>30s)
   - **Taxa de Erro**: Falhas de validação e integração

## Segurança e Conformidade

### Controles de Segurança

#### Autenticação de Parceiros (Watchman)

```typescript
// Validação de credenciais
const partner = await AuthPartnerService.execute({
  clientId,
  clientSecret,
  childrenId: childPartnerIdHeader,
});

// Isolamento por parceiro
req.partnerId = partner.id;
req.partnerUuid = partner.uuid;
```

#### Assinatura de Webhooks (Watchman)

```typescript
const { nonce, signature, timestamp } = createHmacSignature(payload, webhook.secretKey);

// Headers de segurança
headers: {
  'x-signature': signature,
  'x-webhook-nonce': nonce,
  'x-webhook-timestamp': timestamp.toString(),
  'Content-Type': 'application/json',
  'User-Agent': 'Watchman/1.0.0'
}
```

#### Autenticação Assemble

- **Autenticação JWT**: Validação de identidade
- **Autorização RBAC**: Controle baseado em recursos
- **Validação de Partner**: Segregação por parceiro de negócio

#### Mascaramento de Dados Sensíveis

- CPF/CNPJ mascarados em logs
- Dados pessoais não expostos em erros
- Soft delete para manter auditoria
- **Dados Sensíveis**: Tratamento específico para PII

### Conformidade Regulatória

#### LGPD (Lei Geral de Proteção de Dados)

- Consentimento explícito para coleta
- Direito ao esquecimento (soft delete)
- Minimização de dados coletados
- Transparência no processamento

#### Controles de Blacklist (Watchman)

```typescript
const checkBlacklist = await prisma.blacklist.findFirst({
  where: {
    matches: taxpayer,
    type: BlacklistTypeEnum.TAXPAYER,
    OR: [{ partnerId }, { partnerId: null }],
  },
});
```

#### Outras Conformidades

- **BACEN**: Requisitos do Banco Central do Brasil
- **KYC/KYB**: Know Your Customer/Business
- **AML**: Anti-Money Laundering

## Casos de Erro e Recuperação

### Códigos de Erro Específicos

#### Erros de Autenticação (401)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials"
  }
}
```

#### Erros de Validação (400)

```json
{
  "success": false,
  "error": {
    "code": "TAXPAYER_INVALID_LENGTH",
    "message": "Document length doesn't match customer type"
  }
}
```

#### Erros de Conflito (409)

```json
{
  "success": false,
  "error": {
    "code": "CUSTOMER_AWAIT_EVALUATION",
    "message": "Customer is already being processed"
  }
}
```

#### Erros de Não Encontrado (404)

```json
{
  "success": false,
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Customer not found for the given parameters"
  }
}
```

#### Erros Específicos do Assemble

- `E_CUSTOMER_TYPE_NOT_PROVIDED`: Tipo de customer não informado
- `E_CUSTOMER_TYPE_INVALID`: Tipo de customer inválido
- `E_CUSTOMER_NOT_FOUND`: Customer não encontrado
- `E_PARTNER_MISMATCH`: Customer não pertence ao partner
- `E_TAXPAYER_NOT_FOUND`: Taxpayer não cadastrado
- `E_INVALID_DATA`: Dados inválidos ou incompletos
- `E_INVALID_DOCUMENT`: Documento inválido
- `E_INVALID_FILE`: Formato de arquivo não suportado

### Estratégias de Recuperação

#### Recuperação de Webhook (Watchman)

```typescript
// Fibonacci backoff para retry
const maxRetries = webhook.maxRetries ?? 30;
if (nAttempt < maxRetries && shouldRetry) {
  await SendWebhookJob.add({
    ...params,
    attempt: nAttempt,
    delay: fibonacci(nAttempt + 1) * 1000,
    relatedAttempt: saveAttempt.id,
  });
}
```

#### Recuperação de Estado (Watchman)

```typescript
// Transição de REPROVED/ON_HOLD para PENDING_APPROVAL
if (
  customer.status === CustomerStatusEnum.REPROVED ||
  customer.status === CustomerStatusEnum.ON_HOLD
) {
  status = CustomerStatusEnum.PENDING_APPROVAL;

  await prisma.customerAnalysis.updateMany({
    where: {
      customerId: customer.id,
      status: {
        in: [CustomerAnalysisEnum.REPROVED, CustomerAnalysisEnum.ON_HOLD],
      },
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
  });
}
```

#### Recuperação de Dados

- Versionamento permite rollback de alterações
- Soft delete mantém histórico
- Logs estruturados facilitam debugging

#### Estratégias do Assemble

- **Retry Logic**: Tentativas automáticas para falhas temporárias
- **Graceful Degradation**: Operação parcial quando serviços estão indisponíveis
- **Manual Intervention**: Escalação para análise manual quando necessário

#### Tratamento de Erros e Resiliência (WatchmanService)

- Captura e normalização de erros HTTP
- Mapeamento de mensagens de erro específicas
- Logs estruturados para observabilidade
- Fallback graceful para indisponibilidade temporária

## Roadmap e Melhorias Futuras

### Funcionalidades Planejadas

#### Análise de Risco em Tempo Real

- Integração com mais bureaus de crédito
- Machine Learning para detecção de fraudes
- Scoring dinâmico baseado em comportamento

#### Otimizações de Performance

- Cache distribuído para dados de cliente
- Processamento assíncrono para uploads
- Compressão de dados históricos

#### Melhorias de UX

- SDK para integração simplificada
- Dashboard em tempo real para parceiros
- Notificações push para mudanças de status

#### Funcionalidades do Assemble

- **Webhooks**: Notificações em tempo real de mudanças de status
- **Bulk Operations**: Processamento em lote para partners
- **Advanced Analytics**: Dashboards de conversão e performance
- **Document OCR**: Extração automática de dados de documentos

### Integrações Futuras

#### Novos Sistemas de Validação

- Serasa/SPC para análise de crédito
- Receita Federal para validação fiscal
- TSE para validação de títulos eleitorais

#### Expansão Internacional

- Suporte a documentos internacionais
- Validações específicas por país
- Compliance com regulamentações locais

#### APIs Complementares

- API de consulta de histórico
- API de relatórios e analytics
- API de configuração de regras de negócio

#### Integrações do Assemble

- **Bureau de Crédito**: Consultas automáticas de score
- **Blockchain**: Certificação imutável de documentos
- **Biometria**: Validação biométrica avançada
- **Open Banking**: Integração com dados bancários existentes

### Melhorias de Infraestrutura

#### Escalabilidade

- Microserviços para componentes específicos
- Load balancing inteligente
- Auto-scaling baseado em demanda

#### Observabilidade Avançada

- Tracing distribuído
- Métricas de negócio em tempo real
- Alertas proativos baseados em ML

#### Segurança Avançada

- Zero-trust architecture
- Encryption at rest e in transit
- Auditoria completa de acessos

---

_Este documento representa a visão unificada dos fluxos específicos do Watchman integrados ao ecossistema Assemble, focando nos 5 endpoints principais utilizados no processo de onboarding de clientes._
