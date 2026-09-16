import { EditorGroup, MediaUploadField, SegmentedField, TextField } from './AdminFields';
import { defaultTheme } from '../../data/cms';
import { prettyLabel } from './fieldUtils';

const colorFields = [
  ['gold', 'Accent', 'Buttons, links, highlights'],
  ['accentCopper', 'Accent hover', 'Darker accent on hover'],
  ['deepNavy', 'Headings', 'Main text and dark sections'],
  ['midNavy', 'Dark borders', 'Lines inside dark sections'],
  ['mutedBlue', 'Body text', 'Secondary paragraph text'],
  ['warmWhite', 'Page background', 'Light section background'],
  ['surfaceGrey', 'Dividers', 'Card borders and lines'],
];

const designFields = [
  { key: 'sectionSpacing', label: 'Section spacing', options: [['compact', 'Compact'], ['normal', 'Normal'], ['spacious', 'Spacious']] },
  { key: 'cardStyle', label: 'Card shadow', options: [['flat', 'Flat'], ['elevated', 'Elevated'], ['premium', 'Premium']] },
  { key: 'cornerRadius', label: 'Corners', options: [['sharp', 'Sharp'], ['soft', 'Soft'], ['rounded', 'Rounded']] },
  { key: 'fontScale', label: 'Text size', options: [['compact', 'Smaller'], ['normal', 'Normal'], ['large', 'Larger']] },
  { key: 'logoSize', label: 'Logo size', options: [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']] },
  { key: 'animationIntensity', label: 'Scroll animation', options: [['calm', 'Calm'], ['normal', 'Normal'], ['expressive', 'Expressive']] },
  { key: 'heroMediaOpacity', label: 'Hero image visibility', options: [['quiet', 'Quiet'], ['subtle', 'Subtle'], ['visible', 'Visible']] },
  { key: 'heroOverlay', label: 'Hero dark overlay', options: [['medium', 'Medium'], ['strong', 'Strong'], ['heavy', 'Heavy']] },
];

function updateHeroImage(section, value) {
  return { media: { ...(section.media || {}), type: 'image', url: value } };
}

export default function DesignPanel({ theme, onThemeChange, pages, onUpdateSection }) {
  const design = theme.design || {};

  const heroSections = Object.entries(pages).flatMap(([pageKey, page]) =>
    (page.sections || [])
      .filter((section) => section.type === 'hero' || section.type === 'page-hero')
      .map((section) => ({ pageKey, pageTitle: page.title || prettyLabel(pageKey), section })),
  );

  return (
    <div className="admin-pane-inner">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Design & colors</h1>
          <p className="admin-page-sub">Pick colors and styles, then click Save site to apply them across the website.</p>
        </div>
        <button
          type="button"
          className="admin-btn"
          onClick={() => {
            if (window.confirm('Reset colors to the original palette?')) {
              onThemeChange({ ...theme, ...Object.fromEntries(colorFields.map(([key]) => [key, defaultTheme[key]])) });
            }
          }}
        >
          Reset colors
        </button>
      </div>

      <EditorGroup title="Colors" icon="droplet">
        <div className="admin-swatches">
          {colorFields.map(([key, label, hint]) => (
            <div key={key} className="admin-swatch">
              <label className="admin-swatch-chip" style={{ background: theme[key] }}>
                <input
                  type="color"
                  value={theme[key]}
                  onChange={(event) => onThemeChange({ ...theme, [key]: event.target.value })}
                  aria-label={`${label} color`}
                />
              </label>
              <div className="min-w-0 flex-1">
                <span className="admin-label">{label}</span>
                <span className="admin-hint-sm block">{hint}</span>
                <input
                  value={theme[key]}
                  onChange={(event) => onThemeChange({ ...theme, [key]: event.target.value })}
                  className="admin-input admin-input-mono mt-1.5"
                  spellCheck="false"
                />
              </div>
            </div>
          ))}
        </div>
      </EditorGroup>

      <EditorGroup title="Layout & motion" icon="layers">
        <div className="admin-grid-2">
          {designFields.map((field) => (
            <SegmentedField
              key={field.key}
              label={field.label}
              value={design[field.key] || field.options[1][0]}
              options={field.options}
              onChange={(value) => onThemeChange({ ...theme, design: { ...design, [field.key]: value } })}
            />
          ))}
        </div>
      </EditorGroup>

      <EditorGroup title="Hero media" icon="image" hint="Background image, video and portrait for each page header." count={heroSections.length}>
        <div className="grid gap-3">
          {heroSections.map(({ pageKey, pageTitle, section }) => (
            <EditorGroup
              key={`${pageKey}-${section.id}`}
              title={pageTitle}
              hint={section.eyebrow || section.id}
              collapsible
              defaultOpen={false}
            >
              <div className="admin-grid-2">
                {section.type === 'hero' && (
                  <div className="admin-span-2">
                    <MediaUploadField
                      label="heroImage"
                      displayLabel="Portrait image"
                      value={section.media?.url || ''}
                      onChange={(value) => onUpdateSection(pageKey, section.id, updateHeroImage(section, value))}
                    />
                  </div>
                )}
                <div className="admin-span-2">
                  <MediaUploadField
                    label="backgroundImage"
                    value={section.backgroundImage || ''}
                    onChange={(value) => onUpdateSection(pageKey, section.id, { backgroundImage: value })}
                  />
                </div>
                <div className="admin-span-2">
                  <TextField
                    label="backgroundVideo"
                    value={section.backgroundVideo || ''}
                    onChange={(value) => onUpdateSection(pageKey, section.id, { backgroundVideo: value })}
                  />
                </div>
              </div>
            </EditorGroup>
          ))}
        </div>
      </EditorGroup>
    </div>
  );
}
