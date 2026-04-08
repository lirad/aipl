import { motion } from 'motion/react';
import { User, Bot, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';
import type { Message } from '../../types';

interface ChatMessageProps {
  message: Message;
  index: number;
  feedbackGiven?: 'positive' | 'negative';
  onFeedback?: (index: number, rating: 'positive' | 'negative') => void;
}

export function ChatMessage({ message, index, feedbackGiven, onFeedback }: ChatMessageProps) {
  return (
    <motion.div
      key={index}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "flex gap-4",
        message.role === 'user' ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
        message.role === 'user' ? "bg-gray-900 text-white" : "bg-white text-blue-600 border border-gray-100"
      )}>
        {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      <div className={cn(
        "flex flex-col max-w-[85%]",
        message.role === 'user' ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-6 py-4 rounded-3xl text-sm leading-relaxed shadow-sm",
          message.role === 'user'
            ? "bg-blue-600 text-white rounded-tr-none"
            : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
        )}>
          <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-3 prose-headings:text-inherit prose-headings:mt-4 prose-headings:mb-2 prose-strong:text-inherit prose-ul:list-disc prose-ul:my-2 prose-li:my-1 prose-ol:my-2">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
        {/* Feedback buttons for model messages (skip welcome message at index 0) */}
        {message.role === 'model' && index > 0 && onFeedback && (
          <div className="flex items-center gap-1 mt-1.5 ml-1">
            <button
              onClick={() => onFeedback(index, 'positive')}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                feedbackGiven === 'positive'
                  ? "bg-green-100 text-green-600"
                  : "text-gray-300 hover:text-green-500 hover:bg-green-50"
              )}
              title="Resposta util"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onFeedback(index, 'negative')}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                feedbackGiven === 'negative'
                  ? "bg-red-100 text-red-600"
                  : "text-gray-300 hover:text-red-500 hover:bg-red-50"
              )}
              title="Resposta nao ajudou"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
            {feedbackGiven && (
              <span className={cn(
                "text-[10px] font-bold ml-1",
                feedbackGiven === 'positive' ? "text-green-500" : "text-red-500"
              )}>
                {feedbackGiven === 'positive' ? 'Obrigado!' : 'Vamos melhorar'}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
