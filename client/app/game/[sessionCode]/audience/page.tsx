import AudienceDisplay from "@/components/AudienceDisplay";

interface AudiencePageProps {
  params: {
    sessionCode: string;
  };
}

export default function AudiencePage({ params }: AudiencePageProps) {
  return (
    <div className="min-h-screen">
      <AudienceDisplay sessionCode={params.sessionCode} isPresentationMode={true} />
    </div>
  );
}