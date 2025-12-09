import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const finders = [
    {
      name: "Book Finder",
      description: "Find the best prices for books across multiple stores.",
      href: "/book-finder",
      image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Shoe Finder",
      description: "Step into style with our shoe collection finder.",
      href: "/shoe-finder",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Electronics Finder",
      description: "Find the best deals on gadgets and electronics.",
      href: "/electronics-finder",
      image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80",
    }
  ];

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="w-full max-w-6xl flex flex-col items-center mt-10 mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-center drop-shadow-sm">
          E-Finder Hub
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 text-center max-w-2xl font-light leading-relaxed">
          Your ultimate destination for finding the best deals on books, fashion, and electronics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl px-2">
        {finders.map((finder) => (
          <Link href={finder.href} key={finder.name} className="group">
            <div className="glass-card h-full flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 dark:bg-gray-800/60 dark:border-gray-700">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={finder.image}
                  alt={finder.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                <h2 className="absolute bottom-4 left-4 text-2xl font-bold text-white drop-shadow-md">
                  {finder.name}
                </h2>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {finder.description}
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
                  Explore
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

