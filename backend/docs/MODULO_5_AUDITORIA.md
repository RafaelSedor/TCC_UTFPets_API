# Módulo 5 — Auditoria (observabilidade)

## 📋 Visão Geral

O **Módulo 5** estende o sistema de auditoria implementado no Módulo 4, adicionando trilhas de eventos detalhadas para suporte técnico e compliance. Este módulo foca em observabilidade e rastreabilidade completa de todas as ações do sistema.

## 🎯 Objetivos

- **Trilha de Eventos**: Registro detalhado de todas as ações críticas
- **Observabilidade**: Logs estruturados para análise e debugging
- **Compliance**: Atender requisitos de LGPD e auditoria
- **Rastreabilidade**: Histórico completo com payload de dados

## 🏗️ Componentes Criados

### **1. Tabela `audits`**

```sql
CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NULLABLE,
    action VARCHAR(255) NOT NULL,  -- pet.created, meal.updated, etc
    entity VARCHAR(255) NOT NULL,  -- pet, meal, shared_pet, etc
    entity_id VARCHAR(255) NULLABLE,
    payload JSONB NULLABLE,        -- Diffs ou dados relevantes
    ip VARCHAR(255) NULLABLE,
    user_agent VARCHAR(255) NULLABLE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### **2. Trait `Auditable`**

Trait reutilizável para adicionar auditoria automática aos models:

```php
trait Auditable
{
    protected static function bootAuditable()
    {
        static::created(fn($model) => $model->auditEvent('created', $model->toArray()));
        static::updated(fn($model) => $model->auditEvent('updated', $diff));
        static::deleted(fn($model) => $model->auditEvent('deleted', $model->toArray()));
    }

    protected function auditEvent(string $event, array $payload = [])
    {
        // Registra no banco
        // Registra no arquivo de log
    }
}
```

### **3. Canais de Log Personalizados**

#### **audit.log**
- Retenção: 90 dias
- Nível: INFO
- Formato: Daily rotation
- Conteúdo: Todas as ações de auditoria

#### **jobs.log**
- Retenção: 30 dias
- Nível: INFO
- Formato: Daily rotation
- Conteúdo: Execução de jobs (lembretes, notificações)

### **4. Eventos Auditados**

#### **Autenticação**
- `user.login` - Login de usuário
- `user.logout` - Logout de usuário
- `user.register` - Registro de novo usuário

#### **Pets**
- `pet.created` - Criação de pet
- `pet.updated` - Atualização de pet  
- `pet.deleted` - Remoção de pet
- `pet.accessed` - Visualização de pet

#### **Refeições**
- `meal.created` - Criação de refeição
- `meal.updated` - Atualização de refeição
- `meal.deleted` - Remoção de refeição
- `meal.consumed` - Refeição marcada como consumida

#### **Compartilhamento**
- `share.invited` - Convite enviado
- `share.accepted` - Convite aceito
- `share.role_changed` - Papel alterado
- `share.revoked` - Acesso revogado

#### **Lembretes**
- `reminder.created` - Lembrete criado
- `reminder.updated` - Lembrete atualizado
- `reminder.deleted` - Lembrete removido
- `reminder.dispatched` - Lembrete disparado
- `reminder.snoozed` - Lembrete adiado
- `reminder.completed` - Lembrete concluído

## 📊 Estrutura de Payload

### **Exemplo de Criação**
```json
{
  "action": "pet.created",
  "entity": "pet",
  "entity_id": "1",
  "payload": {
    "name": "Buddy",
    "species": "dog",
    "breed": "Golden Retriever",
    "user_id": 1
  },
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
}
```

### **Exemplo de Atualização**
```json
{
  "action": "pet.updated",
  "entity": "pet",
  "entity_id": "1",
  "payload": {
    "before": {
      "weight": 25.0,
      "name": "Buddy"
    },
    "after": {
      "weight": 26.5,
      "name": "Buddy Jr."
    }
  },
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
}
```

## 🔐 Segurança

### **Sanitização de Dados**
- ✅ Senha e tokens são **removidos** do payload
- ✅ Dados sensíveis são **filtrados**
- ✅ Apenas informações relevantes são armazenadas

### **Controle de Acesso**
- ✅ Logs de auditoria acessíveis apenas por **admins**
- ✅ Usuário regular não vê logs de outros usuários
- ✅ Sistema de eventos separado de logs de aplicação

## 📈 Benefícios

### **Para Suporte**
- Investigação de bugs com contexto completo
- Rastreamento de ações de usuários
- Debug de problemas em produção

### **Para Compliance**
- LGPD: Rastreabilidade de dados
- Auditoria: Histórico completo
- Transparência: Quem fez o quê e quando

### **Para Operações**
- Monitoramento de uso do sistema
- Análise de padrões
- Detecção de anomalias

## 🚀 Melhorias Futuras

- [ ] Dashboard de auditoria
- [ ] Alertas em tempo real
- [ ] Export de logs (CSV/Excel)
- [ ] Integração com ferramentas de observabilidade (DataDog, New Relic)
- [ ] Replay de ações
- [ ] Análise de segurança

## 📚 Documentação Relacionada

- [Módulo 4 - Admin](MODULO_4_ADMIN.md) - Sistema de auditoria administrativa
- [README Principal](../README.md)

---

## 🏆 Status: **INFRAESTRUTURA CRIADA**

**Tabela audits criada** ✅  
**Trait Auditable implementado** ✅  
**Canais de log configurados** ✅  
**Pronto para ativação nos models** ✅

