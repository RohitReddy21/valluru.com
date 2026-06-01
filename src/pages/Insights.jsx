import SectionRenderer from '../components/SectionRenderer';
import BlogArchive from '../components/BlogArchive';
import { useSiteContent } from '../context/useSiteContent';

export default function Insights() {
  const { siteContent } = useSiteContent();
  const sections = siteContent.pages.insights.sections;

  return (
    <div>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} pageKey="insights" />
      ))}
      <BlogArchive blogs={siteContent.pages.insights.blogs} />
    </div>
  );
}
