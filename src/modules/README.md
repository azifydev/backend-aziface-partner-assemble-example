### 🔒 Estratégia de Blindagem: Ocultando Tecnologias Internas
Adotamos o princípio de segurança por encapsulamento e minimização de exposição de informações sensíveis a respeito da nossa infraestrutura e das tecnologias que utilizamos.

### 🧠 Por quê?
Se eu sou um atacante, quanto menos informações eu tenho sobre a sua stack, menor é a superfície de ataque que posso explorar.

Saber, por exemplo, que um sistema utiliza tecnologias como Node.js, Express ou MySQL já é o suficiente para direcionar buscas por vulnerabilidades conhecidas, ataques automatizados e ferramentas específicas. Isso facilita enormemente o trabalho de um invasor e reduz a eficiência das nossas defesas.

Esse mesmo princípio se aplica a nomes de serviços internos como Aziface, Watchman ou quaisquer outras integrações que usamos. Se um fraudador, parceiro externo ou mesmo um usuário mal-intencionado tiver acesso direto a nomes ou URLs internas desses serviços, ele pode:

Descobrir endpoints sensíveis;

Explorar autenticações e permissões com base em engenharia reversa;

Simular chamadas fraudulentas (falsificando payloads);

Identificar padrões de tecnologias vulneráveis.

### 🎯 O que estamos fazendo?
Estamos removendo ou mascarando qualquer referência direta a nomes internos de tecnologias, serviços ou ferramentas de terceiros nas respostas da API, documentação pública e retornos de erro. Isso inclui:

- **Evitar nomes como watchman, aziface ou similares em campos públicos**

- **Padronizar nomenclaturas genéricas como biometricProcess ao invés de nomes comerciais**

- **Garantir que erros internos não revelem detalhes da stack (versões, bibliotecas, etc)**

### 📦 Modelo de Caixa Preta
A filosofia aqui é transformar nosso sistema em uma caixa preta do ponto de vista externo:

O parceiro interage exclusivamente com o Assemble, nosso orquestrador blindado;

Todas as APIs internas permanecem isoladas e não expostas;

Apenas o que for absolutamente necessário é entregue ao parceiro, com nomenclatura controlada.

### ✅ Benefícios
Dificulta ataques direcionados por falta de informações específicas;

Reduz a dependência de blindagem múltipla (cada serviço) e foca no ponto de contato principal (Assemble);

Melhora a segurança geral do sistema sem comprometer usabilidade ou integração.

