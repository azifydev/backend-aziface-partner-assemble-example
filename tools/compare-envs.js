const fs = require('fs');
const path = require('path');

// Cores para o terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

/**
 * Compara variáveis de ambiente entre .env, .env.example e env.validation.ts
 * Reporta variáveis ausentes em cada arquivo
 */
function compareEnvs() {
  const rootDir = path.join(__dirname, '..');
  const envPath = path.join(rootDir, '.env');
  const envExamplePath = path.join(rootDir, '.env.example');
  const envValidationPath = path.join(rootDir, 'src/config/env.validation.ts');

  console.log(colorize('🔍 Comparando variáveis de ambiente...', 'cyan'));
  console.log('');

  // Lê variáveis do .env
  const envVars = readEnvFile(envPath, '.env');

  // Lê variáveis do .env.example
  const envExampleVars = readEnvFile(envExamplePath, '.env.example');

  // Lê variáveis do env.validation.ts
  const envValidationVars = readValidationFile(envValidationPath);

  console.log(colorize('📊 Resumo:', 'blue'));
  console.log(`  ${colorize('.env:', 'white')} ${envVars.size} variáveis`);
  console.log(
    `  ${colorize('.env.example:', 'white')} ${envExampleVars.size} variáveis`,
  );
  console.log(
    `  ${colorize('env.validation.ts:', 'white')} ${envValidationVars.size} variáveis`,
  );
  console.log('');

  // Verifica variáveis ausentes
  const missingInExample = checkMissingVars(
    '.env.example',
    envVars,
    envExampleVars,
  );
  const missingInValidation = checkMissingVars(
    'env.validation.ts',
    envVars,
    envValidationVars,
  );

  // Verifica variáveis extras (definidas mas não usadas no .env)
  const extraInExample = checkExtraVars(
    '.env.example',
    envExampleVars,
    envVars,
  );
  const extraInValidation = checkExtraVars(
    'env.validation.ts',
    envValidationVars,
    envVars,
  );

  // Exibe lista completa se solicitado
  if (process.argv.includes('--verbose') || process.argv.includes('-v')) {
    showDetailedComparison(envVars, envExampleVars, envValidationVars);
  }

  // Retorna status para uso programático
  return {
    allSynced: missingInExample.size === 0 && missingInValidation.size === 0,
    missing: {
      example: missingInExample,
      validation: missingInValidation,
    },
    extra: {
      example: extraInExample,
      validation: extraInValidation,
    },
  };
}

/**
 * Lê um arquivo .env e extrai as variáveis
 */
function readEnvFile(filePath, fileName) {
  const vars = new Set();

  if (!fs.existsSync(filePath)) {
    console.log(
      colorize(`❌ Arquivo ${fileName} não encontrado: ${filePath}`, 'red'),
    );
    return vars;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      // Ignora comentários e linhas vazias
      if (trimmed && !trimmed.startsWith('#')) {
        const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=/);
        if (match) {
          vars.add(match[1]);
        }
      }
    }

    console.log(
      colorize(`✅ ${fileName}: ${vars.size} variáveis encontradas`, 'green'),
    );
  } catch (error) {
    console.log(
      colorize(`❌ Erro ao ler ${fileName}: ${error.message}`, 'red'),
    );
  }

  return vars;
}

/**
 * Lê o arquivo env.validation.ts e extrai as variáveis do schema
 */
function readValidationFile(filePath) {
  const vars = new Set();

  if (!fs.existsSync(filePath)) {
    console.log(
      colorize(
        `❌ Arquivo env.validation.ts não encontrado: ${filePath}`,
        'red',
      ),
    );
    return vars;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Procura por propriedades dentro do z.object()
    const objectMatch = content.match(/z\.object\s*\(\s*\{([\s\S]*?)\}\s*\)/);
    if (objectMatch) {
      const objectContent = objectMatch[1];
      const propertyRegex = /([A-Z_][A-Z0-9_]*)\s*:/g;
      let match;

      while ((match = propertyRegex.exec(objectContent)) !== null) {
        vars.add(match[1]);
      }
    }

    console.log(
      colorize(
        `✅ env.validation.ts: ${vars.size} variáveis encontradas`,
        'green',
      ),
    );
  } catch (error) {
    console.log(
      colorize(`❌ Erro ao ler env.validation.ts: ${error.message}`, 'red'),
    );
  }

  return vars;
}

/**
 * Verifica variáveis ausentes em um arquivo de destino
 */
function checkMissingVars(targetFile, sourceVars, targetVars) {
  const missing = new Set([...sourceVars].filter((x) => !targetVars.has(x)));

  if (missing.size > 0) {
    console.log(colorize(`🔴 Variáveis ausentes em ${targetFile}:`, 'red'));
    for (const varName of Array.from(missing).sort()) {
      console.log(`  ${colorize('-', 'red')} ${colorize(varName, 'yellow')}`);
    }
    console.log('');
  } else {
    console.log(
      colorize(
        `✅ Todas as variáveis do .env estão presentes em ${targetFile}`,
        'green',
      ),
    );
    console.log('');
  }

  return missing;
}

/**
 * Verifica variáveis extras (definidas mas não presentes no .env)
 */
function checkExtraVars(sourceFile, sourceVars, envVars) {
  const extra = new Set([...sourceVars].filter((x) => !envVars.has(x)));

  if (extra.size > 0) {
    console.log(
      colorize(
        `🟡 Variáveis em ${sourceFile} que não estão no .env:`,
        'yellow',
      ),
    );
    for (const varName of Array.from(extra).sort()) {
      console.log(`  ${colorize('-', 'yellow')} ${colorize(varName, 'white')}`);
    }
    console.log('');
  }

  return extra;
}

/**
 * Exibe comparação detalhada de todas as variáveis
 */
function showDetailedComparison(envVars, envExampleVars, envValidationVars) {
  console.log(colorize('📋 Comparação Detalhada:', 'magenta'));
  console.log('');

  const allVars = new Set([
    ...envVars,
    ...envExampleVars,
    ...envValidationVars,
  ]);
  const sortedVars = Array.from(allVars).sort();

  console.log(
    `${colorize('Variável', 'white').padEnd(40)} ${colorize('.env', 'green')} ${colorize('.env.example', 'blue')} ${colorize('validation.ts', 'magenta')}`,
  );
  console.log('-'.repeat(70));

  for (const varName of sortedVars) {
    const inEnv = envVars.has(varName) ? '✅' : '❌';
    const inExample = envExampleVars.has(varName) ? '✅' : '❌';
    const inValidation = envValidationVars.has(varName) ? '✅' : '❌';

    console.log(
      `${varName.padEnd(35)} ${inEnv}    ${inExample}          ${inValidation}`,
    );
  }
  console.log('');
}

// Executa o script se chamado diretamente
if (require.main === module) {
  const result = compareEnvs();

  // Exibe ajuda se solicitado
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(colorize('📖 Uso:', 'cyan'));
    console.log('  node tools/compare-envs.js [opções]');
    console.log('');
    console.log(colorize('Opções:', 'white'));
    console.log('  -v, --verbose    Exibe comparação detalhada');
    console.log('  -h, --help       Exibe esta ajuda');
    console.log('');
  }

  // Exit com código apropriado
  process.exit(result.allSynced ? 0 : 1);
}

module.exports = { compareEnvs };
