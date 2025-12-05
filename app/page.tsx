"use client";

import axios from "axios";
import { useState } from "react";

interface Book {
  title: string;
  author: string;
  price: number;
  image_url: string;
  product_url: string;
  source: string;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [author, setAuthor] = useState("");
  const [store, setStore] = useState("all");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const searchBooks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query && !author) return;

    setLoading(true);
    setSearched(true);
    setBooks([]);
    setCurrentPage(1); // Reset to first page on new search

    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/search/`, {
        params: {
          q: query,
          author: author,
          store: store
        }
      });
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = books.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(books.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50 text-gray-900">
      <h1 className="text-4xl font-bold mb-8 text-blue-600">E-Finder</h1>

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
          <div className="flex items-center gap-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400 transition"
          >
            {loading ? "Searching..." : "Search Books"}
          </button>
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
            <div className="relative h-64 w-full bg-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={book.image_url}
                alt={book.title}
                className="object-contain w-full h-full p-4"
              />
              <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white rounded ${book.source === 'Rokomari' ? 'bg-green-600' : 'bg-orange-500'}`}>
                {book.source}
              </span>
            </div>
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
