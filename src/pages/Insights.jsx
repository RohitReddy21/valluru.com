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
      {/* BlogArchive is hidden for now. Use Admin CMS sections below for editable insight content. */}
    </div>
  );
}
