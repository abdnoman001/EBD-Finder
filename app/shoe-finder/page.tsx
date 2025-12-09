import Link from "next/link";

export default function Page() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-orange-100 via-yellow-100 to-red-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
            <div className="glass-card p-12 rounded-2xl max-w-lg w-full text-center shadow-xl dark:bg-gray-800/60 dark:border-gray-700">
                <h1 className="text-5xl font-bold mb-6 text-gray-800 dark:text-white drop-shadow-sm">Shoe Finder</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 font-light">
                    Step into style soon! We are curating the best shoe collection for you.
                </p>
                <Link href="/" className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition shadow-md">
                    Back to Home
                </Link>
            </div>
        </main>
    );
}
