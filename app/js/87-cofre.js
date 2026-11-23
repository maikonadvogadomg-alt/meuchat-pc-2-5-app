/* Meu Chat — 87-cofre.js: 🔐 Cofre de chaves.
   Mostra cada chave guardada (👁 ver, 📋 copiar) e leva SÓ as chaves para outro app/aparelho
   num arquivo trancado com senha — o mesmo arquivo do Mini SK (js/lib/cofre-arquivo.js). */
(function (MC) {
  'use strict';
  const E = MC.esc;
  let abertas = {};

  async function todas() {
    const P = MC.ia.P, out = [];
    (await MC.ia.chaves()).filter((c) => !c.automatica && c.chave).forEach((c) => out.push({ grupo: '🤖', nome: c.apelido || (P[c.provedor] || {}).nome || c.provedor, valor: c.chave }));
    const bc = await MC.banco.kv('buscaChave', ''); if (bc) out.push({ grupo: '🔎', nome: 'Pesquisa (' + (MC.pref.get('buscaTipo', '') || '?') + ')', valor: bc });
    const gh = await MC.banco.kv('ghToken', ''); if (gh) out.push({ grupo: '🐙', nome: 'GitHub (token)', valor: gh });
    const ex = await MC.banco.kv('expoToken', ''); if (ex) out.push({ grupo: '☁️', nome: 'Expo (token)', valor: ex });
    ((await MC.banco.kv('cofreOutras', [])) || []).forEach((x) => out.push({ grupo: '🤖', nome: (x.apelido || x.provedor) + ' (veio de outro app)', valor: x.chave }));
    ((await MC.banco.kv('minhasChaves', [])) || []).forEach((x, j) => out.push({ grupo: '📌', nome: x.nome, valor: x.valor, minha: j }));
    return out;
  }

  async function pintar() {
    const el = MC.$('#cartao-cofre'); if (!el) return;
    const l = await todas(), m = window.CofreArquivo ? CofreArquivo.mascara : (v) => '••••••';
    el.innerHTML = '<h3>🔐 Cofre de chaves e senhas</h3><p class="pequeno"><b>Guarde aqui</b> (e não na conversa) as chaves, senhas e tokens que você precisa lembrar. Na nuvem elas vão <b>trancadas</b> com a sua senha do login: nem o Supabase consegue ler.</p>' +
      '<div class="linha"><button class="bt primario" id="cofre-novo">➕ Guardar uma senha ou chave</button><button class="bt" id="cofre-nuvem">☁️ Mandar o cofre trancado para a nuvem</button></div>' +
      '<p class="mudo pequeno">Todas as chaves guardadas aqui. 👁 mostra, 📋 copia. Para levar para outro app ou aparelho (Mini SK, outro celular, o PC): <b>⬇ Baixar só as chaves</b> — fica trancado com uma senha sua — e lá use <b>⬆ Trazer chaves</b>. Assim não precisa passar pelo WhatsApp.</p>' +
      '<div class="linha"><button class="bt primario" id="cofre-baixar">⬇ Baixar só as chaves</button><button class="bt" id="cofre-trazer">⬆ Trazer chaves</button><input type="file" id="cofre-arq" accept=".json,application/json" hidden></div>' +
      (l.length ? l.map((x, i) => '<div class="chave" data-ci="' + i + '"><div style="flex:1;min-width:0"><b>' + x.grupo + ' ' + E(x.nome) + '</b><div class="pequeno mudo" style="font-family:monospace;word-break:break-all">' + E(abertas[i] ? x.valor : m(x.valor)) + '</div></div><button class="ic" data-cc="ver" title="Mostrar">👁</button><button class="ic" data-cc="copiar" title="Copiar">📋</button>' + (x.minha != null ? '<button class="ic" data-cc="tirar" title="Tirar do cofre">🗑</button>' : '') + '</div>').join('') : '<p class="pequeno mudo">Nenhuma chave guardada ainda.</p>') +
      '<div id="cofre-status" class="pequeno"></div>';
    el.onclick = async (e) => {
      const b = e.target.closest('button'); if (!b) return;
      try {
        if (b.id === 'cofre-baixar') return await baixar();
        if (b.id === 'cofre-trazer') return MC.$('#cofre-arq').click();
        if (b.id === 'cofre-novo') { const nome = prompt('Nome (ex.: Senha do Supabase, Token do GitHub):'); if (!nome) return; const valor = prompt('Cole a senha ou a chave:'); if (!valor) return; await guardar(nome, valor); return mandarNuvem(true); }
        if (b.id === 'cofre-nuvem') return mandarNuvem(false);
        const row = b.closest('[data-ci]'); if (!row) return; const i = +row.dataset.ci, lista = await todas();
        if (b.dataset.cc === 'ver') { abertas[i] = !abertas[i]; pintar(); }
        if (b.dataset.cc === 'copiar') MC.copiar(lista[i].valor);
        if (b.dataset.cc === 'tirar' && lista[i].minha != null) { if (!confirm('Tirar "' + lista[i].nome + '" do cofre?')) return; const ex = (await MC.banco.kv('minhasChaves', [])) || []; ex.splice(lista[i].minha, 1); await MC.banco.kvSet('minhasChaves', ex); abertas = {}; pintar(); status('🗑 Tirei do cofre deste aparelho. Toque em ☁️ Mandar o cofre para tirar da nuvem também.'); }
      } catch (er) { status('⚠ ' + er.message); }
    };
    MC.$('#cofre-arq').onchange = (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) trazer(f).catch((er) => status('⚠ ' + er.message)); };
  }
  // 📌 guardar uma coisa no cofre (usado também pelo chat, quando você cola uma chave secreta)
  async function guardar(nome, valor) {
    const ex = (await MC.banco.kv('minhasChaves', [])) || [];
    if (!ex.some((x) => x.valor === valor)) ex.push({ nome: String(nome).trim() || 'Sem nome', valor: String(valor), quando: Date.now() });
    await MC.banco.kvSet('minhasChaves', ex); if (MC.$('#cartao-cofre')) pintar();
  }
  // ☁️ tranca tudo com a senha do LOGIN (ela não fica guardada) e manda para a nuvem
  async function mandarNuvem(depoisDeGuardar) {
    if (!MC.nuvem || !MC.nuvem.logado() || MC.nuvem.ehNeon()) { status(depoisDeGuardar ? '🔐 Guardado neste aparelho. (Entre na nuvem para ele ir para os outros aparelhos.)' : 'Entre com o seu e-mail e senha primeiro.'); return; }
    const senha = prompt((depoisDeGuardar ? '🔐 Guardado aqui.\n\n' : '') + 'Para mandar o cofre para a nuvem TRANCADO, digite a sua senha do login (ela não fica guardada).\nCancelar = fica só neste aparelho.'); if (!senha) { status('🔐 Ficou só neste aparelho.'); return; }
    status('⏳ Trancando e mandando…'); try { const r = await MC.nuvem.chavesComLogin(senha); status(r || '🔐 Pronto.'); MC.aviso(r || '🔐 Pronto.', 'ok'); } catch (e) { status('⚠ ' + e.message); } pintar();
  }
  const status = (t) => { const s = MC.$('#cofre-status'); if (s) s.textContent = t; };

  async function conteudo() {
    return {
      ia: (await MC.ia.chaves()).filter((c) => !c.automatica && c.chave).map((c) => ({ provedor: c.provedor, chave: c.chave, modelo: c.modelo || '', base: c.base || '', apelido: c.apelido || '' }))
        .concat((await MC.banco.kv('cofreOutras', [])) || []),
      github: await MC.banco.kv('ghToken', ''), expo: await MC.banco.kv('expoToken', ''),
      busca: { tipo: MC.pref.get('buscaTipo', ''), chave: await MC.banco.kv('buscaChave', '') },
      extras: (await MC.banco.kv('minhasChaves', [])) || [],
      neon: MC.pref.get('nuvem:neon', ''), // 17/11: o endereço do Neon também vai no cofre (TRANCADO com a sua senha)
    };
  }
  async function baixar() {
    const c = await conteudo();
    if (CofreArquivo.contar(c) === 'nenhuma') throw new Error('Não há nenhuma chave guardada para baixar.');
    const s1 = prompt('Crie uma senha para trancar o arquivo (vai precisar dela para trazer as chaves; anote num lugar seguro):'); if (!s1) return;
    const s2 = prompt('Repita a senha:'); if (s2 == null) return;
    if (s1 !== s2) throw new Error('As senhas não são iguais.');
    const texto = await CofreArquivo.selar(c, s1, 'Meu Chat');
    MC.baixar('chaves-do-maikon-' + new Date().toISOString().slice(0, 10) + '.json', texto, 'application/json');
    status('🔐 Baixei só as chaves (' + CofreArquivo.contar(c) + '), trancadas com a sua senha.');
  }
  async function trazer(arq) {
    const senha = prompt('Senha do arquivo de chaves:'); if (senha == null) return;
    return trazerTexto(await arq.text(), senha);
  }
  // 🔐 usado pelo ☁️ Nuvem também: o texto vem TRANCADO com a senha (a nuvem nunca vê as chaves abertas)
  async function selarTexto(senha) { return CofreArquivo.selar(await conteudo(), senha, 'Meu Chat'); }
  async function trazerTexto(texto, senha) {
    const d = await CofreArquivo.abrir(texto, senha);
    const P = MC.ia.P;
    const lista = (await MC.ia.chaves()).filter((c) => !c.automatica), ja = new Set(lista.map((c) => c.chave));
    const outras = (await MC.banco.kv('cofreOutras', [])) || [], jaO = new Set(outras.map((x) => x.chave));
    let n = 0;
    for (const x of d.ia) {
      if (!x.chave || ja.has(x.chave) || jaO.has(x.chave)) continue;
      if (P[x.provedor] && x.provedor !== 'ollama') { lista.push({ id: MC.uid(), provedor: x.provedor, chave: x.chave, apelido: x.apelido || P[x.provedor].nome, modelo: x.modelo || undefined }); ja.add(x.chave); }
      else { outras.push(x); jaO.add(x.chave); }   // IA que o Meu Chat ainda não usa: fica guardada para ir junto no próximo arquivo
      n++;
    }
    await MC.ia.salvarChaves(lista);
    await MC.banco.kvSet('cofreOutras', outras);
    if (lista.length && !MC.pref.get('chaveAtiva', '')) MC.pref.set('chaveAtiva', lista[0].id);
    if (d.github && !(await MC.banco.kv('ghToken', ''))) { await MC.banco.kvSet('ghToken', d.github); n++; }
    if (d.expo && !(await MC.banco.kv('expoToken', ''))) { await MC.banco.kvSet('expoToken', d.expo); n++; }
    if (d.busca && d.busca.chave && !(await MC.banco.kv('buscaChave', ''))) { await MC.banco.kvSet('buscaChave', d.busca.chave); if (d.busca.tipo) MC.pref.set('buscaTipo', d.busca.tipo); n++; }
    const ex = (await MC.banco.kv('minhasChaves', [])) || [], jaE = new Set(ex.map((x) => x.nome + '\u0000' + x.valor));
    (d.extras || []).forEach((x) => { if (x && x.valor && !jaE.has(x.nome + '\u0000' + x.valor)) { ex.push({ nome: x.nome, valor: x.valor }); n++; } });
    await MC.banco.kvSet('minhasChaves', ex);
    if (d.neon && !MC.pref.get('nuvem:neon', '')) { MC.pref.set('nuvem:neon', d.neon); MC.pref.set('nuvem:neonOk', true); n++; }
    if (MC.config) await MC.config.pintar();
    status(n ? '⬆ Trouxe ' + n + ' chave(s) novas (as que já estavam aqui não foram repetidas).' : 'Todas as chaves desse arquivo já estavam aqui.');
    MC.aviso(n ? '🔐 ' + n + ' chave(s) trazida(s)' : 'Nada novo no arquivo', 'ok');
  }

  document.addEventListener('DOMContentLoaded', () => { const b = document.getElementById('bt-cofre'); if (b) b.onclick = () => MC.cofre.abrir(); });
  setTimeout(() => { const b = document.getElementById('bt-cofre'); if (b && !b.onclick) b.onclick = () => MC.cofre.abrir(); }, 0);
  MC.cofre = { guardar, mandarNuvem, abrir: async () => { if (MC.config && MC.config.abrir) await MC.config.abrir(); setTimeout(() => { const c = MC.$('#cartao-cofre'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300); }, pintar, baixar, trazer, todas, selarTexto, trazerTexto, conteudo };
})(window.MC);
