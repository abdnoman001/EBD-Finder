import Link from "next/link";

export default function Page() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
            <div className="glass-card p-12 rounded-2xl max-w-lg w-full text-center shadow-xl">
                <h1 className="text-5xl font-bold mb-6 text-gray-800 drop-shadow-sm">Electronics Finder</h1>
                <p className="text-xl text-gray-600 mb-10 font-light">
                    The best gadgets and deals are coming your way. Watch this space!
                </p>
                <Link href="/" className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition shadow-md">
                    Back to Home
                </Link>
            </div>
        </main>
    );
}
