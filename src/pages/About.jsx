import SectionRenderer from '../components/SectionRenderer';
import { useSiteContent } from '../context/useSiteContent';

export default function About() {
  const { siteContent } = useSiteContent();
  const sections = siteContent.pages.about.sections;

  return (
    <div>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} pageKey="about" />
      ))}
    </div>
  );
}
