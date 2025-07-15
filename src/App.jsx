import { useState, useEffect, useCallback, useRef } from 'react';
import ConversationList from './components/ConversationList.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import MessageInput from './components/MessageInput.jsx';
import ChatHeader from './components/ChatHeader.jsx';
import DeleteConfirmationModal from './components/DeleteConfirmationModal.jsx';
import ImageModal from './components/ImageModal.jsx';

function App() {
  // --- STATE MANAGEMENT ---
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(() => 
    localStorage.getItem('currentConversationId') || null
  );
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // تخزين حالة الـ status لكل محادثة
  const [conversationsStatus, setConversationsStatus] = useState({});
  
  // تتبع المحادثات التي تنتظر ردًا
  const [pendingResponses, setPendingResponses] = useState({});

  // UI States
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  // --- REFS ---
  const conversationIdRef = useRef(currentConversationId);
  useEffect(() => {
    conversationIdRef.current = currentConversationId;
  }, [currentConversationId]);

  // --- Helper Functions ---
  const updateConversationStatus = (conversationId, status) => {
    setConversationsStatus(prev => ({
      ...prev,
      [conversationId]: status
    }));
  };

  const setPendingResponse = (conversationId, isPending) => {
    setPendingResponses(prev => ({
      ...prev,
      [conversationId]: isPending
    }));
  };

  const getCurrentStatus = () => {
    return conversationsStatus[currentConversationId || 'new'] || '';
  };

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const isWaitingForResponse = () => {
    return pendingResponses[currentConversationId || 'new'] || false;
  };

  // --- DATA FETCHING ---
  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/conversations`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (currentConversationId === null) {
      setMessages([]);
      setIsLoading(false);
      return;
    }
    
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/conversations/${currentConversationId}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        updateConversationStatus(currentConversationId, 'Error loading messages.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
  }, [currentConversationId]);

  // --- EVENT HANDLERS ---
  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/stream`);
    
    eventSource.onmessage = (event) => {
      if (event.data === ":") return;
      const data = JSON.parse(event.data);
      
      if (data.type === 'session_created') {
        fetchConversations();
        handleSelectConversation(data.conversation_id);
      } else if (data.conversation_id == conversationIdRef.current) {
        if (data.type === 'status') {
          updateConversationStatus(data.conversation_id, data.message);
        } else if (data.type === 'text' || data.type === 'image') {
          updateConversationStatus(data.conversation_id, '');
          setPendingResponse(data.conversation_id, false);
          setMessages(prevMsgs => [...prevMsgs, { role: 'model', content: data.content }]);
        }
      }
    };
    
    eventSource.onerror = () => {
      updateConversationStatus(conversationIdRef.current, 'Connection to server lost.');
      setPendingResponse(conversationIdRef.current, false);
    };
    
    return () => eventSource.close();
  }, [fetchConversations]);

  const handleSendMessage = async (input) => {
    if (!input.trim() || isWaitingForResponse()) return;
    
    const currentId = currentConversationId || 'new';
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    updateConversationStatus(currentId, 'Analyzing...');
    setPendingResponse(currentId, true);
    
    try {
      await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: input, 
          conversation_id: currentConversationId 
        })
      });
    } catch (error) {
      updateConversationStatus(currentId, 'Error sending message!');
      setPendingResponse(currentId, false);
    }
  };

  const handleSelectConversation = (id) => {
    if (id === currentConversationId) return;
    localStorage.setItem('currentConversationId', String(id));
    setCurrentConversationId(String(id));
  };
  
  const handleNewConversation = () => {
    localStorage.removeItem('currentConversationId');
    setCurrentConversationId(null);
    setMessages([]);
    updateConversationStatus('new', '');
    setPendingResponse('new', false);
  };

  const handleRenameConversation = async (id, newTitle) => {
    setConversations(prev => prev.map(c => c.id == id ? {...c, title: newTitle} : c));
    try {
      await fetch(`${API_URL}/conversations/${id}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ title: newTitle })
      });
    } catch (error) { 
      console.error('Error renaming conversation:', error); 
    }
  };

  const handleInitiateDelete = (id, title) => {
    if (isWaitingForResponse()) return;
    setConversationToDelete({ id, title });
  };

  const handleCancelDelete = () => setConversationToDelete(null);
  
  const handleConfirmDelete = async () => {
    if (!conversationToDelete) return;
    const idToDelete = conversationToDelete.id;
    try {
      await fetch(`${API_URL}/conversations/${idToDelete}`, { 
        method: 'DELETE' 
      });
      await fetchConversations();
      if (currentConversationId == idToDelete) {
        handleNewConversation();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    } finally {
      setConversationToDelete(null);
    }
  };

  const handleToggleSidebar = () => setIsSidebarCollapsed(prev => !prev);
  const handleZoomImage = (imageSrc) => setZoomedImage(imageSrc);

  const currentConversationTitle = conversations.find(c => c.id == currentConversationId)?.title || 'New Chat';

  return (
    <>
      <div className="flex h-screen bg-background text-content-primary font-sans">
        <ConversationList
          conversations={conversations}
          selectedId={currentConversationId}
          isCollapsed={isSidebarCollapsed}
          onSelect={handleSelectConversation}
          onNew={handleNewConversation}
          onDelete={handleInitiateDelete} 
          onRename={handleRenameConversation}
          isDisabled={isWaitingForResponse()}
        />
        <main className="flex-1 flex flex-col h-screen transition-all duration-300">
          <ChatHeader 
            conversationTitle={currentConversationTitle}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={handleToggleSidebar}
            isWaitingForResponse={isWaitingForResponse()}
          />
          <ChatWindow
            messages={messages}
            status={getCurrentStatus()}
            isLoading={isLoading}
            onZoomImage={handleZoomImage}
            isWaitingForResponse={isWaitingForResponse()}
          />
          <MessageInput 
            onSendMessage={handleSendMessage} 
            isDisabled={isWaitingForResponse() || isLoading}
          />
        </main>
      </div>

      {conversationToDelete && (
        <DeleteConfirmationModal
          conversationTitle={conversationToDelete.title}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDisabled={isWaitingForResponse()}
        />
      )}
      {zoomedImage && (
        <ImageModal
          imageSrc={zoomedImage}
          onClose={() => setZoomedImage(null)}
        />
      )}
    </>
  );
}

export default App;