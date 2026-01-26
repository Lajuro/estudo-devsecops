# 🔧 Troubleshooting Guide - Problemas Comuns

Este documento descreve os problemas mais comuns encontrados e suas soluções.

## 📋 Índice

- [Problemas com Artefatos](#problemas-com-artefatos)
- [Problemas com Permissões](#problemas-com-permissões)
- [Problemas com Scans](#problemas-com-scans)
- [Problemas com Pull Requests](#problemas-com-pull-requests)

## 🗂️ Problemas com Artefatos

### ❌ Erro: "The artifact name Veracode Pipeline-Scan Results is not valid"

**Sintoma:**
```
Error: Create Artifact Container failed: The artifact name Veracode Pipeline-Scan Results is not valid.
Status Code: 400
```

**Causa:**
O Veracode Pipeline Scan Action tentava criar um artefato com nome contendo hífens e espaços, que não são aceitos pela API do GitHub Actions.

**Solução:** ✅ Corrigido!

O workflow foi atualizado para usar:
```yaml
- name: 🔒 Veracode Pipeline Scan (SAST)
  uses: veracode/veracode-pipeline-scan-action@v1.0.12
  with:
    artifact_name: veracode-pipeline-scan-results  # ✅ Nome válido
```

E o artefato de upload também foi renomeado:
```yaml
- name: 📤 Upload Resultados Veracode
  uses: actions/upload-artifact@v4
  with:
    name: veracode-security-results  # ✅ Nome sem hífens no meio
```

**Arquivos gerados:**
- `results.json` - Resultados completos (gerado pelo Veracode CLI)
- `filtered_results.json` - Resultados filtrados
- `veracode-pipeline-summary.txt` - Resumo

### ⚠️ Continue-on-error esconde erros

**Sintoma:**
O step mostra erro mas o workflow marca como sucesso (✅).

**Causa:**
Steps marcados com `continue-on-error: true` não falham o workflow.

**Quando usar:**
```yaml
# ✅ Correto - permite que o workflow continue mesmo com vulnerabilidades
- name: Veracode Pipeline Scan
  continue-on-error: true  # Não queremos bloquear o pipeline

# ❌ Incorreto - problemas críticos devem falhar
- name: Checkout
  continue-on-error: true  # Checkout deve falhar se não funcionar
```

**Verificação:**
Sempre revise os artefatos gerados, mesmo que o workflow passe.

## 🔐 Problemas com Permissões

### ❌ Erro: "Resource not accessible by integration"

**Sintoma:**
```
Error: Erro ao criar Pull Request: Resource not accessible by integration
```

**Causa:**
O token `GITHUB_TOKEN` não tem permissões para criar PRs, comentários ou acessar issues.

**Solução 1:** ✅ Adicionar permissões ao workflow (Já implementado!)

```yaml
permissions:
  contents: write        # Necessário para push/merge
  pull-requests: write   # Necessário para criar/editar PRs
  issues: write          # Necessário para comentários
  actions: read          # Necessário para ler workflows
```

**Solução 2:** Configurar permissões do repositório

1. Vá em `Settings → Actions → General`
2. Em "Workflow permissions":
   - ✅ Selecione: **"Read and write permissions"**
   - ✅ Marque: **"Allow GitHub Actions to create and approve pull requests"**
3. Salve as mudanças

**Solução 3:** Usar Personal Access Token (PAT)

Se as soluções acima não funcionarem, crie um PAT:

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Selecione scopes:
   - `repo` (acesso completo)
   - `workflow` (se precisar modificar workflows)
4. Copie o token
5. Adicione como secret: `Settings → Secrets → Actions → New repository secret`
   - Nome: `GH_PAT`
   - Valor: [seu token]
6. Use no workflow:
   ```yaml
   - name: Criar Pull Request
     uses: actions/github-script@v7
     with:
       github-token: ${{ secrets.GH_PAT }}  # Em vez de secrets.GITHUB_TOKEN
   ```

### ❌ Erro: "403 Forbidden" ao fazer download de artefato

**Sintoma:**
```
Error: download-artifact failed: 403 Forbidden
```

**Causa:**
Tentando baixar artefato de outro workflow sem permissões adequadas.

**Solução:**
Certifique-se que o workflow tem permissão de leitura:
```yaml
permissions:
  actions: read  # Necessário para ler artefatos de outros workflows
```

## 🔍 Problemas com Scans

### ⚠️ Scan passa mas não encontra vulnerabilidades

**Sintoma:**
```
SCAN_STATUS: SUCCESS
Analysis Successful.
```
Mas nenhuma vulnerabilidade é reportada em código vulnerável.

**Causas possíveis:**

1. **Código não está sendo analisado:**
   - Verifique se o pacote contém o código fonte
   - Node.js precisa de arquivos `.js`, não só `node_modules`

2. **Exclusões incorretas:**
   ```bash
   # ❌ Pode excluir código importante
   zip -r app.zip . -x "*.js"
   
   # ✅ Correto
   zip -r app.zip . -x "node_modules/*" ".git/*"
   ```

3. **Severidade muito alta:**
   - Veracode pode encontrar issues de baixa severidade
   - Verifique `results.json` completo

**Verificação:**
```bash
# Verifique o conteúdo do zip
unzip -l veracode-artifacts/app.zip

# Deve conter seus arquivos .js
```

### ❌ Erro: "No scannable modules found"

**Sintoma:**
```
Found 0 Scannable modules.
Analysis Failed.
```

**Causa:**
O arquivo enviado não contém código suportado pelo Veracode.

**Linguagens suportadas pelo Pipeline Scan:**
- ✅ Java (.jar, .war, .ear)
- ✅ JavaScript/Node.js (.js)
- ✅ Python (.py)
- ✅ Go
- ✅ Android (.apk)

**Solução:**
Verifique o conteúdo do pacote:
```yaml
- name: Criar Pacote para Análise
  run: |
    cd nodejs_example
    # Liste arquivos que serão incluídos
    find . -name "*.js" | grep -v node_modules
    # Crie o pacote
    zip -r ../veracode-artifacts/app.zip . -x "node_modules/*"
```

### ⏱️ Scan demora muito

**Sintoma:**
O scan leva mais de 10-15 minutos.

**Causas:**
- Pacote muito grande (> 100MB)
- Muitas dependências incluídas

**Solução:**
```yaml
# Exclua arquivos desnecessários
zip -r app.zip . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "*.md" \
  -x "tests/*" \
  -x "*.test.js" \
  -x "coverage/*"
```

## 🔀 Problemas com Pull Requests

### ❌ PR não é criado automaticamente

**Sintoma:**
Scan passa mas PR não é criado.

**Verificações:**

1. **Branch correta?**
   ```bash
   # ✅ Deve começar com feature/
   git branch --show-current
   # feature/minha-funcionalidade
   
   # ❌ Não criará PR
   # develop
   # main
   ```

2. **Branch develop existe?**
   ```bash
   git ls-remote --heads origin develop
   
   # Se não existir:
   git checkout -b develop
   git push origin develop
   ```

3. **Permissões configuradas?**
   - Verifique seção [Problemas com Permissões](#problemas-com-permissões)

4. **PR já existe?**
   - O workflow não cria PR duplicado
   - Verifica se já existe PR aberto com mesmo head/base

### ❌ PR criado mas sem comentário

**Sintoma:**
PR é criado mas o comentário com resultados não aparece.

**Causa:**
Falha ao criar comentário (pode ser permissão).

**Solução:**
Verifique os logs do step "Criar Pull Request":
```
✅ Pull Request criado com sucesso: https://...
⚠️ Não foi possível adicionar comentário ao PR: [erro]
```

Configure permissões conforme [seção acima](#problemas-com-permissões).

## 🔐 Problemas com Credenciais

### ❌ Erro: "401 Unauthorized"

**Sintoma:**
```
Error: Veracode authentication failed: 401 Unauthorized
```

**Causas:**

1. **Secrets não configurados:**
   ```
   Settings → Secrets and variables → Actions
   ```
   Verifique se existem:
   - `VERACODE_API_ID`
   - `VERACODE_API_KEY`
   - `SRCCLR_API_TOKEN`

2. **Credenciais expiradas:**
   - Veracode API credentials não expiram automaticamente
   - Mas podem ser revogadas

3. **Formato incorreto:**
   ```
   # ✅ Correto
   VERACODE_API_ID: vera01ei-1234-5678-abcd-ef1234567890
   
   # ❌ Incorreto (com aspas ou espaços)
   VERACODE_API_ID: "vera01ei-1234..."
   VERACODE_API_ID:  vera01ei-1234...  
   ```

**Verificação:**
```bash
# Teste localmente (se tiver Veracode CLI)
export VERACODE_API_ID="seu-id"
export VERACODE_API_KEY="sua-key"

java -jar pipeline-scan.jar \
  -vid "$VERACODE_API_ID" \
  -vkey "$VERACODE_API_KEY" \
  --help
```

### ❌ SCA: "SRCCLR_API_TOKEN not set"

**Sintoma:**
```
Error: SRCCLR_API_TOKEN environment variable not set
```

**Solução:**

1. Obtenha o token:
   - https://web.analysiscenter.veracode.com/
   - Account → Integrations → Agent-Based Scan
   - Copie `SRCCLR_API_TOKEN`

2. Adicione como secret:
   ```
   Settings → Secrets → Actions → New repository secret
   Nome: SRCCLR_API_TOKEN
   Valor: [seu token]
   ```

3. Verifique no workflow:
   ```yaml
   - name: Veracode SCA Scan
     env:
       SRCCLR_API_TOKEN: ${{ secrets.SRCCLR_API_TOKEN }}  # ✅
   ```

## 📊 Analisando Resultados

### Onde encontrar os resultados?

1. **GitHub Actions UI:**
   ```
   Actions → [seu workflow] → [run específico] → Artifacts
   ```

2. **Baixar artefatos:**
   ```bash
   gh run download [run-id] -n veracode-security-results
   ```

3. **Visualizar no Veracode Platform:**
   ```
   https://web.analysiscenter.veracode.com/
   ```

### Entendendo o JSON de resultados

```json
{
  "findings": [
    {
      "title": "SQL Injection",
      "severity": 5,           // 5=Very High, 4=High, 3=Medium, 2=Low, 1=Very Low
      "issue_type": "SQL Injection",
      "files": {
        "source_file": {
          "file": "app.js",
          "line": 42
        }
      }
    }
  ]
}
```

**Priorização:**
- Severity 5 ou 4: 🔴 Corrija imediatamente
- Severity 3: 🟡 Corrija no sprint
- Severity 2 ou 1: 🔵 Backlog

## 🆘 Suporte

### Problemas não resolvidos?

1. **Verifique os logs completos:**
   ```
   Actions → [workflow] → [run] → [step falhado] → View raw logs
   ```

2. **Issues conhecidos:**
   - [Veracode Pipeline Scan Action](https://github.com/veracode/veracode-pipeline-scan-action/issues)
   - [Veracode SCA Action](https://github.com/veracode/veracode-sca/issues)

3. **Documentação oficial:**
   - [Veracode Docs](https://docs.veracode.com/)
   - [GitHub Actions Docs](https://docs.github.com/en/actions)

4. **Criar issue neste repositório:**
   - Inclua os logs completos
   - Descreva o comportamento esperado vs atual
   - Mencione o commit/branch afetado

---

**Última atualização:** 2026-01-26
**Versão do documento:** 1.1.0
