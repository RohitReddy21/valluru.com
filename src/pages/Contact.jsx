import SectionRenderer from '../components/SectionRenderer';
import { useSiteContent } from '../context/useSiteContent';
import { useScrollToHash } from '../components/ScrollLink';

export default function Contact() {
  useScrollToHash();
  const { siteContent } = useSiteContent();
  const sections = siteContent.pages.contact.sections;

  return (
    <div>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} pageKey="contact" />
      ))}
    </div>
  );
}
