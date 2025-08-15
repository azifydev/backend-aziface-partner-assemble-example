# 🚀 Documentação de Integração - Banking as a Service (BaaS)

## 🎯 Visão Geral

Esta documentação fornece um guia completo para integração com a plataforma de Banking as a Service (BaaS) da Azify. Nossa plataforma permite que parceiros criem contas bancárias digitais para seus clientes de forma simples e escalável.

### Características Principais

- **🔐 Autenticação Robusta**: Sistema de API Keys criptografadas com AES-256-GCM
- **⚡ Processamento Assíncrono**: Criação de contas e onboarding não-bloqueante
- **🔄 Webhooks Inteligentes**: Notificações em tempo real sobre mudanças de status
- **📊 Observabilidade**: Logs detalhados e métricas de performance
- **🛡️ Compliance**: Integração automática com validações KYC/AML

### Arquitetura do Sistema

![Architecture](./images/architecture.png)

### Fluxo Geral de Integração

![Integration Flow](./images/flowchart.png)

### [Documentação de API](https://assemble.azify.dev/docs-static/swagger/index.html)

O sistema é baseado em RESTful APIs, você poderá encontrar todos os detalhes sobre os endpoints, parâmetros e exemplos de uso nesta [documentação](https://assemble.azify.dev/docs-static/swagger/index.html)

## Configuração Inicial

### Como Obter Credenciais de Acesso

**1. Processo de Onboarding do Parceiro**

Você deverá entrar em contato com a equipe Azify para iniciar o processo de onboarding. A equipe irá coletar as seguintes informações:

```
- Nome da empresa, exemplo: "Cat Bank Ltda"
```

Sua empresa será cadastrada pela equipe Azify com as seguintes informações:

```json
{
  "id": "cef9a942-4c75-11f0-9d7f-828deb0370e2",
  "name": "Cat Bank Ltda"
}
```

**2. Recebimento das Credenciais**

Você receberá:

- **API Key**: Chave única criptografada para autenticação
- **Partner ID**: Identificador único do seu parceiro

```json
{
  "partnerId": "03fd1f79-74f1-4a51-8d1c-b696a8114f9d",
  "apiKey": "061d7085-2bbd-4e94-aa8a-1463fc14a7c3"
}
```

> Importante: Essas credenciais são armazenadas de forma segura em nossos sistemas, e devem ser mantidas em segredo. Nunca as exponha em repositórios públicos ou logs.

### Configuração do Ambiente

**URLs Base:**

```bash
# Sandbox
SANDBOX_URL=xxxxxxx
SANDBOX_WEBHOOKS=xxxxxx

# Produção
PRODUCTION_URL=xxxxx
PRODUCTION_WEBHOOKS=xxxxxxxx
```

**Variáveis de Ambiente Recomendadas:**

```bash
# .env
API_KEY=sua_api_key_aqui
ENVIRONMENT=sandbox  # ou production
PARTNER_ID=partner-uuid
DEFAULT_CUSTOMER_GROUP_ID=group-uuid # usado exclusivamente para identificação de clientes
```

**Configuração de Permissões Básicas**

Durante o setup, configure os grupos de usuários padrão:

- `PARTNER_ADMIN`: Administradores da sua empresa
- `PARTNER_CUSTOMER`: Clientes finais

> ⚠️ **Importante**: Mantenha suas credenciais seguras e nunca as exponha em repositórios públicos ou logs.

### Testes de Conectividade

**Teste de Autenticação:**

```bash
curl -X GET https://sandbox-api.azify.com/health \
  -H "x-api-key: sua_api_key_aqui"
```

**Resposta Esperada:**

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    }
  }
}
```

## Autenticação e Autorização

### Sistema de Autenticação

A plataforma utiliza um sistema de autenticação em **duas camadas**:

1. **Partner API Key** (`x-api-key`): Autentica sua empresa como parceiro
2. **JWT Tokens** (`Authorization: Bearer`): Autentica usuários específicos

### Papéis e Permissões

A plataforma define papéis padrão para diferentes tipos de usuários:

#### PARTNER_ADMIN

- **Função**: Administradores do parceiro
- **Permissões**:
  - Gerenciar usuários e configurações do parceiro
  - Criar e gerenciar clientes
  - Acessar todas as funcionalidades da API
  - Configurar webhooks

#### PARTNER_CUSTOMER

- **Função**: Clientes finais
- **Permissões**:
  - Acessar apenas seus próprios dados (`self:read`, `self:update`)
  - Realizar operações em sua própria conta
  - Consultar histórico de transações próprias

### Diferença entre API Key e JWT Token

| Aspecto       | API Key (`x-api-key`)             | JWT Token (`Authorization: Bearer`)         |
| :------------ | :-------------------------------- | :------------------------------------------ |
| **Propósito** | Identifica e autentica o parceiro | Identifica e autentica o usuário específico |
| **Escopo**    | Acesso geral às APIs do parceiro  | Acesso baseado nas permissões do usuário    |
| **Duração**   | Permanente (até renovação)        | Temporário (expira em 1 hora)               |
| **Uso**       | Sempre obrigatório                | Obrigatório para operações de usuário       |

### Implementação da Autenticação

**Headers para Operações de Parceiro:**

```http
x-api-key: sua_chave_api_partner
Content-Type: application/json
```

**Headers para Operações de Usuário:**

```http
x-api-key: sua_chave_api_partner
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

## Guia de Integração Passo a Passo

Esta seção fornece um guia completo e sequencial para integração com a plataforma BaaS da Azify.

### Passo 0: Onboarding do Parceiro

**Processo de Cadastro Inicial**

Entre em contato com a equipe Azify para iniciar o processo de onboarding. A equipe coletará as seguintes informações:

- Nome da empresa (ex: "Cat Bank Ltda")
- Dados de contato técnico
- Ambiente de integração desejado

Sua empresa será cadastrada com as seguintes informações:

```json
{
  "id": "cef9a942-4c75-11f0-9d7f-828deb0370e2",
  "name": "Cat Bank Ltda"
}
```

**Credenciais Fornecidas:**

```json
{
  "partnerId": "03fd1f79-74f1-4a51-8d1c-b696a8114f9d",
  "apiKey": "061d7085-2bbd-4e94-aa8a-1463fc14a7c3"
}
```

### Passo 1: Configuração do Usuário Administrador do Parceiro

O primeiro passo após receber as credenciais é criar um usuário administrador que terá permissões para gerenciar clientes e configurações do parceiro.

**Endpoint:** `POST /partner-system-user/setup`

**Headers Obrigatórios:**

```http
x-api-key: sua_api_key_aqui
Content-Type: application/json
```

**Request Body:**

```json
{
  "systemUser": {
    "name": "João Silva", // Nome completo do administrador
    "externalId": "admin_joao_001" // ID único do administrador no seu sistema
  },
  "authentication": {
    "secret": "senha_segura_123" // Senha que será usada para login
  }
}
```

**Response (201 Created):**

```json
{
  "systemUserId": "550e8400-e29b-41d4-a716-446655440000",
  "groupId": "admin-group-uuid",
  "bankUserId": "bank-user-uuid"
}
```

**Campos da Resposta:**

- `systemUserId`: ID do usuário no sistema Assemble
- `groupId`: ID do grupo administrativo (papel `PARTNER_ADMIN`)
- `bankUserId`: ID bancário para operações futuras

### Passo 2: Autenticação e Obtenção de Token JWT

Após criar o usuário administrador, você deve autenticá-lo para obter um token JWT que será usado nas operações subsequentes.

**Endpoint:** `POST /auth/login`

**Headers Obrigatórios:**

```http
x-api-key: sua_api_key_aqui
Content-Type: application/json
```

**Request Body:**

```json
{
  "assembleUserId": "550e8400-e29b-41d4-a716-446655440000", // systemUserId do passo anterior
  "externalSecret": "senha_segura_123" // senha definida no setup
}
```

**Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "external_id": "admin_joao_001"
  }
}
```

**⚠️ Importante:** Este token deve ser incluído no header `Authorization: Bearer <accessToken>` para todas as operações que requerem autenticação de usuário.

### Passo 3: Criação de Clientes (Customers)

Agora você pode criar clientes finais que passarão pelo processo de onboarding.

**Endpoint:** `POST /customers`

**Headers Obrigatórios:**

```http
x-api-key: sua_api_key_aqui
Content-Type: application/json
```

**Request Body:**

```json
{
  "type": "INDIVIDUAL",
  "groupId": "customer-group-uuid", // ID do grupo de clientes finais
  "taxpayer": "12345678900", // CPF que será validado
  "fullName": "Maria Silva Santos", // Nome completo (obrigatório no schema)
  "username": "maria.silva", // Deve ser único dentro do parceiro
  "password": "senha_segura_123",
  "email": "maria@email.com", // Deve ser único dentro do parceiro
  "phoneNumber": "+5511999999999" // Deve ser único dentro do parceiro
}
```

**Validações Automáticas:**

- **Email, phoneNumber e username** devem ser únicos dentro do seu parceiro
- **Taxpayer (CPF)** será validado quanto à formatação e regularidade
- **GroupId** deve ser o ID do grupo de clientes finais configurado previamente
- **FullName** é obrigatório conforme schema da API

**Response (200 OK):**

```json
{
  "id": "customer-uuid",
  "type": "INDIVIDUAL",
  "taxpayer": "12345678900",
  "username": "maria.silva",
  "email": "maria@email.com",
  "phoneNumber": "+5511999999999",
  "createdAt": "2025-06-30T12:00:00Z"
}
```

### Passo 4: O Processo de Onboarding Completo

Após a criação, o cliente entra em um fluxo de onboarding para validação de dados e documentos. Este processo é essencial para ativar a conta bancária.

#### Estados do Onboarding

| Estado                         | Descrição para o Parceiro                        | Próxima Ação Esperada                |
| :----------------------------- | :----------------------------------------------- | :----------------------------------- |
| `MISSING_ACCOUNT_CONFIRMATION` | Cliente recém-criado, aguardando dados           | Enviar dados de onboarding           |
| `ONBOARDING_SENT`              | Dados recebidos, em análise automática           | Aguardar webhook ou consultar status |
| `MAESTRO_ONBOARDING_CREATED`   | Análise automática concluída, aguardando revisão | Aguardar                             |
| `MAESTRO_ACCOUNT_CREATED`      | Cliente aprovado! Conta pronta para ser ativada  | Chamar endpoint de confirmação       |
| `ACCOUNT_CREATED`              | Conta ativa e operacional                        | Cliente pode realizar operações      |

#### Fluxo de API do Onboarding

**1. Consultar Status Atual**

**Endpoint:** `GET /onboardings/{userType}/{bankUserId}`

**Headers Obrigatórios:**

```http
x-api-key: sua_api_key_aqui
Authorization: Bearer <accessToken>
```

```bash
curl -X GET "https://api.azify.com/onboardings/individual/bank-user-uuid" \
  -H "x-api-key: sua_api_key_aqui" \
  -H "Authorization: Bearer <accessToken>"
```

**Response (200 OK):**
```json
{
  "registerName": "Maria Silva Santos",
  "socialName": "Maria Silva Santos",
  "taxpayer": "12345678900",
  "motherName": "Ana Santos Silva",
  "email": "maria@email.com",
  "birthDate": "1990-01-01",
  "pep": "SELF",
  "phone": {
    "countryCode": "55",
    "number": "11999999999"
  },
  "address": {
    "address": "Rua das Flores",
    "zipcode": "01234-567",
    "complement": "Apto 45",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "buildingNumber": "123"
  },
  "declaredIncome": "FROM_FIVE_THOUSAND_TO_TEN_THOUSAND",
  "documentation": {
    "biometricProcess": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**2. Enviar/Atualizar Dados Detalhados**

**Endpoint:** `PUT /onboardings/individual/{bankUserId}`

**Headers Obrigatórios:**

```http
x-api-key: sua_api_key_aqui
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "registerName": "Maria Silva Santos",
  "socialName": "Maria Silva Santos",
  "taxpayer": "12345678900",
  "motherName": "Ana Santos Silva",
  "email": "maria@email.com",
  "birthDate": "1990-01-01",
  "pep": "SELF",
  "phone": {
    "countryCode": "55",
    "number": "11999999999"
  },
  "address": {
    "address": "Rua das Flores",
    "zipcode": "01234-567",
    "complement": "Apto 45",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "buildingNumber": "123"
  },
  "declaredIncome": "FROM_FIVE_THOUSAND_TO_TEN_THOUSAND"
}
```

**Validações Automáticas:**
- **Taxpayer (CPF)** será validado quanto à formatação e regularidade
- **documentation** não é permitido ser enviado essa informação nesta requisição

**Response (200 OK):**
```json
{
  "registerName": "Maria Silva Santos",
  "socialName": "Maria Silva Santos",
  "taxpayer": "12345678900",
  "motherName": "Ana Santos Silva",
  "email": "maria@email.com",
  "birthDate": "1990-01-01",
  "pep": "SELF",
  "phone": {
    "countryCode": "55",
    "number": "11999999999"
  },
  "address": {
    "address": "Rua das Flores",
    "zipcode": "01234-567",
    "complement": "Apto 45",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "buildingNumber": "123"
  },
  "declaredIncome": "FROM_FIVE_THOUSAND_TO_TEN_THOUSAND"
}
```

**3. Configurar Processo Biométrico**

**3.1 Obter Configuração:**

```bash
curl -X GET "https://api.azify.com/biometric/configs" \
  -H "x-api-key: sua_api_key_aqui"
```

**3.2 Criar Sessão:**

```json
{
  "userId": "bank-user-uuid",
  "documentNumber": "12345678900"
}
```

**3.3 Registrar Processo:**

**Endpoint:** `POST /onboardings/biometric-process`

**Headers Obrigatórios:**

```http
x-api-key: sua_api_key_aqui
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**

```json
{
  "biometricProcess": "550e8400-e29b-41d4-a716-446655440000", // Código do processo biométrico
  "userType": "INDIVIDUAL", // Tipo do usuário
}
```

```bash
curl -X POST "https://api.azify.com/onboardings/biometric-process" \
  -H "x-api-key: sua_api_key_aqui" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "biometricProcess": "biometric-process-id",
    "userType": "INDIVIDUAL"
  }'
```

**Response (204 OK):**

**4. Obter Termos de Aceite**

**Endpoint:** `GET /acceptance-terms-and-conditions`

**Headers Obrigatórios:**

```http
x-api-key: sua_api_key_aqui
```

```bash
curl -X GET "https://api.azify.com/acceptance-terms-and-conditions" \
  -H "x-api-key: sua_api_key_aqui"
```

**6. Finalizar Onboarding**

**Endpoint:** `POST /onboardings/complete`

**Headers Obrigatórios:**

```http
x-api-key: sua_api_key_aqui
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**

```json
{
  "bankUserId": "bank-user-uuid", // ID do bank user do Assemble
  "userType": "INDIVIDUAL", // Tipo do usuário
  "acceptTermsAndConditions": true // Se os termos e condiçoes foram aceitas (true/false)
}
```

```bash
curl -X POST "https://api.azify.com/onboardings/complete" \
  -H "x-api-key: sua_api_key_aqui" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "individual",
    "bankUserId": "bank-user-uuid",
    "acceptTermsAndCondition": true
  }'
```

**Response (200 OK):**

```json
{
  "data": "ok"
}
```

---

## Gestão de Customers

### Criação de Customers

**Endpoint:** `POST /customers`

**Headers Obrigatórios:**

```http
x-api-key: sua_api_key_aqui
Content-Type: application/json
```

**Parâmetros Obrigatórios:**

```json
{
  "type": "INDIVIDUAL",
  "groupId": "customer-group-uuid",
  "taxpayer": "12345678900",
  "fullName": "Maria Silva Santos",
  "username": "maria.silva",
  "password": "senha_segura_123",
  "email": "maria@email.com",
  "phoneNumber": "+5511999999999"
}
```

**Parâmetros Opcionais:**
Todos os campos listados acima são obrigatórios segundo o schema da API.

### Validações Implementadas

**1. Validação de Documentos:**

- CPF/CNPJ válidos e em situação regular na Receita Federal
- Verificação via integração com órgãos oficiais

**2. Validação de Unicidade:**

- Email único por parceiro
- Telefone único por parceiro
- Username único por parceiro

**3. Validação de Grupo:**

- Grupo deve existir e pertencer ao parceiro
- Usuário será associado ao grupo especificado

## Tratamento de Erros

Uma seção dedicada ao tratamento adequado de erros para garantir uma integração robusta.

### Códigos de Erro HTTP Comuns

| Código                      | Mensagem de Erro (Exemplo)              | Causa Provável                                                   | Ação Recomendada                                                                                   |
| :-------------------------- | :-------------------------------------- | :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `400 Bad Request`           | `["email must be a valid email"]`       | Dados enviados na requisição estão incorretos ou faltando        | Verifique o payload da requisição contra a documentação e corrija os campos inválidos              |
| `401 Unauthorized`          | `Invalid API key`                       | A x-api-key está incorreta, expirou ou não foi enviada           | Confirme se você está usando a API Key correta fornecida durante o onboarding                      |
| `403 Forbidden`             | `You do not have permission...`         | O usuário autenticado não tem permissão para executar a ação     | Garanta que o usuário logado pertence a um grupo com as permissões necessárias (ex: PARTNER_ADMIN) |
| `409 Conflict`              | `Email already exists for this partner` | Tentativa de criar um recurso que já existe                      | Verifique se o cliente já foi cadastrado. Use endpoints PUT para atualizações                      |
| `422 Unprocessable Entity`  | `Documento irregular`                   | CPF/CNPJ com status irregular em sistemas de verificação externa | Informe o cliente para regularizar sua situação cadastral                                          |
| `429 Too Many Requests`     | `Rate limit exceeded`                   | Muitas requisições em pouco tempo                                | Implemente backoff exponencial e respeite os rate limits                                           |
| `500 Internal Server Error` | `Internal server error`                 | Erro interno do servidor                                         | Tente novamente após alguns segundos. Se persistir, contate o suporte                              |

### Estrutura Padrão de Erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "must be a valid email",
        "value": "invalid-email"
      }
    ]
  },
  "timestamp": "2025-06-30T14:30:00Z",
  "path": "/customers"
}
```

### Boas Práticas de Tratamento

1. **Log Estruturado**: Registre sempre código, mensagem e contexto
2. **Retry Inteligente**: Implemente retry apenas para erros 5xx e 429
3. **Feedback ao Usuário**: Traduza mensagens técnicas para o usuário final
4. **Monitoramento**: Configure alertas para erros recorrentes

---

## Referência Completa da API

Esta seção fornece uma referência rápida e útil de todos os endpoints, organizados por funcionalidade.

### Autenticação

#### POST /auth/login

Autentica um usuário e retorna um token JWT.

**cURL Example:**

```bash
curl -X POST "https://api.azify.com/auth/login" \
  -H "x-api-key: sua_api_key_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "assembleUserId": "550e8400-e29b-41d4-a716-446655440000",
    "externalSecret": "senha_segura_123"
  }'
```

**Request Body:**

```json
{
  "assembleUserId": "string", // ID do usuário no sistema Assemble
  "externalSecret": "string" // Senha definida no setup
}
```

**Response Body (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "external_id": "admin_joao_001"
  }
}
```

#### POST /partner-system-user/setup

Configura o usuário administrador inicial do parceiro.

**cURL Example:**

```bash
curl -X POST "https://api.azify.com/partner-system-user/setup" \
  -H "x-api-key: sua_api_key_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "systemUser": {
      "name": "João Silva",
      "externalId": "admin_joao_001"
    },
    "authentication": {
      "secret": "senha_segura_123"
    }
  }'
```

**Request Body:**

```json
{
  "systemUser": {
    "name": "string", // Nome completo do administrador
    "externalId": "string" // ID único no sistema do parceiro
  },
  "authentication": {
    "secret": "string" // Senha para login
  }
}
```

**Response Body (201 Created):**

```json
{
  "systemUserId": "550e8400-e29b-41d4-a716-446655440000",
  "groupId": "admin-group-uuid",
  "bankUserId": "bank-user-uuid"
}
```

### Gestão de Clientes (Customers)

#### POST /customers

Cria um novo cliente final.

**cURL Example:**

```bash
curl -X POST "https://api.azify.com/customers" \
  -H "x-api-key: sua_api_key_aqui" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Maria Silva Santos",
    "email": "maria@email.com",
    "phoneNumber": "+5511999999999",
    "taxpayer": "12345678900",
    "type": "INDIVIDUAL",
    "username": "maria.silva",
    "password": "senha_segura_123",
    "groupId": "customer-group-uuid"
  }'
```

**Request Body:**

```json
{
  "type": "INDIVIDUAL", // Tipo de pessoa (obrigatório)
  "groupId": "string", // ID do grupo de clientes (obrigatório)
  "taxpayer": "string", // CPF/CNPJ (obrigatório)
  "fullName": "string", // Nome completo (obrigatório)
  "username": "string", // Username único no parceiro (obrigatório)
  "password": "string", // Senha do cliente (obrigatório)
  "email": "string", // Email único no parceiro (obrigatório)
  "phoneNumber": "string" // Telefone único no parceiro (obrigatório)
}
```

**Response Body (200 OK):**

```json
{
  "id": "customer-uuid",
  "type": "INDIVIDUAL",
  "taxpayer": "12345678900",
  "username": "maria.silva",
  "email": "maria@email.com",
  "phoneNumber": "+5511999999999",
  "createdAt": "2025-06-30T12:00:00Z"
}
```

### Fluxo de Onboarding

#### GET /onboardings/{userType}/{bankUserId}

Consulta o status atual do onboarding.

**cURL Example:**

```bash
curl -X GET "https://api.azify.com/onboardings/individual/bank-user-uuid" \
  -H "x-api-key: sua_api_key_aqui" \
  -H "Authorization: Bearer <accessToken>"
```

**Response Body (200 OK):**

```json
{
  "status": "ONBOARDING_SENT",
  "userType": "individual",
  "bankUserId": "bank-user-uuid",
  "details": {
    "lastUpdate": "2025-06-30T12:00:00Z",
    "nextSteps": ["BIOMETRIC_VERIFICATION"]
  }
}
```

#### PUT /onboardings/document-analysis/{bankUserId}

Gera a URL do arquivo enviado para documentação.

**cURL Example:**

```bash
curl -X PUT "https://api.azify.com/onboardings/document-analysis/bank-user-uuid" \
  -H "x-api-key: sua_api_key_aqui" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
      "file": "base64:file",
      "userType": "INDIVIDUAL"
    }
  }'
```

#### PUT /onboardings/individual/{bankUserId}

Envia/atualiza os dados cadastrais do cliente.

**cURL Example:**

```bash
curl -X PUT "https://api.azify.com/onboardings/individual/bank-user-uuid" \
  -H "x-api-key: sua_api_key_aqui" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "registerName": "Maria Silva Santos",
    "socialName": "Maria Silva Santos",
    "taxpayer": "12345678900",
    "motherName": "Ana Santos Silva",
    "email": "maria@email.com",
    "birthDate": "1990-01-01",
    "pep": "SELF",
    "phone": {
      "countryCode": "55",
      "number": "11999999999"
    },
    "address": {
      "address": "Rua das Flores",
      "zipcode": "01234-567",
      "complement": "Apto 45",
      "city": "São Paulo",
      "state": "SP",
      "country": "Brasil",
      "buildingNumber": "123"
    },
    "declaredIncome": "FROM_FIVE_THOUSAND_TO_TEN_THOUSAND"
  }'
```

#### POST /onboardings/biometric-process

Associa um processo de verificação biométrica ao onboarding.

**cURL Example:**

```bash
curl -X POST "https://api.azify.com/onboardings/biometric-process" \
  -H "x-api-key: sua_api_key_aqui" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "biometricProcess": "biometric-process-id",
    "userType": "INDIVIDUAL"
  }'
```

#### POST /onboardings/complete

Submete o onboarding para análise final.

**cURL Example:**

```bash
curl -X POST "https://api.azify.com/onboardings/complete" \
  -H "x-api-key: sua_api_key_aqui" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "individual",
    "bankUserId": "bank-user-uuid",
    "acceptTermsAndCondition": true
  }'
```

#### GET /acceptance-terms-and-conditions

Obtém o link dos termos de aceite.

**cURL Example:**

```bash
curl -X GET "https://api.azify.com/acceptance-terms-and-conditions" \
  -H "x-api-key: sua_api_key_aqui"
```

**Response Body (200 OK):**

```json
{
  "termsUrl": "https://termos-e-condicoes.azify.com/v1.0"
}
```

### Webhooks

⚠️ **Importante**: Os endpoints de webhooks não estão disponíveis na documentação atual da API. Para configurar webhooks, entre em contato com o suporte técnico da Azify.

**Eventos Principais Esperados:**

- `CUSTOMER_APPROVED`: Cliente aprovado no processo de KYC
- `CUSTOMER_REPROVED`: Cliente reprovado no processo de KYC
- `CUSTOMER_ON_HOLD`: Cliente precisa corrigir dados ou documentos
- `ACCOUNT_CREATED`: Conta bancária criada com sucesso

Para informações sobre configuração de webhooks, consulte a documentação específica ou entre em contato com o suporte.

## Checklist de Implementação

### Fase 1: Configuração e Autenticação

- [ ] Recebeu credenciais de produção e sandbox (API Key, Partner ID)
- [ ] Realizou o setup do primeiro usuário administrador (`POST /partner-system-user/setup`)
- [ ] Implementou a lógica de login (`POST /auth/login`) para obter tokens JWT
- [ ] Testou a conectividade e autenticação com o endpoint `GET /health`
- [ ] Configurou variáveis de ambiente adequadas
- [ ] Implementou tratamento seguro das credenciais

### Fase 2: Fluxo Principal de Clientes

- [ ] Implementou a criação de clientes (`POST /customers`)
- [ ] Implementou o fluxo completo de onboarding:
  - [ ] Envio de dados cadastrais (`PUT /onboardings/individual/{bankUserId}`)
  - [ ] Integração com a biometria (`POST /onboardings/biometric-process`)
  - [ ] Submissão para análise (`POST /onboardings/complete`)
- [ ] Implementou a consulta de status do onboarding (`GET /onboardings/{userType}/{bankUserId}`)
- [ ] Configurou tratamento para todos os estados do onboarding
- [ ] Implementou validação de dados antes do envio

### Fase 3: Notificações e Monitoramento

- [ ] Solicitou configuração de webhooks junto ao suporte técnico da Azify
- [ ] Implementou endpoint para receber webhooks de status (`CUSTOMER_APPROVED`, `CUSTOMER_REPROVED`, `CUSTOMER_ON_HOLD`)
- [ ] Implementou validação de assinatura HMAC dos webhooks (se fornecida pelo suporte)
- [ ] Configurou processamento assíncrono dos webhooks
- [ ] Implementou o tratamento para os principais códigos de erro da API
- [ ] Configurou logs estruturados e monitoramento de errores

### Fase 4: Testes e Validação

- [ ] Realizou testes de ponta a ponta no ambiente de Sandbox
- [ ] Testou todos os cenários de erro e edge cases
- [ ] Validou a segurança da implementação
- [ ] Testou o fluxo de webhook com diferentes eventos
- [ ] Verificou rate limiting e implementou retry adequado
- [ ] Documentou o fluxo de integração interno

### Fase 5: Go-Live

- [ ] Validou o checklist com a equipe do Assemble
- [ ] Trocou as credenciais de Sandbox pelas de Produção
- [ ] Configurou monitoramento em produção
- [ ] Definiu procedimentos de suporte e escalação
- [ ] Treinou equipe de operações
- [ ] Planejou procedimento de rollback se necessário

### Checklist de Segurança

- [ ] API Keys armazenadas de forma segura (não em código)
- [ ] Tokens JWT com expiração adequada
- [ ] Validação de entrada em todos os endpoints
- [ ] Logs não contêm informações sensíveis
- [ ] HTTPS obrigatório em todos os endpoints
- [ ] Validação de assinatura dos webhooks implementada
- [ ] Rate limiting configurado adequadamente

---

## Suporte e Recursos

### Documentação Adicional

- **Portal do Desenvolvedor**: XXXXXXXXXXXXX
- **Status Page**:XXXXXXXXXXXXXXXXXXx
- **Changelog**: XXXXXXXXXXXXXXXXXXXXXXX

### Suporte Técnico

- **Email**: xxxxx
- **Slack**: xxxx
- **Telefone**: xxxx
- **Horário**: xxxxxx
