type Props = {
  title: string;
  subtitle?: string;
};

export default function HeroSection({ title, subtitle }: Props) {
  return (
    <section className="bg-gray-900 text-white py-16 px-4">
      <div className="mx-auto max-w-5xl flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">{title}</h1>
        {subtitle && (
          <p className="mt-4 text-lg text-gray-300 max-w-[600px] sm:max-w-[700px] mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
