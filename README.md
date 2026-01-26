# Estudo de DevSecOps

[![Feature Branch Security Scan](https://github.com/your-org/estudo-devsecops/actions/workflows/ci-pipeline.yml/badge.svg)](https://github.com/your-org/estudo-devsecops/actions/workflows/ci-pipeline.yml)
[![Promote to Production](https://github.com/your-org/estudo-devsecops/actions/workflows/promote-to-main.yml/badge.svg)](https://github.com/your-org/estudo-devsecops/actions/workflows/promote-to-main.yml)

## 📋 Sobre o Projeto

Este projeto implementa um pipeline completo de **DevSecOps** utilizando **GitHub Actions** e **Veracode** para análise de segurança em aplicações Node.js.

### 🎯 Objetivos

- Implementar segurança desde o início do desenvolvimento (Shift Left Security)
- Automatizar scans de segurança em branches de feature
- Validar segurança antes de deploy em produção
- Fornecer feedback rápido sobre vulnerabilidades

### 🛡️ Ferramentas de Segurança

- **Veracode Pipeline Scan (SAST)** - Análise estática de código
- **Veracode SCA** - Análise de composição de software (dependências)

## 🚀 Quick Start

### Pré-requisitos

- Conta no Veracode Platform
- Node.js 18+
- Git

### Configuração Inicial

1. **Clone o repositório**
```bash
git clone https://github.com/your-org/estudo-devsecops.git
cd estudo-devsecops
```

2. **Configure os secrets no GitHub**
   - Vá em: `Settings → Secrets and variables → Actions`
   - Adicione os seguintes secrets:
     - `VERACODE_API_ID`
     - `VERACODE_API_KEY`
     - `SRCCLR_API_TOKEN`
   
   📖 [Ver guia detalhado de configuração](.github/workflows/README.md#-configuração-de-secrets)

3. **Crie uma branch de feature e comece a desenvolver**
```bash
git checkout -b feature/minha-funcionalidade
# Faça suas alterações
git add .
git commit -m "feat: implementa nova funcionalidade"
git push origin feature/minha-funcionalidade
```

O pipeline de segurança será executado automaticamente! 🎉

## 📊 Fluxo de Trabalho

```
feature/** → [Security Scan] → develop → [Validation] → main (production)
```

1. **Desenvolvimento em Feature Branch**
   - Código é desenvolvido em branches `feature/**`
   - Push aciona scan automático de segurança

2. **Security Scan Automático**
   - Veracode Pipeline Scan (SAST)
   - Veracode SCA
   - Geração de artefatos

3. **Pull Request Automático**
   - Se scan passar, PR é criado automaticamente para `develop`
   - Resultados anexados ao PR

4. **Validação para Produção**
   - PR de `develop` → `main` valida scan prévio
   - Bloqueia merge se houver vulnerabilidades críticas

📖 [Ver documentação completa dos workflows](.github/workflows/README.md)

## 🏗️ Estrutura do Projeto

```
estudo-devsecops/
├── .github/
│   └── workflows/
│       ├── ci-pipeline.yml          # Feature branch security scan
│       ├── promote-to-main.yml      # Production promotion validation
│       ├── README.md                # Documentação dos workflows
│       └── secrets.env.example      # Exemplo de configuração
├── nodejs_example/
│   ├── app.js                       # Aplicação Node.js de exemplo
│   └── package.json                 # Dependências
├── sonar-project.properties         # Configuração SonarQube (legacy)
└── README.md                        # Este arquivo
```

## 🔐 Segurança

### Scans Realizados

| Tipo | Ferramenta | Frequência | Bloqueia Deploy |
|------|-----------|------------|-----------------|
| SAST | Veracode Pipeline Scan | A cada push em feature/** | ❌ |
| SCA | Veracode SCA | A cada push em feature/** | ❌ |
| Validação | Análise de Artefatos | PR para main | ✅ (se crítico) |

### Severidades

- 🔴 **Crítico** - Bloqueia merge para produção
- 🟠 **Alto** - Bloqueia merge para produção
- 🟡 **Médio** - Revisão recomendada
- 🔵 **Baixo** - Informativo

## 📚 Documentação Adicional

- [Guia Completo dos Workflows](.github/workflows/README.md)
- [Configuração de Secrets](.github/workflows/secrets.env.example)
- [Veracode Documentation](https://docs.veracode.com/)

## 🛠️ Desenvolvimento

### Trabalhando em Features

```bash
# Criar nova feature
git checkout -b feature/nome-da-feature

# Desenvolver e testar localmente
npm install
npm test

# Commit e push
git add .
git commit -m "feat: descrição da mudança"
git push origin feature/nome-da-feature
```

### Verificar Resultados do Scan

1. Acesse: `Actions` tab no GitHub
2. Selecione o workflow `Feature Branch Security Scan`
3. Baixe os artefatos para análise detalhada
4. Revise vulnerabilidades encontradas

### Corrigir Vulnerabilidades

1. Consulte os artefatos do scan
2. Identifique a vulnerabilidade específica
3. Aplique correção conforme recomendação
4. Faça novo push (scan rodará novamente)

## 🤝 Contribuindo

1. Sempre trabalhe em branches `feature/**`
2. Aguarde aprovação do scan de segurança
3. Revise os resultados antes de criar PR
4. Mantenha dependências atualizadas

## 📝 Changelog

### v2.0.0 - 2026-01-23
- ✨ Implementado Veracode Pipeline Scan (SAST)
- ✨ Implementado Veracode SCA
- ✨ Criação automática de PR após scan
- ✨ Validação de segurança para produção
- 🗑️ Removido SonarQube e Snyk

### v1.0.0 - Anterior
- ✨ Pipeline inicial com SonarQube e Snyk

## 📧 Suporte

Para questões sobre:
- **Workflows**: Abra uma issue neste repositório
- **Veracode**: https://community.veracode.com/
- **Vulnerabilidades**: Consulte documentação Veracode

## 📄 Licença

Este projeto é um estudo de DevSecOps e está disponível para fins educacionais.

---

**Desenvolvido com 🔒 por Roberto Camargo**
