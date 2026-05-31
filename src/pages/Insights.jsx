import SectionRenderer from '../components/SectionRenderer';
import { useSiteContent } from '../context/useSiteContent';

export default function Insights() {
  const { siteContent } = useSiteContent();
  const sections = siteContent.pages.insights.sections;

  return (
    <div>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} pageKey="insights" />
      ))}
    </div>
  );
}
