import { useMemo } from 'react';
import { Download, CheckCircle2, Clock, Wrench } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import type { Phase, Deliverable } from './types';
import { PHASES } from './data/constants';
import { PHASE_DETAILS } from './data/phases';
import { PHASE_LITERATURE } from './data/tools';

const PHASE_EMOJI: Record<Phase, string> = {
  'Ideation': '💡',
  'Opportunity': '🔍',
  'Concept/Prototype': '🛠️',
  'Testing & Analysis': '🧪',
  'Roll-out': '🚀',
  'Monitoring': '📊',
};

const PHASE_NUMBER: Record<Phase, number> = {
  'Ideation': 1,
  'Opportunity': 2,
  'Concept/Prototype': 3,
  'Testing & Analysis': 4,
  'Roll-out': 5,
  'Monitoring': 6,
};

interface Props {
  deliverablesByPhase: Record<Phase, Deliverable[]>;
}

export default function DocumentExport({ deliverablesByPhase }: Props) {
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    PHASES.forEach(p => {
      const dels = deliverablesByPhase[p] || [];
      total += dels.length;
      completed += dels.filter(d => d.status === 'completed').length;
    });
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [deliverablesByPhase]);

  const handleExportHTML = () => {
    const docEl = document.getElementById('aipl-document');
    if (!docEl) return;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AIPL — AI Product Lifecycle Document</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, sans-serif; background: #fff; color: #1a1a2e; line-height: 1.7; padding: 40px; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
  h2 { font-size: 20px; font-weight: 700; margin-top: 48px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; display: flex; align-items: center; gap: 10px; }
  h3 { font-size: 15px; font-weight: 700; margin-top: 20px; margin-bottom: 8px; color: #374151; }
  p, li { font-size: 14px; color: #4b5563; }
  ul, ol { padding-left: 20px; margin: 8px 0; }
  .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 32px; }
  .header .subtitle { font-size: 13px; color: #6b7280; margin-top: 6px; }
  .progress-bar { height: 8px; background: #f3f4f6; border-radius: 99px; margin-top: 16px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #2563eb, #7c3aed); border-radius: 99px; transition: width 0.3s; }
  .phase-section { margin-top: 40px; page-break-inside: avoid; }
  .deliverable { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 12px 0; }
  .deliverable.completed { border-left: 4px solid #16a34a; }
  .deliverable.pending { border-left: 4px solid #d1d5db; }
  .deliverable-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .deliverable-title { font-size: 14px; font-weight: 700; color: #111827; }
  .badge { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 3px 10px; border-radius: 99px; }
  .badge.green { background: #dcfce7; color: #166534; }
  .badge.gray { background: #f3f4f6; color: #6b7280; }
  .deliverable-content { font-size: 13px; color: #374151; }
  .deliverable-content p { margin: 6px 0; }
  .deliverable-content strong { color: #111827; }
  .info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px 20px; margin: 16px 0; }
  .info-box h4 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #1d4ed8; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
  .info-box p, .info-box li { font-size: 12px; color: #1e40af; }
  .tools-box { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 16px 20px; margin: 16px 0; }
  .tools-box h4 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #7c3aed; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
  .tool-row { display: flex; gap: 8px; padding: 6px 0; border-bottom: 1px solid #f3e8ff; font-size: 12px; }
  .tool-row:last-child { border-bottom: none; }
  .tool-name { font-weight: 600; color: #581c87; min-width: 200px; text-decoration: none; }
  .tool-name:hover { text-decoration: underline; }
  .tool-cat { color: #7c3aed; min-width: 140px; font-size: 11px; }
  .tool-purpose { color: #6b21a8; flex: 1; }
  .placeholder { color: #9ca3af; font-style: italic; font-size: 13px; }
  @media print { body { padding: 20px; } .phase-section { page-break-inside: avoid; } }
</style>
</head>
<body>
${docEl.innerHTML}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIPL-Document-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">AIPL Document</span>
          <span className="text-xs text-gray-400">{stats.completed}/{stats.total} entregáveis</span>
        </div>
        <button
          onClick={handleExportHTML}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Download className="w-3.5 h-3.5" />
          Exportar HTML
        </button>
      </div>

      {/* Document */}
      <div className="max-w-[900px] mx-auto px-8 py-12" id="aipl-document">
        {/* Header */}
        <div className="header" style={{ borderBottom: '3px solid #2563eb', paddingBottom: 20, marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', color: '#111827' }}>
            AIPL — AI Product Lifecycle
          </h1>
          <p className="subtitle" style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
            Documento gerado em {today}
          </p>
          <div className="progress-bar" style={{ height: 8, background: '#f3f4f6', borderRadius: 99, marginTop: 16, overflow: 'hidden' }}>
            <div
              className="progress-fill"
              style={{ height: '100%', background: 'linear-gradient(90deg, #2563eb, #7c3aed)', borderRadius: 99, width: `${stats.percent}%` }}
            />
          </div>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6, textAlign: 'right' }}>
            {stats.percent}% completo ({stats.completed} de {stats.total} entregáveis)
          </p>
        </div>

        {/* Phases */}
        {PHASES.map(phase => {
          const deliverables = deliverablesByPhase[phase] || [];
          const lit = PHASE_LITERATURE[phase];
          const phaseDetail = PHASE_DETAILS.find(p => p.id === phase);

          return (
            <div key={phase} className="phase-section" style={{ marginTop: 40 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>{PHASE_EMOJI[phase]}</span>
                <span>Fase {PHASE_NUMBER[phase]}: {phaseDetail?.label || phase}</span>
              </h2>

              {/* Deliverables */}
              {deliverables.map(d => (
                <div
                  key={d.id}
                  className={cn("deliverable", d.status === 'completed' ? 'completed' : 'pending')}
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    padding: 20,
                    margin: '12px 0',
                    borderLeft: d.status === 'completed' ? '4px solid #16a34a' : '4px solid #d1d5db',
                  }}
                >
                  <div className="deliverable-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span className="deliverable-title" style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                      {d.label}
                    </span>
                    <span
                      className={cn("badge", d.status === 'completed' ? 'green' : 'gray')}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.5px',
                        padding: '3px 10px',
                        borderRadius: 99,
                        background: d.status === 'completed' ? '#dcfce7' : '#f3f4f6',
                        color: d.status === 'completed' ? '#166534' : '#6b7280',
                      }}
                    >
                      {d.status === 'completed' ? 'Concluído' : 'Pendente'}
                    </span>
                  </div>
                  <div className="deliverable-content" style={{ fontSize: 13, color: '#374151' }}>
                    {d.content ? (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{d.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="placeholder" style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: 13 }}>
                        A ser preenchido — use o chat para guiar o preenchimento deste entregável.
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Tools Box */}
              <div className="tools-box" style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 12, padding: '16px 20px', margin: '16px 0' }}>
                <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.5px', color: '#7c3aed', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Wrench style={{ width: 14, height: 14 }} />
                  Ferramentas Recomendadas
                </h4>
                {lit.tools.map((t, i) => (
                  <div key={i} className="tool-row" style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: i < lit.tools.length - 1 ? '1px solid #f3e8ff' : 'none', fontSize: 12 }}>
                    <a href={t.url} target="_blank" rel="noopener noreferrer" className="tool-name" style={{ fontWeight: 600, color: '#581c87', minWidth: 200, textDecoration: 'none' }}>{t.name}</a>
                    <span className="tool-cat" style={{ color: '#7c3aed', minWidth: 140, fontSize: 11 }}>{t.category}</span>
                    <span className="tool-purpose" style={{ color: '#6b21a8', flex: 1 }}>{t.purpose}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
