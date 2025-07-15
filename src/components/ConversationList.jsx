// frontend/src/components/ConversationList.jsx

import { useState } from 'react';
import { PlusIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import companyLogo from '../assets/logo.png'; // تأكد من أن مسار اللوغو صحيح

// مكون فرعي لعرض كل عنصر في القائمة، للحفاظ على نظافة الكود
const ConversationListItem = ({ conversation, isSelected, onSelect, onRename, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(conversation.title);

  const handleSaveRename = () => {
    setIsEditing(false);
    if (title.trim() && title !== conversation.title) {
      onRename(conversation.id, title);
    } else {
      setTitle(conversation.title);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveRename();
    } else if (e.key === 'Escape') {
      setTitle(conversation.title);
      setIsEditing(false);
    }
  };

  return (
    <li
      className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors duration-200 group ${
        isSelected ? 'bg-primary/80 text-white' : 'hover:bg-surface'
      }`}
      onClick={() => onSelect(conversation.id)}
    >
      <div className="flex-grow truncate" onDoubleClick={() => setIsEditing(true)}>
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={handleKeyDown}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent focus:outline-none focus:ring-0 text-sm"
          />
        ) : (
          <span className="text-sm font-medium">{conversation.title}</span>
        )}
      </div>

      <div className="flex items-center flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          className="p-1 rounded-full text-content-secondary transition-opacity opacity-0 group-hover:opacity-70 hover:opacity-100 hover:bg-white/10"
          aria-label="Rename conversation"
        >
          <PencilSquareIcon className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(conversation.id, conversation.title);
          }}
          className="p-1 rounded-full text-content-secondary transition-opacity opacity-0 group-hover:opacity-70 hover:opacity-100 hover:bg-white/10"
          aria-label="Delete conversation"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
};


// المكون الرئيسي للشريط الجانبي
function ConversationList({ conversations, selectedId, isCollapsed, onSelect, onNew, onDelete, onRename }) {
  return (
    <aside className={`bg-sidebar flex-shrink-0 flex flex-col h-full transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center p-4 transition-all duration-300 ${isCollapsed ? 'justify-center h-[72px]' : 'justify-start h-[72px]'}`}>
        <img src={companyLogo} alt="Company Logo" className={`transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'}`} />
        {!isCollapsed && (
          <h1 className="text-xl font-semibold ml-3 whitespace-nowrap">GPFA</h1>
        )}
      </div>

      <div className="p-2">
        <button
          onClick={onNew}
          title="New Chat"
          className={`flex items-center w-full gap-3 p-3 rounded-lg text-sm font-medium bg-surface hover:bg-white/10 transition-colors ${isCollapsed ? 'justify-center' : 'justify-start'}`}
        >
          <PlusIcon className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">New Chat</span>}
        </button>
      </div>
      
      <div className={`flex-grow flex flex-col overflow-hidden transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
        <p className="px-3 pt-4 pb-2 text-xs font-medium text-content-secondary">Recent</p>
        <nav className="flex-grow overflow-y-auto space-y-1 pr-1">
          {conversations && conversations.map(conv => (
            <ConversationListItem
              key={conv.id}
              conversation={conv}
              isSelected={conv.id == selectedId}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default ConversationList;