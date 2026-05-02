import PortalNav from "@/components/PortalNav";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth is handled by middleware.ts (redirects unauthenticated users to /login).
  // Firm-record checks are handled by each individual page so there is no
  // central redirect that could create a loop.
  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNav />
      {/* md:pl-60 offsets content for the fixed desktop sidebar */}
      <div className="md:pl-60">
        <main className="px-4 sm:px-6 lg:px-8 pt-8 pb-20 md:pb-10">{children}</main>
      </div>
    </div>
  );
}
