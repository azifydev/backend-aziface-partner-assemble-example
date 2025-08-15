# Arquitetura do Projeto

Este documento detalha a arquitetura e organização do projeto Assemble, explicando a estrutura de pastas, padrões arquiteturais e tecnologias utilizadas.

## 🏗️ Visão Geral da Arquitetura

O Assemble é construído seguindo os princípios de **arquitetura modular** do NestJS, com separação clara de responsabilidades e alta coesão entre componentes relacionados.

### Princípios Arquiteturais

1. **Modular Architecture**: Cada funcionalidade é organizada em módulos independentes
2. **Dependency Injection**: Uso extensivo do sistema de DI do NestJS
3. **Separation of Concerns**: Controllers, Services e DTOs bem definidos
4. **Configuration Management**: Configuração centralizada e validada
5. **Security First**: Middleware de segurança em todas as camadas

## 📁 Estrutura Core do Projeto

### Arquivos Principais

```
src/
├── app.module.ts          # Módulo raiz da aplicação
├── app.controller.ts      # Controller principal
├── app.service.ts         # Service principal
├── main.ts               # Ponto de entrada da aplicação
└── repl.ts               # Configuração do REPL
```

#### Detalhamento dos Arquivos Core

- **main.ts**: Bootstrap da aplicação com configuração de segurança, CORS, Swagger e servidor
- **app.module.ts**: Módulo raiz com configuração de middleware global
- **app.controller.ts**: Controller principal com endpoints básicos
- **app.service.ts**: Service principal com lógica de negócio básica

### Camada de Configuração

```
src/config/
├── config.app.env.ts     # Configurações de ambiente da aplicação
├── config.cors.ts        # Configuração de CORS
├── config.logger.ts      # Configuração de logging
├── config.swagger.ts     # Configuração da documentação API
└── env.validation.ts     # Schema de validação de variáveis de ambiente
```

## 🧩 Módulos de Funcionalidade

### Estrutura de Módulos

Cada módulo segue a estrutura padrão do NestJS:

```
src/[module-name]/
├── [module-name].module.ts       # Definição do módulo
├── [module-name].controller.ts   # Endpoints HTTP
├── [module-name].service.ts      # Lógica de negócio
├── [module-name].repository.ts   # Acesso a dados (opcional)
├── dto/                          # Data Transfer Objects
│   ├── create-[entity].dto.ts
│   ├── update-[entity].dto.ts
│   └── [entity]-response.dto.ts
├── entities/                     # Entidades do domínio
│   └── [entity].entity.ts
└── tests/                        # Testes do módulo
    ├── [module-name].controller.spec.ts
    └── [module-name].service.spec.ts
```

### Módulos Principais

#### Módulos de Infraestrutura

- **health-check/**: Endpoints de monitoramento de saúde
- **http-client/**: Cliente HTTP configurado
- **middleware/**: Middleware customizado (logging)
- **prisma/**: Configuração e serviços do Prisma ORM

#### Módulos de Autenticação e Autorização

- **authentication/**: Sistema de autenticação JWT e API Keys
- **authorization/**: Guards e políticas de autorização
- **system-users/**: Gerenciamento de usuários do sistema
- **partner-api-keys/**: Chaves de API para parceiros

#### Módulos de Negócio

- **bank-users/**: Usuários bancários
- **bank-users-groups/**: Grupos de usuários bancários
- **business-partners/**: Parceiros de negócio
- **onboarding_process/**: Processo de onboarding

#### Módulos de Controle de Acesso

- **system-permissions/**: Permissões do sistema
- **system-resources/**: Recursos do sistema
- **user-permissions/**: Permissões de usuários
- **permission-grants-resource/**: Concessão de permissões

## 🔧 Padrões Arquiteturais Utilizados

### 1. Repository Pattern

```typescript
// Exemplo conceitual
@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

### 2. Service Layer Pattern

```typescript
@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private logger: Logger,
  ) {}

  async createUser(data: CreateUserDto): Promise<User> {
    // Lógica de negócio
    return this.userRepository.create(data);
  }
}
```

### 3. DTO Pattern

```typescript
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;
}
```

### 4. Guard Pattern (Autorização)

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Lógica de autorização
    return true;
  }
}
```

## 🗄️ Camada de Dados

### Prisma ORM

- **Schema**: Definido em `prisma/schema.prisma`
- **Migrations**: Versionamento do banco em `prisma/migrations/`
- **Seeds**: Dados iniciais em `prisma/seed/`

### Padrão de Acesso a Dados

1. **PrismaService**: Instância única do cliente Prisma
2. **Repository Layer**: Abstração sobre o Prisma (opcional)
3. **Service Layer**: Lógica de negócio com transações

## 🔌 Camada de Middleware

### Pipeline de Middleware

1. **Helmet**: Cabeçalhos de segurança
2. **CORS**: Configuração de origens permitidas
3. **Logging**: Interceptação de requests/responses
4. **Authentication**: Validação de tokens/API keys
5. **Authorization**: Verificação de permissões

### Middleware Customizado

- **LoggingMiddleware**: Log estruturado com Pino
- **Custom Guards**: Implementações específicas de autorização

## 📊 Monitoramento e Observabilidade

### Health Checks

- **Database**: Verificação de conectividade com Prisma
- **Memory**: Monitoramento de uso de memória
- **Custom**: Checks específicos da aplicação

### Logging

- **Structured Logging**: JSON estruturado com Pino
- **Request Correlation**: IDs únicos para rastreamento
- **Error Tracking**: Logs de erro detalhados

## 🔒 Segurança

### Camadas de Segurança

1. **Network Level**: CORS e headers de segurança
2. **Authentication**: JWT + API Keys multi-level
3. **Authorization**: Guards baseados em roles/permissions
4. **Data Level**: Validação de entrada com Zod

### Implementação de Segurança

- **Helmet**: Proteção contra vulnerabilidades comuns
- **Rate Limiting**: Proteção contra ataques de força bruta
- **Input Validation**: Sanitização e validação rigorosa
- **SQL Injection Prevention**: Uso do Prisma ORM

## 🚀 Build e Deploy

### Configuração de Build

- **TypeScript**: Compilação com configurações otimizadas
- **Assets**: Cópia de arquivos estáticos necessários
- **Environment**: Configuração por ambiente

### Deploy com PM2

- **Cluster Mode**: Múltiplas instâncias para alta disponibilidade
- **Process Management**: Restart automático e monitoramento
- **Memory Management**: Controle de uso de memória

## 📝 Documentação

### Geração Automática

- **TypeDoc**: Documentação de código TypeScript
- **Swagger**: Documentação interativa da API
- **Custom Plugins**: Extensões para documentação especializada

### Estrutura da Documentação

- **API Reference**: Documentação completa dos endpoints
- **Architecture Docs**: Este documento e similares
- **Business Docs**: Documentação para stakeholders não-técnicos

---

Para mais detalhes sobre implementação específica, consulte:

- [Guia de Desenvolvimento](development-guide.html)
- [Documentação da API](api-documentation.html)
- [Database Management](database-management.html)
