# Testes E2E - UTFPets

Testes End-to-End automatizados usando **Selenium WebDriver**, **Mocha** e **TypeScript**.

## 📋 Estrutura

```
e2e/
├── config/
│   └── webdriver.ts       # Configuração do Selenium WebDriver
├── pages/
│   ├── BasePage.ts        # Page Object base (métodos compartilhados)
│   ├── LoginPage.ts       # Page Object da página de login
│   └── PetListPage.ts     # Page Object da lista de pets
├── specs/
│   ├── auth.spec.ts       # Testes de autenticação
│   └── pets.spec.ts       # Testes de gerenciamento de pets
├── screenshots/           # Screenshots automáticos (gerados)
├── utils/                 # Utilitários
├── .env.example           # Variáveis de ambiente exemplo
├── package.json           # Dependências
├── tsconfig.json          # Config TypeScript
└── README.md             # Este arquivo
```

## 🚀 Como Executar

### 1. Instalar Dependências

```bash
cd tests/e2e
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas configurações:
```env
BASE_URL=http://localhost:4201
TEST_USER_EMAIL=teste@utfpets.com
TEST_USER_PASSWORD=Test@12345
```

### 3. Garantir que Frontend está Rodando

```bash
# Em outro terminal, na raiz do monorepo
cd frontend
npm start
```

Ou use a porta configurada (ex: 4201):
```bash
npx ng serve --port 4201
```

### 4. Executar Testes

**Todos os testes:**
```bash
npm test
```

**Teste específico:**
```bash
npm run test:single specs/auth.spec.ts
```

**Modo watch (re-executa ao salvar):**
```bash
npm run test:watch
```

## 📸 Screenshots

Screenshots são salvos automaticamente em caso de erro ou em pontos específicos dos testes.

Localização: `tests/e2e/screenshots/`

## 🧪 Testes Implementados

### ✅ Authentication Tests (auth.spec.ts)

| Teste | Descrição |
|-------|-----------|
| **Login Page Load** | Verifica se a página de login carrega corretamente |
| **Button Disabled** | Botão de login deve estar desabilitado com campos vazios |
| **Invalid Credentials** | Deve mostrar erro com credenciais inválidas |
| **Successful Login** | Deve redirecionar para /pets após login bem-sucedido |
| **Protected Routes** | Deve redirecionar para login ao acessar rota protegida |
| **Logout** | Deve fazer logout e voltar para login |

### ✅ Pet Management Tests (pets.spec.ts)

| Teste | Descrição |
|-------|-----------|
| **Page Load** | Verifica se a página de pets carrega |
| **Empty State** | Exibe mensagem quando não há pets |
| **Pet List** | Exibe lista de pets quando existem |
| **Add Button** | Botão de adicionar pet está visível |
| **Card Interactions** | Botões de ação no card funcionam |
| **Navigation** | Permanece na página após interações |

## 🔧 Page Object Pattern

Os testes usam o **Page Object Pattern** para melhor manutenibilidade:

```typescript
// Exemplo de uso
const loginPage = new LoginPage(driver);
await loginPage.open();
await loginPage.login('email@teste.com', 'senha');
```

**Vantagens:**
- ✅ Código reutilizável
- ✅ Fácil manutenção
- ✅ Testes mais legíveis
- ✅ Mudanças no UI afetam apenas Page Objects

## 🐳 Executar com Docker

Para rodar os testes em ambiente containerizado:

```bash
# Da raiz do monorepo
docker-compose -f docker-compose.e2e.yml up --abort-on-container-exit
```

## ⚙️ Configuração do WebDriver

O WebDriver está configurado para rodar em **headless mode** por padrão (sem interface gráfica).

Para ver o navegador durante os testes, edite `config/webdriver.ts`:

```typescript
// Comente estas linhas:
// chromeOptions.addArguments('--headless=new');
```

## 🔍 Debugging

### Ver logs detalhados

```bash
DEBUG=selenium* npm test
```

### Desabilitar headless

Edite `config/webdriver.ts` e comente:
```typescript
// chromeOptions.addArguments('--headless=new');
```

### Pausar execução

Adicione nos testes:
```typescript
await driver.sleep(5000); // Pausa 5 segundos
```

## 📦 Dependências

- **selenium-webdriver**: ^4.16.0 - Driver do Selenium
- **chromedriver**: ^120.0.1 - Driver do Chrome
- **mocha**: ^10.2.0 - Framework de testes
- **@types/mocha**: ^10.0.6 - Tipos TypeScript
- **ts-node**: ^10.9.2 - Executar TypeScript
- **typescript**: ^5.3.3 - Compilador TypeScript

## 🎯 Próximos Passos

### Must Have (Pendente)
- [ ] Testes de criação de pet
- [ ] Testes de edição de pet
- [ ] Testes de exclusão de pet
- [ ] Testes de refeições
- [ ] Testes de lembretes
- [ ] Testes de compartilhamento

### Should Have (Futuro)
- [ ] Testes de notificações
- [ ] Testes de histórico de peso
- [ ] Testes de exportação de calendário
- [ ] Testes de performance
- [ ] Testes de acessibilidade

## ❗ Notas Importantes

1. **Usuário de Teste**: Crie um usuário específico para testes no backend com email `teste@utfpets.com`

2. **Dados Limpos**: Os testes assumem um estado específico do banco. Considere usar migrations/seeds para dados de teste.

3. **Timeout**: Testes E2E têm timeout de 60 segundos por padrão.

4. **Screenshots**: São salvos automaticamente para debug.

## 🐛 Troubleshooting

**Erro: ChromeDriver não encontrado**
```bash
npm install chromedriver --save-dev
```

**Erro: Frontend não está rodando**
```bash
# Certifique-se que o frontend está na porta correta
cd ../../frontend
npm start
```

**Erro: Usuário de teste não existe**
- Crie o usuário no backend ou ajuste credenciais no `.env`

**Testes falhando aleatoriamente**
- Aumente os timeouts em `config/webdriver.ts`
- Verifique a estabilidade da rede/API

---

**Documentação do Selenium**: https://www.selenium.dev/documentation/
**Documentação do Mocha**: https://mochajs.org/
