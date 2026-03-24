import { ViewSecret } from "@/components/view-secret";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "機密情報の閲覧 - Vanish Link",
  description: "1回限りの機密情報閲覧ページ",
  robots: { index: false, follow: false },
};

export default async function ViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 flex items-center justify-center min-h-[60vh]">
      <ViewSecret id={id} />
    </div>
  );
}
