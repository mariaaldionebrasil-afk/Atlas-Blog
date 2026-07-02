import type { Author } from "../lib/types";

type Props = {
  author: Author;
};

export default function AuthorBio({ author }: Props) {
  return (
    <div className="mt-10 border-t border-gray-200 pt-8 flex items-start gap-4">
      <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500">
        {author.name.charAt(0)}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Escrito por</p>
        <p className="font-semibold text-gray-900">{author.name}</p>
        <p className="mt-1 text-sm text-gray-600 leading-relaxed">{author.bio}</p>
      </div>
    </div>
  );
}
