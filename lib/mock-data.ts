import type { Post, Review, Category } from "./types";

export const categories: Category[] = [
  {
    slug: "tecnologia",
    name: "Tecnologia",
    description: "Artigos sobre gadgets, software e tendências digitais.",
  },
  {
    slug: "saude",
    name: "Saúde",
    description: "Dicas e informações sobre bem-estar e qualidade de vida.",
  },
  {
    slug: "financas",
    name: "Finanças",
    description: "Guias de educação financeira e investimentos pessoais.",
  },
];

export const posts: Post[] = [
  {
    slug: "como-escolher-um-notebook-em-2025",
    title: "Como escolher um notebook em 2025",
    excerpt:
      "Processador, RAM, armazenamento: o que realmente importa na hora de comprar um notebook novo.",
    content: `Escolher um notebook pode ser uma tarefa difícil diante de tantas opções no mercado. Neste guia, vamos cobrir os principais pontos a considerar.

**Processador**
Para uso cotidiano e trabalho remoto, um processador Intel Core i5 ou AMD Ryzen 5 de última geração é suficiente. Criadores de conteúdo devem considerar o i7/Ryzen 7.

**Memória RAM**
16 GB é o mínimo recomendado em 2025. Se você trabalha com edição de vídeo ou desenvolvimento, prefira 32 GB.

**Armazenamento**
SSD NVMe de 512 GB já é considerado padrão. Discos HD convencionais devem ser evitados.

**Bateria**
Prefira modelos com 60 Wh ou mais e que suportem carregamento rápido.`,
    category: "tecnologia",
    publishedDate: "2025-03-10",
  },
  {
    slug: "5-apps-de-produtividade-para-2025",
    title: "5 apps de produtividade que valem a pena em 2025",
    excerpt:
      "Ferramentas testadas que realmente ajudam a organizar o dia a dia sem complicar demais.",
    content: `A oferta de aplicativos de produtividade nunca foi tão grande, mas nem todos entregam o que prometem.

**1. Notion**
Excelente para notas estruturadas, wikis pessoais e gerenciamento de projetos simples.

**2. Todoist**
Listas de tarefas com priorização inteligente e integração com e-mail.

**3. Raycast (macOS)**
Substitui o Spotlight e automatiza dezenas de tarefas repetitivas.

**4. Obsidian**
Perfeito para quem quer construir uma base de conhecimento pessoal em markdown.

**5. Linear**
Para equipes de tecnologia, é a alternativa mais limpa ao Jira.`,
    category: "tecnologia",
    publishedDate: "2025-04-02",
  },
  {
    slug: "caminhada-diaria-beneficios",
    title: "Por que caminhar 30 minutos por dia muda tudo",
    excerpt:
      "Pesquisas mostram que uma caminhada diária moderada traz benefícios cardiovasculares, mentais e metabólicos significativos.",
    content: `Não é preciso academia, equipamento caro ou dieta restritiva para começar a melhorar a saúde. A caminhada diária é uma das intervenções mais estudadas e com melhor custo-benefício.

**Benefícios cardiovasculares**
30 minutos de caminhada moderada reduzem o risco de doenças cardíacas em até 35%, segundo estudo do American Heart Association.

**Saúde mental**
A atividade física libera endorfinas e serotonina, reduzindo sintomas de ansiedade e depressão.

**Controle de peso**
Combinada a uma alimentação equilibrada, a caminhada ajuda a manter o metabolismo ativo e prevenir o ganho de peso.

**Como começar**
Comece com 15 minutos e aumente 5 minutos por semana até atingir 30-45 minutos diários.`,
    category: "saude",
    publishedDate: "2025-02-18",
  },
  {
    slug: "como-dormir-melhor",
    title: "Higiene do sono: guia prático para dormir melhor",
    excerpt:
      "Hábitos simples que fazem diferença real na qualidade do sono — sem remédios.",
    content: `A qualidade do sono afeta diretamente concentração, humor, imunidade e longevidade. Veja o que a ciência recomenda.

**Horário consistente**
Acordar e dormir no mesmo horário todos os dias, inclusive fins de semana, regula o ritmo circadiano.

**Ambiente escuro e frio**
O quarto ideal para dormir tem temperatura entre 18–20°C e o mínimo de luz possível.

**Sem telas 1 hora antes**
A luz azul de smartphones e notebooks suprime a produção de melatonina.

**Evitar cafeína após as 14h**
A meia-vida da cafeína é de 5–7 horas. Um café às 15h ainda afeta o sono às 22h.`,
    category: "saude",
    publishedDate: "2025-05-05",
  },
  {
    slug: "como-montar-reserva-de-emergencia",
    title: "Como montar sua reserva de emergência do zero",
    excerpt:
      "Passo a passo para construir a base financeira que protege você de imprevistos.",
    content: `A reserva de emergência é o primeiro passo de qualquer planejamento financeiro sólido. Sem ela, qualquer imprevisto vira dívida.

**Quanto guardar?**
O padrão recomendado é de 3 a 6 meses de despesas mensais. Para autônomos, prefira 6 a 12 meses.

**Onde guardar?**
A reserva precisa ter liquidez imediata. As melhores opções são:
- Tesouro Selic
- CDB com liquidez diária (acima de 100% do CDI)
- Conta remunerada de corretoras

**Como montar**
1. Some todas as despesas mensais fixas e variáveis
2. Multiplique por 6 (meta inicial)
3. Divida em aportes mensais realistas
4. Automatize a transferência no dia do pagamento`,
    category: "financas",
    publishedDate: "2025-01-15",
  },
  {
    slug: "tesouro-direto-para-iniciantes",
    title: "Tesouro Direto para iniciantes: tudo que você precisa saber",
    excerpt:
      "O investimento mais seguro do Brasil explicado de forma simples, com exemplos práticos.",
    content: `O Tesouro Direto é o programa do governo federal para venda de títulos públicos a pessoas físicas. É considerado o investimento mais seguro do país.

**Tipos de títulos**
- **Tesouro Selic**: ideal para reserva de emergência, acompanha a taxa básica de juros
- **Tesouro IPCA+**: protege contra inflação, bom para longo prazo
- **Tesouro Prefixado**: taxa fixa definida na compra, ideal se a Selic cair

**Como investir**
1. Abra conta em uma corretora (XP, Rico, NuInvest, etc.)
2. Acesse a área de renda fixa
3. Escolha o título e o valor (mínimo ~R$ 30)
4. Confirme a compra

**Tributação**
IOF até 30 dias e IR regressivo: 22,5% até 6 meses, 15% acima de 2 anos.`,
    category: "financas",
    publishedDate: "2025-06-20",
  },
];

export const reviews: Review[] = [
  {
    slug: "review-kindle-paperwhite-2024",
    productName: "Kindle Paperwhite (2024)",
    rating: 4.5,
    summary:
      "O melhor e-reader do mercado para quem lê com frequência — autonomia excepcional e tela impecável.",
    content: `O Kindle Paperwhite 2024 chegou com tela de 7 polegadas, resolução de 300 ppi e bateria que dura semanas. Testei durante dois meses de leitura diária.

A tela é simplesmente excelente: sem reflexo, com ajuste de temperatura de cor e brilho automático. Ler sob sol forte é possível sem dificuldade, ao contrário de tablets convencionais.

O armazenamento de 16 GB comporta mais de 10.000 livros. O carregamento via USB-C é bem-vindo após anos de micro-USB.

O único ponto fraco é a integração limitada com bibliotecas e formatos alternativos ao EPUB/MOBI da Amazon.`,
    pros: [
      "Tela de 7\" com 300 ppi sem reflexo",
      "Bateria de até 12 semanas",
      "Carregamento USB-C",
      "Resistência à água IPX8",
      "Leve (205g)",
    ],
    cons: [
      "Ecossistema fechado da Amazon",
      "Sem suporte nativo a EPUB",
      "Navegador web quase inutilizável",
    ],
  },
  {
    slug: "review-airfryer-philips-walita",
    productName: "Airfryer Philips Walita HD9252",
    rating: 4,
    summary:
      "Fritadeira a ar que cumpre o que promete, com bom custo-benefício para famílias de até 4 pessoas.",
    content: `A Philips Walita HD9252 tem capacidade de 4,1 litros e potência de 1400W. Testei por 3 meses no preparo de batatas, frango, legumes e até bolos.

O resultado em alimentos empanados é realmente próximo ao frito em óleo. O frango fica crocante por fora e suculento por dentro sem precisar de óleo.

O cesto antiaderente é fácil de limpar, embora não seja compatível com máquina de lavar louça.

O timer mecânico é simples mas funcional. Modelos mais caros da linha têm display digital e mais programas, mas para uso doméstico básico este modelo é suficiente.`,
    pros: [
      "Resultado crocante sem óleo",
      "Fácil de limpar",
      "Preço acessível",
      "Compacta para 4,1L",
    ],
    cons: [
      "Timer mecânico (sem digital)",
      "Cesto não vai à máquina de lavar",
      "Barulhosa em potência máxima",
    ],
  },
  {
    slug: "review-nubank-ultravioleta",
    productName: "Nubank Ultravioleta (cartão de crédito)",
    rating: 3.5,
    summary:
      "Cartão premium com cashback real e sem anuidade — mas benefícios de viagem ainda ficam atrás da concorrência.",
    content: `O Nubank Ultravioleta é o cartão topo de linha do Nubank, com cashback de 1% em todas as compras direto na fatura, sem limite mensal.

O programa de cashback é simples e transparente: 1% de volta em tudo, sem categorias ou restrições. Em 6 meses de uso com gasto médio de R$ 3.000/mês, recebi R$ 180 de volta.

O acesso a salas VIP (Priority Pass) é um diferencial interessante, mas limitado a 2 visitas por ano — insuficiente para viajantes frequentes.

O app do Nubank é, reconhecidamente, o melhor entre bancos digitais: claro, rápido e com notificações em tempo real.`,
    pros: [
      "Cashback de 1% sem restrições",
      "Sem anuidade (condicionada ao gasto mínimo)",
      "Melhor app do mercado",
      "Acesso a salas VIP (2x/ano)",
    ],
    cons: [
      "Limite de visitas VIP muito baixo",
      "Seguro viagem básico",
      "Programa de pontos menos vantajoso que concorrentes premium",
    ],
  },
];
