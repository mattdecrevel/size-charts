export default function SizeGuideLayout({ children }: { children: React.ReactNode }) {
	return (
		<main className="mx-auto max-w-6xl">
			{children}
		</main>
	);
}
