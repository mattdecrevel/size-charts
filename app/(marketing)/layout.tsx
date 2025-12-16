import { FloatingHeader } from "@/components/layout/floating-header";

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <FloatingHeader>{children}</FloatingHeader>;
}
