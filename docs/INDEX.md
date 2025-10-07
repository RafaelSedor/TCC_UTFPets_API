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

#### **Módulo 4 - Admin (Gestão e Auditoria)**
📄 **[MODULO_4_ADMIN.md](MODULO_4_ADMIN.md)**

Painel administrativo completo com gestão de usuários, pets e auditoria.

**Recursos:**
- 👑 Permissões de admin (is_admin)
- 📋 Gestão de usuários (listar, alterar permissões)
- 🐾 Visualização de todos os pets
- 📊 Sistema de auditoria completo
- 🔍 Filtros avançados e paginação
- 🔐 Middleware dedicado (admin)

**Endpoints**: 4 | **Testes**: 13 | **Status**: ✅ 100% passando

---

#### **Módulo 5 - Auditoria (Observabilidade)**
📄 **[MODULO_5_AUDITORIA.md](MODULO_5_AUDITORIA.md)**

Sistema avançado de auditoria para observabilidade e compliance.

**Recursos:**
- 📊 Trilha de eventos completa
- 📝 Logs estruturados (audit.log, jobs.log)
- 🔍 Trait Auditable reutilizável
- 🔐 Sanitização de dados sensíveis
- 📈 Observabilidade e debugging

**Status**: ✅ Infraestrutura criada

---

#### **Módulo 6 - Migração UUID**
📄 **[MODULO_6_UUID.md](MODULO_6_UUID.md)**

Migração gradual e compatível para UUID em todas as tabelas.

**Recursos:**
- 🔄 Migração sem downtime
- 🔗 Chaves paralelas durante transição
- ✅ 100% compatibilidade mantida
- 🆕 Tabelas novas já usam UUID
- 📋 Estratégia em 5 etapas

**Status**: ⏳ Em progresso (shared_pets, reminders, notifications, audit_logs, audits já usam UUID)

---

## 📊 Estatísticas Gerais

### Cobertura de Testes
```
Total: 67 testes | 391 assertions | 100% passando
Tempo de execução: ~66s
```

**Distribuição por módulo:**
- ✅ AuthTest: 5 testes (autenticação JWT)
- ✅ MealTest: 6 testes (gerenciamento de refeições)
- ✅ PetTest: 6 testes (gerenciamento de pets)
- ✅ ReminderTest: 14 testes (lembretes e agendamento)
- ✅ SharedPetTest: 14 testes (compartilhamento de pets)
- ✅ NotificationTest: 9 testes (sistema de notificações)
- ✅ AdminTest: 13 testes (painel administrativo)

### Arquitetura

**Models**: 8
- User, Pet, Meal, SharedPet, Reminder, Notification, AuditLog, Audit

**Controllers**: 7
- AuthController, PetController, MealController, SharedPetController, ReminderController, NotificationController, AdminController

**Enums**: 7
- Species, SharedPetRole, InvitationStatus, ReminderStatus, RepeatRule, NotificationChannel, NotificationStatus

**Services**: 4
- AccessService, PetService, NotificationService, AuditService

**Jobs**: 2
- SendReminderJob, DeliverNotificationJob

**Middleware**: 3
- CorsMiddleware, SecurityHeaders, IsAdmin

**Traits**: 1
- Auditable (observabilidade)

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
- [ ] **Módulo 5 - Dashboard** (Estatísticas e gráficos)
- [ ] **Módulo 6 - Relatórios** (Exportação PDF/Excel)
- [ ] **Módulo 7 - Chat** (Comunicação entre usuários)
- [ ] **Módulo 8 - Integrações** (APIs externas)

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

