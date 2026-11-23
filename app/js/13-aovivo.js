/* Meu Chat — 13-aovivo.js · ⚡ AO VIVO (20/11)
   O que você escreve num aparelho aparece no outro NA HORA (igual à Replit / WhatsApp), sem recarregar.
   Usa o "Realtime" do Supabase: o app fica com um fio ligado na nuvem e ela avisa quando algo muda.
   Não baixa nada a mais e não guarda nada no aparelho.
   Precisa rodar UMA vez no Supabase (SQL Editor → Run) a linha:
     alter publication supabase_realtime add table public.mc_itens;
   (ela já está no comando das tabelas — 📋 Copiar o SQL / 🛠 Conferir a tabela). Sem ela, nada quebra: só não fica ao vivo. */
(function (MC) {
  'use strict';
  let ws = null, hb = null, tk = null, ref = 0, tentativa = 0, parado = false, tReload = null;
  const pode = () => { try { const N = MC.nuvem; return !!(N && N.logado() && !N.ehNeon() && N.sessao()); } catch (e) { return false; } };
  const mandar = (o) => { try { if (ws && ws.readyState === 1) ws.send(JSON.stringify(Object.assign({ ref: String(++ref) }, o))); } catch (e) {} };
  async function ligar() {
    if (ws || parado || !pode()) return;
    let s; try { s = await MC.nuvem.token(); } catch (e) { return; }
    const c = MC.nuvem.config();
    try { ws = new WebSocket(c.url.replace(/^http/, 'ws') + '/realtime/v1/websocket?apikey=' + encodeURIComponent(c.anon) + '&vsn=1.0.0'); } catch (e) { ws = null; return; }
    ws.onopen = () => {
      tentativa = 0;
      mandar({ topic: 'realtime:mc-itens', event: 'phx_join', payload: { config: { broadcast: { self: false }, presence: { key: '' }, postgres_changes: [{ event: '*', schema: 'public', table: 'mc_itens' }] }, access_token: s.access } });
      hb = setInterval(() => mandar({ topic: 'phoenix', event: 'heartbeat', payload: {} }), 25000);
      tk = setInterval(async () => { try { const n = await MC.nuvem.token(); mandar({ topic: 'realtime:mc-itens', event: 'access_token', payload: { access_token: n.access } }); } catch (e) {} }, 10 * 60 * 1000);
      MC.emit('aovivo', true);
    };
    ws.onmessage = (e) => { let m; try { m = JSON.parse(e.data); } catch (x) { return; } if (m.event === 'postgres_changes' && m.payload && m.payload.data) chegou(m.payload.data.record || m.payload.data.old_record || {}); };
    ws.onclose = () => { clearInterval(hb); clearInterval(tk); ws = null; MC.emit('aovivo', false); if (!parado && pode()) setTimeout(ligar, Math.min(60000, 2000 * ++tentativa)); };
    ws.onerror = () => { try { ws.close(); } catch (e) {} };
  }
  function chegou(r) {
    if (!r || !r.tipo) return;
    if (r.tipo === 'codigo') { if (MC.online && MC.online.esquecerCodigos) MC.online.esquecerCodigos(); MC.emit('codigos'); return; }
    if (r.tipo === 'conversa') {
      const ab = MC.chat && MC.chat.conversa;
      if (ab && ab.id === r.id && (ab.atualizado || 0) >= (+r.atualizado || 0)) return; // fui eu mesmo que mandei
      clearTimeout(tReload);
      tReload = setTimeout(async () => {
        MC.emit('nuvem-conversas');
        if (ab && ab.id === r.id && MC.chat.recarregar && !(MC.chat.esperando && MC.chat.esperando())) { try { await MC.chat.recarregar(); } catch (e) {} }
      }, 700);
      return;
    }
    clearTimeout(tReload); tReload = setTimeout(() => { if (MC.nuvem && MC.nuvem.descer) MC.nuvem.descer().catch(() => {}); }, 1500); // memória, configurações
  }
  function parar() { parado = true; try { ws && ws.close(); } catch (e) {} ws = null; }
  MC.on('nuvem-entrou', () => { parado = false; setTimeout(ligar, 500); });
  document.addEventListener('DOMContentLoaded', () => setTimeout(ligar, 2500));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { parado = false; ligar(); } });
  MC.aovivo = { ligar, parar, ligado: () => !!(ws && ws.readyState === 1) };
})(window.MC);
