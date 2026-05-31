import SectionRenderer from '../components/SectionRenderer';
import { useSiteContent } from '../context/useSiteContent';

export default function Investments() {
  const { siteContent } = useSiteContent();
  const sections = siteContent.pages.investments.sections;

  return (
    <div>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} pageKey="investments" />
      ))}
    </div>
  );
}
