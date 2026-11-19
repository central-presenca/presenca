/* Configuração de cada unidade. O código da ferramenta (core/) é o mesmo para todas.
   Cada unidade tem a sua própria base no Supabase e a sua própria lista de e-mails:
   quem tem acesso a uma unidade não acessa a outra.
   ids de culto e "key" das faixas: nunca mudar depois de ter lançamentos. dow: 0=domingo … 6=sábado.
   capAud/local (opcional): culto que acontece em outro espaço, com capacidade própria.
   palavras: usado quando dois cultos têm o mesmo dia e horário, para reconhecer na mensagem do WhatsApp. */
window.UNIDADES = {
  picos: {
    id: "picos",
    nome: "Picos",
    nomeCompleto: "Central Picos",
    lema: "Amor é a nossa razão, entrega é a nossa resposta.",
    chave: "centralpicos_presenca_v2",          // não mudar: guarda o último e-mail usado e a data do último backup
    supabaseUrl: "https://khyacyndvsnmdaszxlvy.supabase.co",
    supabaseKey: "sb_publishable_rqzxj_2YbdkS11gfL0V8xg_0p-coC9i",
    sw: "../sw.js",
    backupDias: 14,                               // avisar quando o último backup tiver mais que isso
    // id: nunca mudar depois de ter lançamentos. dow: 0=domingo … 6=sábado
    cultos: [
      {id:"sab19",   label:"Sábado 19h",    full:"Sábado 19:00h",  dow:6, hora:"19:00"},
      {id:"dom17",   label:"Domingo 17h",   full:"Domingo 17:00h", dow:0, hora:"17:00"},
      {id:"dom1930", label:"Domingo 19h30", full:"Domingo 19:30h", dow:0, hora:"19:30"}
    ],
    // Grupos que somam o total do auditório. key: nunca mudar depois de ter lançamentos. re: como aparece na mensagem do WhatsApp
    faixas: [
      {key:"adultos",  label:"Adultos",               curto:"adultos",  msg:"Adultos",  re:"^adultos?\\b"},
      {key:"criancas", label:"Crianças no auditório", curto:"crianças", msg:"Crianças", re:"^criancas?\\b", dica:"Ficaram no culto com os pais, não foram para a CDC"}
    ],
    equipes: ["Livraria/Cafeteria","Staff","Central Msc","Audiovisual","Comunicação","Produção","Ao vivo","Legendários","Segurança","Enfermaria","Integração","Cop","Intercessão","Estacionamento","Dízimos"]
  },

  boulevard: {
    id: "boulevard",
    nome: "Boulevard",
    nomeCompleto: "Central Boulevard",
    lema: "Amor é a nossa razão, entrega é a nossa resposta.",
    chave: "centralboulevard_presenca_v1",
    supabaseUrl: "",                              // preencher quando a base da Boulevard for criada
    supabaseKey: "",
    sw: "../sw.js",
    backupDias: 14,
    cultos: [
      {id:"sab19jvs", label:"Ekklesia JVS", full:"Sábado 19:00h – Ekklesia JVS (templo principal)", dow:6, hora:"19:00", palavras:"\\bjvs\\b"},
      {id:"sab19adl", label:"Ekklesia ADL", full:"Sábado 19:00h – Ekklesia ADL (templo da CDC)",   dow:6, hora:"19:00", palavras:"\\badl\\b", local:"Templo da CDC", capAud:160},
      {id:"dom9",     label:"Domingo 9h",   full:"Domingo 09:00h", dow:0, hora:"09:00"},
      {id:"dom18",    label:"Domingo 18h",  full:"Domingo 18:00h", dow:0, hora:"18:00"}
    ],
    // Pedido do Samuel: separar o auditório por faixa etária
    faixas: [
      {key:"adultos",      label:"Adultos",               curto:"adultos",      msg:"Adultos",      re:"^adultos?\\b"},
      {key:"jovens",       label:"Jovens",                curto:"jovens",       msg:"Jovens",       re:"^jovens?\\b"},
      {key:"adolescentes", label:"Adolescentes",          curto:"adolescentes", msg:"Adolescentes", re:"^adolesc"},
      {key:"criancas",     label:"Crianças no auditório", curto:"crianças",     msg:"Crianças",     re:"^criancas?\\b", dica:"Ficaram no culto com os pais, não foram para a CDC"}
    ],
    equipes: ["Livraria/Cafeteria","Staff","Central Msc","Audiovisual","Comunicação","Produção","Ao vivo","Legendários","Segurança","Enfermaria","Integração","Cop","Intercessão","Estacionamento","Dízimos"]
  }
};
