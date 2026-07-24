import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(__dirname, "../.env.local") });
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});
const prisma = new PrismaClient({ adapter });

const APPLY = process.argv.includes("--apply");

async function main() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", OR: [{ authorId: null }, { categoryId: null }] },
    select: {
      id: true,
      title: true,
      slug: true,
      authorId: true,
      categoryId: true,
      roundup: { select: { title: true, authorId: true, categoryId: true } },
    },
    orderBy: { title: "asc" },
  });

  console.log(`Encontrados ${posts.length} posts PUBLISHED sem author e/ou category.\n`);

  const fixable: typeof posts = [];
  const unfixable: typeof posts = [];

  for (const post of posts) {
    const canFillAuthor = post.authorId ?? post.roundup?.authorId;
    const canFillCategory = post.categoryId ?? post.roundup?.categoryId;
    if (canFillAuthor && canFillCategory) {
      fixable.push(post);
    } else {
      unfixable.push(post);
    }
  }

  for (const post of fixable) {
    const newAuthorId = post.authorId ?? post.roundup!.authorId!;
    const newCategoryId = post.categoryId ?? post.roundup!.categoryId!;
    console.log(
      `${APPLY ? "[APLICANDO]" : "[DRY-RUN]"} ${post.title}\n` +
        `  silo: ${post.roundup?.title ?? "-"}\n` +
        `  authorId:   ${post.authorId ?? "null"} -> ${newAuthorId}\n` +
        `  categoryId: ${post.categoryId ?? "null"} -> ${newCategoryId}\n`
    );
    if (APPLY) {
      await prisma.post.update({
        where: { id: post.id },
        data: { authorId: newAuthorId, categoryId: newCategoryId },
      });
    }
  }

  if (unfixable.length > 0) {
    console.log(`\n${unfixable.length} post(s) NÃO puderam ser corrigidos automaticamente (sem silo-pai com author/category definidos):`);
    for (const post of unfixable) {
      console.log(`  - ${post.title} (slug: ${post.slug})`);
    }
  }

  console.log(
    APPLY
      ? `\n${fixable.length} post(s) atualizados.`
      : `\nModo dry-run — nada foi alterado. Rode com --apply para aplicar de fato.`
  );

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
