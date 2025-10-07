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

## 📊 Estatísticas Gerais

### Cobertura de Testes
```
Total: 45 testes | 186 assertions | 100% passando
Tempo de execução: ~48s
```

**Distribuição por módulo:**
- ✅ AuthTest: 5 testes (autenticação JWT)
- ✅ MealTest: 6 testes (gerenciamento de refeições)
- ✅ PetTest: 6 testes (gerenciamento de pets)
- ✅ ReminderTest: 14 testes (lembretes e agendamento)
- ✅ SharedPetTest: 14 testes (compartilhamento de pets)

### Arquitetura

**Models**: 5
- User, Pet, Meal, SharedPet, Reminder

**Controllers**: 5
- AuthController, PetController, MealController, SharedPetController, ReminderController

**Enums**: 6
- Species, SharedPetRole, InvitationStatus, ReminderStatus, RepeatRule, NotificationChannel

**Services**: 2
- AccessService, PetService

**Jobs**: 1
- SendReminderJob

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
- [ ] **Módulo 3 - Notificações** (Email, Push, In-App)
- [ ] **Módulo 4 - Dashboard** (Estatísticas e gráficos)
- [ ] **Módulo 5 - Auditoria** (Log de ações e histórico)
- [ ] **Módulo 6 - Relatórios** (Exportação PDF/Excel)

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

