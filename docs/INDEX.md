# 📚 Documentação UTFPets API

Bem-vindo à documentação completa da UTFPets API!

## 📖 Índice de Documentação

### 🚀 Setup e Configuração
- **[Database Setup](DATABASE_SETUP.md)** - Guia completo de configuração de banco de dados (teste + produção)

### 🎯 Módulos Implementados

#### **Módulo 1 - Compartilhamento de Pets**
📄 **[MODULO_1_COMPARTILHAMENTO.md](MODULO_1_COMPARTILHAMENTO.md)**

Sistema colaborativo de compartilhamento de pets com papéis de acesso.

**Recursos:**
- 👥 Sistema de convites (pending → accepted)
- 🔐 3 papéis: owner, editor, viewer
- ✅ Permissões granulares por papel
- 🔔 Eventos para notificações futuras

**Endpoints**: 5 | **Testes**: 14 | **Status**: ✅ 100% passando

---

#### **Módulo 2 - Lembretes com Agendamento**
📄 **[MODULO_2_LEMBRETES.md](MODULO_2_LEMBRETES.md)**

Sistema de lembretes com agendamento inteligente e processamento em background.

**Recursos:**
- 🔔 Lembretes únicos e recorrentes (diário, semanal)
- ⏰ Agendamento com timezone
- 🔁 Jobs assíncronos com idempotência
- ⏸️ Snooze (adiar) e Complete (concluir)
- 📊 Filtros por status e data

**Endpoints**: 7 | **Testes**: 14 | **Status**: ✅ 100% passando

---

#### **Módulo 3 - Notificações**
📄 **[MODULO_3_NOTIFICACOES.md](MODULO_3_NOTIFICACOES.md)**

Sistema completo de notificações com histórico e controle de leitura.

**Recursos:**
- 🔔 Notificações automáticas (lembretes, convites, mudanças)
- 📚 Histórico completo com paginação
- ✅ Controle de leitura (individual e em lote)
- 🔗 Integração total com módulos existentes
- 📊 Filtros por status e período

**Endpoints**: 4 | **Testes**: 9 | **Status**: ✅ 100% passando

---

## 📊 Estatísticas Gerais

### Cobertura de Testes
```
Total: 54 testes | 240 assertions | 100% passando
Tempo de execução: ~58s
```

**Distribuição por módulo:**
- ✅ AuthTest: 5 testes (autenticação JWT)
- ✅ MealTest: 6 testes (gerenciamento de refeições)
- ✅ PetTest: 6 testes (gerenciamento de pets)
- ✅ ReminderTest: 14 testes (lembretes e agendamento)
- ✅ SharedPetTest: 14 testes (compartilhamento de pets)
- ✅ NotificationTest: 9 testes (sistema de notificações)

### Arquitetura

**Models**: 6
- User, Pet, Meal, SharedPet, Reminder, Notification

**Controllers**: 6
- AuthController, PetController, MealController, SharedPetController, ReminderController, NotificationController

**Enums**: 7
- Species, SharedPetRole, InvitationStatus, ReminderStatus, RepeatRule, NotificationChannel, NotificationStatus

**Services**: 3
- AccessService, PetService, NotificationService

**Jobs**: 2
- SendReminderJob, DeliverNotificationJob

**Events**: 4
- SharedPetInvited, SharedPetAccepted, SharedPetRoleChanged, SharedPetRemoved

---

## 🔗 Links Úteis

### Documentação Interativa
- **Swagger UI**: http://localhost:8081/swagger
- **OpenAPI JSON**: http://localhost:8080/api-docs.json

### Repositório
- **README Principal**: [../README.md](../README.md)
- **Scripts Utilitários**: [../scripts/](../scripts/)

### Referências Externas
- [Laravel 12.x Documentation](https://laravel.com/docs/12.x)
- [JWT Auth Documentation](https://github.com/PHP-Open-Source-Saver/jwt-auth)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)

---

## 🎯 Roadmap de Módulos Futuros

### Em Planejamento
- [ ] **Módulo 4 - Dashboard** (Estatísticas e gráficos)
- [ ] **Módulo 5 - Auditoria** (Log de ações e histórico)
- [ ] **Módulo 6 - Relatórios** (Exportação PDF/Excel)
- [ ] **Módulo 7 - Chat** (Comunicação entre usuários)

---

## 📞 Suporte

Para dúvidas sobre módulos específicos, consulte a documentação individual de cada módulo acima.

Para questões gerais, veja:
- [README.md](../README.md#troubleshooting)
- [Swagger UI](http://localhost:8081/swagger)

---

**Última atualização**: Outubro 2025  
**Versão da API**: 1.0.0  
**Laravel**: 12.x | **PHP**: 8.2

