# Presença de Culto – Central (Picos e Boulevard)

Ferramenta de lançamento e painel de presença dos cultos. Uma única ferramenta atende todas as unidades:

| Unidade | Endereço | Configuração |
|---|---|---|
| Central Picos | `/presenca/picos/` | `unidades/unidades.js` (picos) |
| Central Boulevard | `/presenca/boulevard/` | `unidades/unidades.js` (boulevard) |

`/presenca/` abre a última unidade usada no aparelho. No login, a pessoa escolhe a unidade; cada unidade tem a sua própria base e lista de e-mails, então quem tem acesso a uma não entra na outra.

## Como está organizado

- `core/app.js` e `core/app.css`: **a ferramenta em si, igual para todas as unidades.** Qualquer correção ou função nova feita aqui vale para Picos e Boulevard ao mesmo tempo.
- `unidades/unidades.js`: só o que muda de uma unidade para outra (nome, dias e horários dos cultos, faixas etárias do auditório, equipes, endereço da base de dados).
- `picos/index.html` e `boulevard/index.html`: páginas curtas que dizem qual é a unidade e carregam a ferramenta.
- **Dados e login:** cada unidade tem o seu próprio projeto no Supabase. Só e-mails cadastrados na tabela `autorizados` (papel `leitor` ou `editor`) e com conta criada em *Authentication › Users* conseguem entrar.
- `supabase/schema.sql`: cria as tabelas, regras de acesso e registro de alterações num projeto novo.
- `.github/workflows/manter-ativo.yml`: evita que os projetos gratuitos do Supabase sejam pausados por inatividade (uma linha por unidade).

## Nova unidade

1. Criar projeto no Supabase e rodar `supabase/schema.sql`; cadastrar e-mails em `autorizados` e criar as contas.
2. Acrescentar a unidade em `unidades/unidades.js`.
3. Copiar a pasta `boulevard/` para `<nova>/` e trocar `boulevard` pelo id da nova unidade no `index.html` e no `manifest.json`.
4. Acrescentar a base em `manter-ativo.yml`.
