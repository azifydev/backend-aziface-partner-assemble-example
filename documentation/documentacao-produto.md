# 📋 Assemble - Documentação para Produto

_Tradução técnica para linguagem de produto_

---

## 🧠 **Visão Geral:**

O **Assemble** é uma plataforma Banking as a Service (BaaS) que permite que parceiros integrem rapidamente serviços bancários em suas aplicações. A plataforma oferece um sistema completo de gestão de usuários, permissões e processos de onboarding, permitindo que parceiros criem produtos financeiros sem precisar desenvolver toda a infraestrutura bancária do zero.

---

## 🎯 **Motivação:**

### **Problema que Resolve:**

- **Barreira de entrada alta** para empresas que querem oferecer serviços bancários
- **Complexidade regulatória** na criação de produtos financeiros
- **Tempo de desenvolvimento elevado** para infraestrutura bancária
- **Necessidade de expertise técnica específica** em serviços financeiros

### **Oportunidade:**

- Acelerar o **time-to-market** de produtos financeiros para parceiros
- Democratizar o acesso a **serviços bancários digitais**
- Criar um **ecossistema de parceiros** que podem focar em suas especialidades
- Reduzir **custos operacionais** de desenvolvimento e manutenção

---

## 🚀 **Impacto no Produto:**

### **Para Nossos Parceiros:**

- **⚡ Velocidade:** Redução de meses para semanas no lançamento de produtos bancários
- **🔐 Segurança:** Sistema robusto de autenticação e autorização já testado e aprovado
- **📈 Escalabilidade:** Infraestrutura que cresce conforme a demanda do parceiro
- **🎯 Foco:** Parceiros podem focar em sua experiência única ao invés de infraestrutura

### **Para Usuários Finais (Clientes dos Parceiros):**

- **✨ Experiência Fluida:** Processo de onboarding otimizado e personalizável
- **🛡️ Confiabilidade:** Operações bancárias seguras e monitoradas 24/7
- **🚀 Rapidez:** Criação de contas e processos bancários em tempo real
- **📱 Integração:** Serviços bancários nativos nas aplicações que já utilizam

### **Capacidades Técnicas Entregues:**

- **Sistema de Permissões Granular:** Controle fino sobre quem pode fazer o quê
- **Gestão Multi-Partner:** Múltiplos parceiros operando de forma isolada e segura
- **Onboarding Automatizado:** Processo de cadastro e validação de clientes
- **APIs RESTful:** Integração simples e padronizada

---

## 🏗️ **Arquitetura da Solução:**

### **Componentes Principais:**

#### **1. Gestão de Parceiros**

- Cadastro e configuração de parceiros
- Geração de chaves de API para acesso seguro
- Isolamento de dados entre parceiros

#### **2. Sistema de Usuários**

- **Usuários de Sistema:** Operadores dos parceiros
- **Usuários Bancários:** Clientes finais dos produtos bancários
- **Grupos e Permissões:** Controle granular de acesso

#### **3. Processo de Onboarding**

- Fluxo personalizável de cadastro
- Validação de documentos automatizada
- Integração com sistemas externos (Maestro, Watchman)

#### **4. Segurança e Compliance**

- Autenticação multi-camada
- Auditoria completa de ações
- Constraints e validações de negócio

---

## 📊 **Fluxos de Negócio:**

### **Fluxo de Configuração Inicial (Baseline):**

1. **Admin Interno** cria parceiro no sistema
2. **Parceiro** recebe credenciais de acesso
3. **Parceiro** configura suas permissões e recursos
4. **Parceiro** testa integração em ambiente sandbox
5. **Go-live** em produção

### **Fluxo de Onboarding de Cliente:**

1. **Cliente** inicia cadastro na aplicação do parceiro
2. **Sistema** coleta dados e documentos necessários
3. **Validação automatizada** de informações
4. **Análise de risco** e compliance
5. **Criação da conta bancária**
6. **Cliente** pode usar serviços bancários

---

## 🔄 **Fluxos Detalhados de Negócio:**

### **🚀 Fluxo de Configuração de Novo Parceiro (Baseline)**

Este é o processo completo para integrar um novo parceiro à plataforma Assemble:

#### **Etapa 1: Cadastro do Parceiro no Sistema**

- **Responsável:** Equipe interna (Wisiex)
- **Duração:** 30 minutos
- **Resultado:** Parceiro criado com credenciais de integração

**O que acontece:**

- Criação do perfil do parceiro na plataforma
- Configuração de integrações com Maestro (core bancário) e Watchman (compliance)
- Geração de identificadores únicos para isolamento de dados

#### **Etapa 2: Geração de Credenciais de Acesso**

- **Responsável:** Equipe interna (Wisiex)
- **Duração:** 5 minutos
- **Resultado:** Chave de API exclusiva do parceiro

**O que acontece:**

- Criação de chave de API segura para o parceiro
- Configuração de permissões iniciais
- Ativação do ambiente de desenvolvimento

#### **Etapa 3: Configuração do Usuário Administrativo**

- **Responsável:** Parceiro (com suporte interno)
- **Duração:** 15 minutos
- **Resultado:** Administrador do parceiro pode acessar o sistema

**O que acontece:**

- Criação do primeiro usuário administrativo do parceiro
- Configuração de grupo com permissões administrativas
- Definição de credenciais de acesso

#### **Etapa 4: Validação e Testes Iniciais**

- **Responsável:** Parceiro
- **Duração:** 1-2 horas
- **Resultado:** Integração validada e funcionando

**O que acontece:**

- Testes de autenticação e autorização
- Validação de permissões por tipo de usuário
- Verificação de isolamento de dados

### **👤 Fluxo de Onboarding de Cliente Final**

Este é o processo que cada cliente do parceiro passará para ter uma conta bancária:

#### **Estados do Processo de Onboarding:**

```
🔵 AGUARDANDO CONFIRMAÇÃO
    ↓ (Cliente envia documentos)
🟡 ONBOARDING ENVIADO
    ↓ (Sistema processa no Maestro)
🟠 ONBOARDING EM ANÁLISE
    ↓ (Maestro valida informações)
🟢 CONTA CRIADA NO MAESTRO
    ↓ (Watchman confirma compliance)
🔷 COMPLIANCE CONFIRMADO
    ↓ (Finalização do processo)
✅ CONTA ATIVA E HABILITADA
```

#### **Jornada do Cliente - Visão de Produto:**

**1. Início do Cadastro (2-5 minutos)**

- Cliente preenche dados básicos na aplicação do parceiro
- Sistema coleta informações pessoais e de contato
- Validações iniciais de formato e obrigatoriedade

**2. Envio de Documentos (3-10 minutos)**

- Upload de documentos de identificação
- Captura de selfie para validação biométrica
- Sistema analisa qualidade e legibilidade automaticamente

**3. Análise Automatizada (1-30 minutos)**

- Validação de dados com órgãos oficiais
- Verificação de compliance e análise de risco
- Checagem de listas restritivas

**4. Criação da Conta Bancária (Instantâneo)**

- Geração de número de conta único
- Configuração de produtos financeiros básicos
- Ativação de funcionalidades iniciais

**5. Liberação para Uso (Instantâneo)**

- Cliente recebe confirmação de conta criada
- Acesso liberado às funcionalidades bancárias
- Notificação de boas-vindas e orientações

### **🔐 Sistema de Permissões - Visão de Produto**

A plataforma opera com 4 níveis de segurança que garantem que cada usuário acesse apenas o que deve:

#### **Nível 1: Permissões Básicas (O que você PODE fazer)**

- **Super Administradores (Wisiex):** Acesso total à plataforma
- **Administradores de Parceiro:** Gestão completa dentro do seu parceiro
- **Clientes Finais:** Apenas suas próprias informações e operações

#### **Nível 2: Restrições de Compliance (O que você DEVE cumprir)**

- Validações automáticas baseadas em regulamentações
- Controles específicos por tipo de operação
- Auditoria completa de todas as ações

#### **Exemplo Prático - Criação de Cliente:**

**Administrador do Parceiro pode:**
✅ Criar novos clientes
✅ Ver lista de clientes do seu parceiro
✅ Editar informações de clientes
❌ Ver clientes de outros parceiros
❌ Alterar configurações da plataforma

**Cliente Final pode:**
✅ Ver suas próprias informações
✅ Atualizar dados pessoais
✅ Consultar histórico de transações
❌ Ver informações de outros clientes
❌ Realizar operações administrativas

### **📊 Tipos de Usuário e Capacidades**

#### **🔴 Super Administrador (Equipe Wisiex)**

- **Finalidade:** Gestão e manutenção da plataforma
- **Capacidades:**
  - Criar e gerenciar parceiros
  - Configurar permissões globais
  - Monitorar performance da plataforma
  - Resolver problemas técnicos

#### **🟡 Administrador de Parceiro**

- **Finalidade:** Gestão operacional do parceiro
- **Capacidades:**
  - Criar e gerenciar usuários do parceiro
  - Configurar grupos e permissões internas
  - Acompanhar métricas de onboarding
  - Gerenciar configurações de produtos

#### **🟢 Cliente Final**

- **Finalidade:** Uso dos serviços bancários
- **Capacidades:**
  - Consultar saldo e extratos
  - Realizar transferências
  - Atualizar dados pessoais
  - Acessar produtos financeiros

### **⏱️ Tempos de Processo - SLA Esperados**

| Processo                     | Tempo Médio | Tempo Máximo | Observações              |
| ---------------------------- | ----------- | ------------ | ------------------------ |
| **Configuração de Parceiro** | 1 hora      | 4 horas      | Inclui testes iniciais   |
| **Onboarding PF (Simples)**  | 5 minutos   | 30 minutos   | Documentos em ordem      |
| **Onboarding PJ (Complexo)** | 2 horas     | 24 horas     | Depende de validações    |
| **Criação de Usuário**       | Instantâneo | 1 minuto     | Após onboarding completo |
| **Ativação de Conta**        | Instantâneo | 5 minutos    | Após aprovação final     |

## ⚠️ **Riscos e Limitações:**

### **Riscos Identificados:**

- **Dependência de Integrações Externas:** Maestro e Watchman são críticos para operação
- **Complexidade Regulatória:** Mudanças em regulamentações podem impactar funcionalidades
- **Escalabilidade de Suporte:** Crescimento rápido de parceiros pode sobrecarregar suporte técnico
- **Segurança de Dados:** Alto volume de dados sensíveis requer monitoramento constante

### **Limitações Atuais:**

- **Customização de UI:** Parceiros dependem de APIs, precisam desenvolver suas próprias interfaces
- **Relatórios:** Sistema básico de relatórios, pode necessitar ferramentas externas para analytics avançados
- **Workflows Complexos:** Alguns processos bancários específicos podem precisar desenvolvimento customizado

### **Pontos de Atenção:**

- **Onboarding de Parceiros:** Processo manual que pode se tornar gargalo
- **Documentação:** Manter documentação atualizada conforme evoluções da API
- **Versionamento:** Gerenciar compatibilidade entre versões da API

---

_💡 **Dúvidas Técnicas?** Esta documentação foi traduzida de documentos técnicos. Para esclarecimentos específicos sobre implementação, consulte a equipe de desenvolvimento ou a [documentação técnica completa](../README.md)._
