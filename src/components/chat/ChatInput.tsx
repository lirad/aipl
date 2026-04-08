import { motion } from 'motion/react';
import { Send, ArrowRight } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  placeholder: string;
  /** Show "next phase" button above the input */
  showNextPhase: boolean;
  nextPhaseLabel?: string;
  onNextPhase?: () => void;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  placeholder,
  showNextPhase,
  nextPhaseLabel,
  onNextPhase,
}: ChatInputProps) {
  return (
    <div className="p-6 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA] to-transparent">
      <div className="max-w-3xl mx-auto relative">
        {showNextPhase && nextPhaseLabel && onNextPhase && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full mb-6 left-0 right-0 flex justify-center"
          >
            <button
              onClick={onNextPhase}
              className="px-8 py-4 bg-green-600 text-white rounded-2xl font-bold shadow-xl shadow-green-200 hover:bg-green-700 transition-all flex items-center gap-3 group"
            >
              <span>Ir para Proxima Fase: {nextPhaseLabel}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={placeholder}
          className="w-full bg-white border border-gray-200 rounded-[2rem] pl-6 pr-20 py-5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-2xl shadow-blue-900/5 resize-none min-h-[64px] max-h-[200px]"
          rows={1}
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="absolute right-3 bottom-3 p-4 bg-blue-600 text-white rounded-[1.5rem] hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 group"
        >
          <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
