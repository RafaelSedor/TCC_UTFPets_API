# Configuração PWA - UTFPets

## Objetivo

Transformar a aplicação Angular em um Progressive Web App (PWA) instalável.

**Funcionalidades PWA:**
- Instalável na tela inicial (mobile e desktop)
- Modo standalone (sem barra do navegador)
- Ícones e splash screens customizados
- Manifest com metadados da aplicação

## Arquitetura Implementada

### Web App Manifest

Arquivo `manifest.webmanifest` define metadados do app:

```json
{
  "name": "UTFPets - Gerenciamento de Pets",
  "short_name": "UTFPets",
  "theme_color": "#7C3AED",
  "background_color": "#ffffff",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [...]
}
```

**Justificativa**: O manifest é o padrão W3C para definir como o app se comporta quando instalado. `display: standalone` remove a barra do navegador, dando experiência nativa.

### Theme Color Roxo (#7C3AED)

A cor primária do Tailwind é usada como `theme_color`:

**Justificativa**: Consistência visual. A barra de status (Android) e UI do navegador (desktop) usam a mesma cor do app, criando experiência coesa.

### Orientação Portrait

O manifest define `"orientation": "portrait"`:

**Justificativa**: App de gerenciamento de pets é primariamente usado no celular em modo retrato. Fixar a orientação evita comportamento inesperado ao rotacionar.

## Decisões Técnicas

### PWA Básico (sem Service Worker offline)

O projeto configura manifest mas não implementa caching offline completo:

**Justificativa**:
- **Escopo TCC**: PWA instalável já demonstra conceito moderno
- **Complexidade**: Offline-first adiciona camada significativa de complexidade
- **Backend dependência**: App requer API para funcionar, offline seria limitado

**Nota**: Service Worker foi adicionado posteriormente para push notifications, mas não para caching offline.

### Ícones PWA

Ícones precisam ser gerados em 8 tamanhos (72px a 512px):

**Justificativa**: Diferentes dispositivos requerem diferentes resoluções. Android usa 192px e 512px principalmente. iOS usa tamanhos específicos para Home Screen.

### Por que não usar @angular/pwa automático?

Ao invés de `ng add @angular/pwa`, configurou-se manualmente:

**Justificativa**:
- **Controle**: Saber exatamente o que foi adicionado
- **Aprendizado**: Para TCC, demonstrar compreensão em vez de geração automática
- **Flexibilidade**: Adicionar apenas features necessárias

### HTTPS Requirement

PWAs requerem HTTPS em produção (localhost funciona sem):

**Justificativa**: Segurança. Service Workers têm acesso a recursos sensíveis (cache, notificações). Navegadores só permitem PWA features via HTTPS.

## Meta Tags Adicionadas

```html
<meta name="theme-color" content="#7C3AED">
<link rel="manifest" href="manifest.webmanifest">
<meta name="mobile-web-app-capable" content="yes">
```

**Justificativa**:
- `theme-color`: Cor da UI do navegador
- `manifest`: Link para o manifest
- `mobile-web-app-capable`: Habilita modo fullscreen no iOS (não padrão, mas iOS requer)

## Teste de Instalação

### Desktop (Chrome/Edge)
- Ícone de instalação aparece na barra de endereços
- Ou menu > "Instalar UTFPets"

### Mobile (Android)
- Banner "Adicionar à tela inicial" aparece automaticamente
- Ou menu > "Adicionar à tela inicial"

### Mobile (iOS)
- Safari > Compartilhar > "Adicionar à Tela de Início"
- Nota: iOS não suporta PWA manifest completamente, usa meta tags

**Justificativa**: Diferentes browsers têm diferentes UIs para instalação. Testar em múltiplas plataformas garante que o manifest está correto.

## Integração com Angular

### angular.json Assets

```json
"assets": [
  "src/favicon.ico",
  "src/assets",
  "src/manifest.webmanifest"
]
```

**Justificativa**: O manifest precisa ser copiado para `dist/` durante build. Angular build system cuida disso via configuração de assets.

## Limitações do Escopo

### Não Implementado Neste PWA:

- **Offline caching completo**: App não funciona sem internet
- **Background sync**: Ações offline não sincronizam depois
- **Add to home screen prompt**: Não forçamos prompt customizado
- **Update notifications**: Não notificamos sobre novas versões

**Justificativa**: Para o TCC, PWA instalável já demonstra conceito. Features avançadas adicionariam complexidade sem agregar valor proporcional ao escopo acadêmico.

## Arquivos Criados/Modificados

### Criados
- `src/manifest.webmanifest` - Manifest do PWA
- `src/assets/icons/` - Ícones em múltiplos tamanhos

### Modificados
- `src/index.html` - Meta tags e link para manifest
- `angular.json` - Configuração de assets

## Melhorias Futuras

Para evolução além do TCC:

- **Offline caching**: `ngsw-config.json` com estratégias de cache
- **Background sync**: Sincronizar ações offline quando reconectar
- **Share Target**: Receber shares de outros apps
- **Shortcuts**: Atalhos no ícone da Home Screen
- **Install prompt customizado**: Controlar quando mostrar prompt

**Nota**: O sistema já possui Service Worker para push notifications, facilitando adicionar caching no futuro.
