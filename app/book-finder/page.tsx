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
        <div className="relative h-64 w-full bg-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={hasError || !imgSrc ? "https://via.placeholder.com/150?text=No+Image" : imgSrc}
                alt={alt}
                className="object-contain w-full h-full p-4"
                onError={() => setHasError(true)}
            />
            <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white rounded ${source === 'Rokomari' ? 'bg-green-600' :
                source === 'Wafilife' ? 'bg-cyan-600' :
                    source === 'Batighor' ? 'bg-red-600' : 'bg-orange-500'
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

    // Dynamic API URL state
    const [apiUrl, setApiUrl] = useState("http://127.0.0.1:8000");
    const [showSettings, setShowSettings] = useState(false);
    const [tempUrl, setTempUrl] = useState("");

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
        } catch (error) {
            console.error("Error fetching books:", error);
            alert(`Error connecting to backend at ${apiUrl}. Check your settings.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load API URL from local storage or env
        const savedUrl = localStorage.getItem("api_url");
        const envUrl = process.env.NEXT_PUBLIC_API_URL;
        const initialUrl = savedUrl || envUrl || "http://127.0.0.1:8000";
        setApiUrl(initialUrl);
        setTempUrl(initialUrl);

        const params = new URLSearchParams(window.location.search);
        const q = params.get("q");
        const a = params.get("author");
        const s = params.get("store");

        if (q || a) {
            setQuery(q || "");
            setAuthor(a || "");
            setStore(s || "all");
            // Pass the determined URL explicitly to avoid closure staleness if called immediately
            // But fetchBooks uses 'apiUrl' state which might not be updated yet in this render cycle if we just set it.
            // So we pass the url to a modified fetchBooks or just wait. 
            // Better: define fetchBooks inside or use a ref. 
            // For simplicity, we'll call axios directly here or rely on the fact that initial render might be fast enough? 
            // Actually, let's just use the variable 'initialUrl' for the first fetch.

            const performInitialFetch = async () => {
                setLoading(true);
                setSearched(true);
                try {
                    const response = await axios.get(`${initialUrl}/api/search/`, {
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

    const saveSettings = () => {
        // Remove trailing slash
        const cleanUrl = tempUrl.replace(/\/$/, "");
        localStorage.setItem("api_url", cleanUrl);
        setApiUrl(cleanUrl);
        setShowSettings(false);
        alert("API URL saved!");
    };

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
        <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50 text-gray-900 relative">
            <div className="absolute top-4 left-4">
                <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-100 transition border border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    <span className="font-medium">Back to Home</span>
                </Link>
            </div>

            <div className="absolute top-4 right-4">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition"
                    title="API Configuration"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.581-.495.644-.869l.214-1.281z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>

            {showSettings && (
                <div className="w-full max-w-md mb-8 p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-2 text-gray-700">Backend API URL</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={tempUrl}
                            onChange={(e) => setTempUrl(e.target.value)}
                            className="flex-1 p-2 border rounded text-sm"
                            placeholder="https://your-backend-url..."
                        />
                        <button
                            onClick={saveSettings}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Current: {apiUrl} <br />
                        Use this to connect to a forwarded backend (e.g. from VS Code) on mobile.
                    </p>
                </div>
            )}

            <Link href="/">
                <h1 className="text-4xl font-bold mb-8 text-blue-600 cursor-pointer hover:text-blue-700 transition">E-Finder</h1>
            </Link>

            <form onSubmit={searchBooks} className="w-full max-w-2xl flex flex-col gap-4 mb-8 bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Book Title..."
                        className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Author Name..."
                        className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <label className="font-medium text-gray-700">Store:</label>
                            <select
                                value={store}
                                onChange={(e) => setStore(e.target.value)}
                                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Stores</option>
                                <option value="rokomari">Rokomari</option>
                                <option value="wafilife">Wafilife</option>
                                <option value="batighor">Batighor</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="font-medium text-gray-700">Sort:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="w-full md:w-auto px-4 py-3 bg-red-100 text-red-700 font-semibold rounded-lg shadow-md hover:bg-red-200 transition"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={handleRefresh}
                            className="w-full md:w-auto px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition"
                        >
                            Refresh
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 transition"
                        >
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </div>
                </div>
            </form>

            {loading && (
                <div className="flex justify-center items-center mb-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}

            {!loading && searched && books.length === 0 && (
                <p className="text-lg text-gray-600">No books found.</p>
            )}

            {!loading && books.length > 0 && (
                <div className="w-full max-w-6xl mb-4 flex justify-between items-center">
                    <p className="text-gray-600">Found {books.length} results</p>
                    <p className="text-gray-600">Page {currentPage} of {totalPages}</p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl mb-8">
                {currentBooks.map((book, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border border-gray-100 flex flex-col">
                        <BookImage src={book.image_url} alt={book.title} source={book.source} />
                        <div className="p-4 flex flex-col flex-grow">
                            <h2 className="text-lg font-semibold mb-1 line-clamp-2" title={book.title}>{book.title}</h2>
                            {book.author && <p className="text-sm text-gray-600 mb-2 line-clamp-1">{book.author}</p>}
                            <div className="mt-auto flex items-center justify-between">
                                <span className="text-xl font-bold text-gray-800">৳ {book.price}</span>
                                <a
                                    href={book.product_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-700 transition"
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
                <div className="flex gap-2 justify-center items-center mt-4">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100"
                    >
                        Previous
                    </button>

                    <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Logic to show a window of pages around current page
                            let pageNum = i + 1;
                            if (totalPages > 5) {
                                if (currentPage > 3) {
                                    pageNum = currentPage - 3 + i;
                                }
                                if (pageNum > totalPages) {
                                    pageNum = totalPages - 4 + i;
                                }
                            }

                            // Simple logic for now: just show first 5 or if current is high, show range
                            // Let's keep it simple: Show current, prev, next, first, last logic is complex for simple UI
                            // Just showing a simple range or all if small

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => paginate(pageNum)}
                                    className={`w-10 h-10 rounded-lg ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100"
                    >
                        Next
                    </button>
                </div>
            )}
        </main>
    );
}
