import Header from "./components/Header/Header";
import MessageList from "./components/MessageList/MessageList";
import ChatInput from "./components/ChatInput/ChatInput";
import ChatSidebar from "./components/ChatSidebar/ChatSidebar";
import './App.css'
import { useChat } from "./hooks/useChat";
import Login from "./components/Login/Login";
import {  useState } from "react";


function App() {
    const [token,setToken]=useState<string|null>(localStorage.getItem('token'))
  const{  chatList,
        currentChatId,
        resetChat,
        setCurrentChatId,
        handleCreateChat,handleDeleteChat, handleRenameChat,handleRetryMessage,messages,loading,handleSend,handleClear} = useChat(token)
       if (!token) {
      return <Login onLogin={(t)=>setToken(t)} />
    }
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
        <Header onLogout={()=>{
          localStorage.removeItem('token')
          resetChat()
          setToken(null)
        }} />
        <MessageList onRetry={handleRetryMessage} messages={messages} loading={loading} />
        <ChatInput onClear={handleClear} onSend={handleSend} disabled={loading} />
      </div>
      </div>
     
    </div>
  )
}

export default App