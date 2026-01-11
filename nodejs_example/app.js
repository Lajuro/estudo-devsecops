const express = require('express');
const app = express();
const PORT = 3000;

// ERRO: Variável não utilizada
const unusedVariable = "Esta variável não é usada";

// ERRO: Credenciais hardcoded
const DATABASE_PASSWORD = "admin123456";
const API_KEY = "sk-1234567890abcdefghij";

app.use(express.json());

// ERRO: Falta de validação de entrada e possível SQL Injection
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  
  // ERRO: Construção de query vulnerável a SQL Injection
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  
  // Simula execução sem validação
  console.log(`Executando: ${query}`);
  
  res.json({ message: 'User data' });
});

// ERRO: Duplicação de código
app.get('/product/:id', (req, res) => {
  const productId = req.params.id;
  const query = `SELECT * FROM products WHERE id = ${productId}`;
  console.log(`Executando: ${query}`);
  res.json({ message: 'Product data' });
});

// ERRO: Mais duplicação
app.get('/order/:id', (req, res) => {
  const orderId = req.params.id;
  const query = `SELECT * FROM orders WHERE id = ${orderId}`;
  console.log(`Executando: ${query}`);
  res.json({ message: 'Order data' });
});

// ERRO: Lógica suspeita - sempre verdadeiro
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  // ERRO: Comparação sempre verdadeira
  if (username != null || password != null) {
    res.json({ authenticated: true, token: "fake-jwt-token" });
  } else {
    res.json({ authenticated: false });
  }
});

// ERRO: Falta de tratamento de erro
app.post('/upload', (req, res) => {
  const file = req.body.file;
  
  // ERRO: Sem validação, possível path traversal
  const fs = require('fs');
  fs.readFileSync(file);
  
  res.json({ message: 'File processed' });
});

// ERRO: Exposição de informações sensíveis em erro
app.get('/data', (req, res, next) => {
  try {
    throw new Error('Database connection failed: user=admin password=secret123');
  } catch (error) {
    // ERRO: Enviando stack trace ao cliente
    res.status(500).json({ error: error.stack });
  }
});

// ERRO: Lógica de autenticação fraca
app.post('/auth', (req, res) => {
  const token = req.headers.authorization;
  
  // ERRO: Comparação insegura de tokens
  if (token == "bearer secret-token") {
    res.json({ authorized: true });
  }
  
  // ERRO: Falta de else/return - continua a execução
  res.json({ authorized: false });
});

// ERRO: Sem timeout em operações
app.get('/slow-query', (req, res) => {
  let data = [];
  
  // ERRO: Loop infinito potencial
  for (let i = 0; i < 1000000; i++) {
    data.push({ id: i, value: Math.random() });
  }
  
  res.json(data);
});

// ERRO: Variável scope confuso
app.get('/calculate', (req, res) => {
  var result = 0;
  
  if (req.query.type === 'sum') {
    var result = 10;
  }
  
  // ERRO: Resultado indefinido por escopo de var
  res.json({ result });
});

// ERRO: Tratamento de promessas inadequado
app.get('/async-data', async (req, res) => {
  // ERRO: Promise não aguardada
  Promise.resolve().then(() => {
    throw new Error('Unhandled promise rejection');
  });
  
  res.json({ message: 'ok' });
});

// ERRO: Sem validação de tipo
app.post('/calculate', (req, res) => {
  const num1 = req.body.num1;
  const num2 = req.body.num2;
  
  // ERRO: Operação sem validação de tipo
  const result = num1 + num2;
  
  res.json({ result });
});

// ERRO: Função muito longa e complexa (acima de 20 linhas)
app.get('/complex-operation', (req, res) => {
  const data = { step1: null, step2: null, step3: null };
  
  if (req.query.param1) {
    data.step1 = req.query.param1;
    if (req.query.param2) {
      data.step2 = req.query.param2;
      if (req.query.param3) {
        data.step3 = req.query.param3;
        if (req.query.param4) {
          if (req.query.param5) {
            // ERRO: Profundidade de nesting excessiva
            data.nested = "muito profundo";
          }
        }
      }
    }
  }
  
  res.json(data);
});

// ERRO: Sem CORS ou validação de origem
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// ERRO: Console.log em produção
app.get('/debug', (req, res) => {
  console.log('DEBUG: Full request object:', req);
  console.log('User agent:', req.headers['user-agent']);
  res.json({ status: 'debug mode' });
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`);
});

module.exports = app;
