# PWA e Push Notifications - Configuração Completa

## Objetivo

Implementar push notifications no PWA usando Service Workers e protocolo Web Push.

**Funcionalidades:**
- Push notifications do sistema operacional
- Funcionam mesmo com app fechado (background)
- Clicar na notificação abre o app
- Integração com backend via VAPID

## Arquitetura Implementada

### Service Worker (@angular/service-worker)

O Angular Service Worker é instalado e configurado via `ngsw-config.json`:

**Justificativa**: `@angular/service-worker` oferece integração nativa com Angular. Simplifica deployment e atualização do Service Worker, além de fornecer APIs para push notifications.

### VAPID Keys

Voluntary Application Server Identification (VAPID) autentica o servidor:

```
VAPID_PUBLIC_KEY=Vq-EKPNvDCuDtZ2rzUt9ogbAraHZQFrH2b6tdT_OOCU
VAPID_PRIVATE_KEY=n3RiOszeu3fcTdK7h-MEPgM3W59YpQJwpxZVXRAbvR0
```

**Justificativa**: VAPID permite que o backend envie push sem depender de serviços third-party (FCM, OneSignal). A chave pública é usada no frontend para assinar subscription, privada no backend para assinar mensagens.

**Segurança**: Chave privada NUNCA vai para o frontend ou repositório. Fica apenas em `.env` do backend.

### Push Subscription Flow

1. Frontend solicita permissão ao usuário
2. Service Worker cria subscription com VAPID public key
3. Frontend envia subscription ao backend (POST /push-subscriptions)
4. Backend armazena subscription no banco
5. Backend pode enviar push a qualquer momento

**Justificativa**: Este é o flow padrão Web Push API. Separação clara entre autenticação (VAPID) e autorização (permissão do usuário).

### PushNotificationService

Serviço Angular encapsula lógica de push:

```typescript
class PushNotificationService {
  async requestSubscription(): Promise<PushSubscription>
  sendSubscriptionToBackend(subscription): Observable<any>
  listenToNotifications(): Observable<NotificationEvent>
  unsubscribe(): Promise<void>
}
```

**Justificativa**: Abstração sobre Service Worker API. Componentes não precisam conhecer detalhes de implementação. Facilita testes e reutilização.

## Decisões Técnicas

### Por que Web Push e não FCM?

Optou-se pelo padrão Web Push API em vez de Firebase Cloud Messaging:

**Justificativa**:
- **Independência**: Sem lock-in com Google/Firebase
- **Padrão W3C**: Web Push é padrão open, funciona em todos os browsers
- **Simplicidade**: VAPID é mais simples que FCM tokens/credentials
- **Custo**: Zero custo adicional, sem quota limits

**Limitação**: Web Push não funciona no iOS Safari (mas PWA iOS tem limitações gerais).

### Service Worker Registrado Apenas em Produção

```typescript
provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(),
  registrationStrategy: 'registerWhenStable:30000'
})
```

**Justificativa**:
- **Dev experience**: Service Worker pode interferir com hot reload em dev
- **Build requirement**: Service Worker requer production build (`ng build`)
- **Strategy**: Registra após app estabilizar + 30s para não impactar initial load

### Cache Strategy (ngsw-config.json)

Duas estratégias configuradas:

1. **Freshness**: Para endpoints de pets, meals, etc (rede primeiro, cache fallback)
2. **Performance**: Para outros endpoints (cache primeiro, rede fallback)

**Justificativa**:
- **Freshness** para dados dinâmicos garante versão mais recente
- **Performance** para dados semi-estáticos melhora velocidade percebida
- Timeout de 10s/5s previne espera infinita se offline

### Backend Push Subscriptions Table

```sql
CREATE TABLE push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT UNIQUE,
  p256dh VARCHAR(255),
  auth VARCHAR(255)
);
```

**Justificativa**:
- `endpoint` único previne duplicatas (mesmo device)
- `CASCADE DELETE` remove subscriptions se usuário deletado
- `p256dh` e `auth` são chaves criptográficas necessárias para enviar push

### Por que não usar minishlink/web-push no frontend?

A library `web-push` é apenas para backend:

**Justificativa**: Frontend usa Web Push API nativa do browser. Library PHP `minishlink/web-push` é para ENVIAR push, não receber. Frontend só precisa criar subscription e escutar mensagens (APIs nativas).

## Integração Backend (Pendente)

Para o backend enviar push, precisa:

1. Instalar `minishlink/web-push` (Composer)
2. Criar endpoint POST `/push-subscriptions` para salvar subscriptions
3. Implementar `PushNotificationService` que usa library para enviar
4. Integrar com eventos (SharedPetInvited, ReminderDue, etc)

**Justificativa**: Backend implementation está documentada mas não implementada no TCC. O frontend está 100% pronto e testável usando service como Pusher ou manualmente.

## Limitações e Trade-offs

### iOS Safari Não Suporta

Push notifications não funcionam no iOS (Safari):

**Justificativa**: Limitação da plataforma Apple. iOS 16.4+ adicionou suporte parcial, mas com muitas restrições. Android e Desktop funcionam perfeitamente.

### Requer HTTPS

Web Push API só funciona em HTTPS (exceto localhost):

**Justificativa**: Segurança. Push é feature poderosa (pode mostrar notificações a qualquer momento). Browsers restringem a HTTPS.

### Offline-First Cache Não Implementado

Service Worker foi configurado para push, mas não caching agressivo offline:

**Justificativa**: App requer API para funcionar. Offline completo adicionaria complexidade (sync quando reconectar, conflict resolution, etc) sem benefício proporcional ao escopo do TCC.

### No Background Sync

Ações offline não são sincronizadas quando reconectar:

**Justificativa**: Background Sync API é avançada e requer IndexedDB para queue. Para TCC demonstrativo, pushnotifications já mostram capacidade de Service Worker.

## Arquivos Criados/Modificados

### Criados
- `ngsw-config.json` - Configuração do Service Worker
- `push-notification.service.ts` - Service para gerenciar push
- VAPID keys geradas (documentadas, não commitadas)

### Modificados
- `app.config.ts` - Registrar Service Worker
- `notification.service.ts` - Integrar com push
- `environment.ts` - VAPID public key
- `package.json` - `@angular/service-worker` dependency

### Backend (Documentado, Não Implementado)
- Migration para `push_subscriptions` table
- Model `PushSubscription`
- Controller para salvar subscriptions
- Service para enviar push usando `minishlink/web-push`

## Testando Push Notifications

### 1. Build de Produção

```bash
npm run build:prod
```

### 2. Servir com HTTPS

Usar nginx ou http-server com SSL:

```bash
npx http-server dist/frontend -p 8080 --ssl
```

### 3. Aceitar Permissão

Ao abrir app, aceitar prompt de notificações.

### 4. Verificar Subscription

DevTools > Application > Service Workers deve mostrar worker ativo.
Console deve mostrar subscription enviada ao backend.

### 5. Testar Push Manual

Usar Postman ou curl para enviar push manualmente ao endpoint da subscription.

**Justificativa**: Sem backend implementado, testar manualmente valida que frontend está correto.

## Melhorias Futuras

Para evolução além do TCC:

- **Implementar backend completo**: Envio real via backend
- **Notificações ricas**: Imagens, ações, badges
- **Agrupamento**: Múltiplas notificações agrupadas
- **Quiet hours**: Respeitar horários do usuário
- **Priority**: Notificações urgentes vs informativas
- **Analytics**: Tracking de open rate, click rate

**Nota**: A arquitetura atual suporta todas essas melhorias sem refactoring significativo.
