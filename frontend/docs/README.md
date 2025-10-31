# 📚 Documentação - UTFPets Frontend

Bem-vindo à documentação do frontend do UTFPets! Esta pasta contém todos os guias e documentações técnicas do projeto.

## 📖 Índice de Documentação

### 🔔 Sistema de Notificações
- **[NOTIFICATIONS-SYSTEM.md](./NOTIFICATIONS-SYSTEM.md)** - Guia completo do sistema de notificações in-app
  - Componentes: Sino no header e página completa
  - Serviços: API integration e gerenciamento de estado
  - Funcionalidades: Marcar como lida, filtros, paginação
  - Como usar e testar

### 📱 PWA (Progressive Web App)
- **[PWA-SETUP.md](./PWA-SETUP.md)** - Configuração básica do PWA
  - Manifest configurado
  - Instruções para gerar ícones
  - Como instalar e testar
  - Requisitos (HTTPS, ícones)

### 🔔 Push Notifications
- **[PWA-PUSH-NOTIFICATIONS-COMPLETE.md](./PWA-PUSH-NOTIFICATIONS-COMPLETE.md)** - Guia definitivo e completo
  - Service Worker configurado
  - VAPID keys geradas
  - Estratégias de cache (offline mode)
  - Push notifications implementadas
  - Próximos passos no backend
  - Como testar em produção

## 🚀 Quick Start

### Para Desenvolvedores Novos:

1. **Leia primeiro**: [PWA-SETUP.md](./PWA-SETUP.md) - Entenda a configuração do PWA
2. **Depois**: [NOTIFICATIONS-SYSTEM.md](./NOTIFICATIONS-SYSTEM.md) - Sistema de notificações
3. **Por último**: [PWA-PUSH-NOTIFICATIONS-COMPLETE.md](./PWA-PUSH-NOTIFICATIONS-COMPLETE.md) - Push e offline

### Para Implementar Push Notifications:

1. Siga o guia completo em [PWA-PUSH-NOTIFICATIONS-COMPLETE.md](./PWA-PUSH-NOTIFICATIONS-COMPLETE.md)
2. Configure o backend conforme a seção "Backend - Próximos Passos"
3. Teste em build de produção com HTTPS

### Para Trabalhar com Notificações In-App:

1. Leia [NOTIFICATIONS-SYSTEM.md](./NOTIFICATIONS-SYSTEM.md)
2. Veja os exemplos de código
3. Use o `UserNotificationService` no seu componente

## 📋 Checklist de Implementação

### Frontend ✅
- [x] Sistema de notificações in-app
- [x] Service Worker configurado
- [x] PWA manifest criado
- [x] Push notifications configuradas
- [x] Cache offline implementado

### Pendente ⚠️
- [ ] Gerar ícones PWA (veja [PWA-SETUP.md](./PWA-SETUP.md#1-gerar-ícones-do-app))
- [ ] Backend: Implementar envio de push (veja [PWA-PUSH-NOTIFICATIONS-COMPLETE.md](./PWA-PUSH-NOTIFICATIONS-COMPLETE.md#-backend---próximos-passos))
- [ ] Backend: Endpoint para salvar subscriptions

## 🔧 Arquitetura

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── components/
│   │   │   │   └── notification-bell.component.ts    # Sino no header
│   │   │   ├── services/
│   │   │   │   ├── user-notification.service.ts     # API de notificações
│   │   │   │   ├── push-notification.service.ts     # Push notifications
│   │   │   │   └── notification.service.ts          # Snackbars e toasts
│   │   │   └── models/
│   │   │       └── notification.model.ts            # Interfaces
│   │   └── features/
│   │       └── notifications/
│   │           └── components/
│   │               └── notification-list.component.ts # Página completa
│   ├── environments/
│   │   └── environment.ts                           # VAPID keys
│   └── manifest.webmanifest                         # PWA manifest
├── ngsw-config.json                                 # Service Worker config
└── docs/                                            # 📚 Você está aqui!
    ├── README.md
    ├── NOTIFICATIONS-SYSTEM.md
    ├── PWA-SETUP.md
    └── PWA-PUSH-NOTIFICATIONS-COMPLETE.md
```

## 🎯 Funcionalidades Principais

### Notificações In-App
- Sino no header com badge de não lidas
- Dropdown com últimas notificações
- Página completa com paginação e filtros
- Auto-refresh a cada 30 segundos
- Marcar como lida individual ou em massa

### PWA
- App instalável como nativo
- Funciona offline
- Cache inteligente de assets e API
- Service Worker registrado automaticamente

### Push Notifications
- Notificações do sistema operacional
- Funciona mesmo com app fechado
- VAPID keys configuradas
- Integrado com Service Worker

## 🐛 Troubleshooting

### Service Worker não registra
- Verifique se está em build de produção (`npm run build:prod`)
- Service Worker só funciona em HTTPS (ou localhost)

### Push notifications não funcionam
- Verifique permissões do browser
- Confirme que VAPID keys estão corretas
- Backend precisa estar implementado

### Notificações in-app não aparecem
- Verifique se o sino está no header
- Confirme que backend está retornando notificações
- Check console para erros de API

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação específica acima
2. Verifique os comentários no código
3. Revise os exemplos de uso

## 🔄 Atualizações

**Última atualização**: 26/10/2024

**Versão**: 1.0.0

**Mudanças recentes**:
- ✅ Sistema de notificações in-app implementado
- ✅ Service Worker configurado
- ✅ Push notifications prontas (aguardando backend)
- ✅ PWA manifest criado
- ✅ Cache offline implementado

---

**Bom desenvolvimento! 🚀**
