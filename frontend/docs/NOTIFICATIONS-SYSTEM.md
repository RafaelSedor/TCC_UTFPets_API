# Sistema de Notificações - Frontend

## Objetivo

Implementar sistema completo de notificações no frontend Angular, integrado com a API de notificações do backend.

**Principais Recursos:**
- Sino de notificações no header com badge
- Página completa com histórico e filtros
- Auto-refresh para notificações em tempo real
- Navegação contextual baseada em tipo

## Arquitetura Implementada

### Angular Signals para Reatividade

O serviço utiliza Signals (Angular 17+) para estado reativo:

```typescript
private unreadCountSignal = signal<number>(0);
public unreadCount = this.unreadCountSignal.asReadonly();
```

**Justificativa**: Signals oferecem reatividade granular sem precisar de RxJS para tudo. O contador de não lidas atualiza automaticamente todos os componentes que o consomem, sem subscriptions manuais.

### Auto-Refresh com Intervalo

```typescript
setInterval(() => {
  this.updateUnreadCount();
}, 30000); // 30 segundos
```

**Justificativa**: Polling a cada 30 segundos simula "tempo real" sem complexidade de WebSockets. Para o escopo do TCC, é suficiente e muito mais simples de implementar e manter.

### Service Singleton

O `UserNotificationService` é `providedIn: 'root'`:

**Justificativa**: Garante que existe apenas uma instância do serviço. O estado (contador, notificações) é compartilhado entre todos os componentes que o injetam.

### Dois Componentes Especializados

- **NotificationBellComponent**: Sino no header (últimas 10)
- **NotificationListComponent**: Página completa (todas, paginadas)

**Justificativa**: Separação de responsabilidades. O sino é leve e sempre visível. A página oferece funcionalidades avançadas (filtros, paginação) sem poluir o header.

## Decisões Técnicas

### Por que não WebSockets?

Optou-se por polling (30s) em vez de WebSockets:

**Justificativa**:
- **Simplicidade**: Sem necessidade de servidor WebSocket (Laravel Reverb, Socket.io)
- **Escalabilidade**: HTTP polling escala horizontalmente sem estado
- **Custo-benefício**: Para TCC, 30s de latência é aceitável
- **Complexidade**: WebSockets adicionaria infra e código significativos

**Alternativa futura**: Implementar Server-Sent Events (SSE) como meio-termo.

### Formatação Relativa de Datas

```typescript
getRelativeTime(date: string): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes}min`;
  // ...
}
```

**Justificativa**: Datas relativas ("há 5 minutos") são mais intuitivas que timestamps absolutos para notificações recentes. Melhora UX sem adicionar dependências externas (moment.js, date-fns).

### Navegação Contextual

O componente navega baseado no campo `data.type` da notificação:

```typescript
if (notification.data?.pet_id) {
  this.router.navigate(['/app/pets', notification.data.pet_id]);
}
```

**Justificativa**: Notificações devem ser acionáveis. Clicar leva o usuário ao contexto relevante (pet, lembrete, etc).

### Filtros Simples

Três filtros: Todas / Não lidas / Lidas

**Justificativa**: Filtros básicos cobrem 90% dos casos de uso sem adicionar complexidade. Filtros avançados (por tipo, data) podem ser adicionados futuramente se necessário.

### Marcar como Lida no Click

Ao clicar em uma notificação, marca automaticamente como lida:

**Justificativa**: Comportamento esperado pelo usuário. Se clicou, assumimos que leu. Reduz cliques necessários.

### Dropdown vs Modal

O sino usa dropdown, não modal:

**Justificativa**: Dropdown é menos intrusivo. Usuário pode ver notificações rapidamente sem perder contexto da página atual.

## Integração com Backend

### Endpoints Consumidos

- `GET /notifications` - Lista com paginação e filtros
- `GET /notifications/unread-count` - Contador otimizado
- `PATCH /notifications/{id}/read` - Marca individual
- `POST /notifications/mark-all-read` - Marca todas

**Justificativa**: API RESTful completa. Contador separado evita tráfego desnecessário (usado frequentemente no header).

### Cache Local Mínimo

Notificações não são armazenadas em localStorage:

**Justificativa**: Notificações são dinâmicas e multi-device. Cache local causaria inconsistências. Sempre busca do servidor garante dados atualizados.

## UX e Design

### Badge Animado

Badge com contador de não lidas tem animação de "pulse":

**Justificativa**: Chama atenção visual para novas notificações sem ser intrusivo como um toast.

### Estados de Loading

Componentes mostram spinners durante carregamento:

**Justificativa**: Feedback visual evita que usuário pense que o app travou. Especialmente importante em conexões lentas.

### Empty States

Mensagens específicas para listas vazias:

```typescript
<p *ngIf="notifications.length === 0">
  Você não tem notificações {{ currentFilter === 'sent' ? 'não lidas' : 'lidas' }}.
</p>
```

**Justificativa**: Empty states contextuais são mais informativos que simplesmente mostrar lista vazia.

### Indicador Visual de Status

Notificações não lidas tem:
- Fundo azul claro
- Indicador circular azul
- Borda destacada

**Justificativa**: Diferenciação visual clara entre lidas/não lidas. Usuário identifica rapidamente o que é novo.

## Standalone Components

Ambos os componentes são standalone (Angular 17+):

```typescript
@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  // ...
})
```

**Justificativa**: Standalone components eliminam necessidade de NgModules, reduzindo boilerplate e facilitando lazy loading.

## Arquivos Criados

### Services
- `user-notification.service.ts` - Gerenciamento de notificações

### Components
- `notification-bell.component.ts` - Sino no header
- `notification-list.component.ts` - Página completa

### Models
- `notification.model.ts` - Interfaces e tipos

### Integração
- Adicionado ao `app-layout.component.ts` (header)
- Rota lazy-loaded em `app.routes.ts`

## Melhorias Futuras

Para evolução além do TCC:

- **WebSockets / SSE**: Notificações em tempo real verdadeiro
- **Service Worker**: Push notifications mesmo com app fechado
- **Agrupamento**: Notificações similares agrupadas ("3 novos lembretes")
- **Ações inline**: Aceitar/recusar convite direto na notificação
- **Preferências**: Usuário escolher quais tipos quer receber
- **Som/Vibração**: Feedback adicional ao receber notificação

**Nota**: Estas melhorias adicionariam complexidade além do escopo acadêmico atual, mas o sistema está arquitetado para suportá-las futuramente.
