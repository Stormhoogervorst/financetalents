import JobsListingPage, {
  JobsSearchParams,
} from "./JobsListingPage";

export const revalidate = 0;

export const metadata = {
  title: "Jobs",
  description:
    "Browse active finance jobs in Private Equity, Venture Capital, Investment Banking and FinTech. Find your next role on Finance Talents.",
  alternates: {
    canonical: "/jobs",
  },
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<JobsSearchParams>;
}) {
  const params = await searchParams;

  return <JobsListingPage params={params} />;
}
