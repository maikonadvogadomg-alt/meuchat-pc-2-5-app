/* Meu Chat — 11-online.js · ☁️ MODO ONLINE (IGUAL À REPLIT) (19/11)
   Antes: cada aparelho guardava uma CÓPIA de todas as conversas (o app crescia e a nuvem
   gastava baixando tudo). AGORA, com a conta do Supabase ligada:
   • a lista de conversas vem da nuvem só com o NOME (leve);
   • a conversa só é lida quando você abre;
   • cada mudança vai direto para a nuvem — nada de "enviar e puxar".
   No aparelho fica só: fotos (pesadas demais para a nuvem grátis) e o que você fez SEM internet
   (sobe sozinho quando a internet volta). Desligar: ⚙️ → ☁️ Nuvem → "Modo online". */
(function (MC) {
  'use strict';
  const L = MC.banco; // o banco do aparelho (IndexedDB)
  const local = { todas: L.todas.bind(L), pegar: L.pegar.bind(L), salvar: L.salvar.bind(L), apagar: L.apagar.bind(L) };
  MC.bancoLocal = local;
  const temFotos = (c) => (c.msgs || []).some((m) => m.fotos && m.fotos.length);
  const semFotos = (c) => Object.assign({}, c, { nMsgs: (c.msgs || []).length, msgs: (c.msgs || []).map((m) => (m.fotos && m.fotos.length ? Object.assign({}, m, { fotos: [], fotosNoAparelho: m.fotos.length }) : m)) });
  function ligado() {
    const N = MC.nuvem;
    try { return !!(N && N.rest && MC.pref.get('online', true) && N.logado() && !N.ehNeon()); } catch (e) { return false; }
  }
  const T = 'mc_itens';
  const enc = encodeURIComponent;
  function guardarSemInternet(c, apagado) {
    // sem internet (ou a nuvem falhou): guarda aqui e marca para subir depois — nada se perde
    const p = MC.pref.get('online:pendentes', {}); p[c.id || c] = Date.now(); MC.pref.set('online:pendentes', p);
    MC.aviso('📴 Sem conexão com a nuvem: guardei neste aparelho. Sobe sozinho quando a internet voltar.');
    return apagado ? local.apagar(c) : local.salvar(c);
  }
  async function subirPendentes() {
    if (!ligado() || !navigator.onLine) return;
    const p = MC.pref.get('online:pendentes', {}); const ids = Object.keys(p); if (!ids.length) return;
    let n = 0;
    for (const id of ids) {
      try {
        const c = await local.pegar(id);
        await MC.nuvem.rest('POST', T + '?on_conflict=user_id,tipo,id', [c ? { tipo: 'conversa', id, dados: semFotos(c), apagado: false, atualizado: c.atualizado || Date.now() } : { tipo: 'conversa', id, dados: null, apagado: true, atualizado: Date.now() }], 'resolution=merge-duplicates,return=minimal');
        delete p[id]; n++; if (c && !temFotos(c)) await local.apagar(id);
      } catch (e) { break; }
    }
    MC.pref.set('online:pendentes', p); if (n) MC.aviso('☁️ ' + n + ' conversa(s) feitas sem internet subiram para a nuvem.', 'ok');
  }
  MC.banco = Object.assign(MC.banco, {
    async todas(completas) {
      if (!ligado()) return local.todas();
      try {
        if (completas) { const l = await MC.nuvem.rest('GET', T + '?select=dados&tipo=eq.conversa&apagado=eq.false&order=atualizado.desc&limit=1000'); return (l || []).map((r) => r.dados).filter(Boolean); }
        const l = await MC.nuvem.rest('GET', T + '?select=id,atualizado,titulo:dados->>titulo,n:dados->>nMsgs&tipo=eq.conversa&apagado=eq.false&order=atualizado.desc&limit=300');
        const nuvem = (l || []).map((r) => ({ id: r.id, titulo: r.titulo || 'Conversa', atualizado: +r.atualizado, nMsgs: +r.n || 0, msgs: [], soNome: true }));
        const ids = new Set(nuvem.map((c) => c.id)); const pend = MC.pref.get('online:pendentes', {});
        for (const c of await local.todas()) if (pend[c.id] && !ids.has(c.id)) nuvem.unshift(c); // feitas sem internet
        return nuvem;
      } catch (e) { return local.todas(); }
    },
    async pegar(id) {
      if (!ligado()) return local.pegar(id);
      try {
        const l = await MC.nuvem.rest('GET', T + '?select=dados&tipo=eq.conversa&apagado=eq.false&id=eq.' + enc(id) + '&limit=1');
        const d = l && l[0] && l[0].dados; const aqui = await local.pegar(id);
        if (!d) return aqui;
        if (aqui && (aqui.atualizado || 0) > (d.atualizado || 0)) return aqui; // a daqui é mais nova (feita sem internet)
        if (aqui) { const f = new Map((aqui.msgs || []).filter((m) => m.fotos && m.fotos.length).map((m) => [m.quando, m.fotos])); d.msgs = (d.msgs || []).map((m) => (m.fotosNoAparelho && f.has(m.quando) ? Object.assign({}, m, { fotos: f.get(m.quando) }) : m)); }
        return d;
      } catch (e) { return local.pegar(id); }
    },
    async salvar(c) {
      c.atualizado = c.atualizado || Date.now();
      if (!ligado()) return local.salvar(c);
      if (temFotos(c)) await local.salvar(c); // as fotos ficam só aqui
      try { await MC.nuvem.rest('POST', T + '?on_conflict=user_id,tipo,id', [{ tipo: 'conversa', id: c.id, dados: semFotos(c), apagado: false, atualizado: c.atualizado }], 'resolution=merge-duplicates,return=minimal'); }
      catch (e) { return guardarSemInternet(c); }
    },
    async apagar(id) {
      if (!ligado()) return local.apagar(id);
      try { await MC.nuvem.rest('POST', T + '?on_conflict=user_id,tipo,id', [{ tipo: 'conversa', id, dados: null, apagado: true, atualizado: Date.now() }], 'resolution=merge-duplicates,return=minimal'); await local.apagar(id); }
      catch (e) { return guardarSemInternet(id, true); }
    },
  });

  // 🧹 LIBERAR ESPAÇO: sobe o que falta e tira do aparelho as cópias que já estão na nuvem.
  // Antes de tirar, baixa um backup completo (com as fotos) — regra: nunca apagar sem cópia.
  async function liberar() {
    if (!ligado()) throw new Error('Entre na conta do Supabase (com o Modo online ligado) primeiro.');
    const aqui = await local.todas(); if (!aqui.length) return MC.aviso('O aparelho já está leve: nenhuma cópia de conversa aqui.', 'ok');
    const resp = prompt('Vou: 1) baixar um backup completo (com fotos), 2) mandar para a nuvem o que faltar, 3) tirar deste aparelho as ' + aqui.length + ' cópia(s) de conversa que ficarem iguais na nuvem.\n\nAs conversas com FOTO ficam aqui (as fotos não vão para a nuvem).\n\nPara continuar, escreva CONFIRMO:');
    if (String(resp || '').trim().toUpperCase() !== 'CONFIRMO') return MC.aviso('Cancelado. Nada foi tirado.');
    await MC.backup.baixar(false);
    const l = await MC.nuvem.rest('GET', T + '?select=id,atualizado&tipo=eq.conversa&limit=5000'); const na = new Map((l || []).map((r) => [r.id, +r.atualizado]));
    let subiu = 0, tirou = 0, ficou = 0;
    for (const c of aqui) {
      if (!na.has(c.id) || (c.atualizado || 0) > na.get(c.id)) { await MC.nuvem.rest('POST', T + '?on_conflict=user_id,tipo,id', [{ tipo: 'conversa', id: c.id, dados: semFotos(c), apagado: false, atualizado: c.atualizado || Date.now() }], 'resolution=merge-duplicates,return=minimal'); subiu++; }
      if (temFotos(c)) { ficou++; continue; }
      await local.apagar(c.id); tirou++;
    }
    const p = MC.pref.get('online:pendentes', {}); aqui.forEach((c) => delete p[c.id]); MC.pref.set('online:pendentes', p);
    MC.aviso('🧹 Pronto: ' + subiu + ' subiram, ' + tirou + ' cópia(s) tiradas do aparelho' + (ficou ? ', ' + ficou + ' com foto ficaram' : '') + '. O backup baixado é a sua garantia — guarde no HD.', 'ok');
    if (MC.chat && MC.chat.recarregar) MC.chat.recarregar();
  }
  async function ocupa() {
    try { const e = await navigator.storage.estimate(); return (e.usage / 1048576).toFixed(1) + ' MB'; } catch (e) { return '?'; }
  }
  // 🧪 20/11: os CÓDIGOS do playground também ficam SÓ na nuvem (antes ficava uma cópia de todos no aparelho).
  // Ficam na memória do app enquanto ele está aberto (não no armazenamento do celular).
  const kv0 = L.kv.bind(L), kvSet0 = L.kvSet.bind(L);
  let cods = null, codsHora = 0;
  async function codsDaNuvem(forcar) {
    if (cods && !forcar && Date.now() - codsHora < 10 * 60 * 1000) return cods;
    const l = await MC.nuvem.rest('GET', T + '?select=id,dados&tipo=eq.codigo&apagado=eq.false&limit=5000');
    const m = {}; (l || []).forEach((r) => { if (r.dados) m[r.id] = r.dados; });
    cods = m; codsHora = Date.now(); return cods;
  }
  L.kv = async function (k, d) {
    if (k !== 'codigos' || !ligado()) return kv0(k, d);
    try { return Object.assign({}, await codsDaNuvem()); } catch (e) { return kv0(k, d); }
  };
  L.kvSet = async function (k, v) {
    if (k !== 'codigos' || !ligado()) return kvSet0(k, v);
    try {
      const antes = await codsDaNuvem(); const novo = v || {}; const linhas = []; const ag = Date.now();
      for (const [id, c] of Object.entries(novo)) if (!antes[id] || JSON.stringify(antes[id]) !== JSON.stringify(c)) linhas.push({ tipo: 'codigo', id, dados: c, apagado: false, atualizado: ag });
      for (const id of Object.keys(antes)) if (!novo[id]) linhas.push({ tipo: 'codigo', id, dados: null, apagado: true, atualizado: ag });
      for (let i = 0; i < linhas.length; i += 50) await MC.nuvem.rest('POST', T + '?on_conflict=user_id,tipo,id', linhas.slice(i, i + 50), 'resolution=merge-duplicates,return=minimal');
      cods = Object.assign({}, novo); codsHora = Date.now();
    } catch (e) { MC.aviso('📴 Sem conexão com a nuvem: o código ficou guardado neste aparelho.'); return kvSet0(k, v); }
  };
  // ao entrar: o que ficou de cópia ANTIGA no aparelho (conversas sem foto e códigos) e JÁ ESTÁ IGUAL na nuvem
  // sai do aparelho sozinho. O que não está na nuvem SOBE primeiro. Nada se perde: a nuvem é a cópia.
  async function enxugar() {
    if (!ligado()) return;
    let subiu = 0, tirou = 0;
    try {
      const velhos = (await kv0('codigos', {})) || {}; const ids = Object.keys(velhos);
      if (ids.length) {
        const na = await codsDaNuvem(true); const faltam = ids.filter((id) => !na[id]).map((id) => ({ tipo: 'codigo', id, dados: velhos[id], apagado: false, atualizado: Date.now() }));
        for (let i = 0; i < faltam.length; i += 50) await MC.nuvem.rest('POST', T + '?on_conflict=user_id,tipo,id', faltam.slice(i, i + 50), 'resolution=merge-duplicates,return=minimal');
        subiu += faltam.length; faltam.forEach((x) => { na[x.id] = x.dados; });
        await kvSet0('codigos', {}); tirou += ids.length;
      }
      const aqui = await local.todas(); const pend = MC.pref.get('online:pendentes', {});
      if (aqui.length) {
        const l = await MC.nuvem.rest('GET', T + '?select=id,atualizado&tipo=eq.conversa&limit=5000'); const na = new Map((l || []).map((r) => [r.id, +r.atualizado]));
        for (const c of aqui) {
          if (pend[c.id] || temFotos(c)) continue;
          if (!na.has(c.id) || (c.atualizado || 0) > na.get(c.id)) { await MC.nuvem.rest('POST', T + '?on_conflict=user_id,tipo,id', [{ tipo: 'conversa', id: c.id, dados: semFotos(c), apagado: false, atualizado: c.atualizado || Date.now() }], 'resolution=merge-duplicates,return=minimal'); subiu++; }
          await local.apagar(c.id); tirou++;
        }
      }
    } catch (e) { return; } // sem internet: tenta na próxima vez
    if (tirou) MC.aviso('☁️ Tirei do aparelho ' + tirou + ' cópia(s) antiga(s) que já estavam na nuvem' + (subiu ? ' (' + subiu + ' subiram antes)' : '') + '. Agora fica tudo só lá.', 'ok');
  }
  MC.on && MC.on('nuvem-entrou', () => setTimeout(enxugar, 1500));
  document.addEventListener('DOMContentLoaded', () => setTimeout(enxugar, 6000));

  window.addEventListener('online', () => subirPendentes());
  document.addEventListener('DOMContentLoaded', () => setTimeout(subirPendentes, 3000));
  MC.online = { ligado, liberar, ocupa, subirPendentes, enxugar, codsDaNuvem, esquecerCodigos: () => { cods = null; } };
})(window.MC);
