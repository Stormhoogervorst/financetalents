import VacaturesListingPage, {
  VacaturesSearchParams,
} from "./VacaturesListingPage";

export const revalidate = 0;

export const metadata = {
  title: "Jobs",
  description:
    "Browse active finance jobs in Private Equity, Venture Capital, Investment Banking and FinTech. Find your next role on Finance Talents.",
  alternates: {
    canonical: "/vacatures",
  },
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<VacaturesSearchParams>;
}) {
  const params = await searchParams;

  return <VacaturesListingPage params={params} />;
}
