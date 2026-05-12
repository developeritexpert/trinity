// src/app/[category]/[product]/page.tsx
import { notFound } from 'next/navigation';
import { getProductConfig } from '@/core/config';
import { ConfiguratorLayout } from '@/features/configurator/components/ConfiguratorLayout';
import Footer from '@/shared/components/Footer';

interface PageProps {
    params: Promise<{
        category: string;
        product: string;
    }>;
}

export default async function ProductPage({ params }: PageProps) {
    const resolvedParams = await params;
    const { category, product } = resolvedParams;

    // Fetch the corresponding JSON
    const config = getProductConfig(category, product);

    // Trigger 404 if not found
    if (!config) {
        notFound();
    }

    return (
        <main className="w-full bg-white text-slate-900 flex flex-col min-h-screen">
            {/* Viewport container lock for the customizer workspace */}
            <div className="w-full h-[calc(100vh-112px)] flex-shrink-0">
                <ConfiguratorLayout initialConfig={config} />
            </div>
            
            {/* Branded Footer */}
            <Footer />
        </main>
    );
}