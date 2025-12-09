"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Book {
    title: string;
    author: string;
    price: number;
    image_url: string;
    product_url: string;
    source: string;
}

// Separate component for handling image errors gracefully
const BookImage = ({ src, alt, source }: { src: string, alt: string, source: string }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
    }, [src]);

    return (
        <div className="relative h-64 w-full bg-white/50 flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={hasError || !imgSrc ? "https://via.placeholder.com/150?text=No+Image" : imgSrc}
                alt={alt}
                className="object-contain max-h-full max-w-full drop-shadow-sm"
                onError={() => setHasError(true)}
            />
            <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white rounded shadow-sm ${source === 'Rokomari' ? 'bg-green-600/90' :
                source === 'Wafilife' ? 'bg-cyan-600/90' :
                    source === 'Batighor' ? 'bg-red-600/90' : 'bg-orange-500/90'
                }`}>
                {source}
            </span>
        </div>
    );
};

export default function Home() {
    const [query, setQuery] = useState("");
    const [author, setAuthor] = useState("");
    const [store, setStore] = useState("all");
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [sortBy, setSortBy] = useState("relevance");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    const fetchBooks = async (q: string, a: string, s: string) => {
        if (!q && !a) return;
        setLoading(true);
        setSearched(true);
        setBooks([]);
        setCurrentPage(1);

        try {
            const response = await axios.get(`${apiUrl}/api/search/`, {
                params: { q, author: a, store: s }
            });
            setBooks(response.data);
        } catch (error: any) {
            console.error("Error fetching books:", error);
            let errorMessage = "Error connecting to backend.";
            if (error.response) {
                errorMessage = `Server Error: ${error.response.status} - ${error.response.statusText}`;
            } else if (error.request) {
                errorMessage = "No response from server. The backend might be waking up (Render free tier) or is unreachable.";
            } else {
                errorMessage = `Request Error: ${error.message}`;
            }
            alert(`${errorMessage} URL: ${apiUrl}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q");
        const a = params.get("author");
        const s = params.get("store");

        if (q || a) {
            setQuery(q || "");
            setAuthor(a || "");
            setStore(s || "all");

            const performInitialFetch = async () => {
                setLoading(true);
                setSearched(true);
                try {
                    const response = await axios.get(`${apiUrl}/api/search/`, {
                        params: { q: q || "", author: a || "", store: s || "all" }
                    });
                    setBooks(response.data);
                } catch (error) {
                    console.error("Error fetching books:", error);
                } finally {
                    setLoading(false);
                }
            };
            performInitialFetch();
        }
    }, []);

    const searchBooks = async (e: React.FormEvent) => {
        e.preventDefault();

        // Update URL
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (author) params.set("author", author);
        if (store) params.set("store", store);
        window.history.pushState({}, "", `?${params.toString()}`);

        fetchBooks(query, author, store);
    };

    // Sorting & Pagination logic
    const sortedBooks = [...books].sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBooks = sortedBooks.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(books.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleRefresh = () => {
        fetchBooks(query, author, store);
    };

    const handleClear = () => {
        setQuery("");
        setAuthor("");
        setStore("all");
        setBooks([]);
        setSearched(false);
        window.history.pushState({}, "", window.location.pathname);
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
            <div className="w-full max-w-7xl flex flex-col items-center">
                <div className="w-full flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg shadow-sm hover:bg-white transition border border-white/50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        <span className="font-medium">Back</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800 drop-shadow-sm">Book Finder</h1>
                    <div className="w-24 hidden md:block"></div>
                </div>

                <form onSubmit={searchBooks} className="w-full max-w-4xl flex flex-col gap-4 mb-12 glass-card p-6 md:p-8 rounded-2xl shadow-lg">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Book Title..."
                            className="flex-1 p-4 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition placeholder-gray-600"
                        />
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="Author Name..."
                            className="flex-1 p-4 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition placeholder-gray-600"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between ">
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <label className="font-medium text-gray-700 whitespace-nowrap">Store:</label>
                                <select
                                    value={store}
                                    onChange={(e) => setStore(e.target.value)}
                                    className="p-2 rounded-lg border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full sm:w-auto hover:cursor-pointer"
                                >
                                    <option value="all">All Stores</option>
                                    <option value="rokomari">Rokomari</option>
                                    <option value="wafilife">Wafilife</option>
                                    <option value="batighor">Batighor</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <label className="font-medium text-gray-700 whitespace-nowrap">Sort:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="p-2 rounded-lg border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full sm:w-auto hover:cursor-pointer"
                                >
                                    <option value="relevance">Relevance</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                            <button
                                type="button"
                                onClick={handleClear}
                                className="flex-1 md:flex-none px-4 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition border border-red-100 hover:cursor-pointer"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={handleRefresh}
                                className="flex-1 md:flex-none px-6 py-3 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition border border-gray-200 hover:cursor-pointer"
                            >
                                Refresh
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 md:flex-none px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-md disabled:opacity-70 hover:cursor-pointer"
                            >
                                {loading ? "Searching..." : "Search"}
                            </button>
                        </div>
                    </div>
                </form>

                {loading && (
                    <div className="flex justify-center items-center mb-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {!loading && searched && books.length === 0 && (
                    <div className="glass-card p-8 rounded-xl text-center w-full max-w-2xl">
                        <p className="text-xl text-gray-600">No books found matching your criteria.</p>
                    </div>
                )}

                {!loading && books.length > 0 && (
                    <div className="w-full mb-6 flex justify-between items-center px-2">
                        <p className="text-gray-600 font-medium">Found {books.length} results</p>
                        <p className="text-gray-600 font-medium">Page {currentPage} of {totalPages}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full mb-8">
                    {currentBooks.map((book, index) => (
                        <div key={index} className="glass-card bg-white/80 rounded-xl overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-xl">
                            <BookImage src={book.image_url} alt={book.title} source={book.source} />
                            <div className="p-5 flex flex-col flex-grow">
                                <h2 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2 leading-tight" title={book.title}>{book.title}</h2>
                                {book.author && <p className="text-sm text-gray-500 mb-3 line-clamp-1">{book.author}</p>}
                                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                                    <span className="text-xl font-bold text-blue-600">৳ {book.price}</span>
                                    <a
                                        href={book.product_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
                                    >
                                        Buy Now
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Controls */}
                {!loading && books.length > itemsPerPage && (
                    <div className="flex gap-2 justify-center items-center mt-4 mb-12 flex-wrap">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition shadow-sm"
                        >
                            Previous
                        </button>

                        <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none pb-2 sm:pb-0">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum = i + 1;
                                if (totalPages > 5) {
                                    if (currentPage > 3) {
                                        pageNum = currentPage - 3 + i;
                                    }
                                    if (pageNum > totalPages) {
                                        pageNum = totalPages - 4 + i;
                                    }
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => paginate(pageNum)}
                                        className={`w-10 h-10 rounded-lg transition flex-shrink-0 ${currentPage === pageNum ? 'bg-blue-600 text-white font-bold shadow-md' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
