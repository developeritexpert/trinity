// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 text-center">
            <h2 className="text-4xl font-light mb-4">Product Not Found</h2>
            <p className="text-gray-500 mb-8">Sorry, we couldn't find the custom product you are looking for.</p>
            <Link
                href="/men/suit"
                className="px-6 py-3 bg-black text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition"
            >
                Design a Suit Instead
            </Link>
        </div>
    );
}