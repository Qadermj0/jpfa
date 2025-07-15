// frontend/src/components/ChatHeader.jsx

import { Bars3Icon } from '@heroicons/react/24/outline';

function ChatHeader({ conversationTitle, onToggleSidebar }) {
  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-4 sm:px-6 z-10">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-full text-content-secondary hover:bg-surface transition-colors"
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        <h2 className="text-base font-semibold text-content-primary truncate">
          {conversationTitle}
        </h2>
      </div>

      <div className="text-sm font-medium text-content-secondary/70">
        Government Performance Follow-Up Agency
      </div>
    </header>
  );
}

export default ChatHeader;