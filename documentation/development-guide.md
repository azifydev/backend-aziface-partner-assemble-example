# Guia de Desenvolvimento

Este guia contém todas as informações necessárias para configurar, desenvolver e manter o projeto Assemble.

## 🚀 Setup Inicial do Projeto

### Pré-requisitos

- **Node.js**: versão 18.x ou superior
- **pnpm**: gerenciador de pacotes preferido
- **Docker**: para banco de dados local (opcional)
- **Git**: controle de versão

### Instalação

```bash
# Clonar o repositório
$ git clone <repository-url>
$ cd assemble

# Instalar dependências
$ pnpm install

# Configurar variáveis de ambiente
$ cp .env.example .env
$ # Editar .env com suas configurações

# Configurar banco de dados
$ pnpm run db:migrate
$ pnpm run db:seed
```

## 📦 Dependências Principais

### Core Dependencies

| Pacote                     | Versão      | Propósito                     |
| -------------------------- | ----------- | ----------------------------- |
| `@nestjs/core`             | ^10.x       | Framework principal           |
| `@nestjs/common`           | ^10.x       | Utilities e decorators        |
| `@nestjs/platform-express` | ^10.x       | Adapter para Express          |
| `@nestjs/config`           | ^3.x        | Gerenciamento de configuração |
| `@nestjs/swagger`          | ^7.x        | Documentação OpenAPI          |
| `@nestjs/terminus`         | ^10.x       | Health checks                 |
| `helmet`                   | ^7.x        | Middleware de segurança       |
| `nestjs-pino` & `pino`     | ^3.x & ^8.x | Logging performático          |
| `zod`                      | ^3.x        | Validação de schemas          |
| `rxjs`                     | ^7.x        | Programação reativa           |

### Development Dependencies

| Pacote                   | Versão      | Propósito                |
| ------------------------ | ----------- | ------------------------ |
| `@nestjs/testing`        | ^10.x       | Utilities de teste       |
| `jest` & `@swc/jest`     | ^29.x       | Framework de testes      |
| `typescript` & `ts-node` | ^5.x        | Suporte TypeScript       |
| `eslint` & `prettier`    | ^8.x & ^3.x | Linting e formatação     |
| `typedoc`                | ^0.25.x     | Geração de documentação  |
| `pm2`                    | ^5.x        | Gerenciador de processos |

## 🛠️ Scripts Disponíveis

### Scripts de Desenvolvimento

```bash
# Desenvolvimento com hot-reload
$ pnpm run start:dev

# Modo debug com inspector
$ pnpm run start:debug

# REPL interativo para desenvolvimento
$ pnpm run repl
```

### Scripts de Build e Deploy

```bash
# Compilar TypeScript para JavaScript
$ pnpm run build

# Executar versão compilada
$ pnpm run start:prod

# Build e deploy com PM2
$ pnpm run deploy
```

### Scripts de Teste

```bash
# Testes unitários
$ pnpm run test

# Testes em modo watch
$ pnpm run test:watch

# Testes com coverage
$ pnpm run test:cov

# Testes end-to-end
$ pnpm run test:e2e
```

### Scripts de Qualidade de Código

```bash
# Formatação com Prettier
$ pnpm run format

# Linting com ESLint
$ pnpm run lint

# Lint com correção automática
$ pnpm run lint:fix
```

### Scripts de Documentação

```bash
# Gerar documentação TypeDoc
$ pnpm run docs

# Servir documentação localmente
$ pnpm run docs:serve
```

### Scripts PM2 (Produção)

```bash
# Verificar status dos processos
$ pnpm run pm2:status

# Visualizar logs
$ pnpm run pm2:logs

# Reiniciar aplicação
$ pnpm run pm2:restart

# Parar aplicação
$ pnpm run pm2:stop

# Deletar processos PM2
$ pnpm run pm2:delete
```

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/assemble"

# Server
PORT=30000
NODE_ENV=development

# Authentication
JWT_SECRET="your-jwt-secret"
API_KEY_INTERNAL="your-internal-api-key"

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGIN="http://localhost:3000"
```

### Configuração do Banco de Dados

```bash
# Gerar cliente Prisma
$ pnpm run db:generate

# Executar migrações
$ pnpm run db:migrate

# Reset do banco (cuidado em produção!)
$ pnpm run db:reset

# Executar seeds
$ pnpm run db:seed
```

## 🏗️ Estrutura de Desenvolvimento

### Criando um Novo Módulo

1. **Gerar módulo com NestJS CLI**:

```bash
$ nest generate module feature-name
$ nest generate controller feature-name
$ nest generate service feature-name
```

2. **Estrutura de arquivos**:

```
src/feature-name/
├── feature-name.module.ts
├── feature-name.controller.ts
├── feature-name.service.ts
├── dto/
│   ├── create-feature.dto.ts
│   └── update-feature.dto.ts
├── entities/
│   └── feature.entity.ts
└── tests/
    ├── feature-name.controller.spec.ts
    └── feature-name.service.spec.ts
```

### Padrões de Código

#### Controllers

```typescript
@Controller('api/v1/features')
@ApiTags('Features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  @ApiOperation({ summary: 'List all features' })
  async findAll(): Promise<FeatureResponseDto[]> {
    return this.featureService.findAll();
  }
}
```

#### Services

```typescript
@Injectable()
export class FeatureService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async findAll(): Promise<Feature[]> {
    this.logger.log('Finding all features');
    return this.prisma.feature.findMany();
  }
}
```

#### DTOs

```typescript
export class CreateFeatureDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Feature name' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Feature description', required: false })
  description?: string;
}
```

## 🧪 Estratégia de Testes

### Testes Unitários

```typescript
describe('FeatureService', () => {
  let service: FeatureService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureService,
        {
          provide: PrismaService,
          useValue: {
            feature: {
              findMany: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FeatureService>(FeatureService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should find all features', async () => {
    const mockFeatures = [{ id: '1', name: 'Test Feature' }];
    jest.spyOn(prisma.feature, 'findMany').mockResolvedValue(mockFeatures);

    const result = await service.findAll();
    expect(result).toEqual(mockFeatures);
  });
});
```

### Testes de Integração

```typescript
describe('FeatureController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/v1/features (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/features')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
```

## 🔍 Debug e Troubleshooting

### Debug Mode

```bash
# Executar em modo debug
$ pnpm run start:debug

# Com VS Code, conectar ao inspector na porta 9229
```

### Logs

```bash
# Logs em desenvolvimento
$ pnpm run start:dev

# Logs PM2 em produção
$ pnpm run pm2:logs

# Logs específicos de um processo
$ pm2 logs assemble-api
```

### Profiling

```bash
# Executar com profiling
$ node --prof dist/main.js

# Analisar profile
$ node --prof-process isolate-*.log > profile.txt
```

## 🚀 Deploy e Produção

### Build para Produção

```bash
# Build otimizado
$ pnpm run build

# Verificar build
$ node dist/main.js
```

### Deploy com PM2

```bash
# Deploy completo
$ pnpm run deploy

# Configuração PM2 em ecosystem.config.js
module.exports = {
  apps: [{
    name: 'assemble-api',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 30000
    }
  }]
};
```

### Docker

```bash
# Build da imagem
$ docker build -t assemble-api .

# Executar container
$ docker run -p 30000:30000 assemble-api

# Com docker-compose
$ docker-compose up -d
```

## 📋 Checklist de Desenvolvimento

### Antes de Commitar

- [ ] Testes passando (`pnpm test`)
- [ ] Linting sem erros (`pnpm lint`)
- [ ] Código formatado (`pnpm format`)
- [ ] Documentação atualizada
- [ ] Variáveis de ambiente documentadas

### Antes de Deploy

- [ ] Build bem-sucedido (`pnpm build`)
- [ ] Testes e2e passando (`pnpm test:e2e`)
- [ ] Migrações executadas
- [ ] Configuração de produção validada
- [ ] Health checks funcionando

## 🔗 Links Úteis

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Jest Documentation](https://jestjs.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Para informações específicas sobre arquitetura e APIs, consulte:

- [Arquitetura do Projeto](project-architecture.html)
- [Documentação da API](api-documentation.html)
- [Testing](testing.html)
