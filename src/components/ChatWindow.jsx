// frontend/src/components/ChatWindow.jsx

import { useEffect, useRef, memo } from 'react';
import { UserIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

// Helper function to detect if text is Arabic
const isArabic = (text) => {
  // Regular expression to match Arabic characters
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
};

// --- Sub-component for a single message bubble ---
const MessageBubble = memo(({ message, onZoomImage }) => {
  const isUser = message.role === 'user';
  const isImage = typeof message.content === 'string' && message.content.startsWith('data:image');
  const isTextArabic = !isImage && isArabic(message.content);

  // Animation for each message to appear smoothly
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className={`flex w-full items-start gap-3 max-w-full sm:max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
    >
      <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-primary' : 'bg-surface'}`}>
        {isUser ? <UserIcon className="w-5 h-5 text-white" /> : <SparklesIcon className="w-5 h-5 text-accent" />}
      </div>
      <div
        className={`px-4 py-3 rounded-xl text-content-primary break-words ${
          isUser 
            ? 'bg-primary text-white rounded-br-none' 
            : 'bg-surface rounded-bl-none'
        } ${isTextArabic ? 'text-right' : 'text-left'}`}
        dir={isTextArabic ? 'rtl' : 'ltr'}
      >
        {isImage ? (
          <img
            src={message.content}
            alt="Generated Visual"
            className="max-w-full sm:max-w-md h-auto rounded-lg cursor-pointer transition-transform hover:scale-105"
            onClick={() => onZoomImage(message.content)}
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        )}
      </div>
    </motion.div>
  );
});

// --- Sub-component for the typing/status indicator ---
const StatusIndicator = memo(({ statusText }) => (
  <div className="flex justify-center items-center gap-2 text-center py-4 text-content-secondary text-sm animate-fade-in">
    <span>{statusText}</span>
    <div className="flex gap-1.5">
      <span className="h-1.5 w-1.5 bg-content-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
      <span className="h-1.5 w-1.5 bg-content-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
      <span className="h-1.5 w-1.5 bg-content-secondary rounded-full animate-bounce"></span>
    </div>
  </div>
));

// --- Sub-component for the Welcome Screen ---
const WelcomeScreen = () => (
    <div className="m-auto flex flex-col items-center justify-center text-center text-content-secondary animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
            <SparklesIcon className="w-8 h-8 text-accent"/>
        </div>
        <h1 className="text-2xl font-medium text-content-primary">Government Performance Follow-Up Agency</h1>
        <p className="mt-1">How can I help you today?</p>
    </div>
);

// --- Sub-component for the main Loading Spinner ---
const LoadingSpinner = () => (
    <div className="m-auto flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status">
            <span className="sr-only">Loading...</span>
        </div>
    </div>
);


// --- Main ChatWindow Component ---
function ChatWindow({ messages, status, isLoading, onZoomImage }) {
  const scrollRef = useRef(null);

  // This effect ensures the view automatically scrolls to the bottom
  // whenever new messages are added.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, status]); // Trigger on messages or status change

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (!messages || messages.length === 0) {
      return <WelcomeScreen />;
    }
    return messages.map((msg, index) => (
      <MessageBubble key={index} message={msg} onZoomImage={onZoomImage} />
    ));
  };

  return (
    // The main scrollable container
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col">
      {/* This inner div ensures content starts at the bottom and scrolls up */}
      <div className="mt-auto">
        <div className="flex flex-col gap-5">
            {renderContent()}
        </div>
      </div>
      {status && !isLoading && <StatusIndicator statusText={status} />}
    </div>
  );
}

export default memo(ChatWindow);