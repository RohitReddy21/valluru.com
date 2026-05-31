import SectionRenderer from '../components/SectionRenderer';
import { useSiteContent } from '../context/useSiteContent';

export default function Advisory() {
  const { siteContent } = useSiteContent();
  const sections = siteContent.pages.advisory.sections;

  return (
    <div>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} pageKey="advisory" />
      ))}
    </div>
  );
}
