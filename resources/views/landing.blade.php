<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{ $appName }} – API</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />
    <style>
      :root{ --bg:#0b1220; --panel:#0f172a; --muted:#94a3b8; --text:#e2e8f0; --brand:#22d3ee; }
      *{ box-sizing: border-box; } body{ margin:0; font-family:Figtree,ui-sans-serif,system-ui; background:var(--bg); color:var(--text);} 
      .wrap{ max-width:960px; margin:0 auto; padding:32px 20px; }
      .panel{ background:var(--panel); border:1px solid #1f2a44; border-radius:12px; padding:20px; }
      h1{ margin:0 0 8px; font-size:28px; } h2{ margin:24px 0 8px; font-size:18px; }
      p{ margin:8px 0; color:var(--muted);} code,pre{ font-family: ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; }
      pre{ background:#0b132b; border:1px solid #1e293b; border-radius:8px; padding:14px; overflow:auto; color:#d1d5db; }
      a{ color:var(--brand); text-decoration:none; } a:hover{ text-decoration:underline; }
      .grid{ display:grid; gap:16px; grid-template-columns: repeat(auto-fit,minmax(280px,1fr)); }
      .pill{ display:inline-block; padding:4px 10px; border-radius:999px; border:1px solid #1f2a44; color:#a5b4fc; font-size:12px; }
      .kvs{ display:grid; grid-template-columns: 140px 1fr; gap:8px; }
      .footer{ margin-top:24px; font-size:12px; color:#64748b; text-align:center; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px; margin-bottom:16px;">
        <div>
          <div class="pill">API</div>
          <h1>{{ $appName }}</h1>
          <p>API para gerenciamento de pets (autenticação JWT, pets, refeições, lembretes, notificações, calendário, artigos educacionais e mais).</p>
        </div>
        <div>
          <a href="{{ $docsUrl }}" style="padding:10px 14px;border:1px solid #1f2a44;border-radius:8px;">Abrir Swagger ▶</a>
        </div>
      </div>

      <div class="grid">
        <div class="panel">
          <h2>Endpoints Principais</h2>
          <div class="kvs">
            <div>Health</div><div><a href="{{ $healthUrl }}">GET /api/health</a></div>
            <div>Login</div><div>POST /api/auth/login</div>
            <div>Registro</div><div>POST /api/auth/register</div>
            <div>Artigos</div><div>GET /api/educational-articles</div>
            <div>Protegidos</div><div>prefixo /api/v1 (ex.: GET /api/v1/pets)</div>
            <div>Docs</div><div><a href="{{ $docsUrl }}">/swagger</a> &middot; <a href="/api-docs.json">/api-docs.json</a></div>
          </div>
        </div>

        <div class="panel">
          <h2>Autenticação (JWT)</h2>
          <p>1) Registre-se (ou use um usuário já existente), 2) Faça login e 3) Envie o token Bearer nas rotas protegidas.</p>
          <pre><code>curl -X POST '{{ $baseUrl }}/api/auth/register' \ 
  -H 'Content-Type: application/json' \ 
  -d '{
  "name": "João da Silva",
  "email": "joao.silva@example.com",
  "password": "Senha@123",
  "password_confirmation": "Senha@123"
}'

curl -X POST '{{ $baseUrl }}/api/auth/login' \ 
  -H 'Content-Type: application/json' \ 
  -d '{
  "email": "joao.silva@example.com",
  "password": "Senha@123"
}'

# Exemplo rota protegida (substitua TOKEN)
curl -H 'Authorization: Bearer TOKEN' '{{ $baseUrl }}/api/v1/pets'</code></pre>
        </div>
      </div>

      <div class="panel" style="margin-top:16px;">
        <h2>Ambiente</h2>
        <div class="kvs">
          <div>Base URL</div><div><code>{{ $baseUrl }}</code></div>
          <div>Saúde</div><div><a href="{{ $healthUrl }}">{{ $healthUrl }}</a></div>
          <div>Docs</div><div><a href="{{ $docsUrl }}">{{ $docsUrl }}</a></div>
        </div>
      </div>

      <p class="footer">Dica: use o Swagger para testar os endpoints, gerar exemplos e explorar modelos de resposta.</p>
    </div>
  </body>
  </html>

