import { AlignCenter, AlignLeft, AlignRight, ChevronDown, Lock, MoreHorizontal, SlidersHorizontal, Type } from 'lucide-react';
import { Button, Divider, SectionLabel } from '../../../components/ui/primitives';
import { useCanvasStore } from '../../../stores/canvas-store';

export function PropertiesPanel() {
  const { objects, selectedIds, showProperties, updateObject, gridVisible, toggleGrid } = useCanvasStore();
  if (!showProperties) return null;
  const selected = selectedIds.length === 1 ? objects.find((object) => object.id === selectedIds[0]) : null;
  const selectedCount = selectedIds.length;
  return <aside className="properties-panel">
    <div className="panel-header"><div><SectionLabel>Inspector</SectionLabel><strong>{selected ? 'Selected object' : selectedCount > 1 ? `${selectedCount} objects` : 'Board settings'}</strong></div><button className="icon-button" aria-label="More inspector actions"><MoreHorizontal size={16} /></button></div>
    {selected ? <>
      <div className="inspector-object-preview"><div className={`mini-object mini-object-${selected.type}`} style={{ background: selected.fill, borderColor: selected.stroke }}><span>{selected.text?.slice(0, 1) || '□'}</span></div><div><strong>{selected.type[0].toUpperCase() + selected.type.slice(1)}</strong><span className="muted-text">{selected.id}</span></div></div>
      <InspectorSection title="Layout" icon={<SlidersHorizontal size={14} />}><div className="property-grid"><PropertyInput label="X" value={Math.round(selected.x)} onChange={(value) => updateObject(selected.id, { x: value })} /><PropertyInput label="Y" value={Math.round(selected.y)} onChange={(value) => updateObject(selected.id, { y: value })} /><PropertyInput label="W" value={Math.round(selected.width)} onChange={(value) => updateObject(selected.id, { width: value })} /><PropertyInput label="H" value={Math.round(selected.height)} onChange={(value) => updateObject(selected.id, { height: value })} /></div><div className="property-row"><span>Rotation</span><div className="property-control"><input type="number" value={selected.rotation} onChange={(event) => updateObject(selected.id, { rotation: Number(event.target.value) })} /><span>°</span></div></div></InspectorSection>
      <Divider />
      <InspectorSection title="Appearance" icon={<span className="color-dot" />}><div className="color-row"><span>Fill</span><label className="color-input"><input type="color" value={selected.fill === 'transparent' ? '#ffffff' : selected.fill} onChange={(event) => updateObject(selected.id, { fill: event.target.value })} /><span>{selected.fill}</span></label></div><div className="color-row"><span>Stroke</span><label className="color-input"><input type="color" value={selected.stroke === 'transparent' ? '#ffffff' : selected.stroke} onChange={(event) => updateObject(selected.id, { stroke: event.target.value })} /><span>{selected.stroke}</span></label></div><div className="property-row"><span>Opacity</span><input className="range-input" type="range" min="0" max="1" step="0.05" value={selected.opacity} onChange={(event) => updateObject(selected.id, { opacity: Number(event.target.value) })} /></div></InspectorSection>
      <Divider />
      <InspectorSection title="Text" icon={<Type size={14} />}><textarea className="text-editor" value={selected.text ?? ''} onChange={(event) => updateObject(selected.id, { text: event.target.value })} /><div className="text-actions"><Button variant="soft" size="icon" aria-label="Align left"><AlignLeft size={15} /></Button><Button variant="soft" size="icon" aria-label="Align center"><AlignCenter size={15} /></Button><Button variant="soft" size="icon" aria-label="Align right"><AlignRight size={15} /></Button><Button variant="soft" size="icon" aria-label="Lock object"><Lock size={15} /></Button></div></InspectorSection>
    </> : <>
      <div className="board-setting-card"><span className="setting-label">Canvas background</span><div className="background-options"><button className="background-option is-selected"><span className="background-swatch background-swatch-white" />Paper</button><button className="background-option"><span className="background-swatch background-swatch-tint" />Mist</button></div></div>
      <div className="board-setting-card"><div className="setting-inline"><span><strong>Show grid</strong><small>Subtle guide dots on the canvas</small></span><button className={`toggle ${gridVisible ? 'is-on' : ''}`} onClick={toggleGrid} aria-label="Toggle grid"><span /></button></div></div>
      <div className="empty-inspector"><div className="empty-inspector-icon">✦</div><strong>Select an object to inspect</strong><span>Click any shape on the canvas to tune its layout and style.</span></div>
    </>}
  </aside>;
}

function InspectorSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="inspector-section"><div className="inspector-section-heading">{icon}<span>{title}</span><ChevronDown size={13} /></div>{children}</section>;
}
function PropertyInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="property-input"><span>{label}</span><input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}
