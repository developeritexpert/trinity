// src/app/[category]/[product]/layout.tsx
import localFont from 'next/font/local';

const womenBlazerFont = localFont({
    src: '../../../fonts/women-blazzer.woff',
    variable: '--font-women-blazer',
    display: 'swap',
});

export default function ProductLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`${womenBlazerFont.variable}`}>
            {children}
        </div>
    );
}
