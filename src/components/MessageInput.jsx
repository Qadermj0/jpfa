// frontend/src/components/MessageInput.jsx

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

function MessageInput({ onSendMessage }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-grow textarea logic
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  // Function to detect if text is Arabic
  const isArabic = (text) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  };

  const handleSend = () => {
    if (input.trim() === '') return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Determine direction and layout based on language
  const isRTL = isArabic(input);
  const containerClass = `flex items-end gap-3 rounded-2xl border bg-light-surface border-light-border dark:bg-dark-surface dark:border-dark-border focus-within:border-primary-blue transition-colors ${isRTL ? 'flex-row-reverse' : ''}`;
  const textareaClass = `flex-1 resize-none self-center bg-transparent py-2.5 px-3 text-base text-light-text-primary dark:text-dark-text-primary placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none max-h-48 ${isRTL ? 'text-right' : 'text-left'}`;
  const placeholderText = isRTL ? 'أدخل النص هنا...' : 'Enter a prompt here...';

  return (
    <div className="flex-shrink-0 px-4 pt-2 pb-4 sm:px-6 bg-light-bg dark:bg-dark-bg">
      <div className={containerClass}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          className={textareaClass}
          rows={1}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={input.trim() === ''}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-blue text-white transition-all duration-200 hover:bg-primary-blue-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default MessageInput;