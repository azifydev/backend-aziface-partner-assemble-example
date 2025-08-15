# Cobertura de Código

Este documento explica como funciona a integração do relatório de cobertura de código com a documentação do Assemble.

## 📊 Visão Geral

O sistema de cobertura de código está integrado à documentação do TypeDoc, permitindo fácil acesso aos relatórios de cobertura diretamente da página principal da documentação.

### Funcionalidades

- **Integração Automática**: Coverage é automaticamente copiado para a documentação
- **Navegação Unificada**: Links diretos na documentação principal
- **Relatórios Detalhados**: Coverage completo por arquivo e função
- **Interface Moderna**: Interface HTML responsiva e interativa

## 🛠️ Como Funciona

### Geração do Coverage

O coverage é gerado usando Jest com as seguintes configurações:

```bash
# Gerar coverage básico
$ pnpm run test:cov

# Gerar coverage para CI (sem watch)
$ pnpm run test:cov:ci

# Gerar coverage e verificar thresholds
$ pnpm run test:cov:check
```

### Estrutura dos Arquivos

Após executar os testes com coverage, os seguintes arquivos são gerados:

```
coverage/
├── index.html              # Página principal do relatório
├── lcov-report/            # Relatório LCOV detalhado
│   ├── index.html
│   ├── base.css
│   └── src/                # Coverage por pasta do código
├── coverage-final.json     # Dados finais em JSON
├── coverage-summary.json   # Resumo da cobertura
├── lcov.info              # Arquivo LCOV padrão
└── clover.xml             # Formato Clover XML
```

## 🔗 Integração com TypeDoc

### Plugin Personalizado

O plugin `typedoc-documentation-plugin.js` foi modificado para:

1. **Copiar Coverage**: Automaticamente copia a pasta `coverage/` para a documentação
2. **Adicionar Links**: Inclui links para o coverage na página principal
3. **Navegação**: Adiciona links de navegação em todas as páginas de docs

### Função de Cópia

```javascript
function copyCoverageReport(outputDir) {
  const coverageDir = join(process.cwd(), 'coverage');
  const outputCoverageDir = join(outputDir, 'coverage');

  if (!existsSync(coverageDir)) {
    console.warn('⚠️ Pasta coverage não encontrada:', coverageDir);
    return;
  }

  try {
    cpSync(coverageDir, outputCoverageDir, { recursive: true });
    console.log('✅ Relatório de coverage copiado para a documentação');
  } catch (error) {
    console.error('❌ Erro ao copiar coverage:', error);
  }
}
```

## 📈 Scripts Disponíveis

### Scripts de Coverage

| Script           | Descrição                           |
| ---------------- | ----------------------------------- |
| `test:cov`       | Gera coverage com watch ativo       |
| `test:cov:ci`    | Gera coverage para CI/CD            |
| `test:cov:check` | Gera coverage e verifica thresholds |

### Scripts de Documentação

| Script               | Descrição                      |
| -------------------- | ------------------------------ |
| `docs`               | Gera documentação sem coverage |
| `docs:with-coverage` | Gera coverage + documentação   |

### Fluxo Recomendado

```bash
# 1. Gerar coverage e documentação juntos
$ pnpm run docs:with-coverage

# 2. Ou fazer separadamente
$ pnpm run test:cov
$ pnpm run docs
```

## 📊 Configuração do Jest

### jest.config.js

```javascript
module.exports = {
  // ...outras configurações
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.interface.ts',
    '!src/main.ts',
    '!src/repl.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json', 'json-summary', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Ignorar Arquivos

Para ignorar arquivos específicos do coverage:

```javascript
// No jest.config.js
collectCoverageFrom: [
  'src/**/*.ts',
  '!src/**/*.spec.ts', // Ignorar testes
  '!src/**/*.interface.ts', // Ignorar interfaces
  '!src/**/*.dto.ts', // Ignorar DTOs (opcional)
  '!src/main.ts', // Ignorar bootstrap
  '!src/repl.ts', // Ignorar REPL
  '!src/**/index.ts', // Ignorar arquivos de índice
];
```

## 🎯 Métricas de Coverage

### Tipos de Métricas

1. **Lines**: Linhas de código executadas
2. **Functions**: Funções chamadas durante os testes
3. **Branches**: Caminhos condicionais testados
4. **Statements**: Declarações executadas

### Thresholds Recomendados

```javascript
coverageThreshold: {
  global: {
    branches: 80,     // 80% dos branches cobertos
    functions: 85,    // 85% das funções cobertas
    lines: 85,        // 85% das linhas cobertas
    statements: 85    // 85% dos statements cobertos
  },
  // Thresholds específicos por pasta
  './src/core/': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
}
```

## 🔍 Interpretando os Relatórios

### Página Principal (index.html)

- **Resumo Geral**: Percentuais globais de cobertura
- **Lista de Arquivos**: Coverage por arquivo individual
- **Filtros**: Filtrar por tipo de cobertura ou pasta
- **Busca**: Buscar arquivos específicos

### Relatório Detalhado

- **Código Colorido**:
  - 🟢 Verde: Código coberto
  - 🔴 Vermelho: Código não coberto
  - 🟡 Amarelo: Parcialmente coberto (branches)

### Navegação

- **Breadcrumbs**: Navegação hierárquica por pastas
- **Links Diretos**: Clicar em qualquer arquivo para ver detalhes
- **Estatísticas**: Números exatos de linhas/funções

## 🚀 Automação e CI/CD

### GitHub Actions

```yaml
name: Tests and Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm run test:cov:ci
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Deploy da Documentação

```yaml
- name: Generate Documentation with Coverage
  run: pnpm run docs:with-coverage

- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./docs
```

## 📝 Boas Práticas

### Escrevendo Testes para Coverage

1. **Testar Casos Felizes**: Fluxos principais da aplicação
2. **Testar Edge Cases**: Casos extremos e de erro
3. **Testar Branches**: Todos os caminhos condicionais
4. **Mock Adequado**: Mockar dependências externas

### Mantendo Coverage Alto

1. **Revisar Regularmente**: Verificar coverage em cada PR
2. **Definir Thresholds**: Estabelecer metas mínimas
3. **Identificar Gaps**: Focar em áreas com baixa cobertura
4. **Refatorar**: Melhorar testabilidade do código

### Exceções Válidas

Nem todo código precisa de 100% de coverage:

- **Código de Bootstrap**: `main.ts`, configurações iniciais
- **Interfaces e Types**: Apenas definições de tipos
- **Error Handlers**: Alguns erros são difíceis de simular
- **Third-party Integrations**: Dependências externas

## 🔗 Links Relacionados

- [Testing](testing.html) - Estratégias gerais de teste
- [Desenvolvimento](development-guide.html) - Guia completo de dev
- [API Documentation](api-documentation.html) - Documentação dos endpoints

## 📞 Troubleshooting

### Coverage Não Aparece na Documentação

1. Verificar se o coverage foi gerado: `ls coverage/`
2. Executar `pnpm run docs:with-coverage` em vez de só `docs`
3. Verificar logs do plugin no terminal

### Números de Coverage Baixos

1. Verificar configuração do `collectCoverageFrom`
2. Adicionar mais testes unitários
3. Verificar se todos os casos estão sendo testados

### Erro ao Copiar Coverage

1. Verificar permissões da pasta
2. Executar testes antes da documentação
3. Verificar se a pasta `coverage/` existe

---

_Este sistema de coverage integrado permite monitoramento contínuo da qualidade dos testes e facilita a manutenção de um código bem testado._
