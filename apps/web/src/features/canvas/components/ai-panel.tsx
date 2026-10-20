import { ArrowUp, Bot, ChevronDown, PlugZap, Sparkles, X } from 'lucide-react';
import { Button, Badge, SectionLabel } from '../../../components/ui/primitives';
import { useCanvasStore } from '../../../stores/canvas-store';

export function AiPanel() {
  const { showAiPanel, toggleAiPanel } = useCanvasStore();
  if (!showAiPanel) return null;
  return <aside className="ai-panel"><div className="panel-header"><div><SectionLabel>AI Studio</SectionLabel><strong>Sketch ideas with AI</strong></div><button className="icon-button" onClick={toggleAiPanel} aria-label="Close AI panel"><X size={16} /></button></div>
    <div className="ai-connect-card"><span className="provider-icon"><Bot size={17} /></span><div><strong>No provider connected</strong><small>Your board stays on this device.</small></div><Badge tone="warning">Local</Badge></div>
    <div className="ai-prompt-card"><div className="ai-prompt-heading"><Sparkles size={15} /><span>Describe a diagram</span></div><textarea placeholder="For example: map a request from the browser to our payment service and database." aria-label="Describe a diagram" /><div className="ai-prompt-footer"><span className="mono-text">AI generation unavailable</span><Button size="sm" disabled title="Connect an AI provider to enable generation"><ArrowUp size={14} /> Generate</Button></div></div>
    <div className="ai-provider-info"><PlugZap size={16} /><div><strong>Connect your AI provider</strong><span>AI diagram generation needs a configured provider and API credentials. No provider is configured in this local build, so prompts are not sent anywhere.</span></div></div>
    <button className="ai-provider-select" disabled><span><span className="provider-icon"><PlugZap size={14} /></span><span><strong>Provider connection</strong><small>Not configured in this build</small></span></span><ChevronDown size={14} /></button>
    <div className="ai-suggestion"><Sparkles size={15} /><div><strong>Keep your ideas on the board</strong><span>Draw a first draft with the toolbar, then refine objects with the inspector.</span></div></div>
  </aside>;
}
