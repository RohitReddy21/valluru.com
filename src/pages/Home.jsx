import SectionRenderer from '../components/SectionRenderer';
import { useSiteContent } from '../context/useSiteContent';

export default function Home() {
  const { siteContent } = useSiteContent();
  const sections = siteContent.pages.home.sections;

  return (
    <div className="space-y-0">
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} pageKey="home" />
      ))}
    </div>
  );
}
