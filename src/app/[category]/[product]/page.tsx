// src/app/[category]/[product]/page.tsx
import { notFound } from 'next/navigation';
import { getProductConfig } from '@/core/config';
import { ConfiguratorLayout } from '@/features/configurator/components/ConfiguratorLayout';

// In Next.js 15+, params is a Promise!
interface PageProps {
    params: Promise<{
        category: string;
        product: string;
    }>;
}

// Added the "async" keyword to the function
export default async function ProductPage({ params }: PageProps) {

    // 1. We must AWAIT the params before destructuring them
    const resolvedParams = await params;
    const { category, product } = resolvedParams;

    // 2. Fetch the corresponding JSON
    const config = getProductConfig(category, product);

    // 3. Trigger 404 if not found
    if (!config) {
        notFound();
    }

    // 4. Render the UI
    return (
        <main className="w-full h-screen bg-white text-slate-900 overflow-hidden">
            <ConfiguratorLayout initialConfig={config} />
        </main>
    );
}