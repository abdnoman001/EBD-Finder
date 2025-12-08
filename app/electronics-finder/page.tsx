import Link from "next/link";

export default function Page() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">Electronics Finder</h1>
            <p className="text-xl text-gray-600 mb-8">Coming Soon...</p>
            <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Back to Home
            </Link>
        </main>
    );
}
