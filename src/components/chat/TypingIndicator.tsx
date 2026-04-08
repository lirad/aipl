import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-blue-600 shadow-sm">
        <Bot className="w-5 h-5 animate-pulse" />
      </div>
      <div className="bg-white border border-gray-100 px-6 py-4 rounded-3xl rounded-tl-none shadow-sm flex flex-col gap-2">
        <div className="flex gap-1.5 items-center">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">
          Processando resposta...
        </span>
      </div>
    </div>
  );
}
