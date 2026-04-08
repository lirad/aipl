import { useState, useEffect, useRef } from 'react';
import type { Phase, Deliverable } from '../types';
import { PHASES, STORAGE_KEYS } from '../data/constants';
import { PHASE_DETAILS } from '../data/phases';
import { reformatDeliverableContent } from '../services/gemini';

/**
 * Manages deliverable state for all phases.
 *
 * Responsibilities:
 * - Initialise from localStorage, merging with the latest PHASE_DETAILS
 * - Persist to localStorage on every change
 * - Auto-reformat poorly-formatted completed deliverables on mount
 * - Expose CRUD helpers (updateDeliverable, resetPhaseDeliverables)
 */
export function useDeliverables() {
  const [deliverablesByPhase, setDeliverablesByPhase] = useState<Record<Phase, Deliverable[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.deliverables);
    const initial: Record<string, Deliverable[]> = saved ? JSON.parse(saved) : {};

    // Sync deliverables with latest PHASE_DETAILS (handles new/removed deliverables)
    PHASE_DETAILS.forEach(p => {
      if (!initial[p.id]) {
        initial[p.id] = p.deliverables;
      } else {
        // Merge: keep completed status from saved, add any new deliverables
        const freshDeliverables = p.deliverables.map(fresh => {
          const existing = initial[p.id].find((d: Deliverable) => d.id === fresh.id);
          return existing ? { ...fresh, content: existing.content, status: existing.status } : fresh;
        });
        initial[p.id] = freshDeliverables;
      }
    });
    return initial as Record<Phase, Deliverable[]>;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.deliverables, JSON.stringify(deliverablesByPhase));
  }, [deliverablesByPhase]);

  // Reformat completed deliverables that lack markdown formatting (once on mount).
  // Uses a ref guard to prevent double-invocation in React strict mode.
  const reformatRanRef = useRef(false);
  useEffect(() => {
    if (reformatRanRef.current) return;
    reformatRanRef.current = true;

    PHASES.forEach(phase => {
      const dels = deliverablesByPhase[phase] || [];
      dels.forEach(d => {
        if (d.status === 'completed' && d.content && !d.content.includes('**')) {
          reformatDeliverableContent(d.content, d.label).then(formatted => {
            if (formatted !== d.content) {
              setDeliverablesByPhase(prev => ({
                ...prev,
                [phase]: prev[phase].map(dd =>
                  dd.id === d.id ? { ...dd, content: formatted } : dd
                )
              }));
            }
          });
        }
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Reset all deliverables in a given phase to their initial (pending) state. */
  const resetPhaseDeliverables = (phase: Phase) => {
    setDeliverablesByPhase(prev => {
      const initialPhaseDetails = PHASE_DETAILS.find(p => p.id === phase);
      if (!initialPhaseDetails) return prev;

      return {
        ...prev,
        [phase]: initialPhaseDetails.deliverables.map(d => ({
          ...d,
          content: '',
          status: 'pending' as const,
        })),
      };
    });
  };

  return {
    deliverablesByPhase,
    setDeliverablesByPhase,
    resetPhaseDeliverables,
  };
}
