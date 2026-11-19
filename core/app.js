(function(){
"use strict";
/* Tudo o que muda de uma unidade para outra vem de unidades/<nome>.js (window.UNIDADE).
   Este arquivo é o mesmo para todas as unidades: corrigir ou melhorar aqui vale para todas. */
const UNIDADES = window.UNIDADES;                     // todas as unidades (unidades/unidades.js)
const U = UNIDADES[window.UNIDADE_ID];                // a unidade desta página
const pronta = u => !!(u && u.supabaseUrl && u.supabaseKey);
const CONVITE = /type=(invite|recovery)/.test(location.hash);   // chegou pelo link do convite ou de "esqueci a senha"
const DIAS = ["domingo","segunda","terça","quarta","quinta","sexta","sábado"];
const CULTOS = U.cultos.map((c,i)=>({...c, color:c.color||`var(--s${i+1})`}));
const CMAP = Object.fromEntries(CULTOS.map(c=>[c.id,c]));
const EQUIPES_PADRAO = U.equipes || [];
const FAIXAS = U.faixas;                 // grupos que somam o auditório (ex.: adultos, jovens, adolescentes, crianças)
const fid = k => "i-"+k.toLowerCase();
// Capacidade do auditório: a geral (Configurações) ou a do próprio culto, quando ele acontece em outro lugar (ex.: Ekklesia ADL no templo da CDC)
const capAudDe = id => (CMAP[id]&&CMAP[id].capAud) || config.capAud;
const localDe = id => (CMAP[id]&&CMAP[id].local) || "Auditório";
const temCap = () => config.capAud||config.capCdc||config.capCarros||config.capMotos||CULTOS.some(c=>c.capAud);
const FIM_DE_SEMANA = CULTOS.every(c=>c.dow===6||c.dow===0);
const INICIO = U.inicioSemana!=null ? U.inicioSemana : (FIM_DE_SEMANA?6:1);   // dia que abre o período
const DUR = FIM_DE_SEMANA && INICIO===6 ? 1 : 6;
const PER = FIM_DE_SEMANA ? "Fim de semana" : "Semana";
const PER_MIN = PER.toLowerCase();
const hmin = c => { const m=String(c.hora||"").match(/(\d{1,2})(?:[:h](\d{2}))?/); return m? (+m[1])*60+(+(m[2]||0)) : 0; };

const $ = id => document.getElementById(id);
const fmt = n => (Number(n)||0).toLocaleString("pt-BR");
const fmt1 = n => (Math.round((Number(n)||0)*10)/10).toLocaleString("pt-BR",{maximumFractionDigits:1});
const p2 = n => String(Number(n)||0).padStart(2,"0");
const toInt = v => { const n = parseInt(v,10); return isFinite(n) && n>0 ? n : 0; };
const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
document.title = "Presença de Culto "+U.nomeCompleto;
document.body.insertAdjacentHTML("afterbegin", `<header class="band">
  <div class="band-in">
    <div class="brand">
      <span class="word" id="wordmark"><img src="data:image/webp;base64,UklGRmIHAABXRUJQVlA4WAoAAAAQAAAA/wAAPQAAQUxQSIgGAAAB8IcA1OtE/v8dLpcQQghBgkiQMI0ukleTKUGyXaaR7X13+mzfMCVs77vTi7i9SRh6H0S2r8j2FRFxuwSRaYQwSAhBQricP3LPec7zXMur/REREwDT9QPofmHadp7A/1sWu8uezv3z1UHEpumatfy9S1gbn66lkZy2tf+/r+i6zh/m1oS/O/rQHDPCDTPCtlmhaGNoovPVzYj4PWHf0YuImKqJIyL2bfLraUqf/LWCiOiMfJJpFvKFXUNu9vKO/jIiYqmv/VpLxQ67vkMlwqSPssLuPmLWhre6v5qr1JT5ZBRrC9/sSlpEMOwa0HVPDl05iIXHbLHgll9Rceghn4DvKrrvAAD7sQvIHn3I5g2i+FiQ+ADdL7jc8RPWpnj2mn7kj2b8NavR3YlrmdOLJA9xKC5jp6+i4IVb1MJIZgHmDqLyYBOrKIcziPMEAkCsB915yd9R/cJqAEgTmNJxRwmlsPqYxNwBFD4e1JAYQ8Hyas/E8yjg60DZfZYZzyBXCfEttVQJxYcaxeJFFK0u98iMPApEvkHpw5YJO1APHla5x0GNuUah08MoXJrrCes7FIgMofx7BqRRFx7g3eag1uE6GQfFf7K8sAkFggOos1/bjY7CP2uiDg/v4yweR81fWSI67/FCTsDqRjOlInnklrPXguvSj0qs8hwqPIrcX19tmxsJzrj25X4OZjRUv3jujhtveyh7hfUnMaahUY3vtgX5o0d3bNm243TemMPIdDrqgRneVWXgJ9QhZPYlgZkcYFTmSzkdDeBu31dgYKvbhnbXAepwO/kMaHDyw0018yuc6gdxIBPHzViMzEsJUIznGB8Ri5H5sgVsu4PC80LFa4Eb/ZXR7ka2U3FQV/rhofkWuHcjs38hsBcPm/AZY6gelCN9bsNtQPYwHgLlHRS2iFQTwI8Vqd89MpgEZgKZR32gGOrRF0f6Uj0IRv5ExPJTPiD/jvQeEOymDom8AKpPUBjyxD4buKcZpy1QDnyj7S3KSYBocwWPNwLzPep3WyJaJiohgbxfKVCiFnvhOWBHHGrID4J1lzRZBaoDhFsTwLUKVApE9xB4j8AuUO+m7vDAJ8Bfh3QcRJdrWoxkKSKl+E8kcyA7izossFjgKWqTBxYqnKYOgXCvngz1ERj5BLVHCAaInFrFFriPSpvXA4pXqH9KpfScpBJmdFLXS+0jMKw0BIJtHtqiEEFyBKT9ZS2DRMVnRg91aVR4jIorfSKR9FBCoYU6JAY9Wq4SfWBmjtK/UunsxBJVWE1l5N7SQncZcsmcu5SyE4tf4QHqPrmnjMgaUjRnzcQGimuolFzaiNOG5M15YFK6Ry6jpUR8Y8ioOcsnk1uotNw+Lb8TJcuMH8xpmkwS1DtyXVq6CWw24yj1VlrzbTCZRKlBMaug5VVqlxnPURkwdHKAqwTOkGpFLTdSV/xGXE8NTCk+oXZJHdbjLxO4Tao+wgqME7h0KrGFKjXINDl64DhVnCFTny9lfAw4Tf1gTSFiFJ4Usb5DTddT2OeTsHsQ8c8bGbdQ+JTI/OMp771KJQ2CHgrTEgdQFwxR2OVTsw6j69kYYY1Qzj0CjSOI3bO89hSVMSnFcDaovYz6bmPgN1GV8BdIjj/iBusoxOcsleYRRMTKq35vPUDlAgZZ/RRiR4AXPo4GwDcMzK+xWLddQWYfYQ0wsP96VujlCrqPrPTUYgp/SJgDrRwcWeengukCGjG/wkD89bEGt8hDg8huJaC5wkD8c8fKKABYsVs+KiG33kuBKoU49l33+fM9p20D4B0OYvH0ltXJ5C1PdY2jshQ8wkIcn1NTV0T+68B8jOU6VqyiYha8BF9xyBkmBIZYOsWgk4epmjjyP7M40KGkPuD31n3egFhey4g+X5eunwLAtjo1/RoBb/ly3oCmgobutD7wndbTGwLV17X0NYDHIOl4A5ouiPUGTABrj45OP6gvL8h1+sFzsMHxBjR8I/RJCIwAWHlFqrgGROvecmRybaDoEbj+gjfA2jYuUHnOAlMgfKAq4WQbQHrGgTG1wTU2qAYc4h2JFmqTGvgf6WfVEceJshhAQ3tZoXp8FgDABirJOExUOACxfWMqpQ8Wgk67rb2vShU/e24hSC5MuockoCXpmrAFACCyfMuej7LZ9tcfaQWyLuk+RwNAcM3pAjH+1bYouNqJpOtiYIaT7nN5AL6V7wxU/lnTWBnO3hYE/Vbj0rZU6tqWCEwl65e2pZa3xsBQVlA4ILQAAABwCgCdASoAAT4APlEmkEWjoiGQhew4BQS0t3BgO/yBhgPwARMgBHhcVyA5I+kaRTTTquijSYbbtYZV9Kj1Wei0thjmGYVvXgz44hCAAsaDSAlyZj0XeS7UydnWCAD96AAJr9UD8VClvKxH2gVPHMaYZ4DFkLschD05GBiGIbFt5YehJErQPCSIMmcYrs+K1sMrHREES9/yrNaK4KDFVFbOr0NcJfABDnSsbsMo9rAysIAAAAA=" alt="central"></span><span class="unit">${esc(U.nome)} · Presença de culto</span>
      <span class="tag">${esc(U.lema||"")}</span>
    </div>
    <nav class="tabs" role="tablist">
      <button class="tab" role="tab" id="tab-painel" data-view="painel" aria-selected="true">Painel</button>
      <button class="tab edit-only" role="tab" id="tab-lancar" data-view="lancar" aria-selected="false">Lançar culto</button>
      <button class="tab" role="tab" id="tab-historico" data-view="historico" aria-selected="false">Histórico</button>
      <span style="margin-left:auto"></span>
      <button class="tab lock" type="button" id="b-lock">Entrar para editar</button>
    </nav>
    <div class="savebar" id="savebar"></div>
    <div class="backupbar edit-only" id="backupbar" hidden><span id="backup-txt"></span><button type="button" id="b-backup-top">Fazer backup agora</button></div>
  </div>
</header>

<div class="modal" id="modal" hidden>
  <form class="modal-box" id="lock-form" novalidate>
    <h2 id="lock-title">Entrar para editar</h2>
    <p class="sub" id="lock-sub">Só os e-mails autorizados conseguem lançar, editar ou excluir cultos.</p>
    <label class="f" for="lock-unidade" id="lock-lu">Unidade<select id="lock-unidade">${Object.values(UNIDADES).map(u=>`<option value="${u.id}"${u.id===U.id?" selected":""}${pronta(u)?"":" disabled"}>${esc(u.nomeCompleto)}${pronta(u)?"":" (em breve)"}</option>`).join("")}</select></label>
    <label class="f" for="lock-email" id="lock-le">Seu e-mail<input type="email" id="lock-email" autocomplete="email" placeholder="seu e-mail autorizado"></label>
    <label class="f" for="lock-p1">Senha<input type="password" id="lock-p1" autocomplete="off"></label>
    <label class="f" for="lock-p2" id="lock-l2">Repita a nova senha<input type="password" id="lock-p2" autocomplete="off"></label>
    <div class="status err" id="lock-st"></div>
    <div class="btns"><button type="submit" class="btn" id="lock-ok">Entrar</button><button type="button" class="btn ghost" id="lock-cancel">Cancelar</button></div>
    <button type="button" id="lock-esqueci" style="margin-top:12px;border:0;background:none;padding:0;color:var(--muted);text-decoration:underline;cursor:pointer;font-size:13px">Esqueci minha senha</button>
  </form>
</div>
<main>
  <div class="notice" id="conn" hidden></div>

  <!-- PAINEL -->
  <section class="view on" id="view-painel">
    <div class="head" style="margin:0">
      <div>
        <h1 style="font-size:26px;font-weight:900" id="wk-title">Último ${PER_MIN}</h1>
        <div class="sub" style="color:var(--muted)" id="wk-sub">Carregando dados…</div>
      </div>
      <div class="filters">
        <div class="seg" id="f-periodo" aria-label="Período">
          <button data-v="3" aria-pressed="true">3 meses</button>
          <button data-v="6" aria-pressed="false">6 meses</button>
          <button data-v="12" aria-pressed="false">12 meses</button>
          <button data-v="0" aria-pressed="false">Tudo</button>
          <button data-v="-1" aria-pressed="false">Datas</button>
        </div>
        <div class="cal" id="f-range" hidden></div>
        <div class="seg" id="f-culto" aria-label="Culto"></div>
        <button type="button" class="btn ghost small no-print" id="b-print">Imprimir / salvar PDF</button>
      </div>
    </div>

    <div class="alerts" id="alerts"></div>

    <div class="tiles" id="tiles"></div>

    <div class="grid2">
      <div class="card">
        <div class="head">
          <div><h2>Resumo do mês</h2><div class="sub">Todos os cultos do mês, comparados ao mês anterior e ao mesmo mês do ano passado</div></div>
          <div class="btns" style="align-items:center"><select class="msel" id="m-sel" aria-label="Mês"></select><button type="button" class="btn ghost small" id="b-mcopy">Copiar resumo para WhatsApp</button></div>
        </div>
        <div id="m-body"></div>
      </div>
      <div class="card">
        <div class="head"><div><h2>Lotação</h2><div class="sub" id="occ-sub">Último ${PER_MIN}, em relação à capacidade</div></div></div>
        <div class="occ" id="occ"></div>
      </div>
    </div>

    <div class="grid2">
      <div class="card">
        <div class="head"><div><h2>Total geral por ${PER_MIN}</h2><div class="sub">Auditório + voluntários + pastores + Central da Criança, por culto</div></div></div>
        <div class="chart" id="ch-total"></div>
        <div class="legend" id="lg-total"></div>
        <div class="evlist" id="ev-list"></div>
      </div>
      <div class="card">
        <div class="head"><div><h2>Voluntários por equipe</h2><div class="sub" id="vol-sub">Média por culto no período</div></div></div>
        <div class="bars" id="ch-vol"></div>
      </div>
    </div>

    <div class="card">
      <div class="head"><div><h2>Comparativo entre cultos</h2><div class="sub" id="cmp-sub">Médias por culto no período; visitantes e decisões somados</div></div></div>
      <div class="tbl-wrap"><table id="tb-cmp"></table></div>
    </div>
  </section>

  <!-- LANÇAR -->
  <section class="view" id="view-lancar">
    <form class="form" id="frm" novalidate>
      <div class="fields">
        <div class="card paste">
          <div class="head"><div><h2>Colar mensagem do WhatsApp</h2><div class="sub">Recebeu o relatório no WhatsApp? Copie a mensagem inteira, cole aqui e clique em Preencher campos. Pode colar vários relatórios de uma vez (por exemplo, o histórico das últimas semanas) ou abrir a conversa exportada do WhatsApp.</div></div></div>
          <label class="f" for="i-paste" style="color:var(--muted)">Mensagem<textarea id="i-paste" rows="4" placeholder="Culto: Domingo 17:00h&#10;*Data: 15/11&#10;Auditório:= 239&#10;Adultos = 230 …"></textarea></label>
          <div class="btns" style="margin-top:10px"><button type="button" class="btn" id="b-parse">Preencher campos</button><button type="button" class="btn ghost" id="b-paste-clear">Limpar</button><button type="button" class="btn ghost" id="b-paste-file">Abrir conversa exportada (.txt)</button><input type="file" id="f-paste" accept=".txt,text/plain" hidden></div>
          <div class="notice" id="paste-msg" hidden style="margin-top:10px"></div>
          <div class="lote" id="lote" hidden></div>
        </div>
        <div class="card">
          <div class="head"><div><h2>Culto</h2><div class="sub">Pode lançar datas passadas. Se já houver lançamento para o mesmo culto e data, ele abre para edição.</div></div></div>
          <div class="row">
            <label class="f" for="i-data">Data<input type="date" id="i-data" required></label>
            <label class="f" for="i-culto">Culto<select id="i-culto"></select></label>
            <label class="f" for="i-evento">Evento especial (opcional)<input type="text" id="i-evento" list="eventos" placeholder="Ex.: Santa Ceia"></label>
            <datalist id="eventos"><option value="Santa Ceia"></option><option value="Batismo"></option><option value="Culto especial"></option><option value="Feriado"></option><option value="Apresentação de crianças"></option><option value="Conferência"></option><option value="Culto de família"></option></datalist>
          </div>
          <div class="notice" id="frm-warn" hidden style="margin-top:12px"></div>
        </div>

        <div class="card">
          <div class="head"><div><h2>Auditório</h2></div></div>
          <div class="row">
            ${FAIXAS.map(f=>`<label class="f" for="${fid(f.key)}">${esc(f.label)}<input type="number" min="0" inputmode="numeric" id="${fid(f.key)}">${f.dica?`<span style="font-weight:400;font-size:12px">${esc(f.dica)}</span>`:""}</label>`).join("")}
            <label class="f">Total auditório<div class="calc num m-aud" id="c-aud">0</div></label>
          </div>
        </div>

        <div class="card">
          <div class="head">
            <div><h2>Voluntários</h2><div class="sub">As equipes mudam de culto para culto: renomeie, inclua ou remova à vontade.</div></div>
            <button type="button" class="btn ghost small" id="add-team">+ Adicionar equipe</button>
          </div>
          <div class="teams" id="teams"></div>
          <div class="notice" id="ess-warn" hidden style="margin-top:10px"></div>
          <div class="row" style="margin-top:14px">
            <label class="f" for="i-pastores">Pastores<input type="number" min="0" inputmode="numeric" id="i-pastores"></label>
            <label class="f">Total de voluntários<div class="calc num m-vol" id="c-vol">0</div></label>
          </div>
        </div>

        <div class="card">
          <div class="head"><div><h2>Central da Criança</h2></div></div>
          <div class="row">
            <label class="f" for="i-vltcdc">VLT CDC<input type="number" min="0" inputmode="numeric" id="i-vltcdc"></label>
            <label class="f" for="i-criancascdc">Crianças<input type="number" min="0" inputmode="numeric" id="i-criancascdc"></label>
            <label class="f">Total CDC<div class="calc num m-cdc" id="c-cdc">0</div></label>
          </div>
        </div>

        <div class="card">
          <div class="head"><div><h2>Indicadores e estacionamento</h2><div class="sub">Visitantes já estão contados no auditório. Nada aqui entra nos totais.</div></div></div>
          <div class="row">
            <label class="f" for="i-visitantes">Visitantes<input type="number" min="0" inputmode="numeric" id="i-visitantes"></label>
            <label class="f" for="i-decisoes">Decisões por Cristo<input type="number" min="0" inputmode="numeric" id="i-decisoes"></label>
            <label class="f" for="i-carros">Carros<input type="number" min="0" inputmode="numeric" id="i-carros"></label>
            <label class="f" for="i-motos">Motos<input type="number" min="0" inputmode="numeric" id="i-motos"></label>
          </div>
          <label class="f" for="i-obs" style="margin-top:12px">Observações<textarea id="i-obs" rows="2"></textarea></label>
        </div>

        <div class="card">
          <div class="head"><div><h2>Configurações</h2><div class="sub">Valem para todos os cultos. Usadas na lotação do painel e no alerta de equipes essenciais.</div></div></div>
          <div class="row">
            <label class="f" for="c-capaud">Capacidade do auditório<input type="number" min="0" inputmode="numeric" id="c-capaud">${CULTOS.filter(c=>c.capAud).map(c=>`<span style="font-weight:400;font-size:12px">${esc(c.label)}: ${fmt(c.capAud)} lugares (${esc(c.local||"local próprio")})</span>`).join("")}</label>
            <label class="f" for="c-capcdc">Capacidade da CDC<input type="number" min="0" inputmode="numeric" id="c-capcdc"></label>
            <label class="f" for="c-capcar">Vagas de carro<input type="number" min="0" inputmode="numeric" id="c-capcar"></label>
            <label class="f" for="c-capmoto">Vagas de moto<input type="number" min="0" inputmode="numeric" id="c-capmoto"></label>
          </div>
          <label class="f" for="c-ess" style="margin-top:12px">Equipes essenciais (separe por vírgula)<input type="text" id="c-ess"></label>
          <div class="btns" style="margin-top:12px"><button type="button" class="btn ghost" id="b-cfg">Salvar configurações</button><span class="status" id="cfg-st"></span></div>
        </div>
      </div>

      <aside class="summary">
        <div class="card">
          <h2>Resumo do culto</h2>
          <div class="sub" id="s-head">Preencha os números</div>
          <div class="sumlist num" style="margin-top:10px">
            <div class="m-aud"><span>Auditório <small style="color:var(--muted);font-weight:400" id="s-audcri"></small></span><b class="cv" id="s-aud">0</b></div>
            <div class="m-vol"><span>Voluntários</span><b class="cv" id="s-vol">0</b></div>
            <div><span>Pastores</span><b id="s-pas">0</b></div>
            <div class="mid"><span>Total participantes</span><span id="s-part">0</span></div>
            <div class="m-cdc"><span>Central da Criança <small style="color:var(--muted);font-weight:400" id="s-cdcdet"></small></span><b class="cv" id="s-cdc">0</b></div>
            <div class="big"><span>Total geral</span><span id="s-geral">0</span></div>
          </div>
          <div class="sumlist num" style="margin-top:4px">
            <div class="m-vis"><span>Visitantes</span><b class="cv" id="s-vis">0</b></div>
            <div class="m-dec"><span>Decisões por Cristo</span><b class="cv" id="s-dec">0</b></div>
          </div>
        </div>
        <div class="btns">
          <button type="submit" class="btn" id="b-save">Salvar lançamento</button>
          <button type="button" class="btn ghost" id="b-copy">Copiar texto do WhatsApp</button>
          <button type="button" class="btn ghost" id="b-new">Novo lançamento</button>
          <button type="button" class="btn ghost small" id="b-pass">Trocar senha</button>
        </div>
        <div class="status" id="st" role="status"></div>
      </aside>
    </form>
  </section>

  <!-- HISTÓRICO -->
  <section class="view" id="view-historico">
    <div class="card">
      <div class="head"><div><h2>Lançamentos</h2><div class="sub" id="h-sub">Todos os cultos lançados, do mais recente ao mais antigo</div></div><span class="btns"><button type="button" class="btn ghost small" id="b-tsv">Copiar tabela para Google Sheets / Excel</button><button type="button" class="btn small" id="b-backup">Fazer backup</button><button type="button" class="btn ghost small edit-only" id="b-import">Importar backup</button><input type="file" id="f-import" accept=".json,.html,.htm,application/json,text/html" hidden></span></div>
      <div class="tbl-wrap"><table id="tb-hist"></table></div>
    </div>
    <div class="card">
      <div class="head"><div><h2>Registro de alterações</h2><div class="sub" id="log-sub">Quem lançou, editou ou excluiu, e quando. Mais recentes primeiro.</div></div></div>
      <div class="tbl-wrap"><table id="tb-log"></table></div>
    </div>
  </section>
</main>`);
function parseDate(s){ const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); }
function isoDate(dt){ return dt.getFullYear()+"-"+p2(dt.getMonth()+1)+"-"+p2(dt.getDate()); }
function ddmm(s){ const d=parseDate(s); return p2(d.getDate())+"/"+p2(d.getMonth()+1); }
function ddmmyy(s){ const d=parseDate(s); return p2(d.getDate())+"/"+p2(d.getMonth()+1)+"/"+d.getFullYear(); }
function weekKey(s){ const d=parseDate(s); const back=(d.getDay()-INICIO+7)%7; d.setDate(d.getDate()-back); return isoDate(d); } // primeiro dia do período (sábado, no caso de fim de semana)
function weekLabel(k){ const s=parseDate(k); const e=new Date(s); e.setDate(e.getDate()+DUR); return p2(s.getDate())+(s.getMonth()!==e.getMonth()?"/"+p2(s.getMonth()+1):"")+"–"+p2(e.getDate())+"/"+p2(e.getMonth()+1); }

function totals(r){
  const vol = (r.voluntarios||[]).reduce((a,t)=>a+(Number(t.qtd)||0),0);
  const aud = FAIXAS.reduce((a,f)=>a+(Number(r[f.key])||0),0);
  const pas = Number(r.pastores)||0;
  const part = aud+vol+pas;
  const cdc = (Number(r.vltCdc)||0)+(Number(r.criancasCdc)||0);
  return {aud, vol, pas, part, cdc, geral: part+cdc};
}

/* ---------- Estado ---------- */
let rows = [], canWrite = true, loaded = false, savedAt = "", unlocked = false, usuario = "", log = [];
let config = {capAud:0, capCdc:0, capCarros:0, capMotos:0, essenciais:["Segurança","Enfermaria"]};
const MESES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const state = { periodo: 3, culto: "todos", dias: new Set(), calMes: "" };

/* ---------- Abas ---------- */
const VIEWS = ["painel","lancar","historico"];
function show(v){
  if(!VIEWS.includes(v)) v="painel";
  if(v==="lancar" && typeof unlocked!=="undefined" && !unlocked) v="painel";
  VIEWS.forEach(x=>{
    $("view-"+x).classList.toggle("on", x===v);
    $("tab-"+x).setAttribute("aria-selected", x===v?"true":"false");
  });
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{ location.hash = b.dataset.view; show(b.dataset.view); }));
window.addEventListener("hashchange",()=>show(location.hash.slice(1)));
show(location.hash.slice(1));

/* ---------- Filtros ---------- */
const fc = $("f-culto");
fc.innerHTML = `<button data-v="todos" aria-pressed="true">Todos</button>` + CULTOS.map(c=>`<button data-v="${c.id}" aria-pressed="false"><i class="dot" style="background:${c.color}"></i>${c.label}</button>`).join("");
function bindSeg(el,key,parse){
  el.addEventListener("click",e=>{
    const b=e.target.closest("button"); if(!b) return;
    el.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed", x===b?"true":"false"));
    state[key]=parse(b.dataset.v); renderDashboard();
  });
}
bindSeg($("f-periodo"),"periodo",Number);
/* Calendário: escolher uma ou várias datas para ver no painel */
$("f-periodo").addEventListener("click",()=>{ const on = state.periodo===-1; $("f-range").hidden=!on; if(on) renderCal(); });
function renderCal(){
  const box=$("f-range"); if(box.hidden) return;
  if(!state.calMes){ const ult=rows.reduce((m,r)=>r.data>m?r.data:m,""); state.calMes=(ult||isoDate(new Date())).slice(0,7); }
  const [y,m]=state.calMes.split("-").map(Number);
  const com=new Set(rows.filter(r=>state.culto==="todos"||r.culto===state.culto).map(r=>r.data));
  const ini=new Date(y,m-1,1), dias=new Date(y,m,0).getDate();
  let cel=""; for(let i=0;i<ini.getDay();i++) cel+=`<span></span>`;
  for(let d=1;d<=dias;d++){ const k=y+"-"+p2(m)+"-"+p2(d), sel=state.dias.has(k), tem=com.has(k);
    cel+=`<button type="button" data-d="${k}" class="${sel?"sel":""} ${tem?"tem":""}" aria-pressed="${sel}" title="${tem?"Tem culto lançado":"Sem culto lançado"}">${d}</button>`; }
  const n=state.dias.size;
  box.innerHTML=`<div class="cal-h"><button type="button" data-nav="-1" aria-label="Mês anterior">‹</button><b>${MESES[m-1]} ${y}</b><button type="button" data-nav="1" aria-label="Próximo mês">›</button></div>
  <div class="cal-g">${["D","S","T","Q","Q","S","S"].map(x=>`<i>${x}</i>`).join("")}${cel}</div>
  <div class="cal-f"><span>${n?`${n} data${n>1?"s":""} escolhida${n>1?"s":""}`:"Toque nas datas para ver no painel. Pode escolher várias."} · <span class="tem-l">●</span> tem culto</span>${n?`<button type="button" data-limpar="1">Limpar</button>`:""}</div>`;
}
$("f-range").addEventListener("click",e=>{
  const b=e.target.closest("button"); if(!b) return;
  if(b.dataset.nav){ const [y,m]=state.calMes.split("-").map(Number); const d=new Date(y,m-1+Number(b.dataset.nav),1); state.calMes=d.getFullYear()+"-"+p2(d.getMonth()+1); renderCal(); return; }
  if(b.dataset.limpar){ state.dias.clear(); }
  else if(b.dataset.d){ state.dias.has(b.dataset.d) ? state.dias.delete(b.dataset.d) : state.dias.add(b.dataset.d); }
  renderCal(); renderDashboard();
});
bindSeg(fc,"culto",String);

/* ---------- Painel ---------- */
function filtered(){
  let r = rows.slice();
  if(state.periodo===-1){ if(state.dias.size) r = r.filter(x=>state.dias.has(x.data)); }
  else if(state.periodo>0 && r.length){
    const last = r.reduce((m,x)=>x.data>m?x.data:m, r[0].data);
    const lim = parseDate(last); lim.setMonth(lim.getMonth()-state.periodo);
    r = r.filter(x=>parseDate(x.data)>lim);
  }
  if(state.culto!=="todos") r = r.filter(x=>x.culto===state.culto);
  return r;
}
function byWeek(list){
  const m = new Map();
  list.forEach(r=>{ const k=weekKey(r.data); if(!m.has(k)) m.set(k,[]); m.get(k).push(r); });
  return [...m.entries()].sort((a,b)=>a[0]<b[0]?-1:1);
}
function sumWeek(list){
  const o={geral:0,aud:0,fx:{},cdc:0,cdcCri:0,cdcVlt:0,vol:0,pas:0,vis:0,dec:0,n:list.length};
  FAIXAS.forEach(f=>o.fx[f.key]=0);
  list.forEach(r=>{ const t=totals(r); o.geral+=t.geral; o.aud+=t.aud; FAIXAS.forEach(f=>o.fx[f.key]+=Number(r[f.key])||0); o.cdc+=t.cdc; o.cdcCri+=Number(r.criancasCdc)||0; o.cdcVlt+=Number(r.vltCdc)||0; o.vol+=t.vol; o.pas+=t.pas; o.vis+=Number(r.visitantes)||0; o.dec+=Number(r.decisoes)||0; });
  return o;
}
function delta(cur,prev){
  if(prev===undefined) return "";
  if(prev==null) return `<span class="delta flat">sem ${PER_MIN} anterior</span>`;
  const d=cur-prev;
  if(d===0) return `<span class="delta flat">igual ao anterior</span>`;
  const pct = prev? ` (${d>0?"+":""}${Math.round(d/prev*100)}%)` : "";
  return `<span class="delta ${d>0?"up":"down"}">${d>0?"▲ +":"▼ "}${fmt(d)}${pct} vs anterior</span>`;
}
function renderDashboard(){
  renderCal();
  const list = filtered();
  const weeks = byWeek(list);
  const tiles = $("tiles");
  if(!loaded){ return; }
  if(!rows.length){
    $("wk-title").textContent = "Nenhum culto lançado ainda";
    $("wk-sub").textContent = "Lance o primeiro culto para o painel ganhar vida.";
    tiles.innerHTML = `<div class="card empty" style="grid-column:1/-1">Ainda não há lançamentos. <a href="#lancar" class="edit-only" style="color:inherit;font-weight:700">Lançar culto</a></div>`;
    $("ch-total").innerHTML=""; $("lg-total").innerHTML=""; $("ch-vol").innerHTML=""; $("tb-cmp").innerHTML="";
    return;
  }
  if(!weeks.length){
    $("wk-title").textContent = "Sem lançamentos neste filtro";
    $("wk-sub").textContent = "Mude o período ou o culto.";
    tiles.innerHTML=""; $("ch-total").innerHTML=""; $("lg-total").innerHTML=""; $("ch-vol").innerHTML=""; $("tb-cmp").innerHTML="";
    return;
  }
  renderMes();
  const [lk, lrows] = weeks[weeks.length-1];
  const escolhidas = state.periodo===-1 && state.dias.size>0;   // datas do calendário: soma tudo o que foi escolhido
  const prev = escolhidas ? undefined : weeks.length>1 ? sumWeek(weeks[weeks.length-2][1]) : null;
  const cur = sumWeek(escolhidas ? list : lrows);
  const cultosNa = CULTOS.filter(c=>lrows.some(r=>r.culto===c.id)).map(c=>c.label);
  if(escolhidas){
    const ds=[...new Set(list.map(r=>r.data))].sort();
    $("wk-title").textContent = ds.length===1 ? "Dia "+ddmmyy(ds[0]) : ds.length+" datas escolhidas";
    $("wk-sub").textContent = `${cur.n} culto${cur.n===1?"":"s"}: ` + ds.map(ddmm).join(", ") + (ds.length<state.dias.size ? ` (${state.dias.size-ds.length} data${state.dias.size-ds.length>1?"s":""} sem culto lançado)` : "");
  } else {
  $("wk-title").textContent = PER+" " + weekLabel(lk);
  $("wk-sub").textContent = (state.culto==="todos" ? `${cur.n} de ${CULTOS.length} cultos lançados: ` : "") + cultosNa.join(", ");
  }
  const T = (lbl,val,d,hero,cls)=>`<div class="tile${hero?" hero":""} ${cls||""}"><span class="lbl">${lbl}</span><span class="val num">${fmt(val)}</span>${d}</div>`;
  tiles.innerHTML =
    T("Total geral",cur.geral,delta(cur.geral,prev&&prev.geral),true)+
    T("Auditório",cur.aud,`<span class="delta flat">${FAIXAS.map(f=>fmt(cur.fx[f.key])+" "+esc(f.curto)).join(" · ")}</span>`+delta(cur.aud,prev&&prev.aud),false,"m-aud")+
    T("Central da Criança",cur.cdc,`<span class="delta flat">${fmt(cur.cdcCri)} criança${cur.cdcCri===1?"":"s"} · ${fmt(cur.cdcVlt)} VLT CDC</span>`+delta(cur.cdc,prev&&prev.cdc),false,"m-cdc")+
    T("Voluntários",cur.vol,`<span class="delta flat">nas equipes · + ${fmt(cur.cdcVlt)} VLT CDC = ${fmt(cur.vol+cur.cdcVlt)} no total</span>`+delta(cur.vol,prev&&prev.vol),false,"m-vol")+
    T("Visitantes",cur.vis,delta(cur.vis,prev&&prev.vis),false,"m-vis")+
    T("Decisões por Cristo",cur.dec,delta(cur.dec,prev&&prev.dec),false,"m-dec");
  renderLine(weeks);
  renderAlerts(lk, lrows);
  renderOcc(lk, lrows);
  renderVol(list);
  renderCmp(list);
}

function pctCls(p){ return p>=95?"c":p>=80?"w":""; }
function renderAlerts(lk, lrows){
  const out=[];
  CULTOS.forEach(c=>{ const r=lrows.find(x=>x.culto===c.id); if(!r) return; const v=essVazias(r); if(v.length) out.push(`<div class="alert crit"><span><b>${c.label} (${ddmm(r.data)}):</b> ${esc(v.join(" e "))} ${v.length>1?"ficaram":"ficou"} sem voluntários.</span></div>`); });
  if(temCap()){
    lrows.forEach(r=>{ const t=totals(r); const it=[];
      const chk=(nome,v,cap)=>{ if(cap){ const p=Math.round(v/cap*100); if(p>=80) it.push(`${nome} ${p}%`); } };
      chk(localDe(r.culto).toLowerCase(),t.aud,capAudDe(r.culto)); chk("CDC",t.cdc,config.capCdc); chk("carros",Number(r.carros)||0,config.capCarros); chk("motos",Number(r.motos)||0,config.capMotos);
      if(it.length) out.push(`<div class="alert"><span><b>${CMAP[r.culto].label} (${ddmm(r.data)}):</b> lotação alta: ${it.join(", ")}.</span></div>`); });
  }
  $("alerts").innerHTML=out.join("");
}
function renderOcc(lk, lrows){
  const box=$("occ");
  if(!temCap()){ box.innerHTML=`<div class="empty" style="padding:12px;text-align:left">Informe as capacidades em <b>Lançar culto › Configurações</b> para ver a lotação de cada culto.</div>`; return; }
  $("occ-sub").textContent=`${PER} ${weekLabel(lk)}, em relação à capacidade`;
  const row=(nome,v,cap)=>{ if(!cap) return ""; const p=Math.round(v/cap*100); return `<div class="occ-r"><span>${nome}</span><span class="track"><span class="fill ${pctCls(p)}" style="display:block;width:${Math.min(100,p)}%"></span></span><span class="pct num">${fmt(v)} / ${fmt(cap)} · ${p}%</span></div>`; };
  box.innerHTML = CULTOS.map(c=>{ const r=lrows.find(x=>x.culto===c.id); if(!r) return ""; const t=totals(r);
    return `<div class="occ-c"><h3><i class="dot" style="background:${c.color}"></i>${c.label} · ${ddmm(r.data)}</h3>${row(localDe(c.id),t.aud,capAudDe(c.id))}${row("CDC",t.cdc,config.capCdc)}${row("Carros",Number(r.carros)||0,config.capCarros)}${row("Motos",Number(r.motos)||0,config.capMotos)}</div>`; }).join("") || `<div class="empty">Sem cultos no último ${PER_MIN}.</div>`;
}
/* ----- Resumo do mês ----- */
function mesKey(d){ return d.slice(0,7); }
function mesNome(k){ const [y,m]=k.split("-").map(Number); return MESES[m-1]+"/"+y; }
function mesAnterior(k,delta){ const [y,m]=k.split("-").map(Number); const d=new Date(y,m-1+delta,1); return d.getFullYear()+"-"+p2(d.getMonth()+1); }
function statsMes(k){
  const rs=rows.filter(r=>mesKey(r.data)===k); const s={n:rs.length,geral:0,vis:0,dec:0,vt:0,pub:0,best:null,porCulto:{}};
  rs.forEach(r=>{ const t=totals(r); s.geral+=t.geral; s.vis+=Number(r.visitantes)||0; s.dec+=Number(r.decisoes)||0; s.vt+=t.vol+(Number(r.vltCdc)||0); s.pub+=t.aud+(Number(r.criancasCdc)||0);
    if(!s.best||t.geral>s.best.g) s.best={g:t.geral,r};
    const pc=s.porCulto[r.culto]||(s.porCulto[r.culto]={n:0,g:0}); pc.n++; pc.g+=t.geral; });
  s.media = s.n? s.geral/s.n : 0; return s;
}
function varTxt(cur,prev){ if(!prev) return null; const p=Math.round((cur-prev)/prev*100); return (p>0?"+":"")+p+"%"; }
function renderMes(){
  const sel=$("m-sel"); const meses=[...new Set(rows.map(r=>mesKey(r.data)))].sort().reverse();
  if(!meses.length){ sel.innerHTML=""; $("m-body").innerHTML=`<div class="empty">Sem lançamentos.</div>`; return; }
  const atual = meses.includes(sel.value) ? sel.value : meses[0];
  sel.innerHTML = meses.map(k=>`<option value="${k}"${k===atual?" selected":""}>${mesNome(k)}</option>`).join("");
  const s=statsMes(atual), ant=statsMes(mesAnterior(atual,-1)), ano=statsMes(mesAnterior(atual,-12));
  const M=(k,v,d,cls)=>`<div class="mstat ${cls||""}"><div class="k">${k}</div><div class="v num">${v}</div>${d?`<div class="d">${d}</div>`:""}</div>`;
  let h=`<div class="mstats">`+
    M("Cultos lançados",fmt(s.n),"")+
    M("Total geral no mês",fmt(s.geral),"soma de todos os cultos")+
    M("Média por culto",fmt(Math.round(s.media)),"")+
    M("Visitantes",fmt(s.vis),"","m-vis")+
    M("Decisões por Cristo",fmt(s.dec),"","m-dec")+
    M("Voluntários por 100 pessoas",s.pub?fmt1(s.vt/s.pub*100):"—","","m-vol")+`</div>`;
  const cmp=[];
  if(s.best) cmp.push(`<span><b>Maior público:</b> ${CMAP[s.best.r.culto].label} de ${ddmm(s.best.r.data)}${s.best.r.evento?" ("+esc(s.best.r.evento)+")":""}, com ${fmt(s.best.g)} pessoas.</span>`);
  const v1=varTxt(s.media,ant.media), v2=varTxt(s.media,ano.media);
  cmp.push(`<span><b>Comparado a ${mesNome(mesAnterior(atual,-1))}:</b> ${v1?`média por culto ${v1} (${fmt(Math.round(ant.media))} → ${fmt(Math.round(s.media))})`:"sem lançamentos para comparar"}.</span>`);
  cmp.push(`<span><b>Comparado a ${mesNome(mesAnterior(atual,-12))}:</b> ${v2?`média por culto ${v2} (${fmt(Math.round(ano.media))} → ${fmt(Math.round(s.media))})`:"sem lançamentos para comparar"}.</span>`);
  h+=`<div class="cmpline">${cmp.join("")}</div>`;
  h+=`<table><thead><tr><th>Horário</th><th>Cultos</th><th>Média total geral</th></tr></thead><tbody>`+CULTOS.map(c=>{ const pc=s.porCulto[c.id]; return `<tr><td><span class="chip"><i class="dot" style="background:${c.color}"></i>${c.label}</span></td><td class="num">${pc?pc.n:0}</td><td class="num"><b>${pc?fmt(Math.round(pc.g/pc.n)):"—"}</b></td></tr>`; }).join("")+`</tbody></table>`;
  $("m-body").innerHTML=h;
}
function textoMes(){
  const k=$("m-sel").value; if(!k) return "";
  const s=statsMes(k), ant=statsMes(mesAnterior(k,-1)), ano=statsMes(mesAnterior(k,-12));
  const L=[`*Resumo de ${mesNome(k)} – ${U.nomeCompleto}*`,"",`Cultos lançados: ${s.n}`,`Total geral no mês: ${fmt(s.geral)} pessoas`,`Média por culto: ${fmt(Math.round(s.media))}`];
  if(s.best) L.push(`Maior público: ${CMAP[s.best.r.culto].label} (${ddmm(s.best.r.data)}${s.best.r.evento?", "+s.best.r.evento:""}) – ${fmt(s.best.g)}`);
  L.push(`Visitantes: ${fmt(s.vis)}`,`Decisões por Cristo: ${fmt(s.dec)}`,"","Média por horário:");
  CULTOS.forEach(c=>{ const pc=s.porCulto[c.id]; L.push(`• ${c.label}: ${pc?fmt(Math.round(pc.g/pc.n)):"—"}`); });
  const v1=varTxt(s.media,ant.media), v2=varTxt(s.media,ano.media);
  if(v1||v2) L.push("");
  if(v1) L.push(`Comparado a ${mesNome(mesAnterior(k,-1))}: média ${v1}`);
  if(v2) L.push(`Comparado a ${mesNome(mesAnterior(k,-12))}: média ${v2}`);
  return L.join("\n");
}
$("m-sel").addEventListener("change",renderMes);
$("b-mcopy").addEventListener("click",e=>copyText(textoMes(),e.currentTarget));
$("b-print").addEventListener("click",()=>{ location.hash="painel"; show("painel"); setTimeout(()=>window.print(),100); });

function renderLine(weeks){
  const host=$("ch-total");
  const series = (state.culto==="todos"?CULTOS:[CMAP[state.culto]]);
  const xs = weeks.map(w=>w[0]);
  const data = series.map(c=>({c, v: weeks.map(([,rs])=>{ const r=rs.find(x=>x.culto===c.id); return r? totals(r).geral : null; }), ev: weeks.map(([,rs])=>{ const r=rs.find(x=>x.culto===c.id); return r&&r.evento ? r.evento : ""; })}));
  const W=640,H=260,L=40,R=14,Tp=12,B=28;
  const all = data.flatMap(d=>d.v).filter(v=>v!=null);
  let max = Math.max(10,...all);
  const step = niceStep(max/4); max = Math.ceil(max/step)*step;
  const x = i => xs.length===1 ? L+(W-L-R)/2 : L + i*(W-L-R)/(xs.length-1);
  const y = v => Tp + (H-Tp-B)*(1-v/max);
  let g = `<g class="grid">`;
  for(let v=0; v<=max; v+=step){ g+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${fmt(v)}</text>`; }
  g+=`</g>`;
  const every = Math.max(1, Math.ceil(xs.length/8));
  let xl = xs.map((k,i)=> (i%every===0 || i===xs.length-1) ? `<text x="${x(i)}" y="${H-8}" text-anchor="middle">${ddmm(k)}</text>` : "").join("");
  let paths = data.map(d=>{
    let p="", started=false;
    d.v.forEach((v,i)=>{ if(v==null){started=false;return;} p+=(started?"L":"M")+x(i)+" "+y(v); started=true; });
    const pts = d.v.map((v,i)=> v==null?"":`<circle cx="${x(i)}" cy="${y(v)}" r="${i===d.v.length-1?4.5:3}" fill="${d.c.color}" stroke="var(--card)" stroke-width="2"/>`+(d.ev[i]?`<circle cx="${x(i)}" cy="${y(v)}" r="8" fill="none" stroke="var(--ink)" stroke-width="1.5"/>`:"")).join("");
    return `<path d="${p}" fill="none" stroke="${d.c.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>${pts}`;
  }).join("");
  // rótulo direto no último ponto
  const lastLbl = data.map(d=>{ const i=d.v.length-1; const v=d.v[i]; return v==null?"":{y:y(v),v,c:d.c}; }).filter(Boolean).sort((a,b)=>a.y-b.y);
  for(let i=1;i<lastLbl.length;i++){ if(lastLbl[i].y-lastLbl[i-1].y<16) lastLbl[i].y=lastLbl[i-1].y+16; }
  const lbls = lastLbl.map(o=>`<text x="${x(xs.length-1)+(xs.length===1?10:-8)}" y="${o.y-8}" text-anchor="${xs.length===1?"start":"end"}" style="fill:var(--ink);font-weight:700">${fmt(o.v)}</text>`).join("");
  host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Total geral por ${PER_MIN}">${g}${xl}<line id="xh" x1="0" x2="0" y1="${Tp}" y2="${H-B}" stroke="var(--muted)" stroke-dasharray="3 3" style="display:none"/>${paths}${lbls}<rect id="hit" x="${L}" y="0" width="${W-L-R}" height="${H}" fill="transparent"/></svg><div class="tip" id="tip"></div>`;
  $("lg-total").innerHTML = series.map(c=>`<span><i class="dot" style="background:${c.color}"></i>${c.label}</span>`).join("") + (data.some(d=>d.ev.some(Boolean))?`<span><svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>Culto com evento especial</span>`:"");
  const evs=[]; weeks.forEach(([,rs])=>rs.forEach(r=>{ if(r.evento && series.some(c=>c.id===r.culto)) evs.push(`${ddmm(r.data)} ${CMAP[r.culto].label}: ${r.evento}`); }));
  $("ev-list").textContent = evs.length ? "Eventos no período: " + evs.join(" · ") : "";
  const svg = host.querySelector("svg"), tip=$("tip"), xh=host.querySelector("#xh");
  function move(ev){
    const r = svg.getBoundingClientRect();
    const px = (ev.clientX - r.left) * W / r.width;
    let i = xs.length===1?0:Math.round((px-L)/((W-L-R)/(xs.length-1)));
    i = Math.max(0,Math.min(xs.length-1,i));
    xh.setAttribute("x1",x(i)); xh.setAttribute("x2",x(i)); xh.style.display="";
    const tot = data.reduce((a,d)=>a+(d.v[i]||0),0);
    tip.innerHTML = `<b>${PER} ${weekLabel(xs[i])}</b>` + data.map(d=>`<div class="r"><span><i class="dot" style="background:${d.c.color}"></i>${d.c.label}</span><b class="num" style="margin:0">${d.v[i]==null?"—":fmt(d.v[i])}</b></div>${d.ev[i]?`<div style="font-size:11.5px;color:var(--muted);margin:-2px 0 3px 15px">${esc(d.ev[i])}</div>`:""}`).join("") + (data.length>1?`<div class="r" style="border-top:1px solid var(--line);margin-top:4px;padding-top:4px"><span>Soma</span><b class="num" style="margin:0">${fmt(tot)}</b></div>`:"");
    tip.style.display="block";
    const left = x(i)*r.width/W;
    tip.style.left = Math.min(Math.max(0,left+12), r.width-tip.offsetWidth)+"px";
    tip.style.top = "10px";
  }
  const hit = host.querySelector("#hit");
  hit.addEventListener("pointermove",move);
  hit.addEventListener("pointerdown",move);
  hit.addEventListener("pointerleave",()=>{tip.style.display="none"; xh.style.display="none";});
}
function niceStep(raw){ const p=Math.pow(10,Math.floor(Math.log10(raw||1))); const n=raw/p; return (n<=1?1:n<=2?2:n<=5?5:10)*p; }

function renderVol(list){
  const m=new Map();
  list.forEach(r=>(r.voluntarios||[]).forEach(t=>{ const k=(t.equipe||"").trim()||"Sem nome"; m.set(k,(m.get(k)||0)+(Number(t.qtd)||0)); }));
  const n=list.length||1;
  const arr=[...m.entries()].map(([k,v])=>[k,v/n]).sort((a,b)=>b[1]-a[1]);
  const max=Math.max(1,...arr.map(a=>a[1]));
  $("vol-sub").textContent = `Média por culto em ${list.length} culto${list.length===1?"":"s"} do período`;
  $("ch-vol").innerHTML = arr.length ? arr.map(([k,v])=>`<div class="bar" title="${esc(k)}: ${fmt1(v)} por culto"><span class="name">${esc(k)}</span><span class="track"><span class="fill" style="display:block;width:${v/max*100}%"></span></span><span class="v num">${fmt1(v)}</span></div>`).join("") : `<div class="empty">Sem voluntários lançados</div>`;
}

function renderCmp(list){
  const cols = CULTOS.filter(c=>state.culto==="todos"||c.id===state.culto);
  const agg = cols.map(c=>{
    const rs=list.filter(r=>r.culto===c.id); const n=rs.length;
    const s={n,geral:0,aud:0,cdc:0,vol:0,vis:0,dec:0,car:0,mot:0,vt:0,pub:0,vcdc:0,ccdc:0};
    FAIXAS.forEach(f=>s["fx_"+f.key]=0);
    rs.forEach(r=>{const t=totals(r); FAIXAS.forEach(f=>s["fx_"+f.key]+=Number(r[f.key])||0); s.vcdc+=Number(r.vltCdc)||0; s.ccdc+=Number(r.criancasCdc)||0; s.vt+=t.vol+(Number(r.vltCdc)||0); s.pub+=t.aud+(Number(r.criancasCdc)||0); s.geral+=t.geral; s.aud+=t.aud; s.cdc+=t.cdc; s.vol+=t.vol; s.vis+=Number(r.visitantes)||0; s.dec+=Number(r.decisoes)||0; s.car+=Number(r.carros)||0; s.mot+=Number(r.motos)||0;});
    return {c,s};
  });
  const avg=(s,k)=> s.n? fmt1(s[k]/s.n) : "—";
  let h=`<thead><tr><th>Culto</th><th>Cultos lançados</th><th>Total geral (média)</th><th class="m-aud" style="color:var(--c)">Auditório (média)</th>${FAIXAS.map(f=>`<th class="m-aud" style="color:var(--c);font-weight:500">${esc(f.label)} (média)</th>`).join("")}<th class="m-cdc" style="color:var(--c)">CDC total (média)</th><th class="m-cdc" style="color:var(--c);font-weight:500">Crianças CDC (média)</th><th class="m-cdc" style="color:var(--c);font-weight:500">VLT CDC (média)</th><th class="m-cdc" style="color:var(--c);font-weight:500">Crianças por VLT CDC</th><th class="m-vol" style="color:var(--c)">Voluntários (média)</th><th class="m-vis" style="color:var(--c)">Visitantes (soma)</th><th class="m-dec" style="color:var(--c)">Decisões (soma)</th><th>Carros (média)</th><th>Motos (média)</th><th class="m-vol" style="color:var(--c)">Voluntários por 100 pessoas</th></tr></thead><tbody>`;
  agg.forEach(({c,s})=>{ h+=`<tr><td><span class="chip"><i class="dot" style="background:${c.color}"></i>${c.label}</span></td><td class="num">${s.n}</td><td class="num"><b class="tg">${avg(s,"geral")}</b></td><td class="num m-aud cv">${avg(s,"aud")}</td>${FAIXAS.map(f=>`<td class="num m-aud">${avg(s,"fx_"+f.key)}</td>`).join("")}<td class="num m-cdc cv">${avg(s,"cdc")}</td><td class="num m-cdc">${avg(s,"ccdc")}</td><td class="num m-cdc">${avg(s,"vcdc")}</td><td class="num m-cdc">${s.vcdc?fmt1(s.ccdc/s.vcdc):"—"}</td><td class="num m-vol cv">${avg(s,"vol")}</td><td class="num m-vis cv">${s.n?fmt(s.vis):"—"}</td><td class="num m-dec cv">${s.n?fmt(s.dec):"—"}</td><td class="num">${avg(s,"car")}</td><td class="num">${avg(s,"mot")}</td><td class="num m-vol cv">${s.pub?fmt1(s.vt/s.pub*100):"—"}</td></tr>`; });
  h+=`</tbody>`;
  $("tb-cmp").innerHTML=h;
}

/* ---------- Histórico ---------- */
function renderHist(){
  const t=$("tb-hist");
  if(!loaded){ t.innerHTML=`<tbody><tr><td class="empty">Carregando…</td></tr></tbody>`; return; }
  if(!rows.length){ t.innerHTML=`<tbody><tr><td class="empty">Nenhum lançamento ainda.</td></tr></tbody>`; return; }
  const rs = rows.slice().sort((a,b)=> a.data===b.data ? CULTOS.findIndex(c=>c.id===b.culto)-CULTOS.findIndex(c=>c.id===a.culto) : (a.data<b.data?1:-1));
  $("h-sub").textContent = `${rs.length} culto${rs.length===1?"":"s"} lançado${rs.length===1?"":"s"}, do mais recente ao mais antigo`;
  let h=`<thead><tr><th>Data</th><th>Culto</th><th class="m-aud" style="color:var(--c)">Auditório</th><th class="m-vol" style="color:var(--c)">Voluntários</th><th>Pastores</th><th>Participantes</th><th class="m-cdc" style="color:var(--c);font-weight:500">Crianças CDC</th><th class="m-cdc" style="color:var(--c);font-weight:500">VLT CDC</th><th class="m-cdc" style="color:var(--c)">CDC total</th><th>Total geral</th><th class="m-vis" style="color:var(--c)">Visitantes</th><th class="m-dec" style="color:var(--c)">Decisões</th><th>Última alteração</th><th></th></tr></thead><tbody>`;
  rs.forEach(r=>{ const x=totals(r); const c=CMAP[r.culto]||{label:r.culto,color:"var(--muted)"};
    h+=`<tr><td class="num">${ddmmyy(r.data)}</td><td><span class="chip"><i class="dot" style="background:${c.color}"></i>${c.label}</span>${r.evento?`<span class="evt">${esc(r.evento)}</span>`:""}</td><td class="num m-aud cv">${fmt(x.aud)}</td><td class="num m-vol cv">${fmt(x.vol)}</td><td class="num">${fmt(x.pas)}</td><td class="num">${fmt(x.part)}</td><td class="num m-cdc">${fmt(r.criancasCdc)}</td><td class="num m-cdc">${fmt(r.vltCdc)}</td><td class="num m-cdc cv">${fmt(x.cdc)}</td><td class="num"><b class="tg">${fmt(x.geral)}</b></td><td class="num m-vis cv">${fmt(r.visitantes)}</td><td class="num m-dec cv">${fmt(r.decisoes)}</td><td style="text-align:left;color:var(--muted);font-size:12.5px">${r.atualizadoPor?esc(r.atualizadoPor)+"<br>"+quando(r.atualizadoEm):"—"}</td>
    <td><span class="actions"><button class="btn ghost small edit-only" data-act="edit" data-id="${esc(r._id)}">Editar</button><button class="btn ghost small" data-act="copy" data-id="${esc(r._id)}">Copiar</button><button class="btn ghost small edit-only" data-act="del" data-id="${esc(r._id)}">Excluir</button></span></td></tr>`; });
  t.innerHTML=h+`</tbody>`;
  renderLog();
}
function quando(iso){ if(!iso) return ""; const d=new Date(iso); return d.toLocaleDateString("pt-BR")+" "+d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}); }
function renderLog(){
  const t=$("tb-log"); if(!t) return;
  if(!log.length){ t.innerHTML=`<tbody><tr><td class="empty">Nenhuma alteração registrada ainda.</td></tr></tbody>`; return; }
  const ls=log.slice().reverse();
  t.innerHTML=`<thead><tr><th>Quando</th><th style="text-align:left">Quem</th><th style="text-align:left">O que fez</th><th style="text-align:left">Culto</th></tr></thead><tbody>`+
    ls.map(e=>`<tr><td class="num">${quando(e.em)}</td><td style="text-align:left">${esc(e.por)}</td><td style="text-align:left">${esc(e.acao)}</td><td style="text-align:left">${e.data?esc((CMAP[e.culto]||{label:e.culto}).label+", "+ddmmyy(e.data)):"—"}${e.det?` <span style="color:var(--muted)">· ${esc(e.det)}</span>`:""}</td></tr>`).join("")+`</tbody>`;
}
async function registrar(acao, data, culto, det){
  try{ await sb.from("registro").insert({acao, data:data||null, culto:culto||null, det:det||null}); }catch(e){}
}
$("tb-hist").addEventListener("click", async e=>{
  const b=e.target.closest("button[data-act]"); if(!b) return;
  const r=rows.find(x=>x._id===b.dataset.id); if(!r) return;
  if(b.dataset.act==="edit"){ fillForm(r); location.hash="lancar"; show("lancar"); window.scrollTo(0,0); }
  if(b.dataset.act==="copy"){ copyText(whatsText(r), b); }
  if((b.dataset.act==="del"||b.dataset.act==="edit") && !unlocked){ openLock(); return; }
  if(b.dataset.act==="del"){
    if(b.dataset.confirm!=="1"){ b.dataset.confirm="1"; b.textContent="Confirmar exclusão"; b.classList.add("danger"); setTimeout(()=>{ if(b.isConnected){ b.dataset.confirm=""; b.textContent="Excluir"; b.classList.remove("danger"); } },4000); return; }
    b.disabled=true;
    const {error} = await sb.from("cultos").delete().eq("id", r._id);
    if(error){ b.disabled=false; b.textContent="Falhou"; return; }
    await carregar();
  }
});

$("b-tsv").addEventListener("click",e=>{
  const eqs=[...new Set(rows.flatMap(r=>(r.voluntarios||[]).map(t=>t.equipe)))];
  const head=["Data","Culto",...FAIXAS.map(f=>f.label),"Total auditório",...eqs.map(q=>"VLT "+q),"Total voluntários","Pastores","Total participantes","VLT CDC","Crianças CDC","Total CDC","Total geral","Visitantes","Decisões","Carros","Motos","Observações"];
  const lines=[head.join("\t")];
  rows.slice().sort((a,b)=>a.data<b.data?-1:a.data>b.data?1:0).forEach(r=>{ const t=totals(r); const vm=Object.fromEntries((r.voluntarios||[]).map(v=>[v.equipe,v.qtd]));
    lines.push([ddmmyy(r.data),(CMAP[r.culto]||{}).label||r.culto,...FAIXAS.map(f=>r[f.key]||0),t.aud,...eqs.map(q=>vm[q]??""),t.vol,t.pas,t.part,r.vltCdc||0,r.criancasCdc||0,t.cdc,t.geral,r.visitantes||0,r.decisoes||0,r.carros||0,r.motos||0,(r.obs||"").replace(/\s+/g," ")].join("\t")); });
  copyText(lines.join("\n"), e.currentTarget);
});

/* ---------- Formulário ---------- */
$("i-culto").innerHTML = CULTOS.map(c=>`<option value="${c.id}">${c.label}</option>`).join("");
const OUTROS = ["pastores","vltCdc","criancasCdc","visitantes","decisoes","carros","motos"];
const NUMS = [...FAIXAS.map(f=>f.key), ...OUTROS];
const FID = Object.fromEntries(NUMS.map(k=>[k,fid(k)]));
let editingId = null;

function teamRow(nome,qtd){
  const d=document.createElement("div"); d.className="team";
  const uid="t"+Math.random().toString(36).slice(2,8);
  d.innerHTML=`<input type="text" id="${uid}n" aria-label="Equipe" value="${esc(nome)}" placeholder="Nome da equipe"><input type="number" id="${uid}q" aria-label="Quantidade" min="0" inputmode="numeric" value="${qtd?qtd:""}" placeholder="0"><button type="button" class="x" aria-label="Remover equipe">×</button>`;
  return d;
}
function setTeams(list){ const box=$("teams"); box.innerHTML=""; list.forEach(t=>box.appendChild(teamRow(t.equipe,t.qtd))); recalc(); }
$("add-team").addEventListener("click",()=>{ const r=teamRow("",0); $("teams").appendChild(r); r.querySelector("input").focus(); });
$("teams").addEventListener("click",e=>{ if(e.target.classList.contains("x")){ e.target.parentElement.remove(); recalc(); } });

function readForm(){
  const r={ data:$("i-data").value, culto:$("i-culto").value };
  NUMS.forEach(k=>r[k]=toInt($(FID[k]).value));
  r.voluntarios=[...$("teams").querySelectorAll(".team")].map(d=>({equipe:d.querySelector('input[type="text"]').value.trim(), qtd:toInt(d.querySelector('input[type="number"]').value)})).filter(t=>t.equipe||t.qtd);
  r.obs=$("i-obs").value.trim();
  r.evento=$("i-evento").value.trim();
  return r;
}
function recalc(){
  const r=readForm(), t=totals(r);
  $("c-aud").textContent=fmt(t.aud); $("c-vol").textContent=fmt(t.vol); $("c-cdc").textContent=fmt(t.cdc);
  $("s-aud").textContent=fmt(t.aud); const sub=FAIXAS.slice(1).filter(f=>r[f.key]).map(f=>fmt(r[f.key])+" "+f.curto); $("s-audcri").textContent = sub.length ? `(${sub.join(", ")})` : ""; $("s-vol").textContent=fmt(t.vol); $("s-pas").textContent=fmt(t.pas);
  $("s-part").textContent=fmt(t.part); $("s-cdc").textContent=fmt(t.cdc); $("s-cdcdet").textContent=`(${fmt(r.criancasCdc)} crianças, ${fmt(r.vltCdc)} VLT)`; $("s-geral").textContent=fmt(t.geral);
  $("s-vis").textContent=fmt(r.visitantes); $("s-dec").textContent=fmt(r.decisoes);
  $("s-head").textContent = r.data ? `${CMAP[r.culto].label} · ${ddmmyy(r.data)}${r.evento?" · "+r.evento:""}` : "Escolha a data do culto";
  const vaz = essVazias(r); const w=$("ess-warn");
  w.textContent = vaz.length ? `Atenção: ${vaz.join(" e ")} ${vaz.length>1?"estão":"está"} sem voluntários neste culto.` : ""; w.hidden=!vaz.length;
}
function essVazias(r){
  const m=new Map((r.voluntarios||[]).map(t=>[norm(t.equipe||""),Number(t.qtd)||0]));
  return (config.essenciais||[]).filter(e=>e && !(m.get(norm(e))>0));
}
$("frm").addEventListener("input",recalc);

function lastTeams(){
  if(!rows.length) return EQUIPES_PADRAO.map(e=>({equipe:e,qtd:0}));
  const last=rows.slice().sort((a,b)=>a.data<b.data?1:-1)[0];
  const names=(last.voluntarios||[]).map(t=>t.equipe).filter(Boolean);
  return (names.length?names:EQUIPES_PADRAO).map(e=>({equipe:e,qtd:0}));
}
function blankForm(keepKey){
  NUMS.forEach(k=>$(FID[k]).value="");
  $("i-obs").value=""; $("i-evento").value="";
  setTeams(lastTeams());
  editingId=null;
  if(!keepKey){ // último dia que teve culto, até hoje
    const d=new Date(); for(let i=0;i<7 && !CULTOS.some(c=>c.dow===d.getDay());i++) d.setDate(d.getDate()-1);
    $("i-data").value=isoDate(d); $("i-culto").value=(CULTOS.find(c=>c.dow===d.getDay())||CULTOS[0]).id; }
  checkKey();
}
function fillForm(r){
  $("i-data").value=r.data; $("i-culto").value=r.culto;
  NUMS.forEach(k=>$(FID[k]).value = r[k]!=null&&r[k]!==0 ? r[k] : (r[k]===0?"0":""));
  $("i-obs").value=r.obs||""; $("i-evento").value=r.evento||"";
  setTeams((r.voluntarios&&r.voluntarios.length)?r.voluntarios:lastTeams());
  editingId=r._id;
  checkKey(true);
}
function docId(data,culto){ return data+"_"+culto; }
function checkKey(fromFill){
  const data=$("i-data").value, culto=$("i-culto").value, w=$("frm-warn");
  const msgs=[];
  if(data){
    const id=docId(data,culto);
    const ex=rows.find(x=>x._id===id);
    if(ex && editingId!==id && !fromFill){ fillForm(ex); return; }
    if(ex) msgs.push(`Você está editando o lançamento de ${CMAP[culto].label}, ${ddmmyy(data)}. Ao salvar, ele será substituído.`);
    const dow=parseDate(data).getDay();
    if(dow!==CMAP[culto].dow) msgs.push(`Atenção: ${ddmmyy(data)} não cai num(a) ${DIAS[CMAP[culto].dow]}. Confira a data ou o culto.`);
    if(data>isoDate(new Date())) msgs.push("Essa data está no futuro.");
  }
  if(!ex_check(data,culto) && editingId){ editingId=null; NUMS.forEach(k=>$(FID[k]).value=""); $("i-obs").value=""; setTeams(lastTeams()); }
  w.innerHTML=msgs.map(esc).join("<br>"); w.hidden=!msgs.length;
  $("b-save").textContent = rows.some(x=>x._id===docId(data,culto)) ? "Salvar alterações" : "Salvar lançamento";
  recalc();
}
function ex_check(data,culto){ return data && rows.some(x=>x._id===docId(data,culto)); }
$("i-data").addEventListener("change",()=>checkKey());
$("i-culto").addEventListener("change",()=>checkKey());
$("b-new").addEventListener("click",()=>{ blankForm(false); setStatus(""); });

function setStatus(t,cls){ const s=$("st"); s.textContent=t; s.className="status"+(cls?" "+cls:""); }

$("frm").addEventListener("submit", async e=>{
  e.preventDefault();
  if(!unlocked){ openLock(); return; }
  const r=readForm();
  if(!r.data){ setStatus("Escolha a data do culto.","err"); $("i-data").focus(); return; }
  const t=totals(r);
  const id=docId(r.data,r.culto);
  const b=$("b-save"); b.disabled=true; setStatus("Salvando…");
  try{
    await salvarCulto(r);
    editingId=id;
    await carregar();
    setStatus(`Salvo: ${CMAP[r.culto].label}, ${ddmmyy(r.data)} · total geral ${fmt(t.geral)}.`,"ok");
  }catch(err){
    setStatus(/permiss|policy|JWT|401|403/i.test(String(err.message||err)) ? "Sem permissão para salvar. Entre de novo com um e-mail autorizado." : "Não foi possível salvar agora. Verifique a internet e tente de novo.","err");
  }finally{ b.disabled=false; }
});

async function salvarCulto(r){
  const id=docId(r.data,r.culto);
  const dados={...r, totalGeral:totals(r).geral}; ["data","culto","_id","atualizadoEm","atualizadoPor"].forEach(k=>delete dados[k]);
  const {data:ex, error:e1} = await sb.from("cultos").select("id").eq("id",id).maybeSingle();
  if(e1) throw e1;
  const res = ex ? await sb.from("cultos").update({data:r.data, culto:r.culto, dados}).eq("id",id).select("id")
                 : await sb.from("cultos").insert({id, data:r.data, culto:r.culto, dados}).select("id");
  if(res.error) throw res.error;
  if(!res.data || !res.data.length) throw new Error("sem permissão");
  return ex ? "editado" : "novo";
}

/* ---------- Colar mensagem do WhatsApp ---------- */
function norm(t){ return t.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase(); }
function norm(t){ return t.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase(); }
// Linha de conversa exportada do WhatsApp: "19/11/2026 14:18 - Polly: ..." ou "[19/11/2026, 14:18:05] Polly: ..."
const PREFIXO_ZAP = /^\[?\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]\.?\s*m\.?)?\]?\s*(?:-\s*)?[^:\n]{1,60}:\s?/i;
function linhasLimpas(txt){
  return txt.replace(/\r/g,"").replace(/[‎‏‪-‮]/g,"").split("\n")
    .map(l=>l.replace(PREFIXO_ZAP,"").replace(/[*_~👉]/gu,"").replace(/\s+/g," ").trim()).filter(Boolean);
}
// Descobre o culto pelo dia da semana e pelo horário escritos na linha (ou pela data, se o dia não vier escrito)
function acharCulto(linha, dataISO){
  const l=norm(linha).replace(/\d{1,2}\/\d{1,2}(\/\d{2,4})?/g," ");   // tira a data antes de procurar o horário
  const porNome=CULTOS.find(c=>c.palavras && new RegExp(c.palavras).test(l));
  if(porNome) return {id:porNome.id, duvida:false};
  const dias=[/\bdom/,/\bseg/,/\bter[cç]/,/\bqua/,/\bqui/,/\bsex/,/\bsab/];
  let dow=dias.findIndex(re=>re.test(l));
  if(dow<0 && dataISO) dow=parseDate(dataISO).getDay();
  const hm=l.match(/(\d{1,2})\s*(?:[:h]\s*(\d{2}))?\s*h?/);
  const min = hm ? (+hm[1])*60+(+(hm[2]||0)) : null;
  let cands=CULTOS.filter(c=>dow<0||c.dow===dow); if(!cands.length) cands=CULTOS.slice();
  if(min!=null) cands.sort((a,b)=>Math.abs(hmin(a)-min)-Math.abs(hmin(b)-min));
  const empate = cands.length>1 && (min==null || Math.abs(hmin(cands[0])-min)===Math.abs(hmin(cands[1])-min));
  return {id:cands[0]&&cands[0].id, duvida: empate};
}
// Nome da equipe como está na configuração da unidade (ex.: "Enfermeira" -> "Enfermaria", "cafeteira" -> "Cafeteria/Livraria")
function equipeCanonica(nome){
  const n=norm(nome).replace(/[^a-z0-9/ ]/g," ").trim(); if(!n) return nome;
  const pal=n.split(/[\s/]+/).filter(p=>p.length>=3);
  for(const e of EQUIPES_PADRAO){
    const pe=norm(e).split(/[\s/]+/).filter(p=>p.length>=3);
    if(pal.some(a=>pe.some(b=>a.slice(0,5)===b.slice(0,5)))) return e;
  }
  return nome.charAt(0).toUpperCase()+nome.slice(1);
}
// Lê um ou vários relatórios. Um novo relatório começa quando aparece de novo "Culto" ou "Data".
// Aceita as variações que aparecem no WhatsApp: "VTL-", número sem dois-pontos, "494 adultos e 12 crianças",
// "CDC Voluntários: 23", pastores por nome com o total na linha seguinte, "1.155", total geral na linha de baixo.
function parseWhatsAll(txt){
  const blocos=[]; let cur=null;
  const novo=()=>{ cur={r:{voluntarios:[]}, avisos:[], totalTexto:null, achou:0, sec:"aud", cultoTxt:"", audTotal:null, audLinha:null, tp:null, volTexto:null, cdcNum:null, esperaGeral:false, obs:[], vazios:{}}; blocos.push(cur); };
  const num = s => { const m=String(s).match(/(\d{1,3}(?:\.\d{3})+|\d+)/); return m? parseInt(m[1].replace(/\./g,""),10) : null; };
  const depois = l => { const i=l.search(/[:=]/); return i<0 ? null : l.slice(i+1); };      // texto depois do ":" ou "="
  const valor = l => { const d=depois(l); if(d==null) return null; const n=num(d); return n!=null ? n : (/^\s*$/.test(d) ? 0 : null); };
  const ultimo = l => { const m=l.match(/(\d{1,3}(?:\.\d{3})+|\d+)\s*(?:pessoas?)?\s*$/); return m? parseInt(m[1].replace(/\./g,""),10) : null; };
  const lerData = (raw)=>{ const m=raw.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/); if(!m) return null;
    const now=new Date(); let y=m[3]?parseInt(m[3],10):now.getFullYear(); if(y<100) y+=2000;
    let dt=new Date(y,parseInt(m[2],10)-1,parseInt(m[1],10)); if(!m[3] && dt>now) dt.setFullYear(y-1); return isoDate(dt); };
  for(const raw of linhasLimpas(txt)){
    const l=norm(raw).replace(/^[\s\-–•>]+/,"");
    if(/^culto\b/.test(l)){ if(!cur || cur.cultoTxt) novo(); cur.cultoTxt=raw; cur.achou++; const d=lerData(raw); if(d && !cur.r.data){ cur.r.data=d; cur.achou++; } continue; }
    if(/^data\b/.test(l)){ const d=lerData(raw); if(d){ if(!cur || cur.r.data) novo(); cur.r.data=d; cur.achou++; } continue; }
    if(!cur) continue;
    const out=cur.r;
    // total geral pode vir na linha de baixo
    if(cur.esperaGeral){ const n=num(l); cur.esperaGeral=false; if(n!=null){ cur.totalTexto=n; continue; } }
    if(/^total geral\b/.test(l)){ const n=valor(l); if(n){ cur.totalTexto=n; } else cur.esperaGeral=true; continue; }
    if(/^obs/.test(l)){ const t=raw.replace(/^[^:]*:\s*/,"").trim(); if(t) cur.obs.push(t); continue; }
    if(/^evento\b/.test(l)){ out.evento=raw.replace(/^[^:]*:\s*/,"").trim(); continue; }
    if(/^estacionamento\b/.test(l)){ cur.sec="est"; continue; }
    // Central da Criança
    if(/^cdc\s*[-:]?\s*(vlt|volunt)/.test(l)){ const n=ultimo(l); if(n!=null){ out.vltCdc=n; cur.achou++; } cur.sec="cdc"; continue; }
    if(/^vlt\s*cdc\b/.test(l)){ const n=ultimo(l); if(n!=null){ out.vltCdc=n; cur.achou++; } cur.sec="cdc"; continue; }
    if(/central da crianca/.test(l) || /^cdc\b/.test(l)){ cur.sec="cdc"; const n=ultimo(l); if(n!=null) cur.cdcNum=n; continue; }
    if(cur.sec==="cdc" && /^(vlt|vtl|volunt)/.test(l)){ const n=ultimo(l); if(n!=null){ out.vltCdc=n; cur.achou++; } continue; }
    if(cur.sec==="cdc" && /^criancas?\b/.test(l)){ const n=ultimo(l); if(n!=null){ out.criancasCdc=n; cur.achou++; } continue; }
    // voluntários
    if(/^total de (vlt|vtl|volunt)/.test(l)){ cur.volTexto=ultimo(l); continue; }
    if(/^voluntarios\b/.test(l)){ cur.sec="vol"; continue; }
    if(/^v[lt]{2}\b/.test(l)){
      const nome=raw.replace(/^[\s*]*v[lt]{2}\s*[-–:]?\s*/i,"").replace(/[\s:=\-–]*\d[\d.]*\s*$/,"").replace(/\s*[:=\-–]\s*$/,"").trim();
      const n=ultimo(l); if(n==null) continue;
      if(!nome){ if(cur.sec==="cdc"){ out.vltCdc=n; cur.achou++; } continue; }
      out.voluntarios.push({equipe:equipeCanonica(nome), qtd:n}); cur.achou++; continue;
    }
    // pastores: número na linha, ou nomes e o total na linha seguinte
    if(/^pastores?\b/.test(l)){
      const d=depois(raw)||""; const n=num(d);
      if(n!=null){ out.pastores=n; cur.achou++; cur.sec="pasNomes"; }
      else { const nomes=d.split(/,| e /).map(x=>x.trim()).filter(Boolean); if(nomes.length){ cur.obs.push("Pastores: "+nomes.join(", ")); out.pastores=nomes.length; } cur.sec="pas"; }
      continue;
    }
    if(cur.sec==="pasNomes"){ cur.sec="x"; if(!/\d/.test(l) && /[a-z]/.test(l)){ cur.obs.push("Pastores: "+raw.split(/,| e /).map(x=>x.trim()).filter(Boolean).join(", ")); continue; } }
    if(/^(total\b|=)/.test(l)){
      const n=ultimo(l)!=null?ultimo(l):num(l); if(n==null) continue;
      if(/^total participantes/.test(l)){ cur.tp=n; continue; }
      if(cur.sec==="pas"){ out.pastores=n; cur.achou++; cur.sec="x"; continue; }
      if(cur.sec==="aud"){ cur.audTotal=n; continue; }
      if(cur.sec==="cdc"){ continue; }
      cur.tp=n; continue;
    }
    if(/^visitantes?\b/.test(l)){ const n=valor(l); if(n!=null){ if(n || out.visitantes==null) out.visitantes=n; cur.achou++; } continue; }
    if(/^decis/.test(l)){ const n=valor(l); if(n!=null){ out.decisoes=n; cur.achou++; } continue; }
    if(/^carros?\b/.test(l)){ const n=ultimo(l); if(n!=null){ out.carros=n; cur.achou++; } continue; }
    if(/^motos?\b/.test(l)){ const n=ultimo(l); if(n!=null){ out.motos=n; cur.achou++; } continue; }
    // auditório: "Auditório: 487 pessoas", "Adultos: 892", "494 adultos e 12 crianças"
    if(/^auditorio\b/.test(l)){ cur.sec="aud"; const n=valor(l); if(n) cur.audLinha=n; continue; }
    if(/^\d/.test(l)){ let achouFx=false; FAIXAS.forEach(f=>{ const w=norm(f.curto||f.key).replace(/s$/,""); const m=l.match(new RegExp("(\\d[\\d.]*)\\s*"+w)); if(m){ out[f.key]=num(m[1]); achouFx=true; } }); if(achouFx){ cur.achou++; continue; } }
    const fx=FAIXAS.find(f=>new RegExp(f.re||("^"+norm(f.key))).test(l));
    if(fx){ const n=valor(l)!=null?valor(l):ultimo(l); if(n!=null){ out[fx.key]=n; if(n===0 && depois(l)!=null && !/\d/.test(depois(l))) cur.vazios[fx.key]=1; cur.achou++; } continue; }
  }
  return blocos.filter(b=>b.achou>=3).map(b=>{
    const r=b.r, soma=()=>FAIXAS.reduce((a,f)=>a+(Number(r[f.key])||0),0), principal=FAIXAS[0].key;
    // CDC: "CDC: 122" sem a linha de crianças = crianças da CDC
    if(b.cdcNum!=null && r.criancasCdc==null){ r.criancasCdc = (r.vltCdc!=null && b.cdcNum>r.vltCdc && b.totalTexto==null) ? b.cdcNum - r.vltCdc : b.cdcNum; }
    // auditório: completa a faixa principal (adultos) quando veio só o total
    const vol=r.voluntarios.reduce((a,t)=>a+t.qtd,0), pas=Number(r.pastores)||0;
    if(b.audLinha!=null && !(Number(r[principal])>0)){
      const outros=soma()-(Number(r[principal])||0);
      const comoTotal=b.audLinha-outros, comoAdultos=b.audLinha;
      const bate = v => b.tp!=null && v+outros+vol+pas===b.tp;
      r[principal] = bate(comoAdultos) && !bate(comoTotal) ? comoAdultos : comoTotal;
    }
    if(b.audTotal!=null && (!(Number(r[principal])>0) || b.vazios[principal])){
      const outros=soma()-(Number(r[principal])||0); r[principal]=b.audTotal-outros;
      b.avisos.push(`${FAIXAS[0].label} não veio na mensagem; calculei pelo total do auditório (${fmt(b.audTotal)}).`);
    }
    if(b.audTotal!=null && soma()!==b.audTotal) b.avisos.push(`a mensagem diz auditório ${fmt(b.audTotal)}, a soma das faixas dá ${fmt(soma())}`);
    if(b.volTexto!=null && b.volTexto!==vol) b.avisos.push(`a mensagem diz ${fmt(b.volTexto)} voluntários, a soma das equipes dá ${fmt(vol)}`);
    if(b.tp!=null && b.tp!==soma()+vol+pas) b.avisos.push(`a mensagem diz total participantes ${fmt(b.tp)}, a soma dá ${fmt(soma()+vol+pas)}`);
    if(b.obs.length) r.obs=b.obs.join("\n");
    if(b.cultoTxt||b.r.data){ const c=acharCulto(b.cultoTxt, b.r.data); if(b.cultoTxt||c.id){ b.r.culto=c.id; if(c.duvida) b.avisos.push("Confira o culto: o horário não estava claro na mensagem."); } }
    if(!b.cultoTxt) b.avisos.push("A mensagem não diz o culto; deduzi pela data.");
    return b;
  });
}
function completar(b){ // transforma o que foi lido num lançamento completo
  const r=b.r, novo={data:r.data, culto:r.culto};
  NUMS.forEach(k=>novo[k]= r[k]!=null ? r[k] : 0);
  novo.voluntarios=r.voluntarios; novo.evento=r.evento||""; novo.obs=r.obs||"";
  const antigo=r.data&&r.culto ? rows.find(x=>x._id===docId(r.data,r.culto)) : null;
  if(antigo){ if(!novo.evento) novo.evento=antigo.evento||""; if(!novo.obs) novo.obs=antigo.obs||""; }
  return {novo, antigo};
}
$("b-paste-clear").addEventListener("click",()=>{ $("i-paste").value=""; $("paste-msg").hidden=true; });
let lote=[];
$("b-parse").addEventListener("click",()=>{
  const box=$("paste-msg"); box.className="notice"; $("lote").hidden=true; lote=[];
  const blocos=parseWhatsAll($("i-paste").value||"");
  if(!blocos.length){ box.textContent="Não reconheci a mensagem. Cole o relatório inteiro, começando em \"Culto:\"."; box.hidden=false; return; }
  if(blocos.length>1){ mostrarLote(blocos); box.hidden=true; return; }
  const b=blocos[0], r=b.r;
  const falta=[]; if(!r.data) falta.push("data"); if(!r.culto) falta.push("culto");
  const cur=readForm();
  r.data=r.data||cur.data; r.culto=r.culto||cur.culto;
  const {novo, antigo}=completar(b);
  if(!r.voluntarios.length) novo.voluntarios=cur.voluntarios;
  if(!antigo && !novo.obs) novo.obs=cur.obs;
  const existe=!!antigo; novo._id = existe ? docId(novo.data,novo.culto) : undefined;
  fillForm(novo); $("frm").dataset.touched="1";
  const t=totals(novo), msgs=[];
  msgs.push(`Campos preenchidos: ${CMAP[novo.culto].label}, ${ddmmyy(novo.data)} · total geral ${fmt(t.geral)}.`);
  if(falta.length) msgs.push(`Não achei ${falta.join(" e ")} na mensagem; confira acima.`);
  if(b.totalTexto!=null && b.totalTexto!==t.geral) msgs.push(`Atenção: a mensagem diz TOTAL GERAL ${fmt(b.totalTexto)}, mas a soma dos números dá ${fmt(t.geral)}. Confira antes de salvar.`);
  if(existe) msgs.push("Esse culto já estava lançado: ao salvar, os números colados substituem os antigos.");
  b.avisos.forEach(a=>msgs.push(a));
  msgs.push("Confira os números e clique em Salvar lançamento.");
  const alerta = falta.length || (b.totalTexto!=null && b.totalTexto!==t.geral) || existe || b.avisos.length;
  if(!alerta) box.classList.add("ok");
  box.innerHTML=msgs.map(esc).join("<br>"); box.hidden=false;
});

/* Vários relatórios de uma vez: mostra a lista para conferir e salva os marcados */
function mostrarLote(blocos){
  lote=blocos.map(b=>{
    const {novo, antigo}=completar(b); const t=totals(novo); const avisos=b.avisos.slice();
    const ok=!!(novo.data&&novo.culto);
    if(!novo.data) avisos.push("sem data"); if(!novo.culto) avisos.push("sem culto");
    if(b.totalTexto!=null && b.totalTexto!==t.geral) avisos.push(`mensagem diz ${fmt(b.totalTexto)}, a soma dá ${fmt(t.geral)}`);
    if(ok && parseDate(novo.data).getDay()!==CMAP[novo.culto].dow) avisos.push(`a data não cai num(a) ${DIAS[CMAP[novo.culto].dow]}`);
    return {id: ok?docId(novo.data,novo.culto):"", novo, antigo, t, avisos, ok, marcado: ok && !antigo};
  });
  // o mesmo culto colado duas vezes: vale o último
  const ultimo=new Map(); lote.forEach((x,i)=>{ if(x.id) ultimo.set(x.id,i); });
  lote.forEach((x,i)=>{ if(x.id && ultimo.get(x.id)!==i){ x.marcado=false; x.avisos.push("repetido: vale o que aparece depois na mensagem"); } });
  renderLote();
}
function renderLote(){
  const el=$("lote"); const n=lote.filter(x=>x.marcado).length;
  const ord=lote.map((x,i)=>i).sort((a,b)=>(lote[a].novo.data||"")<(lote[b].novo.data||"")?-1:1);
  el.innerHTML=`<div class="notice" style="margin-top:10px">Encontrei <b>${lote.length} relatórios</b> na mensagem. Confira a lista, marque os que quer salvar e clique em Salvar. Os que já estavam lançados vêm desmarcados; marque se quiser substituir.</div>
  <div class="tbl-wrap"><table><thead><tr><th></th><th>Data</th><th>Culto</th><th>Auditório</th><th>CDC</th><th>Voluntários</th><th>Total geral</th><th style="text-align:left">Situação</th></tr></thead><tbody>${ord.map(i=>{ const x=lote[i], r=x.novo, c=CMAP[r.culto]||{label:r.culto||"?",color:"var(--muted)"};
    const sit=[x.antigo?"já lançado: será substituído se marcar":"novo", ...x.avisos];
    return `<tr><td><input type="checkbox" data-i="${i}" ${x.marcado?"checked":""} ${x.ok?"":"disabled"} aria-label="Salvar este"></td><td class="num">${r.data?ddmmyy(r.data):"—"}</td><td><span class="chip"><i class="dot" style="background:${c.color}"></i>${esc(c.label)}</span>${r.evento?`<span class="evt">${esc(r.evento)}</span>`:""}</td><td class="num">${fmt(x.t.aud)}</td><td class="num">${fmt(x.t.cdc)}</td><td class="num">${fmt(x.t.vol)}</td><td class="num"><b>${fmt(x.t.geral)}</b></td><td style="text-align:left;font-size:12.5px;color:${x.avisos.length?"var(--bad)":"var(--muted)"}">${esc(sit.join(" · "))}</td></tr>`; }).join("")}</tbody></table></div>
  <div class="btns" style="margin-top:10px"><button type="button" class="btn" id="b-lote-salvar" ${n?"":"disabled"}>Salvar ${n} lançamento${n===1?"":"s"}</button><button type="button" class="btn ghost" id="b-lote-cancelar">Cancelar</button><span class="status" id="lote-st"></span></div>`;
  el.hidden=false;
}
$("lote").addEventListener("change",e=>{ const cb=e.target.closest("input[data-i]"); if(!cb) return; lote[+cb.dataset.i].marcado=cb.checked; renderLote(); });
$("lote").addEventListener("click",async e=>{
  if(e.target.id==="b-lote-cancelar"){ lote=[]; $("lote").hidden=true; return; }
  if(e.target.id!=="b-lote-salvar") return;
  if(!unlocked){ openLock(); return; }
  const b=e.target; b.disabled=true; const st=$("lote-st");
  let novos=0, editados=0, falhas=0; const sel=lote.filter(x=>x.marcado);
  for(const [k,x] of sel.entries()){
    st.textContent=`Salvando ${k+1} de ${sel.length}…`; st.className="status";
    try{ (await salvarCulto(x.novo))==="novo" ? novos++ : editados++; }catch(err){ falhas++; }
  }
  await carregar();
  lote=[]; $("lote").hidden=true; $("i-paste").value="";
  const box=$("paste-msg"); box.className="notice"+(falhas?"":" ok");
  box.textContent=`Salvos: ${novos} novo${novos===1?"":"s"}${editados?`, ${editados} substituído${editados===1?"":"s"}`:""}.`+(falhas?` ${falhas} não ${falhas===1?"foi salvo":"foram salvos"}: verifique a internet e se o seu e-mail pode editar.`:" Confira no Painel e no Histórico.");
  box.hidden=false;
});
$("b-paste-file").addEventListener("click",()=>$("f-paste").click());
$("f-paste").addEventListener("change",async e=>{ const f=e.target.files[0]; e.target.value=""; if(!f) return; $("i-paste").value=await f.text(); $("b-parse").click(); });

/* ---------- Texto do WhatsApp ---------- */
function whatsText(r){
  const t=totals(r), c=CMAP[r.culto];
  const vl=(r.voluntarios||[]).map(v=>`VLT ${v.equipe}: ${p2(v.qtd)}`).join("\n");
  return `Culto: ${c.full}
*Data: ${ddmm(r.data)}${r.evento?"\nEvento: "+r.evento:""}

Auditório:= ${t.aud}
${FAIXAS.map((f,i)=>`${f.msg||f.label} = ${i?p2(r[f.key]):(r[f.key]||0)}`).join("\n")}


Voluntários:
${vl}
Total de Voluntários= ${t.vol}

Pastores: ${p2(r.pastores)}

👉 Total participantes= ${t.part} pessoas*

Visitantes: ${p2(r.visitantes)}
Decisões por Cristo: ${p2(r.decisoes)}

👉 Central da Criança= ${t.cdc}
VLT CDC: ${p2(r.vltCdc)}
Crianças: ${p2(r.criancasCdc)}

👉 TOTAL GERAL: ${t.geral}*pessoas*

Estacionamento:
Carros: ${r.carros||0}
Motos:${r.motos||0}`;
}
async function copyText(txt, btn){
  const old=btn.textContent;
  let ok=false;
  try{ await navigator.clipboard.writeText(txt); ok=true; }catch(e){}
  if(!ok){ try{ const ta=document.createElement("textarea"); ta.value=txt; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select(); ok=document.execCommand("copy"); ta.remove(); }catch(e){} }
  btn.textContent = ok ? "Copiado!" : "Não deu para copiar";
  setTimeout(()=>btn.textContent=old,1800);
}
$("b-copy").addEventListener("click",e=>{ const r=readForm(); if(!r.data){ setStatus("Escolha a data antes de copiar.","err"); return; } copyText(whatsText(r), e.currentTarget); });

/* ---------- Supabase ---------- */
const KEY=U.chave;
if(!pronta(U)){ // unidade ainda sem base de dados
  loaded=true; document.body.classList.add("locked"); renderDashboard(); renderHist();
  $("conn").innerHTML=`A base de dados da ${esc(U.nomeCompleto)} ainda não foi configurada. Assim que ela for criada, o painel passa a funcionar.`+Object.values(UNIDADES).filter(pronta).map(u=>` <a href="../${u.id}/" style="color:inherit;font-weight:700">Ir para ${esc(u.nomeCompleto)}</a>`).join(""); $("conn").hidden=false;
  return;
}
const sb = window.supabase.createClient(U.supabaseUrl, U.supabaseKey, {auth:{persistSession:true, autoRefreshToken:true, lock:(nome, espera, fn)=>fn()}});

/* ---------- Login ---------- */
let lockMode="enter";
function applyLock(){
  document.body.classList.toggle("locked", !unlocked);
  document.body.classList.toggle("gate", !meuPapel);
  if(sessaoOk && !meuPapel){ if($("modal").hidden || lockMode!=="gate") openLock("gate"); }
  else if(meuPapel && lockMode==="gate"){ $("modal").hidden=true; lockMode="enter"; }
  const b=$("b-lock"); b.textContent = unlocked ? `Editando como ${usuario} · Sair` : meuPapel ? `${usuario} · Sair` : "Entrar"; b.classList.toggle("on", unlocked);
  if(!unlocked && $("view-lancar").classList.contains("on")) { location.hash="painel"; show("painel"); }
  renderHist(); renderBackupBar();
}
function openLock(mode){
  lockMode = mode || "enter";
  const change = lockMode==="change";
  const obrig = change && !!window.__obrig;   // primeiro acesso ou link de convite: não dá para pular
  const reset = lockMode==="reset";             // esqueci minha senha: unidade + e-mail + senha nova
  $("lock-esqueci").textContent = reset ? "Voltar para entrar" : "Esqueci minha senha";
  $("lock-esqueci").style.display = change ? "none" : "";
  $("lock-title").textContent = reset ? "Esqueci minha senha" : change ? (CONVITE ? "Crie a sua senha" : obrig ? "Primeiro acesso: crie a sua senha" : "Trocar minha senha") : lockMode==="gate" ? "Entrar" : "Entrar para editar";
  $("lock-cancel").style.display = (lockMode==="gate"||obrig||reset) ? "none" : "";
  $("lock-sub").textContent = reset ? "Escolha a unidade, digite o seu e-mail de acesso e a senha nova." : change ? (CONVITE ? `Escolha uma senha para ${usuario}. Nas próximas vezes, é só entrar com o e-mail e essa senha.` : obrig ? `Troque a senha provisória por uma só sua. Nas próximas vezes, entre com ${usuario} e a senha nova.` : `Nova senha para ${usuario}.`) : lockMode==="gate" ? "Acesso restrito. Entre com o seu e-mail cadastrado." : "Só os e-mails autorizados conseguem lançar, editar ou excluir cultos.";
  $("lock-l2").style.display = (change||reset) ? "" : "none";
  $("lock-le").style.display = change ? "none" : "";
  $("lock-lu").style.display = change ? "none" : ""; $("lock-unidade").value=U.id;
  $("lock-ok").textContent = (change||reset) ? "Salvar nova senha" : "Entrar";
  $("lock-p1").value=""; $("lock-p2").value=""; $("lock-st").textContent="";
  try{ if(!$("lock-email").value) $("lock-email").value = localStorage.getItem(KEY+"_lastuser")||""; }catch(e){}
  $("modal").hidden=false; (!change && !$("lock-email").value ? $("lock-email") : $("lock-p1")).focus();
}
$("lock-cancel").addEventListener("click",()=>{ $("modal").hidden=true; });
$("lock-esqueci").addEventListener("click",()=>{ if(lockMode==="reset") openLock(window.__voltar||"enter"); else { window.__voltar=lockMode; openLock("reset"); } });
$("b-lock").addEventListener("click",async ()=>{
  if(unlocked || meuPapel){ await sb.auth.signOut(); return; }
  openLock();
});
$("lock-form").addEventListener("submit", async e=>{
  e.preventDefault();
  const p1=$("lock-p1").value, p2=$("lock-p2").value, st=$("lock-st"), ok=$("lock-ok");
  st.textContent="";
  if(lockMode==="change"){
    if(p1.length<6){ st.textContent="Use pelo menos 6 caracteres."; return; }
    if(p1!==p2){ st.textContent="As senhas não conferem."; return; }
    ok.disabled=true;
    const {error}=await sb.auth.updateUser({password:p1, data:{senha_definida:true}});
    ok.disabled=false;
    if(error){ st.textContent = /different|same/i.test(error.message||"") ? "A senha nova precisa ser diferente da provisória." : "Não foi possível trocar a senha agora."; return; }
    window.__obrig=false;
    registrar("Trocou a própria senha");
    $("modal").hidden=true; setStatus("Senha trocada.","ok"); return;
  }
  const email=$("lock-email").value.trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[a-z]{2,}(\.[a-z]{2,})?$/.test(email)){ st.textContent="Digite um e-mail válido."; $("lock-email").focus(); return; }
  if(lockMode==="reset"){
    if(p1.length<6){ st.textContent="Use pelo menos 6 caracteres."; return; }
    if(p1!==p2){ st.textContent="As senhas não conferem."; return; }
  }
  ok.disabled=true; ok.textContent = lockMode==="reset" ? "Salvando…" : "Entrando…";
  // Cada unidade tem a sua própria base e a sua lista de e-mails: quem é de uma unidade não entra na outra.
  const destino=UNIDADES[$("lock-unidade").value]||U;
  const cli = destino.id===U.id ? sb : window.supabase.createClient(destino.supabaseUrl, destino.supabaseKey, {auth:{persistSession:true, autoRefreshToken:false, lock:(nome, espera, fn)=>fn()}});
  if(lockMode==="reset"){ // troca a senha na base da unidade escolhida e já entra com ela
    const {data:trocou, error:er}=await cli.rpc("redefinir_senha",{p_email:email, p_senha:p1});
    if(er || !trocou){ ok.disabled=false; ok.textContent="Salvar nova senha"; st.textContent = er ? "Não foi possível trocar a senha agora. Verifique a internet." : `Este e-mail não tem acesso à ${destino.nomeCompleto}.`; return; }
  }
  const {error}=await cli.auth.signInWithPassword({email, password:p1});
  ok.disabled=false; ok.textContent = lockMode==="reset" ? "Salvar nova senha" : "Entrar";
  if(error){ st.textContent = /invalid/i.test(error.message) ? "E-mail ou senha incorretos." : "Não foi possível entrar agora. Verifique a internet."; return; }
  const {data:papel}=await cli.rpc("meu_papel");
  if(!papel){ await cli.auth.signOut(); st.textContent=`Este e-mail não tem acesso à ${destino.nomeCompleto}.`; return; }
  try{ localStorage.setItem("presenca_unidade", destino.id); localStorage.setItem(destino.chave+"_lastuser", email); }catch(e){}
  if(destino.id!==U.id){ location.href="../"+destino.id+"/"; return; }
  try{ localStorage.setItem(KEY+"_lastuser", email); }catch(e){}
  $("modal").hidden=true;
});
let meuPapel="", sessaoOk=false;
sb.auth.onAuthStateChange((ev, session)=>{ setTimeout(()=>atualizarSessao(session),0); });
async function atualizarSessao(session){
  const em = session && session.user ? (session.user.email||"").toLowerCase() : "";
  let papel="";
  if(em){ try{ const {data}=await sb.rpc("meu_papel"); papel=data||""; }catch(e){} }
  if(em && !papel){ try{ await sb.auth.signOut(); }catch(e){} }
  const aut = papel==="editor";
  const mudou = !sessaoOk || (aut!==unlocked) || (papel!==meuPapel) || (em!==usuario);
  sessaoOk=true; unlocked=aut; meuPapel=papel; usuario=papel?em:"";
  if(papel){ try{ localStorage.setItem("presenca_unidade", U.id); }catch(e){} }
  if(!papel){ rows=[]; log=[]; try{ renderDashboard(); }catch(e){} }
  applyLock();
  // Convite, "esqueci a senha" ou primeiro acesso (senha provisória): exige criar uma senha antes de usar
  const semSenhaPropria = papel && !(session.user.user_metadata && session.user.user_metadata.senha_definida===true);
  if(papel && (semSenhaPropria || (CONVITE && !window.__senhaPedida)) && !(lockMode==="change" && !$("modal").hidden)){
    window.__senhaPedida=true; window.__obrig=true; openLock("change");
  }
  if(mudou && papel) carregar();
}

/* ---------- Dados ---------- */
let carregando=false;
async function carregar(){
  if(!meuPapel) return;
  if(carregando) return; carregando=true;
  try{
    const cols = unlocked ? "id,data,culto,dados,atualizado_em,atualizado_por" : "id,data,culto,dados,atualizado_em";
    const [c, cfg, reg] = await Promise.all([
      sb.from("cultos").select(cols).order("data",{ascending:true}),
      sb.from("config").select("dados").eq("id",1).maybeSingle(),
      unlocked ? sb.from("registro").select("em,por,acao,data,culto,det").order("em",{ascending:false}).limit(300) : Promise.resolve({data:[]})
    ]);
    if(c.error) throw c.error;
    rows = (c.data||[]).map(d=>({...d.dados, _id:d.id, data:d.data, culto:d.culto, atualizadoEm:d.atualizado_em, atualizadoPor:d.atualizado_por||""}));
    if(cfg.data && cfg.data.dados) config={...config,...cfg.data.dados};
    log = (reg.data||[]).slice().reverse().map(x=>({...x, data:x.data||"", culto:x.culto||""}));
    savedAt = rows.reduce((m,r)=>r.atualizadoEm>m?r.atualizadoEm:m,"");
    loaded=true; conn("");
    applyConfigForm(); renderSaveBar(); renderBackupBar();
    renderDashboard(); renderHist();
    if(!editingId && !$("frm").dataset.touched) blankForm(false); else checkKey(true);
  }catch(e){
    loaded=true; conn("Não foi possível carregar os dados agora. Verifique a internet; a página tenta de novo sozinha.");
    renderDashboard(); renderHist();
  }finally{ carregando=false; }
}
function conn(msg){ const n=$("conn"); n.textContent=msg||""; n.hidden=!msg; }
function renderSaveBar(){
  if(!savedAt){ $("savebar").textContent=""; return; }
  const d=new Date(savedAt);
  const last = rows.slice().sort((a,b)=>a.atualizadoEm<b.atualizadoEm?1:-1)[0];
  $("savebar").textContent = `Última atualização: ${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}${unlocked&&last&&last.atualizadoPor?" por "+last.atualizadoPor:""} · ${rows.length} culto${rows.length===1?"":"s"} lançado${rows.length===1?"":"s"}`;
}
function afterChange(){ renderDashboard(); renderHist(); checkKey(true); }
$("frm").addEventListener("input",()=>{ $("frm").dataset.touched="1"; },{once:true});

/* ---------- Backup ---------- */
function baixar(nome, conteudo, tipo){
  const blob = new Blob([conteudo], {type:tipo});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 5000);
}
function getLastBackup(){ try{ return localStorage.getItem(KEY+"_backup")||""; }catch(e){ return ""; } }
function backupJson(){
  try{ localStorage.setItem(KEY+"_backup", new Date().toISOString()); }catch(e){}
  const out = {tipo:"backup-presenca-"+U.id, unidade:U.nomeCompleto, geradoEm:new Date().toISOString(), rows:rows.map(r=>{ const o={...r}; return o; }), config, log};
  baixar("backup-presenca-"+U.id+"-"+isoDate(new Date())+".json", JSON.stringify(out,null,1), "application/json");
  renderBackupBar();
}
function renderBackupBar(){
  const bar=$("backupbar"); if(!bar) return;
  if(!unlocked){ bar.hidden=true; return; }
  const lb=getLastBackup();
  const dias = lb ? Math.floor((Date.now()-new Date(lb))/86400000) : null;
  $("backup-txt").innerHTML = `Os dados ficam salvos online. ` + (!lb ? `<span class="warn">Nenhum backup baixado neste aparelho.</span>` :
    `Último backup baixado: ${quando(lb)}${dias>=(U.backupDias||14)?` · <span class="warn">${dias} dias atrás: faça um novo backup</span>`:""}`);
  bar.hidden=false;
}
$("b-pass").addEventListener("click",()=>{ if(!unlocked){ openLock(); return; } openLock("change"); });
$("b-backup").addEventListener("click",backupJson);
$("b-backup-top").addEventListener("click",backupJson);
$("b-import").addEventListener("click",()=>{ if(!unlocked){ openLock(); return; } $("f-import").click(); });
$("f-import").addEventListener("change",async e=>{
  const f=e.target.files[0]; e.target.value=""; if(!f) return;
  const btn=$("b-import"); btn.textContent="Importando…";
  try{
    const txt=await f.text(); let d=null;
    if(/^\s*\{/.test(txt)) d=JSON.parse(txt);
    else { const m=txt.match(/\/\*DADOS\*\/([\s\S]*?)\/\*FIM\*\//); if(m) d=JSON.parse(m[1]); }
    if(!d || !Array.isArray(d.rows)) throw new Error("formato");
    let novos=0, atualizados=0;
    const atual=new Map(rows.map(r=>[r._id,r]));
    for(const r0 of d.rows.filter(r=>r.data&&r.culto)){
      const id=r0._id||docId(r0.data,r0.culto); const cur=atual.get(id);
      const dados={...r0, totalGeral:totals(r0).geral}; ["_id","data","culto","atualizadoEm","atualizadoPor"].forEach(k=>delete dados[k]);
      if(!cur){ const {error}=await sb.from("cultos").insert({id,data:r0.data,culto:r0.culto,dados}); if(!error) novos++; }
      else if((r0.atualizadoEm||"")>(cur.atualizadoEm||"")){ const {error}=await sb.from("cultos").update({data:r0.data,culto:r0.culto,dados}).eq("id",id); if(!error) atualizados++; }
    }
    await registrar("Importou backup","","",`${f.name}: ${novos} novo(s), ${atualizados} atualizado(s)`);
    await carregar();
    btn.textContent=`Importado: ${novos} novo(s), ${atualizados} atualizado(s)`;
  }catch(err){ btn.textContent="Arquivo não reconhecido"; }
  setTimeout(()=>btn.textContent="Importar backup",5000);
});
function applyConfigForm(){
  $("c-capaud").value=config.capAud||""; $("c-capcdc").value=config.capCdc||""; $("c-capcar").value=config.capCarros||""; $("c-capmoto").value=config.capMotos||"";
  $("c-ess").value=(config.essenciais||[]).join(", ");
}
$("b-cfg").addEventListener("click",async ()=>{
  if(!unlocked){ openLock(); return; }
  const novo={capAud:toInt($("c-capaud").value), capCdc:toInt($("c-capcdc").value), capCarros:toInt($("c-capcar").value), capMotos:toInt($("c-capmoto").value),
    essenciais:$("c-ess").value.split(",").map(x=>x.trim()).filter(Boolean)};
  const st=$("cfg-st");
  const {data,error}=await sb.from("config").update({dados:novo}).eq("id",1).select("id");
  if(error||!data||!data.length){ st.textContent="Não foi possível salvar."; st.className="status err"; return; }
  config=novo; await carregar(); recalc();
  st.textContent="Configurações salvas."; st.className="status ok"; setTimeout(()=>st.textContent="",3000);
});

/* ---------- Início ---------- */
applyConfigForm();
blankForm(false);
renderHist();
applyLock();
carregar();
setInterval(()=>{ if(document.visibilityState==="visible") carregar(); }, 60000);
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") carregar(); });
if("serviceWorker" in navigator){ window.addEventListener("load",()=>{ navigator.serviceWorker.register(U.sw||"sw.js").catch(()=>{}); }); }
})();
