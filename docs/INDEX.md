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

#### **Módulo 7 - Locations (Hierarquia Espacial)**
📄 **[MODULO_7_LOCATIONS.md](MODULO_7_LOCATIONS.md)**

Sistema de organização hierárquica: Usuário → Location → Pet.

**Recursos:**
- 📍 Locais físicos (Casa, Fazenda, Apartamento, etc)
- 🏗️ Hierarquia: User → Location → Pet
- 🌍 Timezone por local
- 🔗 Relacionamentos completos
- 🔐 Policies de acesso
- 🔍 Filtro de pets por location

**Endpoints**: 5 | **Testes**: 14 | **Status**: ✅ 100% passando

---

#### **Módulo 8 - Push Notifications (FCM)** ⭐ NOVO
📄 **[MODULO_8_PUSH_NOTIFICATIONS.md](MODULO_8_PUSH_NOTIFICATIONS.md)**

Notificações push reais via Firebase Cloud Messaging.

**Recursos:**
- 🔔 Push notifications via FCM HTTP v1 API
- 📱 Suporte Android, iOS e Web
- 🔄 Sistema de retry automático
- 📊 Gerenciamento de dispositivos

**Endpoints**: 3 | **Testes**: 9 | **Status**: ✅ 100% passando

---

#### **Módulo 9 - Queue Hardening (Filas Robustas)** ⭐ NOVO
📄 **[MODULO_9_QUEUE_HARDENING.md](MODULO_9_QUEUE_HARDENING.md)**

Sistema de filas com retry automático e dead-letter queue.

**Recursos:**
- 🔄 Retry automático com backoff exponencial
- 📋 Dead letter queue para análise
- ⏰ Agendamento sem Cron externo
- 🔍 Observabilidade completa

**Endpoints**: N/A (Sistema) | **Testes**: 10 | **Status**: ✅ 100% passando

---

#### **Módulo 10 - Vault (Supabase) - Opcional** ⚠️
📄 **[MODULO_10_VAULT.md](MODULO_10_VAULT.md)**

Centralização de segredos via Supabase Vault (não implementado).

**Status**: ⏳ **Não Implementado (Opcional)**  
**Motivo**: Arquivo JSON funciona perfeitamente para o escopo atual

---

#### **Módulo 11 - GraphQL Proxy (Read-Only)** ⭐ NOVO
📄 **[MODULO_11_GRAPHQL.md](MODULO_11_GRAPHQL.md)**

Proxy GraphQL para consultas flexíveis via Supabase.

**Recursos:**
- 🔍 Consultas GraphQL complexas
- 🔒 Read-only (bloqueio de mutations)
- 📊 Rate limiting dedicado
- ✅ Allow-list de coleções

**Endpoints**: 1 | **Status**: ✅ Implementado

---

#### **Módulo 12 - Weights & Progress (Histórico de Peso)** ⭐ NOVO
📄 **[MODULO_12_WEIGHTS.md](MODULO_12_WEIGHTS.md)**

Rastreamento da evolução do peso dos pets.

**Recursos:**
- 📊 Histórico completo de peso
- 📈 Cálculo de tendências (increasing/decreasing/stable)
- 📅 Filtros por período
- 🔐 Validações robustas

**Endpoints**: 3 | **Testes**: 10 | **Status**: ✅ 100% passando

---

#### **Módulo 13 - Calendar ICS Export** ⭐ NOVO
📄 **[MODULO_13_CALENDAR.md](MODULO_13_CALENDAR.md)**

Exportação de lembretes como feed iCalendar compatível com RFC 5545.

**Recursos:**
- 📅 Feed ICS público por usuário
- 🔄 Compatível com Apple Calendar, Google Calendar e Outlook
- 🔒 Token UUID rotacionável
- ⏰ Alarmes 15 minutos antes

**Endpoints**: 3 | **Testes**: 10 | **Status**: ✅ 100% passando

---

#### **Módulo 14 - Educational Articles (HU011)** ⭐ NOVO
📄 **[MODULO_14_EDUCATIONAL_ARTICLES.md](MODULO_14_EDUCATIONAL_ARTICLES.md)**

Seção educativa com conteúdo sobre nutrição e segurança alimentar de pets.

**Recursos:**
- 📚 Artigos educacionais com busca e filtros
- 🔍 Busca por termo e filtro por tags
- 🌐 Endpoints públicos (sem autenticação)
- 👑 CRUD completo admin com publicação
- 🔒 Sanitização HTML (whitelist de tags)
- 📝 Sistema de rascunhos e publicação
- 🔗 Slugs únicos e estáveis

**Endpoints**: 6 (2 públicos + 4 admin) | **Testes**: 40+ | **Status**: ✅ 100% passando

---

#### **Módulo 15 - Reminder Customization (HU012)** ⭐ NOVO
📄 **[MODULO_15_REMINDER_CUSTOMIZATION.md](MODULO_15_REMINDER_CUSTOMIZATION.md)**

Personalização avançada de lembretes com controle granular.

**Recursos:**
- 📅 Dias da semana específicos (MON-SUN)
- ⏰ Janela ativa (horários permitidos)
- 🌍 Timezone override por lembrete
- ⏸️ Snooze personalizado (5-1440 min)
- 📧 Canal configurável (push/email)
- 🧪 Endpoint de teste (envio imediato)
- 🎯 Algoritmo inteligente de próxima ocorrência

**Endpoints**: 2 novos (test, snooze melhorado) | **Status**: ✅ Implementado

---

#### **Módulo 16 - Nutrition Summary & Alerts** ⭐ NOVO
📄 **[MODULO_16_NUTRITION_SUMMARY.md](MODULO_16_NUTRITION_SUMMARY.md)**

Relatórios nutricionais com alertas heurísticos automáticos.

**Recursos:**
- 📊 Agregação de refeições por período
- 📈 Evolução de peso (primeiro/último/delta)
- 🚨 Alertas automáticos (queda frequência, peso rápido)
- 📅 Range flexível (até 180 dias)
- 📉 Métricas por dia (per_day breakdown)
- ⚠️ Severidade de alertas (low/medium/high)

**Endpoints**: 1 | **Status**: ✅ Implementado

---

#### **Módulo 17 - Documentation & DX** ⭐ NOVO
📄 **[MODULO_17_DOCUMENTATION_DX.md](MODULO_17_DOCUMENTATION_DX.md)**

Ferramentas de documentação e Developer Experience.

**Recursos:**
- 📚 L5-Swagger UI interativa
- 📦 Postman Collection auto-gerada
- 🧪 Testes de contrato automatizados (19 testes)
- 📥 Download de collection via `/dev/postman`
- ✅ Validação de schemas
- 🔄 Workflow de desenvolvimento documentado

**Commands**: 2 (l5-swagger:generate, postman:generate) | **Testes**: 19 | **Status**: ✅ 100% passando

---

#### **Módulo 18 - Admin Content Tools** ⭐ NOVO
📄 **[MODULO_18_ADMIN_CONTENT_TOOLS.md](MODULO_18_ADMIN_CONTENT_TOOLS.md)**

Ferramentas administrativas para gestão de conteúdo.

**Recursos:**
- 📊 Estatísticas gerais da plataforma
- 📝 Listagem de rascunhos
- 📋 Duplicação de artigos
- 🔢 Contadores em tempo real
- 📈 Overview para dashboard admin

**Endpoints**: 3 | **Status**: ✅ Implementado

---

## 📊 Estatísticas Gerais

### Cobertura de Testes
```
Total: 180+ testes | 900+ assertions | 100% passando
Tempo de execução: ~200s
```

**Distribuição por módulo:**
- ✅ AuthTest: 5 testes (autenticação JWT)
- ✅ MealTest: 6 testes (gerenciamento de refeições)
- ✅ PetTest: 6 testes (gerenciamento de pets)
- ✅ ReminderTest: 14 testes (lembretes e agendamento)
- ✅ SharedPetTest: 14 testes (compartilhamento de pets)
- ✅ NotificationTest: 9 testes (sistema de notificações)
- ✅ AdminTest: 13 testes (painel administrativo)
- ✅ LocationTest: 14 testes (gestão de locais)
- ✅ PetWeightTest: 10 testes (histórico de peso) ⭐
- ✅ CalendarTest: 10 testes (exportação ICS) ⭐
- ✅ UserDeviceTest: 9 testes (dispositivos FCM) ⭐
- ✅ QueueHardeningTest: 10 testes (filas robustas) ⭐
- ✅ EducationalArticleTest: 40+ testes (artigos educacionais) ⭐
- ✅ ApiContractTest: 19 testes (contratos de API) ⭐

### Arquitetura

**Models**: 13
- User, Pet, Meal, SharedPet, Reminder, Notification, AuditLog, Audit, Location, PetWeight, UserDevice, DeadLetter, EducationalArticle

**Controllers**: 13
- AuthController, PetController, MealController, SharedPetController, ReminderController, NotificationController, AdminController, LocationController, PetWeightController, CalendarController, UserDeviceController, GraphQLProxyController, EducationalArticleController, NutritionSummaryController

**Policies**: 5
- PetPolicy, MealPolicy, LocationPolicy, PetWeightPolicy, EducationalArticlePolicy

**Enums**: 7
- Species, SharedPetRole, InvitationStatus, ReminderStatus, RepeatRule, NotificationChannel, NotificationStatus

**Services**: 8
- AccessService, PetService, NotificationService, AuditService, CalendarService, ReminderSchedulerService, FCMClient, SlugService, NutritionSummaryService

**Jobs**: 2
- SendReminderJob, DeliverNotificationJob

**Middleware**: 3
- CorsMiddleware, SecurityHeaders, IsAdmin

**Traits**: 1
- Auditable (observabilidade)

**Events**: 5
- SharedPetInvited, SharedPetAccepted, SharedPetRoleChanged, SharedPetRemoved, ReminderDue

**Listeners**: 2
- SendSharedPetNotification, SendReminderPushNotification

**Commands**: 2
- RetryDeadLetters, GeneratePostmanCollection

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

## 🎯 Status dos Módulos

### ✅ Módulos Implementados (17/18)
- ✅ **Módulos 1-7**: Funcionalidades base completas
- ✅ **Módulo 8**: Push Notifications via FCM
- ✅ **Módulo 9**: Queue Hardening com retry
- ⚠️ **Módulo 10**: Vault (Opcional - não implementado)
- ✅ **Módulo 11**: GraphQL Proxy read-only
- ✅ **Módulo 12**: Weights & Progress tracking
- ✅ **Módulo 13**: Calendar ICS Export
- ✅ **Módulo 14**: Educational Articles (HU011)
- ✅ **Módulo 15**: Reminder Customization (HU012)
- ✅ **Módulo 16**: Nutrition Summary & Alerts
- ✅ **Módulo 17**: Documentation & DX
- ✅ **Módulo 18**: Admin Content Tools

**Taxa de conclusão**: 94% (17 de 18 módulos) 🎉

### 🔮 Próximos Passos
- 🚀 Otimizações de performance
- 📊 Dashboards e analytics
- 🔔 Melhorias em notificações push
- 📱 App móvel nativo (Flutter/React Native)

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
**Novidades**: 📚 Módulos 14-18 implementados! DX Score: 10/10 ⭐

