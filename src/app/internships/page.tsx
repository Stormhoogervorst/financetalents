import JobsListingPage, {
  JobsSearchParams,
} from "../jobs/JobsListingPage";

export const revalidate = 0;

const INTERNSHIP_TYPE_VALUES = ["stage", "internship", "student", "Studentbaan"];

export const metadata = {
  title: "Internships | Finance Talents",
  description:
    "Browse active finance internships in Private Equity, Venture Capital, Investment Banking and FinTech. Find your next internship on Finance Talents.",
  alternates: {
    canonical: "/internships",
  },
};

export default async function InternshipsPage({
  searchParams,
}: {
  searchParams: Promise<JobsSearchParams>;
}) {
  const params = await searchParams;

  return (
    <JobsListingPage
      params={params}
      basePath="/internships"
      headingText="Finance internships"
      subtitleText="Discover internships at the funds, banks and builders shaping modern finance."
      typeValues={INTERNSHIP_TYPE_VALUES}
      typeOptions={[{ value: "stage", label: "Internship" }]}
      eyebrowText="Elite finance internships. One platform."
      filterHelperText="Filter by role, city, radius and sector. Apply directly to the firm when you find a fit."
      resultsHeadingText="Open internships."
      resultLabel={{
        singular: "active internship",
        plural: "active internships",
      }}
      emptyState={{
        filteredTitle: "No internships found.",
        defaultTitle: "Coming soon.",
        filteredText:
          "Try another role, city or sector to uncover more internships.",
        defaultText:
          "No active internships at the moment. Check back soon for new opportunities.",
        viewAllText: "View all internships",
      }}
      cardStageMode
    />
  );
}
