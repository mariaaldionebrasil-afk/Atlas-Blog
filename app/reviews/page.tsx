import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ReviewCard from "../../components/ReviewCard";
import siteConfig from "../../config/site.config";
import { prisma } from "../../lib/prisma";
import { mapReview } from "../../lib/mappers";

export default async function ReviewsPage() {
  const dbReviews = await prisma.review.findMany({ include: { author: true } });
  const reviews = dbReviews.map(mapReview);

  return (
    <>
      <Header config={siteConfig} />
      <main className="flex-1 mx-auto max-w-5xl px-4 py-12 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews</h1>
        <h2 className="text-sm text-gray-500 font-normal mb-8">
          Avaliações detalhadas de produtos e serviços testados pela equipe.
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => <ReviewCard key={review.slug} review={review} />)}
        </div>
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
