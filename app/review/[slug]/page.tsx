import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Breadcrumb from "../../../components/Breadcrumb";
import { reviews } from "../../../lib/mock-data";
import siteConfig from "../../../config/site.config";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return reviews.map((r) => ({ slug: r.slug }));
}

export default async function ReviewPage({ params }: Props) {
  const { slug } = await params;
  const review = reviews.find((r) => r.slug === slug);
  if (!review) notFound();

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Reviews", href: "/reviews" },
    { label: review.productName, href: `/review/${review.slug}` },
  ];

  const fullStars = Math.floor(review.rating);
  const halfStar = review.rating % 1 >= 0.5;

  return (
    <>
      <Header config={siteConfig} />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-10 w-full">
        <Breadcrumb crumbs={crumbs} />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">{review.productName}</h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-2xl text-amber-500">
            {"★".repeat(fullStars)}{halfStar ? "½" : ""}{"☆".repeat(5 - fullStars - (halfStar ? 1 : 0))}
          </span>
          <span className="text-gray-500 text-sm">{review.rating}/5</span>
        </div>
        <p className="mt-4 text-lg text-gray-600 border-l-4 border-amber-200 pl-4 italic">
          {review.summary}
        </p>

        <article className="mt-8 space-y-4 text-gray-700 leading-relaxed">
          {review.content.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </article>

        <div className="mt-10 grid sm:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-5">
            <h2 className="font-semibold text-green-800 mb-3">Prós</h2>
            <ul className="space-y-2">
              {review.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                  <span className="mt-0.5">✓</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-5">
            <h2 className="font-semibold text-red-800 mb-3">Contras</h2>
            <ul className="space-y-2">
              {review.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                  <span className="mt-0.5">✗</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
