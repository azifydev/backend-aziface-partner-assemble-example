# Sistema de Autenticação

Este documento detalha o sistema de autenticação do Assemble, explicando os diferentes métodos de autenticação, fluxos de autorização e implementação de segurança.

## 🔐 Visão Geral do Sistema

O Assemble implementa um **sistema de autenticação multicamadas** que suporta diferentes tipos de usuários e aplicações, garantindo segurança e flexibilidade no acesso aos recursos.

### Tipos de Autenticação

1. **🔑 Autenticação JWT**: Para usuários finais e sistema
2. **🗝️ API Keys Internas**: Para aplicações internas da empresa
3. **🤝 API Keys de Parceiros**: Para parceiros externos autorizados

## 🏗️ Arquitetura de Autenticação

### Fluxo Hierárquico de Acesso

```mermaid
graph TD
    A[Admin Interno] --> B[Gera API Key do Parceiro]
    B --> C[Parceiro Admin]
    C --> D[Cria Usuário de Sistema]
    D --> E[Usuário de Sistema]
    E --> F[Cria Bank User]
    F --> G[Bank User]
    G --> H[Acessa Recursos Bancários]
```

### Resumo do Fluxo

> **Admin** → API Key Parceiro → **Parceiro Admin** → Usuário Sistema → **Usuário Sistema** → Bank User → **Bank User** → Recursos

## 🔑 1. Autenticação JWT

### Implementação

Utiliza **Passport.js** com estratégia JWT para autenticação stateless e segura.

### Características

- **Stateless**: Não requer armazenamento de sessão no servidor
- **Seguro**: Tokens assinados com chave secreta
- **Expirável**: Tokens com tempo de vida configurável
- **Renovável**: Sistema de refresh tokens

### Configuração

```typescript
// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
  }
}
```

### Endpoints de Autenticação

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Resposta**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "roles": ["user"]
  }
}
```

#### Refresh Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

#### Profile

```http
GET /api/v1/auth/profile
Authorization: Bearer <access_token>
```

### Uso em Requisições

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🗝️ 2. API Keys Internas

### Propósito

Para autenticar **aplicações internas** da empresa que consomem a API do Assemble.

### Características

- **Simplicidade**: Autenticação por header HTTP
- **Permanente**: Não expira automaticamente
- **Revogável**: Pode ser revogada pelo administrador
- **Rastreável**: Logs de uso por aplicação

### Configuração

```typescript
// api-key.guard.ts
@Injectable()
export class ApiKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) return false;

    return this.validateInternalApiKey(apiKey);
  }

  private async validateInternalApiKey(key: string): Promise<boolean> {
    return key === process.env.API_KEY_INTERNAL;
  }
}
```

### Uso

```http
X-API-Key: your-internal-api-key-here
```

### Gerenciamento

- **Geração**: Através de variáveis de ambiente
- **Rotação**: Processo manual controlado
- **Monitoramento**: Logs de acesso por aplicação

## 🤝 3. API Keys de Parceiros

### Propósito

Para autenticar **parceiros externos** que têm permissão para usar a API.

### Características

- **Gerenciadas por BD**: Armazenadas e controladas no banco de dados
- **Por Parceiro**: Cada parceiro tem sua própria chave
- **Revogáveis**: Podem ser revogadas instantaneamente
- **Auditáveis**: Histórico completo de uso

### Modelo de Dados

```prisma
model PartnerApiKey {
  id          String   @id @default(uuid())
  key         String   @unique
  name        String
  description String?
  partnerId   String
  partner     BusinessPartner @relation(fields: [partnerId], references: [id])
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lastUsedAt  DateTime?
  usageCount  Int      @default(0)

  @@map("partner_api_keys")
}
```

### Endpoints de Gerenciamento

#### Listar API Keys

```http
GET /api/v1/partner-api-keys
Authorization: Bearer <admin_token>
```

#### Criar Nova API Key

```http
POST /api/v1/partner-api-keys
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Partner XYZ Production Key",
  "description": "Chave para ambiente de produção",
  "partnerId": "partner-uuid"
}
```

#### Revogar API Key

```http
DELETE /api/v1/partner-api-keys/{keyId}
Authorization: Bearer <admin_token>
```

### Uso por Parceiros

```http
X-Partner-API-Key: pk_live_abcd1234567890...
```

### Implementação da Validação

```typescript
// partner-api-key.guard.ts
@Injectable()
export class PartnerApiKeyGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private logger: Logger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-partner-api-key'];

    if (!apiKey) return false;

    const keyRecord = await this.prisma.partnerApiKey.findUnique({
      where: { key: apiKey, isActive: true },
      include: { partner: true },
    });

    if (!keyRecord) return false;

    // Atualizar estatísticas de uso
    await this.updateUsageStats(keyRecord.id);

    // Adicionar informações do parceiro ao request
    request.partner = keyRecord.partner;

    return true;
  }
}
```

## 🔒 Middleware de Segurança

### Helmet.js

Configuração de headers de segurança:

```typescript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);
```

### Rate Limiting

Proteção contra ataques de força bruta:

```typescript
@Injectable()
export class RateLimitGuard implements CanActivate {
  private attempts = new Map<string, number>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;

    const currentAttempts = this.attempts.get(ip) || 0;

    if (currentAttempts >= 5) {
      throw new ThrottlerException();
    }

    return true;
  }
}
```

## 🔐 Criptografia e Hashing

### Passwords

Utiliza **bcrypt** para hash de senhas:

```typescript
@Injectable()
export class HashService {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

### JWT Secrets

- **Produção**: Chaves assimétricas (RSA 2048-bit)
- **Desenvolvimento**: Chaves simétricas seguras
- **Rotação**: Processo automatizado de rotação de chaves

## 🛡️ Guards e Decorators

### Guards Customizados

#### JwtAuthGuard

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
```

#### RolesGuard

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### Decorators Utilitários

#### @Roles()

```typescript
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Uso
@Get()
@Roles(Role.Admin, Role.Manager)
findAll() {
  // apenas admin e manager podem acessar
}
```

#### @CurrentUser()

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Uso
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

## 🔍 Auditoria e Logs

### Log de Autenticação

```typescript
@Injectable()
export class AuthAuditService {
  constructor(private logger: Logger) {}

  logLoginAttempt(email: string, success: boolean, ip: string) {
    this.logger.log({
      event: 'login_attempt',
      email,
      success,
      ip,
      timestamp: new Date().toISOString(),
    });
  }

  logApiKeyUsage(keyId: string, endpoint: string, partnerId: string) {
    this.logger.log({
      event: 'api_key_usage',
      keyId,
      endpoint,
      partnerId,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Métricas de Segurança

- **Failed Login Attempts**: Tentativas de login falhadas
- **API Key Usage**: Uso de chaves de API por parceiro
- **Token Refresh Rate**: Taxa de renovação de tokens
- **Suspicious Activity**: Atividades suspeitas detectadas

## ⚠️ Tratamento de Erros de Autenticação

### Tipos de Erro

```typescript
export enum AuthError {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  API_KEY_INVALID = 'API_KEY_INVALID',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
}
```

### Respostas de Erro

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email ou senha incorretos",
    "timestamp": "2025-06-24T10:00:00Z"
  }
}
```

## 🧪 Testando Autenticação

### Teste de Login

```typescript
describe('AuthController', () => {
  it('should authenticate user with valid credentials', async () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(loginDto)
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
    expect(response.body.user.email).toBe(loginDto.email);
  });
});
```

### Teste de API Key

```typescript
describe('PartnerApiKeyGuard', () => {
  it('should allow access with valid partner API key', async () => {
    const validApiKey = 'pk_test_123456789';

    const response = await request(app.getHttpServer())
      .get('/api/v1/protected-endpoint')
      .set('X-Partner-API-Key', validApiKey)
      .expect(200);
  });
});
```

## 📋 Boas Práticas

### Desenvolvimento

1. **Nunca** hardcodar credentials no código
2. **Sempre** usar HTTPS em produção
3. **Implementar** rate limiting apropriado
4. **Validar** e sanitizar todas as entradas
5. **Logar** todas as tentativas de autenticação

### Produção

1. **Rotacionar** chaves regularmente
2. **Monitorar** tentativas de acesso suspeitas
3. **Implementar** alertas de segurança
4. **Backup** de chaves de forma segura
5. **Auditar** acessos regularmente

## 🔗 Recursos Relacionados

- [Autorização](authorization.html) - Sistema de controle de acesso
- [API Documentation](api-documentation.html) - Como usar os endpoints
- [Testing](testing.html) - Como testar autenticação

---

Para implementação detalhada e exemplos de código, consulte:

- [Guia de Desenvolvimento](development-guide.html)
- [Arquitetura do Projeto](project-architecture.html)
