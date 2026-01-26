# ✅ Checklist de Verificação - Configuração do Veracode

Use este checklist para garantir que tudo está configurado corretamente.

## 📋 Pré-Requisitos

### 1. Conta Veracode
- [ ] Tenho acesso ao portal: https://web.analysiscenter.veracode.com/
- [ ] Tenho permissões para gerar credenciais de API

### 2. Repositório GitHub
- [ ] Tenho permissões de admin no repositório
- [ ] Branch `develop` existe (ou será criada)
- [ ] Branch `main` existe

## 🔐 Configuração de Secrets

### No GitHub: Settings → Secrets and variables → Actions

- [ ] **VERACODE_API_ID** configurado
  - Formato: `vera01ei-XXXX-XXXX-XXXX-XXXXXXXXXXXX`
  - Obtido em: Account → API Credentials
  
- [ ] **VERACODE_API_KEY** configurado
  - Formato: String longa (64+ caracteres)
  - Obtido em: Account → API Credentials
  
- [ ] **SRCCLR_API_TOKEN** configurado
  - Formato: String alfanumérica (32+ caracteres)
  - Obtido em: Account → Integrations → Agent-Based Scan → **CircleCI** section
  - ⚠️ **Importante:** Use o token da seção CircleCI ou GitHub Actions

### Verificação dos Secrets

```bash
# Via GitHub CLI
gh secret list

# Deve mostrar:
# SRCCLR_API_TOKEN      Updated YYYY-MM-DD
# VERACODE_API_ID       Updated YYYY-MM-DD
# VERACODE_API_KEY      Updated YYYY-MM-DD
```

## ⚙️ Configuração do Repositório

### Permissões do Workflow

Settings → Actions → General → Workflow permissions:

- [ ] **Read and write permissions** (selecionado)
- [ ] **Allow GitHub Actions to create and approve pull requests** (marcado)

### Branch Protection (Opcional mas Recomendado)

Settings → Branches → Add branch protection rule:

**Para branch `develop`:**
- [ ] Require a pull request before merging
- [ ] Require status checks to pass before merging
  - [ ] `Feature Branch Security Scan` / `security-and-quality`

**Para branch `main`:**
- [ ] Require a pull request before merging
- [ ] Require status checks to pass before merging
  - [ ] `Promote to Production` / `validate-security-scan`
- [ ] Require review from Code Owners (se aplicável)

## 🧪 Teste do Workflow

### 1. Criar Branch de Teste

```bash
git checkout -b feature/test-veracode-setup
echo "# Teste" >> test.txt
git add test.txt
git commit -m "test: verificar configuração Veracode"
git push origin feature/test-veracode-setup
```

### 2. Verificar Execução

No GitHub: **Actions → Feature Branch Security Scan**

Verifique se cada step passa:

- [ ] ✅ Análise de Contexto
- [ ] ✅ Checkout do Código
- [ ] ✅ Setup Node.js
- [ ] ✅ Instalação de Dependências
- [ ] ✅ Inspeção do Sistema
- [ ] ✅ Listar Arquivos do Projeto
- [ ] ✅ Criar Pacote para Análise
- [ ] ✅ **Veracode Pipeline Scan (SAST)**
  - Deve completar sem erro de artefato
  - `SCAN_STATUS: SUCCESS`
- [ ] ✅ Relatório Pipeline Scan
- [ ] ✅ **Veracode SCA Scan**
  - Deve completar sem erro "uncommitted changes"
  - Deve completar sem erro de artefato
- [ ] ✅ Relatório SCA
- [ ] ✅ Upload Resultados Veracode
- [ ] ✅ Criar Pull Request para Develop
  - PR deve ser criado automaticamente
- [ ] ✅ Pipeline Concluída

### 3. Verificar Artefatos

No workflow executado: **Summary → Artifacts**

- [ ] Artefato `veracode-security-results` existe
- [ ] Download do artefato funciona
- [ ] Arquivos dentro do artefato:
  - [ ] `results.json`
  - [ ] `filtered_results.json`
  - [ ] `veracode-pipeline-summary.txt`
  - [ ] `scaResults.json` ou `scaResults.txt`
  - [ ] `veracode-artifacts/app.zip`

### 4. Verificar Pull Request

- [ ] PR foi criado automaticamente para `develop`
- [ ] Título: `🚀 test-veracode-setup - Ready for Review`
- [ ] Comentário contém informações do scan
- [ ] Link para workflow funciona

## 🔍 Troubleshooting

### ❌ Se Pipeline Scan falhar

**Erro:** "The artifact name Veracode Pipeline-Scan Results is not valid"

**Verificar:**
```yaml
# Em ci-pipeline.yml, linha ~130
- name: 🔒 Veracode Pipeline Scan (SAST)
  env:
    ACTIONS_RUNTIME_TOKEN: ''  # ✅ Deve estar presente
```

**Se não estiver:**
```bash
git pull origin feature/add-veracode  # Puxe as últimas mudanças
```

### ❌ Se SCA falhar

**Erro:** "We detected that you have uncommitted changes"

**Verificar:**
```yaml
# Em ci-pipeline.yml, linha ~150
- name: 🛡️ Veracode SCA Scan
  with:
    allow-dirty: true  # ✅ Deve estar presente
```

### ❌ Se PR não for criado

**Erro:** "Resource not accessible by integration"

**Verificar:**
1. Settings → Actions → General → Workflow permissions
2. Deve estar: **Read and write permissions**
3. Deve estar marcado: **Allow GitHub Actions to create and approve pull requests**

### ❌ Se Credenciais falharem

**Erro:** "401 Unauthorized"

**Verificar:**
```bash
# Via GitHub CLI
gh secret list

# Todos os 3 secrets devem existir:
# - SRCCLR_API_TOKEN
# - VERACODE_API_ID
# - VERACODE_API_KEY

# Se algum estiver faltando:
gh secret set VERACODE_API_ID < veracode-id.txt
gh secret set VERACODE_API_KEY < veracode-key.txt
gh secret set SRCCLR_API_TOKEN < srcclr-token.txt
```

## 📊 Validação Final

### Executar Checklist Completo

- [ ] ✅ Todos os secrets configurados
- [ ] ✅ Permissões do workflow configuradas
- [ ] ✅ Branch de teste executou com sucesso
- [ ] ✅ Pipeline Scan completou sem erros
- [ ] ✅ SCA completou sem erros
- [ ] ✅ Artefatos foram gerados
- [ ] ✅ PR foi criado automaticamente
- [ ] ✅ Documentação revisada

### Se tudo passou ✅

Você está pronto para usar o pipeline! 🎉

**Próximos passos:**
1. Faça merge do PR de teste
2. Comece a desenvolver features normalmente
3. Monitore os scans regulares

### Se algo falhou ❌

1. Consulte: [TROUBLESHOOTING.md](.github/workflows/TROUBLESHOOTING.md)
2. Verifique os logs completos do workflow
3. Abra uma issue com:
   - Logs do erro
   - Prints da configuração
   - Resultado do checklist

## 📚 Documentação Adicional

- [Guia Completo dos Workflows](README.md)
- [Troubleshooting Detalhado](TROUBLESHOOTING.md)
- [Boas Práticas de Segurança](../../SECURITY_PRACTICES.md)

---

**Versão:** 1.0.0  
**Última atualização:** 2026-01-26  
**Tempo estimado:** 15-20 minutos
