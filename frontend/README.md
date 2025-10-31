# UTFPets - Frontend

Sistema de gerenciamento de pets desenvolvido com Angular 17.

## 📚 Documentação Completa

Para documentação detalhada sobre o projeto, acesse a pasta **[docs/](./docs/)**:

- **[Sistema de Notificações](./docs/NOTIFICATIONS-SYSTEM.md)** - Guia do sistema de notificações in-app
- **[PWA Setup](./docs/PWA-SETUP.md)** - Configuração do Progressive Web App
- **[Push Notifications](./docs/PWA-PUSH-NOTIFICATIONS-COMPLETE.md)** - Guia completo de push notifications

## 🚀 Execução

Ver [README principal](../README.md) para instruções completas de setup e execução.

## 🎯 Funcionalidades Principais

- ✅ **PWA** - Progressive Web App instalável
- ✅ **Offline Mode** - Funciona sem internet
- ✅ **Push Notifications** - Notificações do sistema
- ✅ **Notificações In-App** - Sistema completo de notificações
- ✅ **Service Worker** - Cache inteligente de assets e API

## 🏗️ Tecnologias

- **Angular 17** - Framework principal
- **Standalone Components** - Arquitetura moderna
- **TailwindCSS** - Estilização
- **Angular Material** - Componentes UI
- **RxJS** - Programação reativa
- **Service Worker** - PWA e offline mode

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── core/              # Serviços, guards, interceptors
│   ├── features/          # Módulos de funcionalidades
│   ├── shared/            # Componentes compartilhados
│   └── app.config.ts      # Configuração principal
├── environments/          # Ambientes (dev/prod)
├── assets/               # Imagens, ícones, etc
└── manifest.webmanifest  # PWA manifest
```

## 🛠️ Tecnologia

Este projeto utiliza [Angular CLI](https://github.com/angular/angular-cli) versão 17.3.17 com **Standalone Components**, uma arquitetura moderna que elimina a necessidade de NgModules, reduzindo boilerplate e melhorando tree-shaking.
