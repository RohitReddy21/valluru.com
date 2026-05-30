import HeroSection from '../components/HeroSection';
import TextFlowSection from '../components/TextFlowSection';
import CardSection from '../components/CardSection';
import { siteContent } from '../data/content';

export default function Home() {
  const sections = siteContent.pages.home.sections;

  return (
    <div className="space-y-0">
      {sections.map((section) => {
        if (section.type === 'hero') return <HeroSection key={section.id} section={section} />;
        if (section.type === 'text-flow') return <TextFlowSection key={section.id} section={section} />;
        if (section.type === 'cards') return <CardSection key={section.id} section={section} />;
        return null;
      })}
    </div>
  );
}
