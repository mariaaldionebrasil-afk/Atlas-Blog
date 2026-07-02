import Link from "next/link";
import type { Review } from "../lib/types";

type Props = {
  review: Review;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-sm font-medium text-amber-500">
      {"★".repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 ? "½" : ""}
      <span className="ml-1 text-gray-500">({rating}/5)</span>
    </span>
  );
}

export default function ReviewCard({ review }: Props) {
  return (
    <article className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
      <h2 className="text-lg font-semibold text-gray-900">
        <Link href={`/review/${review.slug}`} className="hover:underline">
          {review.productName}
        </Link>
      </h2>
      <div className="mt-1">
        <StarRating rating={review.rating} />
      </div>
      <p className="mt-3 text-sm text-gray-600 line-clamp-3">{review.summary}</p>
      <div className="mt-4">
        <Link
          href={`/review/${review.slug}`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Ver review completo
        </Link>
      </div>
    </article>
  );
}
