# PROJECT ATLAS — Blog Structure Engine
## Documento 4 de 4: GitHub + Deploy na Vercel

> **Instrução para o Claude Code:** a Etapa 0 é manual (feita pela pessoa). As etapas seguintes você executa, parando ao final de cada uma.

---

## Etapa 0 — Ação manual (feita pela pessoa)

### GitHub
1. Acessar https://github.com/new
2. Nome do repositório: `atlas-blog`
3. Deixar **privado** por enquanto (pode tornar público depois se quiser)
4. **Não marcar** "Add a README" nem "Add .gitignore" (o projeto já tem os arquivos locais — marcar isso causaria conflito)
5. Clicar em "Create repository"
6. Copiar a URL do repositório mostrada na tela (algo como `https://github.com/seu-usuario/atlas-blog.git`)

### Vercel
1. Acessar https://vercel.com e clicar em "Continue with GitHub" (login único, sem precisar criar conta separada se você já tem GitHub)
2. Não precisa fazer mais nada agora — o import do projeto acontece na Etapa 2 abaixo

Guardar a URL do repositório GitHub — será usada na Etapa 1.

---

## Etapa 1 — Conectar o projeto local ao GitHub

```bash
git remote add origin <URL do repositório colada pela pessoa>
git branch -M main
git push -u origin main
```

**Verificação:** recarregar a página do repositório no GitHub e confirmar que todos os arquivos e o histórico de commits aparecem lá.

---

## Etapa 2 — Importar o projeto na Vercel

Esta etapa é feita pela pessoa, pela interface (mais confiável que via CLI para o primeiro deploy):

1. No painel da Vercel, clicar em "Add New" → "Project"
2. Selecionar o repositório `atlas-blog` na lista (a Vercel já detecta automaticamente que é um projeto Next.js)
3. **Antes de clicar em Deploy**, expandir "Environment Variables" e adicionar:
   - `NEXT_PUBLIC_SUPABASE_URL` → mesmo valor do `.env.local`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ou publishable key) → mesmo valor do `.env.local`
4. Clicar em "Deploy"
5. Aguardar o build (1-3 minutos)
6. Copiar a URL pública gerada (algo como `atlas-blog-xxxx.vercel.app`)

**Se o Claude Code tiver a Vercel CLI disponível e autenticada**, pode-se alternativamente rodar:

```bash
npm i -g vercel
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel --prod
```

---

## Etapa 3 — Verificação do deploy

Peça ao Claude Code para confirmar, usando a URL pública gerada:

1. Homepage carrega com os 5 blocos (Etapa 7 do adendo anterior)
2. Um post individual abre e mostra o bloco de autor
3. `/about`, `/privacy-policy`, `/terms` carregam corretamente
4. Nenhum erro 500 nas rotas principais

**Verificação extra de segurança:** confirmar que `.env.local` **não** está no repositório GitHub (checar a lista de arquivos do repo na interface do GitHub — não deve aparecer).

---

## Etapa 4 — Deploy automático (CI/CD básico)

Confirmar que a Vercel já está configurada para redeploy automático a cada `git push` na branch `main` (isso é o padrão quando o projeto é importado via GitHub — não precisa configuração extra).

**Teste opcional:** fazer uma pequena alteração (ex: mudar um texto no Footer), commitar, dar push, e observar se a Vercel inicia um novo build automaticamente.

---

## Checklist final do projeto completo

1. Repositório no GitHub com todo o histórico
2. `.env.local` fora do controle de versão
3. Site publicado numa URL pública da Vercel
4. Variáveis de ambiente configuradas na Vercel
5. Push para `main` dispara redeploy automático
6. Site público funcionando: homepage, posts, reviews, categorias, páginas legais

---

## Depois disso

O boilerplate está tecnicamente completo e publicado. Os próximos passos **não fazem parte deste documento** e ficam para depois:

- Reescrever os textos placeholder (Quem somos, Privacy Policy, Termos) com informação real antes de aplicar ao AdSense
- Trocar os autores/posts fake por conteúdo e pessoas reais
- Conectar domínio próprio na Vercel (em vez do `.vercel.app`)
- Só depois de validar esse blog, considerar replicar a estrutura para um segundo projeto
