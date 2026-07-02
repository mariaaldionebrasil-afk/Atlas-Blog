import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { authors, categories, posts, reviews } from "../lib/mock-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Limpando dados existentes...");
  await prisma.review.deleteMany();
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();
  await prisma.author.deleteMany();

  console.log("Inserindo autores...");
  for (const author of authors) {
    await prisma.author.create({
      data: {
        slug: author.slug,
        name: author.name,
        bio: author.bio,
        avatar: author.avatar ?? null,
      },
    });
  }

  console.log("Inserindo categorias...");
  for (const cat of categories) {
    await prisma.category.create({
      data: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description ?? null,
      },
    });
  }

  console.log("Inserindo posts...");
  for (const post of posts) {
    const dbAuthor = await prisma.author.findUniqueOrThrow({ where: { slug: post.author.slug } });
    const dbCategory = await prisma.category.findUniqueOrThrow({ where: { slug: post.category } });
    await prisma.post.create({
      data: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        publishedDate: new Date(post.publishedDate),
        coverImage: post.coverImage ?? null,
        authorId: dbAuthor.id,
        categoryId: dbCategory.id,
      },
    });
  }

  console.log("Inserindo reviews...");
  for (const review of reviews) {
    const dbAuthor = await prisma.author.findUniqueOrThrow({ where: { slug: review.author.slug } });
    await prisma.review.create({
      data: {
        slug: review.slug,
        productName: review.productName,
        rating: review.rating,
        summary: review.summary,
        content: review.content,
        pros: review.pros,
        cons: review.cons,
        coverImage: review.coverImage ?? null,
        authorId: dbAuthor.id,
      },
    });
  }

  const postCount = await prisma.post.count();
  const reviewCount = await prisma.review.count();
  const catCount = await prisma.category.count();
  const authorCount = await prisma.author.count();

  console.log(`\nSeed concluído:`);
  console.log(`  ${authorCount} autores`);
  console.log(`  ${catCount} categorias`);
  console.log(`  ${postCount} posts`);
  console.log(`  ${reviewCount} reviews`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
