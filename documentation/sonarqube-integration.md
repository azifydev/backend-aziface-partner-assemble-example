# Integração SonarQube - Projeto Assemble

## Visão Geral

O SonarQube foi integrado ao projeto Assemble para fornecer análise contínua da qualidade do código, detecção de bugs, vulnerabilidades de segurança e code smells.

## Configuração Local

### 1. Iniciando o SonarQube

```bash
# Executar o script de configuração
./scripts/setup-sonar.sh

# Ou manualmente
docker-compose up -d sonar-db sonarqube
```

### 2. Configuração Inicial

1. Acesse http://localhost:9000
2. Login: `admin` / Senha: `admin`
3. Altere a senha quando solicitado
4. Vá em **Administration > Security > Users**
5. Clique em **Tokens** para o usuário admin
6. Gere um novo token com nome "assemble-local"
7. Copie o token gerado

### 3. Configuração de Ambiente

```bash
# Exporte o token como variável de ambiente
export SONAR_TOKEN=seu_token_aqui

# Ou crie um arquivo .env.local (não commitado)
echo "SONAR_TOKEN=seu_token_aqui" > .env.local
```

## Executando Análises

### Análise Local

```bash
# Análise completa com cobertura de testes
pnpm run sonar:local

# Apenas análise (sem executar testes)
pnpm run sonar
```

### Análise em CI/CD

```bash
# Para uso em pipelines
pnpm run sonar:ci
```

## Configurações

### Arquivos de Configuração

- `sonar-project.properties` - Configuração principal
- `sonar-project-ci.properties` - Configuração para CI/CD
- `jest.config.js` - Configurado para gerar relatórios de cobertura compatíveis

### Exclusões Configuradas

O projeto está configurado para excluir da análise:

- **Arquivos de teste**: `*.spec.ts`, `*.test.ts`
- **DTOs e Entidades**: `*.dto.ts`, `*.entity.ts`
- **Arquivos de configuração**: `*.module.ts`, `*.constants.ts`
- **Decorators e Guards**: `*.decorator.ts`, `*.guard.ts`
- **Strategies**: `*.strategy.ts`
- **Enums**: `*-enum.ts`
- **Arquivos específicos**: `generate-swagger.ts`, `main.ts`, `repl.ts`
- **Diretórios**: `config/`, `common/generators/`, `@types/`, etc.

## Métricas e Quality Gates

### Thresholds de Cobertura

Configurado no Jest para manter os mesmos padrões:

- **Statements**: 98%
- **Branches**: 90%
- **Functions**: 99%
- **Lines**: 98%

### Quality Gates

O SonarQube está configurado para:

- Aguardar o resultado do Quality Gate
- Falhar o pipeline se o Quality Gate não passar
- Herdar configurações de segurança do projeto pai

## Integração com CI/CD

### GitHub Actions

O arquivo `.github/workflows/sonar.yml` está configurado para:

- Executar em pushes para `main` e `develop`
- Executar em Pull Requests para essas branches
- Executar testes com cobertura
- Enviar resultados para o SonarQube
- Verificar o status do Quality Gate

### Variáveis de Ambiente Necessárias

Configure no seu CI/CD:

```bash
SONAR_TOKEN=seu_token_do_sonarqube
SONAR_HOST_URL=https://seu-sonarqube.com
```

## Relatórios e Visualização

### Localização dos Relatórios

- **Cobertura de Testes**: `coverage/lcov.info`
- **Relatório Jest**: `test-reporter.xml`
- **Relatório Clover**: `coverage/clover.xml`

### Dashboard SonarQube

Acesse http://localhost:9000 para visualizar:

- Métricas de qualidade
- Problemas encontrados
- Cobertura de testes
- Duplicação de código
- Vulnerabilidades de segurança

## Comandos Úteis

```bash
# Instalar dependências
pnpm install

# Executar testes com cobertura
pnpm run test:cov

# Análise SonarQube local
pnpm run sonar:local

# Parar serviços SonarQube
docker-compose down sonarqube sonar-db

# Ver logs do SonarQube
docker-compose logs -f sonarqube
```

## Troubleshooting

### Problemas Comuns

1. **SonarQube não inicia**: Verifique se o Docker tem memória suficiente (recomendado: 4GB+)
2. **Token inválido**: Verifique se o token foi copiado corretamente
3. **Análise falha**: Verifique se os testes passaram e se a cobertura foi gerada

### Logs e Debug

```bash
# Ver logs detalhados do SonarQube
docker-compose logs sonarqube

# Executar análise com debug
sonar-scanner -X
```

## Próximos Passos

1. Configure o SonarQube em produção
2. Integre com seu sistema de CI/CD
3. Configure notificações para Quality Gate failures
4. Personalize as regras de qualidade conforme necessário
5. Configure análise de branches e Pull Requests

## Recursos Adicionais

- [Documentação SonarQube](https://docs.sonarqube.org/)
- [SonarQube TypeScript Plugin](https://docs.sonarqube.org/latest/analysis/languages/typescript/)
- [Jest SonarQube Reporter](https://github.com/3dmind/jest-sonar-reporter)
