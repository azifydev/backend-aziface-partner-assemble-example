# Guia Completo: Testes Unitários no NestJS

## Índice

1. Visão Geral
2. Configuração Inicial
3. Classes Utilitárias para Geração de Dados Fake
4. **NOVO: Sistema Flexível de Geração de Entidades**
5. Testando Services
6. Testando Controllers
7. Cenários Avançados
8. Boas Práticas
9. Exemplos Completos

## Visão Geral

Este guia apresenta as melhores práticas para criar testes unitários abrangentes no NestJS, cobrindo tanto services quanto controllers com o uso de classes utilitárias para geração de dados fake.

### Por que Testar Controllers e Services?

**Services (Lógica de Negócio):**

- **Isolamento**: Testamos apenas a lógica do service, sem dependências externas
- **Confiabilidade**: Garantimos que a lógica de negócio funciona conforme esperado
- **Validação de Dados**: Verificamos transformações e processamento de dados

**Controllers (Camada de Apresentação):**

- **Routing**: Verificamos se as rotas respondem corretamente
- **Validação de Input**: Testamos validação de DTOs e parâmetros
- **Integração**: Garantimos que controllers e services trabalham juntos
- **Tratamento de Erros**: Verificamos respostas HTTP adequadas

### **NOVO: Sistema Flexível de Geração de Entidades**

O sistema de geração de entidades foi refatorado para ser mais flexível e trabalhar com qualquer interface/tipo TypeScript, não apenas entidades Prisma:

#### **Classes Genéricas (Recomendado para novos projetos):**

- **`GenericFakeEntityFacade`**: Para mockar qualquer interface/tipo
- **`GenericFunctionalFakeEntityFacade`**: Abordagem funcional para qualquer tipo
- **`GenericFakeEntity<T>`**: Tipo genérico para entidades fake
- **`GenericFakeEntityConstructor<T>`**: Schema genérico

#### **Classes Prisma (Suporte legado):**

- **`FakeEntityFacade`**: Mantido para compatibilidade com código existente
- **`FunctionalFakeEntityFacade`**: Abordagem funcional para entidades Prisma
- **`FakeEntity<T>`**: Tipo específico para entidades Prisma (snake_case)
- **`FakeEntityConstructor<T>`**: Schema específico para Prisma

### Quando usar cada classe utilitária:

- **`generateFakePrismaRepository`**: Para mockar o PrismaService completo com todas as suas operações
- **`GenericFakeEntityFacade`**: **[RECOMENDADO]** Para gerar qualquer entidade fake com abordagem simples
- **`GenericFunctionalFakeEntityFacade`**: **[RECOMENDADO]** Para gerar entidades fake com abordagem funcional e composição
- **`FakeEntityFacade`**: Para compatibilidade com código legado que usa entidades Prisma
- **`FunctionalFakeEntityFacade`**: Para compatibilidade legada com abordagem funcional Prisma

## Configuração Inicial

### Imports Necessários

```typescript
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { z } from 'zod'; // Para validações
import { MockType } from 'src/common/types/mock-like-object';
import { generateMock } from 'src/common/generators/generic-mock.generator';
import { generateFakePrismaRepository } from 'src/common/generators/prisma-mock-repository.generator';
import {
  FakeEntityFacade,
  FunctionalFakeEntityFacade,
} from 'src/common/generators/entity-generator';
```

### Configuração Base do Módulo de Teste

```typescript
export async function createTestingModule(providers: any[]) {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ...providers,
      {
        provide: PrismaService,
        useValue: generateFakePrismaRepository(),
      },
    ],
  }).compile();

  return module;
}
```

### Estrutura Padrão AAA (Arrange, Act, Assert)

```typescript
describe('ComponentName', () => {
  // Setup das variáveis e mocks
  let component: ComponentName;
  let dependency: MockType<DependencyService>;

  beforeEach(async () => {
    // Arrange: Configuração do módulo de teste
  });

  it('should perform specific action', async () => {
    // Arrange: Preparação dos dados
    // Act: Execução do método
    // Assert: Verificação dos resultados
  });
});
```

## Classes Utilitárias para Geração de Dados Fake

### Usando generateFakePrismaRepository

Para mockar o PrismaService completo:

```typescript
describe('UsersService - generateFakePrismaRepository', () => {
  let service: UsersService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma = generateFakePrismaRepository();

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a user successfully', async () => {
    // Arrange
    const userData = {
      name: 'John Doe',
      external_id: 'ext123',
      partner_id: 'partner-uuid',
    };

    const expectedUser = FakeEntityFacade.quickBuild({
      id: 'uuid',
      name: 'string',
      external_id: 'string',
      created_at: 'Date',
      updated_at: 'Date',
    });

    prisma.system_users.create.mockResolvedValue(expectedUser);

    // Act
    const result = await service.createUser(userData);

    // Assert
    expect(prisma.system_users.create).toHaveBeenCalledWith({
      data: userData,
    });
    expect(result).toEqual(expectedUser);
  });
});
```

### Usando FakeEntityFacade (Abordagem Imperativa)

Para gerar entidades fake rapidamente:

```typescript
describe('FakeEntityFacade - Abordagem Imperativa', () => {
  it('should generate a simple user entity', () => {
    // Act
    const fakeUser = FakeEntityFacade.quickBuild({
      id: 'uuid',
      name: 'string',
      external_id: 'string',
      created_at: 'Date',
      updated_at: 'Date',
    });

    // Assert
    expect(fakeUser).toHaveProperty('id');
    expect(fakeUser).toHaveProperty('name');
    expect(typeof fakeUser.id).toBe('string');
    expect(typeof fakeUser.name).toBe('string');
  });

  it('should create user with fixed values and relations', () => {
    // Arrange
    const fakePermission = FakeEntityFacade.quickBuild({
      id: 'uuid',
      name: 'string',
      description: 'string',
    });

    // Act
    const fakeUser = FakeEntityFacade.createBuilder()
      .withBasicSchema({
        id: 'uuid',
        name: 'string',
        external_id: 'string',
        created_at: 'Date',
      })
      .withFixedValues({
        name: 'John Doe',
        external_id: 'fixed-external-id',
      })
      .withManyRelations('permissions', [fakePermission])
      .build();

    // Assert
    expect(fakeUser.name).toBe('John Doe');
    expect(fakeUser.external_id).toBe('fixed-external-id');
    expect(fakeUser.permissions).toEqual([fakePermission]);
  });
});
```

### Usando FunctionalFakeEntityFacade (Abordagem Funcional)

Para composição funcional e reutilização:

```typescript
import {
  FunctionalFakeEntityFacade,
  BuilderConfigFn,
} from '../common/generators/entity-generator';

describe('FunctionalFakeEntityFacade - Abordagem Funcional', () => {
  // Configurações reutilizáveis
  const withBasicUserSchema: BuilderConfigFn<any> = (builder) =>
    builder.withBasicSchema({
      id: 'uuid',
      name: 'string',
      external_id: 'string',
      created_at: 'Date',
      updated_at: 'Date',
      deleted_at: 'Date',
    });

  const withActiveUser: BuilderConfigFn<any> = (builder) =>
    builder.withFixedValues({
      deleted_at: null,
    });

  const withAdminUser: BuilderConfigFn<any> = (builder) =>
    builder.withFixedValues({
      name: 'Admin User',
      external_id: 'admin-001',
    });

  it('should create admin user with compose', () => {
    // Act
    const adminUser = FunctionalFakeEntityFacade.compose(
      withBasicUserSchema,
      withActiveUser,
      withAdminUser,
    ).build();

    // Assert
    expect(adminUser.name).toBe('Admin User');
    expect(adminUser.external_id).toBe('admin-001');
    expect(adminUser.deleted_at).toBeNull();
  });
});
```

## **NOVO: Sistema Flexível de Geração de Entidades**

### Abordagem Genérica (Recomendada)

A nova abordagem genérica permite mockar qualquer interface TypeScript sem as complexidades do sistema snake_case do Prisma:

```typescript
// Interface exemplo
interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}

// Geração simples
const user = GenericFakeEntityFacade.quickBuild<User>({
  id: 'uuid',
  name: 'string',
  email: 'string',
  isActive: 'boolean',
  createdAt: 'Date',
});

// Múltiplas entidades
const users = GenericFakeEntityFacade.quickBuildMany<User>(5, {
  id: 'uuid',
  name: 'string',
  email: 'string',
  isActive: 'boolean',
  createdAt: 'Date',
});
```

### Builder Avançado Genérico

```typescript
describe('UserService - Generic Approach', () => {
  it('should process user data correctly', () => {
    // Arrange
    const user = GenericFakeEntityFacade.createBuilder<User>()
      .withBasicSchema({
        id: 'uuid',
        name: 'string',
        email: 'string',
        isActive: 'boolean',
        createdAt: 'Date',
      })
      .withFixedValues({
        name: 'John Doe',
        email: 'john@example.com',
        isActive: true,
      })
      .withSingleRelation('profile', {
        id: 'profile-1',
        bio: 'Software Developer',
      })
      .build();

    // Act & Assert
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
    expect(user.isActive).toBe(true);
    expect(user.profile).toBeDefined();
  });
});
```

### Composição Funcional Genérica

```typescript
describe('UserService - Functional Composition', () => {
  // Configurações reutilizáveis
  const withBaseUserSchema = (builder) =>
    builder.withBasicSchema({
      id: 'uuid',
      name: 'string',
      email: 'string',
      isActive: 'boolean',
      createdAt: 'Date',
    });

  const withActiveUser = (builder) =>
    builder.withFixedValues({
      isActive: true,
    });

  const withAdminUser = (builder) =>
    builder.withFixedValues({
      name: 'Admin User',
      email: 'admin@example.com',
    });

  it('should create admin user with compose', () => {
    // Act
    const adminUser = GenericFunctionalFakeEntityFacade.compose(
      withBaseUserSchema,
      withActiveUser,
      withAdminUser,
    ).build();

    // Assert
    expect(adminUser.name).toBe('Admin User');
    expect(adminUser.email).toBe('admin@example.com');
    expect(adminUser.isActive).toBe(true);
  });

  it('should create multiple regular users', () => {
    // Act
    const regularUsers = GenericFunctionalFakeEntityFacade.compose(
      withBaseUserSchema,
      withActiveUser,
    ).buildMany(3);

    // Assert
    expect(regularUsers).toHaveLength(3);
    expect(regularUsers.every((u) => u.isActive)).toBe(true);
  });
});
```

### Factory Pattern com Sistema Genérico

```typescript
export class UserFactory {
  private static baseConfig = (builder) =>
    builder.withBasicSchema({
      id: 'uuid',
      name: 'string',
      email: 'string',
      isActive: 'boolean',
      createdAt: 'Date',
    });

  private static activeConfig = (builder) =>
    builder.withFixedValues({ isActive: true });

  static createAdmin() {
    return GenericFunctionalFakeEntityFacade.compose(
      this.baseConfig,
      this.activeConfig,
      (builder) =>
        builder.withFixedValues({
          name: 'System Administrator',
          email: 'admin@system.com',
        }),
    );
  }

  static createRegularUser() {
    return GenericFunctionalFakeEntityFacade.compose(
      this.baseConfig,
      this.activeConfig,
    );
  }
}

// Uso em testes
describe('UserFactory', () => {
  it('should create admin user', () => {
    const admin = UserFactory.createAdmin().build();

    expect(admin.name).toBe('System Administrator');
    expect(admin.email).toBe('admin@system.com');
    expect(admin.isActive).toBe(true);
  });
});
```

### Exemplo com API Response Genérico

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  meta: {
    page: number;
    totalPages: number;
  };
}

describe('API Response Testing', () => {
  it('should generate complex API response', () => {
    // Arrange
    const user = GenericFakeEntityFacade.quickBuild<User>({
      id: 'uuid',
      name: 'string',
      email: 'string',
      isActive: 'boolean',
      createdAt: 'Date',
    });

    const apiResponse = GenericFakeEntityFacade.createBuilder<
      ApiResponse<User>
    >()
      .withBasicSchema({
        status: 'number',
        message: 'string',
      })
      .withFixedValues({
        status: 200,
        message: 'Success',
      })
      .withSingleRelation('data', user)
      .withSingleRelation('meta', {
        page: 1,
        totalPages: 5,
      })
      .build();

    // Assert
    expect(apiResponse.status).toBe(200);
    expect(apiResponse.message).toBe('Success');
    expect(apiResponse.data).toEqual(user);
    expect(apiResponse.meta.page).toBe(1);
  });
});
```

## Testando Services

### Setup para Services

```typescript
describe('PartnerApiKeysService', () => {
  let service: PartnerApiKeysService;
  let prismaService: MockType<PrismaService>;
  let aesService: MockType<AesService>;

  const apiKey =
    '8cb73a1441b86f3947590a6e:ffa2919f4eec7b53e30a6f4e327ba91551fe381f82e28dcc6c2db8f59893f5a7bb97f0f3';
  const partnerId = 'f6a8e31a-8bc0-4b91-8175-6dc3019c4d78';

  beforeEach(async () => {
    // Criação dos mocks
    prismaService = generateFakePrismaRepository();
    aesService = generateMock<AesService>({
      $mockedKeys: ['decrypt', 'decryptString', 'encrypt', 'encryptAsString'],
    });

    // Configuração do módulo de teste
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnerApiKeysService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: AesService,
          useValue: aesService,
        },
      ],
    }).compile();

    service = module.get<PartnerApiKeysService>(PartnerApiKeysService);
  });
});
```

### Teste de Criação com Entidades Fake

```typescript
it('should create a partner API key with proper validation', async () => {
  // Arrange
  aesService.encryptAsString.mockReturnValueOnce(apiKey);

  const expectedUser = FakeEntityFacade.quickBuild({
    id: 'uuid',
    partner_id: 'uuid',
    api_key: 'string',
    created_at: 'Date',
    updated_at: 'Date',
  });

  prismaService.business_partner_api_key.create.mockResolvedValue(expectedUser);

  // Act
  const response = await service.create({ partnerId });

  // Assert
  expect(prismaService.business_partner_api_key.create).toHaveBeenCalledWith({
    data: {
      partner_id: partnerId,
      api_key: apiKey,
    },
  });

  expect(z.string().uuid().safeParse(response.apiKey).success).toEqual(true);
  expect(response.partnerId).toEqual(partnerId);
});
```

### Teste com Relacionamentos Complexos

```typescript
it('should return user with bank user and business partner', async () => {
  // Arrange
  const userId = 'user-uuid';

  // Criando entidades fake relacionadas com FunctionalFakeEntityFacade
  const withUserSchema = (builder) =>
    builder.withBasicSchema({
      id: 'uuid',
      name: 'string',
      external_id: 'string',
      created_at: 'Date',
    });

  const withBankUserSchema = (builder) =>
    builder.withBasicSchema({
      id: 'uuid',
      user_id: 'uuid',
      partner_id: 'uuid',
      created_at: 'Date',
    });

  const fakeBusinessPartner = FakeEntityFacade.quickBuild({
    id: 'uuid',
    name: 'string',
    external_id_maestro: 'string',
  });

  const fakeBankUser = FunctionalFakeEntityFacade.compose(
    withBankUserSchema,
    (builder) =>
      builder
        .withFixedValues({ user_id: userId })
        .withSingleRelation('business_partners', fakeBusinessPartner),
  ).build();

  const fakeUser = FunctionalFakeEntityFacade.compose(
    withUserSchema,
    (builder) =>
      builder
        .withFixedValues({ id: userId })
        .withSingleRelation('bank_users', fakeBankUser),
  ).build();

  prismaService.system_users.findUnique.mockResolvedValue(fakeUser);

  // Act
  const result = await service.getUserWithBankUser(userId);

  // Assert
  expect(result).toEqual(fakeUser);
  expect(result.bank_users.business_partners).toEqual(fakeBusinessPartner);
});
```


### Teste completo
```ts
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { z } from 'zod';

import { PartnerApiKeysService } from './partner-api-keys.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AesService } from 'src/common/modules/cryptography/aes.service';
import { generateMockPrisma } from 'src/common/generators/prisma-mock-repository.generator';
import { MockType } from 'src/common/types/mock-like-object';
import { generateMock } from 'src/common/generators/generic-mock.generator';
import { PartnerApiKeyDto } from './dto/partner-api-key.dto';

describe('PartnerApiKeysService', () => {
  const apiKey =
    '8cb73a1441b86f3947590a6e:ffa2919f4eec7b53e30a6f4e327ba91551fe381f82e28dcc6c2db8f59893f5a7bb97f0f3:055e5af246dcb4e64e4cacfa4dffc52a';
  const partnerId = 'f6a8e31a-8bc0-4b91-8175-6dc3019c4d78';

  let service: PartnerApiKeysService;
  let prismaService: MockType<PrismaService>;
  let aesService: MockType<AesService>;

  beforeEach(async () => {
    prismaService = generateMockPrisma();
    aesService = generateMock<AesService>({
      $mockedKeys: ['decrypt', 'decryptString', 'encrypt', 'encryptAsString'],
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnerApiKeysService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: AesService,
          useValue: aesService,
        },
      ],
    }).compile();

    service = module.get<PartnerApiKeysService>(PartnerApiKeysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a partner API key calling the encrypt method of AesService and save it in the database', async () => {
    aesService.encryptAsString.mockReturnValueOnce(apiKey);

    const response = await service.create({
      partnerId,
    });

    expect(prismaService.business_partner_api_key.create).toHaveBeenCalledWith({
      data: {
        partner_id: partnerId,
        api_key: apiKey,
      },
    });

    // expect the api key returned is an uuid
    expect(z.string().uuid().safeParse(response.apiKey).success).toEqual(true);

    // expect the partnerId returned is the same as the one passed
    expect(response.partnerId).toEqual(partnerId);
  });

  it('expect findAll to return all api keys as a PartnerApiKeyDto and decryptAsString method as called', async () => {
    aesService.decrypt.mockReturnValueOnce(
      '50e83b77-8cae-4f6e-8c6d-bd1436d8ff9e',
    );

    prismaService.business_partner_api_key.findMany.mockResolvedValueOnce([
      {
        partner_id: partnerId,
        api_key: apiKey,
      },
    ]);

    const response = await service.findAll();
    expect(response).toHaveLength(1);
    expect(response[0]).toEqual(
      new PartnerApiKeyDto(partnerId, '50e83b77-8cae-4f6e-8c6d-bd1436d8ff9e'),
    );
    expect(aesService.decrypt).toHaveBeenCalled();
  });

  it('expect findOne to return a PartnerApiKeyDto and decrypt the api key', async () => {
    aesService.decrypt.mockReturnValueOnce(
      '50e83b77-8cae-4f6e-8c6d-bd1436d8ff9e',
    );

    prismaService.business_partner_api_key.findUnique.mockResolvedValueOnce({
      partner_id: partnerId,
      api_key: apiKey,
    });

    const response = await service.findOne(
      '070d29eb-f105-4815-b453-cf384dfed06d',
    );
    expect(response).toEqual(
      new PartnerApiKeyDto(partnerId, '50e83b77-8cae-4f6e-8c6d-bd1436d8ff9e'),
    );
    expect(aesService.decrypt).toHaveBeenCalled();
  });

  it('expect remove to update the deleted_at field of the API key', async () => {
    const id = '070d29eb-f105-4815-b453-cf384dfed06d';
    const now = new Date();

    prismaService.business_partner_api_key.update.mockResolvedValueOnce({
      id,
      partner_id: partnerId,
      api_key: apiKey,
      deleted_at: now,
    });

    const response = await service.remove(id);
    expect(response).toEqual({ message: 'API key successfully deleted' });
    expect(prismaService.business_partner_api_key.update).toHaveBeenCalledWith({
      where: { id, deleted_at: null },
      data: { deleted_at: now },
    });
  });
});
```

## Testando Controllers

### Setup para Controllers

```typescript
describe('PartnerApiKeysController', () => {
  let controller: PartnerApiKeysController;
  let service: MockType<PartnerApiKeysService>;

  const mockCreateDto = { partnerId: 'partner-id' };
  const mockResponse = { partnerId: 'partner-id', apiKey: 'api-key' };

  beforeEach(async () => {
    service = generateMock<PartnerApiKeysService>({
      $mockedKeys: ['create', 'findAll', 'findOne', 'remove'],
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnerApiKeysController],
      providers: [
        {
          provide: PartnerApiKeysService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<PartnerApiKeysController>(PartnerApiKeysController);
  });
});
```

### Teste de Endpoint com Dados Fake

```typescript
it('should return all API keys with proper structure', async () => {
  // Arrange
  const expectedResponse = FakeEntityFacade.quickBuildMany(2, {
    partnerId: 'uuid',
    apiKey: 'string',
    created_at: 'Date',
  });

  service.findAll.mockResolvedValueOnce(expectedResponse);

  // Act
  const result = await controller.findAll();

  // Assert
  expect(service.findAll).toHaveBeenCalled();
  expect(result).toEqual(expectedResponse);
  expect(result).toHaveLength(2);
  result.forEach((item) => {
    expect(item).toHaveProperty('partnerId');
    expect(item).toHaveProperty('apiKey');
  });
});
```

### Exemplo Completo: Controller CRUD com Sistema Genérico

Este exemplo demonstra como testar um controller completo usando o sistema genérico de geração de entidades, incluindo tratamento de guards e dependências mais complexas:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingProcessController } from './onboarding-process.controller';
import { OnboardingProcessService } from './onboarding-process.service';
import { GenericFakeEntityFacade } from 'src/common/generators/entity-generator';
import { generateMock } from 'src/common/generators/generic-mock.generator';
import { CreateOnboardingProcess } from './dto/create-onboarding-process.dto';
import { CreateOnboardingProcessDto } from './dto/onboarding-process.dto';
import { UpdateCreateOnboardingProcessDto } from './dto/update-onboarding-process.dto';
import { ApiKeyGuard } from 'src/authentication/guards/api-key.guard';

// Mock do ConfigService para resolver dependência do ApiKeyGuard
class ConfigServiceMock {
  get = jest.fn();
}

describe('OnboardingProcessController', () => {
  let controller: OnboardingProcessController;
  let service: OnboardingProcessService;

  // Geração de DTOs fake usando abordagem genérica
  const createDtoSchema = {
    partnerId: 'uuid',
    userId: 'uuid',
    uuid: 'uuid',
    status: 'string',
    eventName: 'string',
  } as const;

  const responseDtoSchema = {
    id: 'uuid',
    partnerId: 'uuid',
    userId: 'uuid',
    uuid: 'uuid',
    status: 'string',
    eventName: 'string',
    createdAt: 'Date',
    updatedAt: 'Date',
    deletedAt: 'Date',
  } as const;

  // Gera entidades fake com todos os campos obrigatórios preenchidos
  const fakeCreateDto: CreateOnboardingProcess =
    GenericFakeEntityFacade.createBuilder<CreateOnboardingProcess>()
      .withBasicSchema(createDtoSchema)
      .withFixedValues({
        status: 'ACCOUNT_CREATED',
        eventName: 'BUSINESS_WAS_APPROVED',
      })
      .build() as CreateOnboardingProcess;

  const fakeResponseDto: CreateOnboardingProcessDto =
    new CreateOnboardingProcessDto(
      GenericFakeEntityFacade.createBuilder<CreateOnboardingProcessDto>()
        .withBasicSchema(responseDtoSchema)
        .withFixedValues({
          status: 'ACCOUNT_CREATED',
          eventName: 'BUSINESS_WAS_APPROVED',
          updatedAt: new Date(),
          createdAt: new Date(),
          deletedAt: null,
        })
        .build() as any,
    );

  const fakeResponseDtoArray: CreateOnboardingProcessDto[] =
    GenericFakeEntityFacade.createBuilder<CreateOnboardingProcessDto>()
      .withBasicSchema(responseDtoSchema)
      .withFixedValues({
        status: 'ACCOUNT_CREATED',
        eventName: 'BUSINESS_WAS_APPROVED',
        updatedAt: new Date(),
        createdAt: new Date(),
        deletedAt: null,
      })
      .buildMany(3)
      .map((data) => new CreateOnboardingProcessDto(data as any));

  const serviceMock = generateMock<OnboardingProcessService>({
    $mockedKeys: ['create', 'findAll', 'findOne', 'update', 'remove'],
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnboardingProcessController],
      providers: [
        {
          provide: OnboardingProcessService,
          useValue: serviceMock,
        },
        {
          provide: 'ConfigService',
          useClass: ConfigServiceMock,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<OnboardingProcessController>(
      OnboardingProcessController,
    );
    service = module.get<OnboardingProcessService>(OnboardingProcessService);
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });
  });

  describe('create', () => {
    it('should return created onboarding process and call service.create', async () => {
      // Arrange
      service.create = jest.fn().mockResolvedValue(fakeResponseDto);

      // Act
      const result = await controller.create(fakeCreateDto);

      // Assert
      expect(result).toEqual(fakeResponseDto);
      expect(service.create).toHaveBeenCalledWith(fakeCreateDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors properly', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      service.create = jest.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(controller.create(fakeCreateDto)).rejects.toThrow(error);
      expect(service.create).toHaveBeenCalledWith(fakeCreateDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of onboarding processes', async () => {
      // Arrange
      service.findAll = jest.fn().mockResolvedValue(fakeResponseDtoArray);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(fakeResponseDtoArray);
      expect(result).toHaveLength(3);
      expect(service.findAll).toHaveBeenCalled();
      expect(service.findAll).toHaveBeenCalledTimes(1);

      // Verificar estrutura dos objetos retornados
      result.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('partnerId');
        expect(item).toHaveProperty('userId');
        expect(item).toHaveProperty('status');
        expect(item).toHaveProperty('eventName');
        expect(item).toBeInstanceOf(CreateOnboardingProcessDto);
      });
    });

    it('should return empty array when no processes exist', async () => {
      // Arrange
      service.findAll = jest.fn().mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single onboarding process by id', async () => {
      // Arrange
      service.findOne = jest.fn().mockResolvedValue(fakeResponseDto);
      const id = fakeResponseDto.id!;

      // Act
      const result = await controller.findOne(id);

      // Assert
      expect(result).toEqual(fakeResponseDto);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(CreateOnboardingProcessDto);
    });

    it('should handle not found scenario', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id';
      service.findOne = jest.fn().mockResolvedValue(null);

      // Act
      const result = await controller.findOne(nonExistentId);

      // Assert
      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('update', () => {
    it('should update and return the onboarding process', async () => {
      // Arrange
      const id = fakeResponseDto.id!;
      const updateDto: UpdateCreateOnboardingProcessDto = {
        status: 'UPDATED_STATUS',
      } as any;

      const updatedResponse = new CreateOnboardingProcessDto({
        ...fakeResponseDto,
        status: 'UPDATED_STATUS',
        updatedAt: new Date(),
      } as any);

      service.update = jest.fn().mockResolvedValue(updatedResponse);

      // Act
      const result = await controller.update(id, updateDto);

      // Assert
      expect(result).toEqual(updatedResponse);
      expect(result.status).toBe('UPDATED_STATUS');
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it('should handle partial updates correctly', async () => {
      // Arrange
      const id = fakeResponseDto.id!;
      const partialUpdateDto: Partial<UpdateCreateOnboardingProcessDto> = {
        eventName: 'UPDATED_EVENT',
      };

      service.update = jest.fn().mockResolvedValue(fakeResponseDto);

      // Act
      const result = await controller.update(
        id,
        partialUpdateDto as UpdateCreateOnboardingProcessDto,
      );

      // Assert
      expect(result).toEqual(fakeResponseDto);
      expect(service.update).toHaveBeenCalledWith(id, partialUpdateDto);
    });
  });

  describe('remove', () => {
    it('should remove and return the onboarding process', async () => {
      // Arrange
      const id = fakeResponseDto.id!;
      const deletedResponse = new CreateOnboardingProcessDto({
        ...fakeResponseDto,
        deletedAt: new Date(),
      } as any);

      service.remove = jest.fn().mockResolvedValue(deletedResponse);

      // Act
      const result = await controller.remove(id);

      // Assert
      expect(result).toEqual(deletedResponse);
      expect(result.deletedAt).toBeDefined();
      expect(service.remove).toHaveBeenCalledWith(id);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it('should handle remove operation for non-existent entity', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id';
      const error = new Error('Entity not found');
      service.remove = jest.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(controller.remove(nonExistentId)).rejects.toThrow(error);
      expect(service.remove).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('Guard Integration', () => {
    it('should have ApiKeyGuard properly mocked', () => {
      // Este teste verifica se o guard foi mockado corretamente
      // Em um cenário real, você pode querer testar cenários onde o guard falha
      expect(controller).toBeDefined();
      // O guard está mockado para sempre retornar true no beforeEach
    });
  });
});
```

### Testando Controllers com Guards e Dependências Complexas

O exemplo do `OnboardingProcessController` demonstra como lidar com cenários mais complexos que envolvem guards de autenticação e dependências indiretas.

#### Configuração de Guards:

```typescript
// Mock personalizado para ConfigService (dependência do guard)
class ConfigServiceMock {
  get = jest.fn().mockImplementation((key: string) => {
    // Simular configurações específicas se necessário
    if (key === 'API_KEY_SECRET') return 'mock-secret';
    return 'mock-value';
  });
}

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [OnboardingProcessController],
    providers: [
      {
        provide: OnboardingProcessService,
        useValue: serviceMock,
      },
      {
        provide: 'ConfigService', // ⚠️ String literal se necessário
        useClass: ConfigServiceMock,
      },
    ],
  })
    .overrideGuard(ApiKeyGuard) // 🔑 Override do guard para isolamento
    .useValue({ canActivate: jest.fn().mockReturnValue(true) })
    .compile();

  controller = module.get<OnboardingProcessController>(
    OnboardingProcessController,
  );
  service = module.get<OnboardingProcessService>(OnboardingProcessService);
  jest.clearAllMocks();
});
```

#### Testando Cenários de Guard Failure:

```typescript
describe('Guard Authentication', () => {
  it('should handle guard rejection', async () => {
    // Arrange: Simular falha do guard
    const guardMock = { canActivate: jest.fn().mockReturnValue(false) };

    const moduleWithFailingGuard = await Test.createTestingModule({
      controllers: [OnboardingProcessController],
      providers: [
        /* ... providers */
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue(guardMock)
      .compile();

    const controllerWithFailingGuard = moduleWithFailingGuard.get(
      OnboardingProcessController,
    );

    // Act & Assert: Verificar que o guard impede o acesso
    expect(guardMock.canActivate).toBeDefined();
    // Em um teste de integração real, isso resultaria em 401/403
  });

  it('should pass with valid API key', async () => {
    // Arrange: Guard configurado para sucesso
    const guardMock = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    // Act: Chamar endpoint
    const result = await controller.findAll();

    // Assert: Operação deve funcionar normalmente
    expect(result).toBeDefined();
    expect(service.findAll).toHaveBeenCalled();
  });
});
```

#### Patterns para Dependências Complexas:

**1. Factory Pattern para Módulos de Teste:**

```typescript
export class TestModuleFactory {
  static async createOnboardingModule(overrides?: {
    service?: Partial<OnboardingProcessService>;
    config?: Partial<ConfigService>;
    guardBehavior?: boolean;
  }) {
    const defaultServiceMock = generateMock<OnboardingProcessService>({
      $mockedKeys: ['create', 'findAll', 'findOne', 'update', 'remove'],
    });

    return Test.createTestingModule({
      controllers: [OnboardingProcessController],
      providers: [
        {
          provide: OnboardingProcessService,
          useValue: { ...defaultServiceMock, ...overrides?.service },
        },
        {
          provide: 'ConfigService',
          useValue: overrides?.config || new ConfigServiceMock(),
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({
        canActivate: jest
          .fn()
          .mockReturnValue(overrides?.guardBehavior ?? true),
      })
      .compile();
  }
}

// Uso em testes
describe('OnboardingProcessController - Complex Scenarios', () => {
  it('should handle service timeout', async () => {
    // Arrange: Módulo com service que falha
    const module = await TestModuleFactory.createOnboardingModule({
      service: {
        findAll: jest.fn().mockRejectedValue(new Error('Timeout')),
      },
    });

    const controller = module.get(OnboardingProcessController);

    // Act & Assert
    await expect(controller.findAll()).rejects.toThrow('Timeout');
  });
});
```

**2. Configuração de Environment Variables para Testes:**

```typescript
class ConfigServiceMock {
  private config: Record<string, any> = {
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
    API_KEY_SECRET: 'test-secret-key',
    JWT_SECRET: 'test-jwt-secret',
  };

  get(key: string, defaultValue?: any) {
    return this.config[key] ?? defaultValue;
  }

  set(key: string, value: any) {
    this.config[key] = value;
  }
}
```

#### Validação de Interceptors e Middleware:

```typescript
describe('Controller Middleware Integration', () => {
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock de logger se houver interceptors de logging
    loggerSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    loggerSpy.mockRestore();
  });

  it('should log request details when interceptor is active', async () => {
    // Arrange
    service.findAll = jest.fn().mockResolvedValue([]);

    // Act
    await controller.findAll();

    // Assert: Verificar se logging interceptor funcionou
    // (Isso dependeria da implementação específica do interceptor)
    expect(service.findAll).toHaveBeenCalled();
  });
});
```

#### Troubleshooting Common Issues:

**1. Problema: "Cannot resolve dependencies"**

```typescript
// ❌ Problema: Dependência não resolvida
Error: Nest can't resolve dependencies of the ApiKeyGuard (?).
Please make sure that the argument ConfigService at index [0] is available

// ✅ Solução: Prover todas as dependências do guard
beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [OnboardingProcessController],
    providers: [
      // ... outros providers
      {
        provide: 'ConfigService', // Use string literal se necessário
        useClass: ConfigServiceMock,
      },
    ],
  })
    .overrideGuard(ApiKeyGuard)
    .useValue({ canActivate: jest.fn().mockReturnValue(true) })
    .compile();
});
```

**2. Problema: Mock não está funcionando**

```typescript
// ❌ Problema: Esqueceu de limpar mocks
beforeEach(async () => {
  // Setup do módulo...
  // ❌ Sem jest.clearAllMocks()
});

// ✅ Solução: Sempre limpar mocks
beforeEach(async () => {
  // Setup do módulo...
  jest.clearAllMocks(); // 🧹 Limpeza essencial
});
```

**3. Problema: Tipos não compatíveis**

```typescript
// ❌ Problema: DTO sem construtor adequado
const fakeDto = GenericFakeEntityFacade.quickBuild({...}) as SomeDto;

// ✅ Solução: Usar construtor do DTO
const fakeDto = new SomeDto(
  GenericFakeEntityFacade.quickBuild({...}) as any
);
```

**4. Problema: Async/Await não resolvido**

```typescript
// ❌ Problema: Forgot to mock Promise resolution
service.create.mockReturnValue(result); // Retorna valor síncrono

// ✅ Solução: Mock Promise corretamente
service.create.mockResolvedValue(result); // Retorna Promise resolvida
```

### Best Practices Checklist para Controllers:

**✅ Setup do Teste:**

- [ ] Mock de todas as dependências do controller
- [ ] Override de guards quando necessário
- [ ] Limpeza de mocks entre testes (`jest.clearAllMocks()`)
- [ ] Provider de dependências indiretas (ConfigService, etc.)

**✅ Geração de Dados:**

- [ ] Uso do `GenericFakeEntityFacade` para DTOs não-Prisma
- [ ] Schemas tipados com `as const` para inferência
- [ ] Instanciação correta de classes DTO quando necessário
- [ ] Dados realistas e consistentes entre testes

**✅ Estrutura dos Testes:**

- [ ] Agrupamento por funcionalidade (`describe` aninhados)
- [ ] Nomes descritivos que explicam o comportamento
- [ ] Padrão AAA (Arrange, Act, Assert) claro
- [ ] Testes tanto de sucesso quanto de erro

**✅ Assertions:**

- [ ] Verificação de retorno do método
- [ ] Validação de chamadas do service (`toHaveBeenCalledWith`)
- [ ] Checagem de estrutura dos objetos retornados
- [ ] Contagem de chamadas quando relevante (`toHaveBeenCalledTimes`)

**✅ Casos de Teste:**

- [ ] CRUD completo (Create, Read, Update, Delete)
- [ ] Cenários de erro (not found, validation, etc.)
- [ ] Arrays vazios e dados nulos
- [ ] Validação de tipos e instâncias de classe

**✅ Coverage:**

- [ ] Todos os endpoints públicos testados
- [ ] Cenários de sucesso e falha
- [ ] Tratamento de guards e middleware
- [ ] Validação de transformação de dados
