# 🔒 Workflows DevSecOps com Veracode

Este repositório implementa um fluxo completo de segurança DevSecOps utilizando **Veracode** para análise de segurança estática (SAST) e composição de software (SCA).

## 📋 Visão Geral do Fluxo

O fluxo de segurança é dividido em duas fases:

### 1️⃣ Feature Branch Security Scan (`ci-pipeline.yml`)
**Quando executa:** Push em branches `feature/**`

Este workflow executa análises de segurança completas em branches de feature antes de permitir o merge para develop:

- ✅ **Veracode Pipeline Scan (SAST)** - Análise estática de código para identificar vulnerabilidades
- ✅ **Veracode SCA** - Análise de dependências de terceiros
- ✅ **Upload de Artefatos** - Resultados salvos para auditoria
- ✅ **Criação Automática de PR** - Após sucesso, cria PR para `develop`

### 2️⃣ Promote to Production (`promote-to-main.yml`)
**Quando executa:** Pull Request de `develop` → `main`

Este workflow valida que o scan de segurança foi executado e aprovado antes de permitir merge em produção:

- 🔍 **Validação de Scan Prévio** - Verifica se o scan foi executado na branch
- 📦 **Download de Artefatos** - Recupera resultados do scan anterior
- 📊 **Análise de Vulnerabilidades** - Bloqueia merge se houver issues críticas
- ✅ **Aprovação para Produção** - Confirma que o código está seguro

## 🔄 Fluxo de Trabalho Completo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Desenvolvedor trabalha em feature/nova-funcionalidade        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ git push
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. GitHub Actions: Feature Branch Security Scan                │
│    - Veracode Pipeline Scan (SAST)                             │
│    - Veracode SCA                                              │
│    - Upload de Artefatos                                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ ✅ Scan aprovado
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. GitHub Actions: Cria PR automaticamente                     │
│    feature/nova-funcionalidade → develop                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Revisão manual + merge
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Desenvolvedor cria PR: develop → main                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ PR criado
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. GitHub Actions: Promote to Production                       │
│    - Valida scan de segurança prévio                          │
│    - Baixa e analisa artefatos                                │
│    - Bloqueia se houver issues críticas                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ ✅ Validação aprovada
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. Merge para main e deploy em produção                        │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Configuração de Secrets

Você precisa configurar os seguintes secrets no GitHub:

### Veracode API Credentials
```
VERACODE_API_ID      # Veracode API ID
VERACODE_API_KEY     # Veracode API Key
SRCCLR_API_TOKEN     # Token para Veracode SCA
```

### Obter Credenciais Veracode

1. **Veracode API Credentials (Pipeline Scan)**
   - Acesse: https://web.analysiscenter.veracode.com/
   - Vá em: Account → API Credentials
   - Gere um novo API ID e Key

2. **SCA Token**
   - Acesse: https://web.analysiscenter.veracode.com/
   - Vá em: Account → Integrations → Agent-Based Scan
   - Copie o SRCCLR_API_TOKEN

### Configurar no GitHub

```bash
# Via GitHub UI
Settings → Secrets and variables → Actions → New repository secret

# Ou via GitHub CLI
gh secret set VERACODE_API_ID
gh secret set VERACODE_API_KEY
gh secret set SRCCLR_API_TOKEN
```

## 📦 Artefatos Gerados

Após cada scan, os seguintes artefatos são salvos:

| Arquivo | Descrição |
|---------|-----------|
| `veracode-pipeline-results.json` | Resultados completos do Pipeline Scan |
| `veracode-pipeline-filtered.json` | Resultados filtrados (apenas novas issues) |
| `veracode-pipeline-summary.txt` | Resumo textual do scan |
| `scaResults.json` / `scaResults.txt` | Resultados da análise SCA |
| `app.zip` | Pacote analisado |

**Retenção:** 30 dias

## 🚀 Como Usar

### Criar uma Nova Feature

```bash
# 1. Criar branch feature
git checkout -b feature/minha-funcionalidade

# 2. Desenvolver e commitar
git add .
git commit -m "feat: implementa nova funcionalidade"

# 3. Push para GitHub
git push origin feature/minha-funcionalidade
```

O workflow `Feature Branch Security Scan` será executado automaticamente.

### Após o Scan

1. **Se o scan passar:**
   - Um PR será criado automaticamente para `develop`
   - Revise o PR e os resultados do scan nos artefatos
   - Faça merge do PR

2. **Se o scan falhar:**
   - Revise os problemas nos artefatos
   - Corrija as vulnerabilidades
   - Faça novo push (o scan rodará novamente)

### Promover para Produção

```bash
# Após merge em develop, criar PR para main
git checkout develop
git pull origin develop
# Criar PR: develop → main via GitHub UI
```

O workflow `Promote to Production` validará o scan anterior antes de permitir o merge.

## 📊 Entendendo os Resultados

### Severidades do Veracode Pipeline Scan

- 🔴 **Very High (5)** - Crítico, bloqueia deploy
- 🟠 **High (4)** - Alto, bloqueia deploy
- 🟡 **Medium (3)** - Médio, revisão recomendada
- 🔵 **Low (2)** - Baixo, informativo
- ⚪ **Very Low (1)** - Muito baixo, informativo

### CVSS Score (SCA)

- **9.0-10.0** - Crítico
- **7.0-8.9** - Alto
- **4.0-6.9** - Médio
- **0.1-3.9** - Baixo

## 🛠️ Troubleshooting

### Scan Falhou - "No scan found"

**Problema:** O workflow `Promote to Production` não encontrou scan prévio.

**Solução:**
1. Verifique se o workflow `Feature Branch Security Scan` foi executado na branch
2. Confirme que o workflow foi concluído com sucesso
3. Aguarde alguns minutos para sincronização

### Erro de Autenticação Veracode

**Problema:** `401 Unauthorized` ou `403 Forbidden`

**Solução:**
1. Verifique se os secrets estão configurados corretamente
2. Confirme que as credenciais são válidas no portal Veracode
3. Verifique se o token SCA não expirou

### Artefatos Não Encontrados

**Problema:** `Artifact not found` no download

**Solução:**
1. Artefatos expiram após 30 dias
2. Re-execute o workflow de security scan
3. Verifique se o workflow anterior foi concluído com sucesso

## 📚 Referências

- [Veracode Pipeline Scan Documentation](https://docs.veracode.com/r/c_about_pipeline_scan)
- [Veracode SCA Documentation](https://docs.veracode.com/r/About_Veracode_SCA)
- [GitHub Actions Workflows](https://docs.github.com/en/actions/using-workflows)
- [Veracode Best Practices](https://docs.veracode.com/r/c_best_practices)

## 📝 Notas Importantes

1. **Branch Protection Rules**: Configure regras de proteção em `main` e `develop` para exigir que os checks passem
2. **Review Obrigatório**: Recomenda-se configurar revisão obrigatória de código mesmo com scans aprovados
3. **Baseline Files**: Considere usar baseline files para filtrar vulnerabilidades conhecidas/aceitas
4. **Policy Customization**: Você pode customizar as políticas do Veracode conforme necessário

## 🤝 Contribuindo

Ao contribuir para este projeto:

1. Sempre trabalhe em branches `feature/**`
2. Aguarde aprovação do scan de segurança
3. Revise os resultados antes de criar PR
4. Mantenha dependências atualizadas

## 📧 Suporte

Para questões sobre:
- **Workflows**: Abra uma issue neste repositório
- **Veracode**: Consulte o suporte oficial da Veracode
- **Vulnerabilidades**: Consulte a documentação do Veracode para remediação
