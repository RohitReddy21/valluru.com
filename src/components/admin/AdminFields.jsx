import { useEffect, useRef, useState } from 'react';
import { Icon } from './AdminIcons';
import {
  appearanceKeys,
  createArrayItem,
  createEmptyCta,
  duplicateArrayItem,
  hiddenKeysFor,
  isCtaField,
  isPlainObject,
  isUploadableImageField,
  isVideoUrl,
  itemSnippet,
  itemThumbUrl,
  itemTitle,
  metaFor,
  moveArrayItem,
  optionsFor,
  uploadMaxBytes,
} from './fieldUtils';

export function AutoTextarea({ value, onChange, minRows = 3, className = '', ...rest }) {
  const ref = useRef(null);

  // Grow with the content so long copy never hides behind an inner scrollbar.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight + 2}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={minRows}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      className={`admin-textarea is-auto ${className}`}
      {...rest}
    />
  );
}

function FieldHead({ label, count, max }) {
  return (
    <span className="admin-field-head">
      <span className="admin-label">{label}</span>
      {max ? <span className={`admin-count${count > max ? ' is-over' : ''}`}>{count}/{max}</span> : null}
    </span>
  );
}

export function TextField({ label, displayLabel, value, onChange, hint, placeholder, multiline, max, minRows }) {
  const meta = metaFor(label);
  const text = value ?? '';
  const isMultiline = multiline ?? (meta.multiline || String(text).length > 90);
  const limit = max ?? meta.max;
  const help = hint ?? meta.hint;

  return (
    <label className="admin-field">
      <FieldHead label={displayLabel || meta.label} count={String(text).length} max={limit} />
      {isMultiline ? (
        <AutoTextarea
          value={text}
          onChange={onChange}
          minRows={minRows || 3}
          placeholder={placeholder ?? meta.placeholder}
        />
      ) : (
        <input
          value={text}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder ?? meta.placeholder}
          className="admin-input"
        />
      )}
      {help && <span className="admin-hint-sm">{help}</span>}
    </label>
  );
}

export function Switch({ checked, onChange, label }) {
  return (
    <span className={`admin-switch${checked ? ' is-on' : ''}`}>
      <input
        type="checkbox"
        role="switch"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
        aria-label={label}
      />
      <span className="admin-switch-thumb" aria-hidden="true"></span>
    </span>
  );
}

export function ToggleField({ label, displayLabel, value, onChange, hint }) {
  const meta = metaFor(label);
  const help = hint ?? meta.hint;

  return (
    <label className="admin-toggle-row">
      <span className="grid min-w-0 gap-0.5">
        <span className="admin-label">{displayLabel || meta.label}</span>
        {help && <span className="admin-hint-sm">{help}</span>}
      </span>
      <Switch checked={value} onChange={onChange} label={displayLabel || meta.label} />
    </label>
  );
}

export function NumberField({ label, value, onChange }) {
  return (
    <label className="admin-field">
      <FieldHead label={metaFor(label).label} />
      <input
        type="number"
        value={value ?? 0}
        onChange={(event) => onChange(Number(event.target.value))}
        className="admin-input"
      />
    </label>
  );
}

export function SelectField({ label, value, onChange, options, hint }) {
  return (
    <label className="admin-field">
      <FieldHead label={label} />
      <select value={value} onChange={(event) => onChange(event.target.value)} className="admin-select">
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
      {hint && <span className="admin-hint-sm">{hint}</span>}
    </label>
  );
}

export function SegmentedField({ label, value, onChange, options, hint }) {
  return (
    <div className="admin-field">
      {label && <FieldHead label={label} />}
      <div className="admin-segmented" role="radiogroup" aria-label={label}>
        {options.map(([optionValue, optionLabel]) => (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={value === optionValue}
            className={value === optionValue ? 'is-active' : ''}
            onClick={() => onChange(optionValue)}
          >
            {optionLabel}
          </button>
        ))}
      </div>
      {hint && <span className="admin-hint-sm">{hint}</span>}
    </div>
  );
}

export function MediaUploadField({ label, displayLabel, value, onChange, hint }) {
  const meta = metaFor(label);
  const [note, setNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [brokenSrc, setBrokenSrc] = useState('');
  const inputRef = useRef(null);
  const text = value ?? '';
  const isVideo = isVideoUrl(text);
  const help = hint ?? meta.hint;

  function processFile(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNote('Use an image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > uploadMaxBytes) {
      setNote('That image is over 2.5 MB. Try a smaller one.');
      return;
    }

    setIsUploading(true);
    setNote('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 1200;
        const width = Math.min(img.width, maxWidth);
        const height = Math.round((img.height * width) / img.width);

        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setNote('Could not compress that image.');
              setIsUploading(false);
              return;
            }

            const compressedReader = new FileReader();
            compressedReader.onload = () => {
              const savings = Math.max(0, Math.round((1 - blob.size / file.size) * 100));
              setNote(`Uploaded · ${(blob.size / 1024).toFixed(0)} KB (${savings}% smaller)`);
              onChange(String(compressedReader.result || ''));
              setIsUploading(false);
            };
            compressedReader.readAsDataURL(blob);
          },
          'image/webp',
          0.75,
        );
      };
      img.onerror = () => {
        setNote('Could not read that image.');
        setIsUploading(false);
      };
      img.src = String(event.target.result || '');
    };
    reader.onerror = () => {
      setNote('Could not read that file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  }

  const showPreview = text && brokenSrc !== text;
  const shownValue = text.startsWith('data:') ? '' : text;

  return (
    <div className="admin-field">
      <FieldHead label={displayLabel || meta.label} />
      <div
        className={`admin-media${isDragging ? ' is-dragging' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          processFile(event.dataTransfer.files?.[0]);
        }}
      >
        <button
          type="button"
          className="admin-media-thumb"
          onClick={() => inputRef.current?.click()}
          aria-label={`Upload ${displayLabel || meta.label}`}
        >
          {showPreview ? (
            isVideo ? (
              <video src={text} muted playsInline></video>
            ) : (
              <img src={text} alt="" onError={() => setBrokenSrc(text)} />
            )
          ) : (
            <Icon name="image" size={22} />
          )}
        </button>

        <div className="admin-media-body">
          <input
            value={shownValue}
            onChange={(event) => onChange(event.target.value)}
            placeholder={text.startsWith('data:') ? 'Uploaded image (stored with the content)' : 'Paste a link, or drop an image here'}
            className="admin-input"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="admin-btn admin-btn-sm"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              <Icon name="upload" size={14} />
              {isUploading ? 'Compressing…' : text ? 'Replace' : 'Upload'}
            </button>
            {text && (
              <button type="button" className="admin-btn admin-btn-sm admin-btn-ghost" onClick={() => onChange('')}>
                <Icon name="x" size={14} />
                Remove
              </button>
            )}
            {note && <span className="admin-hint-sm">{note}</span>}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            processFile(file);
          }}
        />
      </div>
      {help && <span className="admin-hint-sm">{help}</span>}
    </div>
  );
}

function CtaEditor({ label, value, onChange }) {
  const meta = metaFor(label);

  if (!isPlainObject(value)) {
    return (
      <button type="button" className="admin-add-dashed" onClick={() => onChange(createEmptyCta(label))}>
        <Icon name="plus" size={14} />
        Add {meta.label.toLowerCase()}
      </button>
    );
  }

  const extraEntries = Object.entries(value).filter(([key]) => !['label', 'href', 'id', 'hidden'].includes(key));

  return (
    <div className="admin-cta">
      <div className="admin-cta-head">
        <span className="admin-label">{meta.label}</span>
        <span className="admin-cta-preview" title="How the button reads">
          {value.label || 'Button'}
          <Icon name="chevronRight" size={12} />
        </span>
        <button type="button" className="admin-icon-btn is-danger" title="Remove this button" onClick={() => onChange(null)}>
          <Icon name="trash" size={15} />
        </button>
      </div>
      <div className="admin-grid-2">
        <TextField label="label" displayLabel="Button text" value={value.label} onChange={(next) => onChange({ ...value, label: next })} />
        <TextField label="href" value={value.href} onChange={(next) => onChange({ ...value, href: next })} />
        {extraEntries.map(([key, childValue]) => (
          <FieldEditor
            key={key}
            label={key}
            value={childValue}
            depth={1}
            path={[label]}
            onChange={(next) => onChange({ ...value, [key]: next })}
          />
        ))}
      </div>
    </div>
  );
}

function RowActions({ index, count, itemName, onMove, onDuplicate, onToggleHidden, hidden, onRemove }) {
  return (
    <div className="admin-row-actions">
      <button type="button" className="admin-icon-btn" title="Move up" disabled={index === 0} onClick={() => onMove(index, -1)}>
        <Icon name="chevronUp" size={15} />
      </button>
      <button type="button" className="admin-icon-btn" title="Move down" disabled={index === count - 1} onClick={() => onMove(index, 1)}>
        <Icon name="chevronDown" size={15} />
      </button>
      {onDuplicate && (
        <button type="button" className="admin-icon-btn" title={`Duplicate ${itemName}`} onClick={() => onDuplicate(index)}>
          <Icon name="copy" size={15} />
        </button>
      )}
      {onToggleHidden && (
        <button
          type="button"
          className="admin-icon-btn"
          title={hidden ? 'Hidden — click to show on site' : 'Visible — click to hide on site'}
          onClick={() => onToggleHidden(index)}
        >
          <Icon name={hidden ? 'eyeOff' : 'eye'} size={15} />
        </button>
      )}
      <button type="button" className="admin-icon-btn is-danger" title={`Remove ${itemName}`} onClick={() => onRemove(index)}>
        <Icon name="trash" size={15} />
      </button>
    </div>
  );
}

function ArrayEditor({ label, value, onChange, depth, path, hideHead = false }) {
  const meta = metaFor(label);
  const itemName = meta.itemName || 'item';
  const primitive = value.every((item) => !isPlainObject(item) && !Array.isArray(item));
  const [openIndex, setOpenIndex] = useState(value.length === 1 ? 0 : -1);

  function setItem(index, item) {
    const next = [...value];
    next[index] = item;
    onChange(next);
  }

  function add() {
    const next = [...value, createArrayItem(label, value)];
    onChange(next);
    setOpenIndex(next.length - 1);
  }

  function move(index, direction) {
    const target = index + direction;
    const next = moveArrayItem(value, index, target);
    if (next === value) return;
    onChange(next);
    if (openIndex === index) setOpenIndex(target);
    else if (openIndex === target) setOpenIndex(index);
  }

  function duplicate(index) {
    const next = [...value];
    next.splice(index + 1, 0, duplicateArrayItem(value[index]));
    onChange(next);
    setOpenIndex(index + 1);
  }

  function toggleHidden(index) {
    setItem(index, { ...value[index], hidden: !value[index].hidden });
  }

  function remove(index) {
    if (!primitive && !window.confirm(`Remove this ${itemName}?`)) return;
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
    if (openIndex === index) setOpenIndex(-1);
    else if (openIndex > index) setOpenIndex(openIndex - 1);
  }

  return (
    <div className="admin-list-editor">
      {!hideHead && (
        <div className="admin-list-editor-head">
          <span className="admin-label">{meta.label}</span>
          <span className="admin-pill">{value.length}</span>
        </div>
      )}

      {value.length === 0 && <p className="admin-hint-sm">Nothing here yet.</p>}

      {primitive ? (
        <div className="grid gap-2">
          {value.map((item, index) => (
            <div key={index} className="admin-row admin-bullet-row">
              <span className="admin-index">{index + 1}</span>
              <AutoTextarea minRows={1} value={String(item ?? '')} onChange={(next) => setItem(index, next)} />
              <RowActions
                index={index}
                count={value.length}
                itemName={itemName}
                onMove={move}
                onRemove={remove}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-2">
          {value.map((item, index) => {
            const isOpen = openIndex === index;
            const thumb = itemThumbUrl(item);
            const canHide = isPlainObject(item) && Object.prototype.hasOwnProperty.call(item, 'hidden');
            const snippet = itemSnippet(item);

            return (
              <div
                key={index}
                id={item?.id ? `admin-${item.id}` : undefined}
                className={`admin-item admin-row${isOpen ? ' is-open' : ''}${item?.hidden ? ' is-hidden' : ''}`}
              >
                <div className="admin-item-head">
                  <button
                    type="button"
                    className="admin-item-toggle"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                  >
                    <span className="admin-index">{index + 1}</span>
                    {thumb ? (
                      <img src={thumb} alt="" className="admin-item-thumb" />
                    ) : item?.icon ? (
                      <span className="admin-item-thumb admin-item-icon">{String(item.icon).slice(0, 3)}</span>
                    ) : null}
                    <span className="min-w-0 flex-1">
                      <span className="admin-item-title">{itemTitle(item, index, itemName)}</span>
                      {snippet && <span className="admin-item-snippet">{snippet}</span>}
                    </span>
                    {item?.hidden && <span className="admin-pill is-muted">Hidden</span>}
                    <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} size={16} className="admin-item-chevron" />
                  </button>
                  <RowActions
                    index={index}
                    count={value.length}
                    itemName={itemName}
                    hidden={item?.hidden}
                    onMove={move}
                    onDuplicate={duplicate}
                    onToggleHidden={canHide ? toggleHidden : null}
                    onRemove={remove}
                  />
                </div>

                {isOpen && (
                  <div className="admin-item-body">
                    {isPlainObject(item) ? (
                      <ObjectFields
                        value={item}
                        depth={depth + 1}
                        path={[...path, label, index]}
                        onChange={(next) => setItem(index, next)}
                      />
                    ) : (
                      <FieldEditor
                        label={label}
                        value={item}
                        depth={depth + 1}
                        path={[...path, label, index]}
                        onChange={(next) => setItem(index, next)}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button type="button" className="admin-add-dashed" onClick={add}>
        <Icon name="plus" size={14} />
        Add {itemName}
      </button>
    </div>
  );
}

function isWideField(key, value, path) {
  if (isPlainObject(value) || Array.isArray(value) || isCtaField(key)) return true;
  if (isUploadableImageField(key, path)) return true;
  return Boolean(metaFor(key).multiline) || String(value ?? '').length > 90;
}

function ObjectFields({ value, onChange, depth, path }) {
  const hidden = hiddenKeysFor(depth);
  const visible = Object.entries(value).filter(([key]) => !hidden.has(key));

  // Short fields first so they pair up side by side; long ones then take full rows.
  const entries = [
    ...visible.filter(([key, childValue]) => !isWideField(key, childValue, path)),
    ...visible.filter(([key, childValue]) => isWideField(key, childValue, path)),
  ];

  return (
    <div className="admin-grid-2">
      {entries.map(([key, childValue]) => (
        <div key={key} className={isWideField(key, childValue, path) ? 'admin-span-2' : ''}>
          <FieldEditor
            label={key}
            value={childValue}
            depth={depth + 1}
            path={path}
            onChange={(next) => onChange({ ...value, [key]: next })}
          />
        </div>
      ))}
    </div>
  );
}

export function FieldEditor({ label, value, onChange, depth = 0, path = [] }) {
  if (isCtaField(label)) {
    return <CtaEditor label={label} value={value} onChange={onChange} />;
  }

  if (typeof value === 'boolean') {
    return <ToggleField label={label} value={value} onChange={onChange} />;
  }

  if (typeof value === 'number') {
    return <NumberField label={label} value={value} onChange={onChange} />;
  }

  if (Array.isArray(value)) {
    return <ArrayEditor label={label} value={value} onChange={onChange} depth={depth} path={path} />;
  }

  if (isPlainObject(value)) {
    if (depth === 0) {
      return <ObjectFields value={value} onChange={onChange} depth={0} path={[...path, label]} />;
    }

    return (
      <div className="admin-subgroup">
        <span className="admin-subgroup-title">{metaFor(label).label}</span>
        <ObjectFields value={value} onChange={onChange} depth={depth} path={[...path, label]} />
      </div>
    );
  }

  const options = optionsFor(label, path);
  if (options) {
    return <SegmentedField label={metaFor(label).label} value={value} options={options} onChange={onChange} />;
  }

  if (isUploadableImageField(label, path)) {
    return <MediaUploadField label={label} value={value} onChange={onChange} />;
  }

  return <TextField label={label} value={value} onChange={onChange} />;
}

export function EditorGroup({ title, icon, count, hint, children, collapsible = false, defaultOpen = true, actions }) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = !collapsible || open;

  const headContent = (
    <>
      {icon && (
        <span className="admin-group-icon">
          <Icon name={icon} size={16} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="admin-group-title">
          {title}
          {count !== undefined && <span className="admin-pill ml-2">{count}</span>}
        </span>
        {hint && <span className="admin-hint-sm mt-0.5 block">{hint}</span>}
      </span>
      {collapsible && <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} size={18} className="admin-item-chevron" />}
    </>
  );

  return (
    <section className={`admin-group${isOpen ? ' is-open' : ''}`}>
      <div className="admin-group-head">
        {collapsible ? (
          <button type="button" className="admin-group-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={isOpen}>
            {headContent}
          </button>
        ) : (
          <div className="admin-group-toggle">{headContent}</div>
        )}
        {actions && <div className="admin-group-actions">{actions}</div>}
      </div>
      {isOpen && <div className="admin-group-body">{children}</div>}
    </section>
  );
}

/** Edits one page section, grouped so the words come first and styling stays tucked away. */
export function SectionEditor({ section, onChange }) {
  const path = [section.id];
  const hidden = hiddenKeysFor(0);
  const groups = { content: [], buttons: [], lists: [], appearance: [] };

  Object.entries(section)
    .filter(([key]) => !hidden.has(key))
    .forEach((entry) => {
      const [key, value] = entry;
      if (appearanceKeys.has(key)) groups.appearance.push(entry);
      else if (isCtaField(key)) groups.buttons.push(entry);
      else if (Array.isArray(value)) groups.lists.push(entry);
      else groups.content.push(entry);
    });

  const mergeInto = (partial) => onChange({ ...section, ...partial });

  return (
    <div className="grid gap-4">
      {groups.content.length > 0 && (
        <EditorGroup title="Content" icon="edit">
          <ObjectFields value={Object.fromEntries(groups.content)} onChange={mergeInto} depth={0} path={path} />
        </EditorGroup>
      )}

      {groups.buttons.length > 0 && (
        <EditorGroup title="Buttons" icon="link">
          <div className="grid gap-3">
            {groups.buttons.map(([key, value]) => (
              <CtaEditor key={key} label={key} value={value} onChange={(next) => mergeInto({ [key]: next })} />
            ))}
          </div>
        </EditorGroup>
      )}

      {groups.lists.map(([key, value]) => (
        <EditorGroup key={key} title={metaFor(key).label} icon="layers" count={value.length}>
          <ArrayEditor
            label={key}
            value={value}
            depth={0}
            path={path}
            hideHead
            onChange={(next) => mergeInto({ [key]: next })}
          />
        </EditorGroup>
      ))}

      {groups.appearance.length > 0 && (
        <EditorGroup
          title="Media & appearance"
          icon="image"
          hint="Background, images, gallery and layout width."
          collapsible
          defaultOpen={false}
        >
          <ObjectFields value={Object.fromEntries(groups.appearance)} onChange={mergeInto} depth={0} path={path} />
        </EditorGroup>
      )}
    </div>
  );
}
