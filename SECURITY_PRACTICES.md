# 🛡️ Boas Práticas de Segurança - DevSecOps

Este documento descreve as melhores práticas para trabalhar com o pipeline de segurança implementado neste projeto.

## 📋 Índice

1. [Desenvolvimento Seguro](#desenvolvimento-seguro)
2. [Gerenciamento de Vulnerabilidades](#gerenciamento-de-vulnerabilidades)
3. [Secrets e Credenciais](#secrets-e-credenciais)
4. [Revisão de Código](#revisão-de-código)
5. [Resposta a Incidentes](#resposta-a-incidentes)

## 🔒 Desenvolvimento Seguro

### Sempre Trabalhe em Feature Branches

```bash
# ✅ Correto
git checkout -b feature/nova-funcionalidade

# ❌ Incorreto - Não commite direto em main/develop
git checkout main
git commit -m "mudança direto em main"
```

### Aguarde Aprovação do Scan

- **Não force push** após falha no scan
- **Não faça merge manual** sem aprovação do scan
- **Revise os resultados** antes de criar PR

### Mantenha Dependências Atualizadas

```bash
# Verificar vulnerabilidades conhecidas
npm audit

# Atualizar dependências
npm update

# Verificar outdated
npm outdated
```

### Use Versões Específicas

```json
// ✅ Correto - versões fixas
{
  "dependencies": {
    "express": "4.18.2",
    "lodash": "4.17.21"
  }
}

// ❌ Incorreto - versões dinâmicas
{
  "dependencies": {
    "express": "^4.0.0",
    "lodash": "*"
  }
}
```

## 🔍 Gerenciamento de Vulnerabilidades

### Priorização

1. **🔴 Crítico** (CVSS 9.0-10.0)
   - Corrija **imediatamente**
   - Bloqueia deploy para produção
   - Notifique a equipe de segurança

2. **🟠 Alto** (CVSS 7.0-8.9)
   - Corrija em **24-48 horas**
   - Bloqueia deploy para produção
   - Requer aprovação de segurança

3. **🟡 Médio** (CVSS 4.0-6.9)
   - Corrija no **próximo sprint**
   - Não bloqueia deploy
   - Registre como tech debt

4. **🔵 Baixo** (CVSS 0.1-3.9)
   - Corrija quando possível
   - Não bloqueia deploy
   - Monitore evolução

### Workflow de Correção

```
1. Identificar vulnerabilidade
   ↓
2. Consultar artefatos do scan
   ↓
3. Verificar se há patch disponível
   ↓
4. Testar correção localmente
   ↓
5. Commitar e push
   ↓
6. Aguardar novo scan
   ↓
7. Validar correção
```

### Quando Aceitar Risco (False Positives)

Documente vulnerabilidades aceitas:

1. **Crie issue** explicando o motivo
2. **Use baseline file** do Veracode
3. **Revise periodicamente** (3-6 meses)
4. **Obtenha aprovação** de segurança

Exemplo de documentação:

```markdown
## Vulnerabilidade Aceita

**CVE:** CVE-2023-XXXXX
**Severidade:** Média
**Componente:** lodash@4.17.20
**Motivo:** Não utilizamos a função vulnerável
**Revisão:** 2026-07-01
**Aprovado por:** Security Team
```

## 🔐 Secrets e Credenciais

### ❌ NUNCA Faça Isso

```javascript
// ❌ NUNCA hardcode credenciais
const apiKey = "vera01ei-1234-5678-abcd-ef1234567890";
const token = "ghp_xxxxxxxxxxxxxxxxxxxx";

// ❌ NUNCA commite .env
API_KEY=minha-chave-secreta
```

### ✅ Sempre Faça Isso

```javascript
// ✅ Use variáveis de ambiente
const apiKey = process.env.VERACODE_API_ID;
const token = process.env.GITHUB_TOKEN;

// ✅ Valide existência
if (!apiKey) {
  throw new Error('VERACODE_API_ID não configurado');
}
```

### Rotação de Secrets

- **Tokens de API**: A cada 90 dias
- **Credenciais comprometidas**: Imediatamente
- **Mudança de equipe**: Quando membro sai

### Verificar Vazamento de Secrets

```bash
# Usar git-secrets ou similar
git secrets --scan

# Verificar histórico
git log -p | grep -i "password\|token\|key\|secret"

# Se encontrar vazamento:
# 1. Rotacione a credencial imediatamente
# 2. Use git filter-branch ou BFG Repo-Cleaner
# 3. Force push (com cuidado!)
```

## 👀 Revisão de Código

### Checklist de Segurança para Revisores

- [ ] Sem hardcoded credentials
- [ ] Validação de input presente
- [ ] Sanitização de output
- [ ] Tratamento de erros adequado
- [ ] Logs não expõem dados sensíveis
- [ ] Dependências atualizadas
- [ ] Scan de segurança passou

### Perguntas a Fazer

1. **Autenticação/Autorização**
   - "Quem pode executar esta função?"
   - "Os privilégios estão corretos?"

2. **Dados Sensíveis**
   - "Quais dados são sensíveis aqui?"
   - "Como estão sendo protegidos?"

3. **Input Validation**
   - "O que acontece se enviar input malicioso?"
   - "Há validação e sanitização?"

4. **Error Handling**
   - "Erros expõem informações sensíveis?"
   - "Há fallback seguro?"

### Comentários de Segurança

```javascript
// 🔒 SECURITY: Validação de input obrigatória
function processUserInput(data) {
  // Valida antes de processar
  if (!isValid(data)) {
    throw new SecurityError('Invalid input');
  }
  // ...
}

// ⚠️ SECURITY-TODO: Implementar rate limiting
app.post('/api/login', loginHandler);
```

## 🚨 Resposta a Incidentes

### Vulnerabilidade Crítica Descoberta em Produção

**Ação Imediata (0-4 horas):**

1. **Avaliar impacto**
   - Sistemas afetados?
   - Dados expostos?
   - Exploração ativa?

2. **Notificar stakeholders**
   - Equipe de segurança
   - Product owners
   - Management (se crítico)

3. **Mitigação temporária**
   - Desabilitar feature afetada
   - Aplicar WAF rules
   - Isolar sistema

**Correção (4-24 horas):**

1. Desenvolver fix em feature branch
2. Testar extensivamente
3. Executar scans de segurança
4. Deploy via hotfix (se crítico)

**Pós-incidente (1-7 dias):**

1. Documentar incidente
2. Root cause analysis
3. Implementar prevenções
4. Atualizar runbooks

### Template de Comunicação

```markdown
## Incidente de Segurança - [SEVERIDADE]

**ID:** SEC-2026-001
**Data:** 2026-01-23
**Status:** EM ANDAMENTO

### Resumo
Breve descrição do incidente.

### Impacto
- Sistemas afetados: [lista]
- Dados expostos: [descrição]
- Usuários impactados: [número/todos]

### Ações Tomadas
1. [Ação 1] - [Timestamp]
2. [Ação 2] - [Timestamp]

### Próximos Passos
1. [Ação pendente 1]
2. [Ação pendente 2]

### Contato
Security Team: security@example.com
```

## 📊 Métricas de Segurança

### KPIs Recomendados

| Métrica | Meta | Frequência |
|---------|------|------------|
| Tempo médio de correção (crítico) | < 24h | Semanal |
| Tempo médio de correção (alto) | < 1 semana | Mensal |
| Vulnerabilidades novas vs corrigidas | +0 | Mensal |
| Cobertura de scans | 100% | Contínuo |
| False positives | < 10% | Mensal |

### Relatórios

**Semanal:**
- Vulnerabilidades críticas abertas
- Status de correções em andamento
- Scan failures e motivos

**Mensal:**
- Tendência de vulnerabilidades
- Tempo médio de correção
- Top 10 vulnerabilidades
- Comparativo com mês anterior

## 🎓 Treinamento

### Para Desenvolvedores

- **OWASP Top 10**: Revisar anualmente
- **Secure Coding**: Workshop semestral
- **Veracode Platform**: Treinamento inicial
- **Incident Response**: Simulações trimestrais

### Recursos Recomendados

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Veracode Security Labs](https://www.veracode.com/security-labs)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [CWE Top 25](https://cwe.mitre.org/top25/)

## 📚 Referências

- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [SANS Top 25](https://www.sans.org/top25-software-errors/)
- [Veracode Documentation](https://docs.veracode.com/)

---

**Última atualização:** 2026-01-23
**Próxima revisão:** 2026-07-23
