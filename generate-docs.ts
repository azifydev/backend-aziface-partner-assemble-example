import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

/**
 * Script para gerar documentação TypeDoc com integração Swagger
 */
function generateDocs() {
  console.log('📚 Iniciando geração da documentação...');

  try {
    // 1. Criar diretórios necessários
    const docsDir = join(process.cwd(), 'docs');
    const swaggerDir = join(docsDir, 'swagger');

    if (!existsSync(docsDir)) {
      mkdirSync(docsDir, { recursive: true });
    }

    if (!existsSync(swaggerDir)) {
      mkdirSync(swaggerDir, { recursive: true });
    }

    // 2. Gerar documentação TypeDoc
    console.log('🔧 Gerando documentação TypeDoc...');
    execSync('npx typedoc ', { stdio: 'inherit' });

    // 3. Definir caminhos
    const indexPath = join(process.cwd(), 'docs', 'index.html');
    const swaggerJsonPath = join(swaggerDir, 'swagger.json');

    const path = join(process.cwd(), 'swagger', 'docs', 'swagger.json');
    // 4. Gerar arquivo swagger.json (exemplo básico),
    const swaggerSpec = readFileSync(path, 'utf-8');

    writeFileSync(swaggerJsonPath, swaggerSpec);
    console.log('✅ Arquivo swagger.json gerado');

    // 5. Gerar página HTML com Swagger UI
    const swaggerHtmlPath = join(swaggerDir, 'index.html');
    const swaggerUIHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assemble API - Swagger UI</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: './swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`;

    writeFileSync(swaggerHtmlPath, swaggerUIHtml);
    console.log('✅ Página Swagger UI gerada');

    // 6. Gerar página Redoc (alternativa)
    const redocHtmlPath = join(swaggerDir, 'redoc.html');
    const redocHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Assemble API - Redoc</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <redoc spec-url='./swagger.json'></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@2.0.0/bundles/redoc.standalone.js"></script>
</body>
</html>`;

    writeFileSync(redocHtmlPath, redocHtml);
    console.log('✅ Página Redoc gerada');

    // 7. Atualizar o link no index.html principal
    if (existsSync(indexPath)) {
      let indexContent = readFileSync(indexPath, 'utf-8');

      const swaggerLink = `
        <div class="swagger-integration" style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #007bff;">
          <h3>📋 API Documentation</h3>
          <p>Além da documentação do código, você pode acessar:</p>
          <ul style="list-style-type: none; padding-left: 0;">
            <li style="margin: 8px 0;"><a href="swagger/index.html" target="_blank" style="text-decoration: none; color: #007bff;">🌐 Swagger UI</a> - Interface interativa da API</li>
            <li style="margin: 8px 0;"><a href="swagger/redoc.html" target="_blank" style="text-decoration: none; color: #007bff;">📚 Redoc</a> - Documentação alternativa</li>
            <li style="margin: 8px 0;"><a href="swagger/swagger.json" target="_blank" style="text-decoration: none; color: #007bff;">📄 Swagger JSON</a> - Especificação OpenAPI</li>
            <li style="margin: 8px 0;"><a href="../api-docs" target="_blank" style="text-decoration: none; color: #007bff;">🔗 API Docs</a> - (quando o servidor estiver rodando)</li>
          </ul>
        </div>
      `;

      // Inserir após o primeiro h1 ou h2
      if (indexContent.includes('<h1')) {
        indexContent = indexContent.replace(
          /(<h1[^>]*>.*?<\/h1>)/,
          `$1${swaggerLink}`,
        );
      } else if (indexContent.includes('<h2')) {
        indexContent = indexContent.replace(
          /(<h2[^>]*>.*?<\/h2>)/,
          `$1${swaggerLink}`,
        );
      } else {
        // Se não encontrar h1 ou h2, inserir após o body
        indexContent = indexContent.replace(
          /(<body[^>]*>)/,
          `$1${swaggerLink}`,
        );
      }

      writeFileSync(indexPath, indexContent);
      console.log('✅ Links da documentação API adicionados ao index.html');
    }

    console.log('🎉 Documentação gerada com sucesso!');
    console.log('📂 Arquivos gerados:');
    console.log('   - docs/index.html (TypeDoc principal)');
    console.log('   - docs/swagger/index.html (Swagger UI)');
    console.log('   - docs/swagger/redoc.html (Redoc)');
    console.log('   - docs/swagger/swagger.json (Especificação OpenAPI)');
  } catch (error) {
    console.error('❌ Erro ao gerar documentação:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  generateDocs();
}

export { generateDocs };
