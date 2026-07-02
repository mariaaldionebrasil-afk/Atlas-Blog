import Link from "next/link";
import type { Post } from "../lib/types";

type Props = {
  post: Post;
};

export default function PostCard({ post }: Props) {
  return (
    <article className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
      <span className="text-xs font-medium uppercase tracking-wide text-blue-600">
        {post.category}
      </span>
      <h2 className="mt-2 text-lg font-semibold text-gray-900 leading-snug">
        <Link href={`/post/${post.slug}`} className="hover:underline">
          {post.title}
        </Link>
      </h2>
      <p className="mt-2 text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
      <div className="mt-4 flex items-center justify-between">
        <time className="text-xs text-gray-400">{post.publishedDate}</time>
        <Link
          href={`/post/${post.slug}`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Leia mais
        </Link>
      </div>
    </article>
  );
}
