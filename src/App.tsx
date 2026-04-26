import Header from "./components/Header/Header";
import MessageList from "./components/MessageList/MessageList";
import ChatInput from "./components/ChatInput/ChatInput";
import ChatSidebar from "./components/ChatSidebar/ChatSidebar";
import './App.css'
import { useChat } from "./hooks/useChat";


function App() {
  const{  chatList,
        currentChatId,
        setCurrentChatId,
        handleCreateChat,handleDeleteChat, handleRenameChat,handleRetryMessage,messages,loading,handleSend,handleClear} = useChat()
  return (
    <div className="app">
      <div className="chat-layout">
        <ChatSidebar
        chatList={chatList}
        curentChatId={currentChatId}
        onSelectChat ={setCurrentChatId}
         onCreateChat ={ handleCreateChat}
         onDeleteChat={handleDeleteChat}
         onRenameChat={handleRenameChat}

         />
          <div className="chat-container">
        <Header />
        <MessageList onRetry={handleRetryMessage} messages={messages} loading={loading} />
        <ChatInput onClear={handleClear} onSend={handleSend} disabled={loading} />
      </div>
      </div>
     
    </div>
  )
}

export default App