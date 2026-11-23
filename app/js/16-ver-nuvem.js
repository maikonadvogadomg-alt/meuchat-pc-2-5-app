/* Meu Chat — 16-ver-nuvem.js · 📊 VER A NUVEM (20/11)
   Uma janela para CONFERIR o que está guardado no Supabase, sem ir no site:
   • o esquema (as colunas da tabela mc_itens);
   • quantas coisas tem de cada tipo (conversa, código, memória, configurações, cofre, jurídico);
   • as últimas coisas guardadas — toque numa para ver o conteúdo.
   • quanto ESTE aparelho está ocupando (para ver que não cresce).
   Só LÊ: não muda nem apaga nada. Chaves secretas aparecem tapadas. */
(function (MC) {
  'use strict';
  const E = MC.esc, T = 'mc_itens';
  const NOMES = { conversa: '💬 Conversas', codigo: '🧪 Códigos', memoria: '🧠 Memória', prefs: '⚙️ Configurações', cofre: '🔐 Cofre (trancado)' };
  const nomeTipo = (t) => NOMES[t] || (String(t).startsWith('jur:') ? '⚖️ Jurídico — ' + t.slice(4) : t);
  const data = (n) => { try { return new Date(+n).toLocaleString('pt-BR'); } catch (e) { return ''; } };
  async function abrir() {
    if (!MC.nuvem || !MC.nuvem.logado() || MC.nuvem.ehNeon()) return MC.aviso('Entre com o seu e-mail e senha primeiro.');
    let w = MC.$('#ver-nuvem'); if (w) w.remove();
    w = document.createElement('div'); w.id = 'ver-nuvem'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true');
    w.style.cssText = 'position:fixed;inset:0;z-index:8500;background:var(--bg);color:var(--tx);overflow:auto;padding:14px 16px 40px';
    w.innerHTML = '<div style="max-width:760px;margin:0 auto"><div style="display:flex;align-items:center;gap:8px"><h2 style="margin:0;flex:1">📊 O que está na nuvem</h2><button class="ic" data-v="fechar" aria-label="Fechar" style="width:40px;height:40px;font-size:20px">✕</button></div>' +
      '<p class="pequeno mudo">Conta: <b>' + E((MC.nuvem.sessao() || {}).email || '') + '</b> · Supabase: ' + E(MC.nuvem.config().url.replace('https://', '')) + ' · Só leitura: aqui nada é mudado.</p>' +
      '<div id="vn-corpo">⏳ Perguntando para a nuvem…</div></div>';
    document.body.appendChild(w);
    w.addEventListener('click', clique);
    await resumo();
  }
  async function resumo() {
    const el = MC.$('#vn-corpo'); if (!el) return;
    try {
      const todos = (await MC.nuvem.rest('GET', T + '?select=tipo&apagado=eq.false&limit=50000')) || [];
      const cont = {}; todos.forEach((r) => { cont[r.tipo] = (cont[r.tipo] || 0) + 1; });
      const ultimos = (await MC.nuvem.rest('GET', T + '?select=tipo,id,atualizado,titulo:dados->>titulo,nome:dados->>nome&apagado=eq.false&order=atualizado.desc&limit=40')) || [];
      const ocupa = MC.online ? await MC.online.ocupa() : '?';
      const aovivo = MC.aovivo && MC.aovivo.ligado();
      el.innerHTML =
        '<div class="cartao"><h3>✅ A tabela existe e o seu login lê ela</h3>' +
        '<p class="pequeno">Total guardado na nuvem: <b>' + todos.length + '</b> item(ns). Este aparelho ocupa <b>' + E(ocupa) + '</b> (é o app + fotos; as conversas e os códigos ficam lá).</p>' +
        '<p class="pequeno">⚡ Ao vivo (aparece no outro aparelho na hora): ' + (aovivo ? '<b>ligado</b>' : '<b>desligado</b> — rode no Supabase, uma vez: <code>alter publication supabase_realtime add table public.mc_itens;</code> <button class="bt" data-v="copiar-rt">📋 Copiar</button>') + '</p></div>' +
        '<div class="cartao"><h3>Quanto tem de cada tipo</h3>' + (Object.keys(cont).length ? '<table style="width:100%;border-collapse:collapse">' + Object.entries(cont).sort((a, b) => b[1] - a[1]).map(([t, n]) => '<tr style="border-bottom:1px solid var(--li)"><td style="padding:6px 0"><button class="ent-link" style="background:none;border:0;color:var(--pri);text-decoration:underline;font:inherit;cursor:pointer;padding:0" data-v="tipo" data-t="' + E(t) + '">' + E(nomeTipo(t)) + '</button></td><td style="text-align:right"><b>' + n + '</b></td></tr>').join('') + '</table>' : '<p class="pequeno mudo">A nuvem está vazia para esta conta.</p>') + '</div>' +
        '<div class="cartao"><h3 id="vn-lista-tit">As últimas 40 coisas guardadas</h3><div id="vn-lista">' + linhas(ultimos) + '</div></div>' +
        '<div class="cartao"><h3>📐 O esquema (as colunas da tabela mc_itens)</h3><table class="pequeno" style="width:100%;border-collapse:collapse">' +
        [['user_id', 'de quem é (o seu login) — cada um só vê o seu'], ['tipo', 'a "gaveta": conversa, codigo, memoria, prefs, cofre, jur:…'], ['id', 'o nome/número da coisa dentro da gaveta'], ['dados', 'o conteúdo (jsonb)'], ['apagado', 'se foi apagada (fica marcada, não some de vez)'], ['atualizado', 'quando mudou pela última vez']].map(([c, d]) => '<tr style="border-bottom:1px solid var(--li)"><td style="padding:5px 8px 5px 0"><code>' + c + '</code></td><td>' + d + '</td></tr>').join('') + '</table></div>';
    } catch (e) {
      el.innerHTML = '<div class="cartao"><h3>⚠ ' + E(e.message) + '</h3>' + (/tabela ainda não existe/i.test(e.message) ? '<button class="bt primario" data-v="criar">🛠 Criar a tabela (abre o SQL Editor)</button>' : '') + '</div>';
    }
  }
  function linhas(l) {
    if (!l.length) return '<p class="pequeno mudo">Nada aqui.</p>';
    return l.map((r) => '<div class="chave" style="cursor:pointer" data-v="ver" data-t="' + E(r.tipo) + '" data-id="' + E(r.id) + '"><div style="flex:1;min-width:0"><b>' + E(nomeTipo(r.tipo)) + '</b> · ' + E(String(r.titulo || r.nome || r.id).slice(0, 80)) + '<div class="pequeno mudo">' + data(r.atualizado) + '</div></div><span>👁</span></div>').join('');
  }
  async function clique(e) {
    const b = e.target.closest('[data-v]'); if (!b) return; const v = b.dataset.v;
    try {
      if (v === 'fechar') return MC.$('#ver-nuvem').remove();
      if (v === 'copiar-rt') return MC.copiar('alter publication supabase_realtime add table public.mc_itens;');
      if (v === 'criar') return MC.nuvem.conferirTabela();
      if (v === 'tipo') {
        const l = (await MC.nuvem.rest('GET', T + '?select=tipo,id,atualizado,titulo:dados->>titulo,nome:dados->>nome&apagado=eq.false&tipo=eq.' + encodeURIComponent(b.dataset.t) + '&order=atualizado.desc&limit=200')) || [];
        MC.$('#vn-lista-tit').textContent = nomeTipo(b.dataset.t) + ' — ' + l.length + (l.length === 200 ? '+ (mostrando 200)' : '');
        MC.$('#vn-lista').innerHTML = linhas(l); MC.$('#vn-lista-tit').scrollIntoView({ behavior: 'smooth' }); return;
      }
      if (v === 'ver') {
        const l = await MC.nuvem.rest('GET', T + '?select=dados&tipo=eq.' + encodeURIComponent(b.dataset.t) + '&id=eq.' + encodeURIComponent(b.dataset.id) + '&limit=1');
        let txt = JSON.stringify(l && l[0] && l[0].dados, null, 2) || '(vazio)';
        if (window.Segredos) txt = Segredos.tampar(txt);
        const kb = (new Blob([txt]).size / 1024).toFixed(1);
        const pre = document.createElement('div'); pre.className = 'cartao';
        pre.innerHTML = '<h3>' + E(nomeTipo(b.dataset.t)) + ' · ' + E(b.dataset.id) + ' <span class="pequeno mudo">(' + kb + ' KB)</span></h3><pre style="white-space:pre-wrap;word-break:break-word;max-height:60vh;overflow:auto;font-size:12px">' + E(txt.slice(0, 200000)) + '</pre>';
        const velho = MC.$('#vn-conteudo'); if (velho) velho.remove(); pre.id = 'vn-conteudo';
        b.after(pre); return;
      }
    } catch (er) { MC.aviso('⚠ ' + er.message, 'erro'); }
  }
  MC.verNuvem = { abrir };
})(window.MC);
