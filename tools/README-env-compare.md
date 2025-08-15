# Environment Variables Comparison Tool

Esta ferramenta compara variáveis de ambiente entre `.env`, `.env.example` e `env.validation.ts`, garantindo que todas as configurações estejam sincronizadas.

## 🚀 Como usar

### Execução básica

```bash
# Via npm script
pnpm run env:compare

# Execução direta
node tools/compare-envs.js

# Modo detalhado (verbose)
node tools/compare-envs.js --verbose
node tools/compare-envs.js -v

# Ajuda
node tools/compare-envs.js --help
node tools/compare-envs.js -h
```

### Opções disponíveis

- `-v, --verbose`: Exibe comparação detalhada em formato de tabela
- `-h, --help`: Exibe informações de ajuda

## 📋 O que o script faz

### 1. Leitura de Variáveis

- **`.env`**: Lê todas as variáveis do arquivo de ambiente atual
- **`.env.example`**: Lê as variáveis do arquivo de exemplo
- **`env.validation.ts`**: Extrai variáveis do schema de validação Zod

### 2. Comparação e Validação

- Identifica variáveis ausentes no `.env.example`
- Identifica variáveis ausentes no `env.validation.ts`
- Identifica variáveis extras (definidas mas não usadas no `.env`)

### 3. Relatório Visual

- Usa cores para facilitar a identificação de problemas
- Exibe resumo com contadores
- Modo verbose mostra tabela completa de comparação

## 🔧 Estrutura dos Arquivos

### .env

Arquivo com as variáveis de ambiente atuais do projeto.

### .env.example

Arquivo de exemplo que deve conter todas as variáveis necessárias para o projeto funcionar, com valores de exemplo ou instruções.

### env.validation.ts

Schema de validação Zod que define:

- Tipos de dados esperados
- Validações (regex, min/max, etc.)
- Valores padrão
- Transformações (coerção de tipos)

## 📊 Exemplo de Saída

### Modo Normal

```
🔍 Comparando variáveis de ambiente...

✅ .env: 20 variáveis encontradas
✅ .env.example: 20 variáveis encontradas
✅ env.validation.ts: 20 variáveis encontradas

📊 Resumo:
  .env: 20 variáveis
  .env.example: 20 variáveis
  env.validation.ts: 20 variáveis

✅ Todas as variáveis do .env estão presentes em .env.example
✅ Todas as variáveis do .env estão presentes em env.validation.ts
```

### Modo Verbose

Inclui uma tabela detalhada mostrando cada variável e em quais arquivos ela está presente:

```
📋 Comparação Detalhada:

Variável                        .env .env.example validation.ts
----------------------------------------------------------------------
API_KEY                         ✅    ✅          ✅
DATABASE_URL                    ✅    ✅          ✅
JWT_SECRET                      ✅    ✅          ✅
...
```

## 🚨 Tratamento de Erros

O script sai com código de erro apropriado:

- `0`: Todas as variáveis estão sincronizadas
- `1`: Existem variáveis desincronizadas

Isso permite uso em pipelines de CI/CD para validar configurações.

## 🔄 Manutenção

Para manter o projeto sempre sincronizado:

1. Execute o script sempre que adicionar novas variáveis
2. Configure como hook de pre-commit se desejado
3. Inclua na pipeline de CI/CD para validação automática

## 📝 Melhorias no env.validation.ts

O arquivo foi atualizado para incluir:

- **Coerção automática** com `z.coerce.number()` para variáveis numéricas
- **Validações robustas** para UUIDs, URLs, portas, etc.
- **Mensagens de erro personalizadas** para melhor debugging
- **Valores padrão** para variáveis opcionais
- **Validação de regex** para chaves de criptografia

### Exemplo de validações implementadas:

```typescript
export const envSchema = z.object({
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().url(),
  DOCS_USER: z.string().uuid('DOCS_USER deve ser um UUID válido'),
  AES_KEY: z
    .string()
    .regex(
      /^[a-fA-F0-9]{64}$/,
      'AES_KEY deve ser uma string hexadecimal de 64 caracteres',
    ),
  // ... outras validações
});
```
