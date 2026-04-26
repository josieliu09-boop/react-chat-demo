import './ChatSidebar.css'
import type { ChatSession } from '../../types/chat'
import { useState } from 'react'

type ChatSidebarProps = {
    chatList: ChatSession[]
    curentChatId: number | null
    onSelectChat: (id: number) => void
    onCreateChat: () => void
    onDeleteChat: (id: number) => void
    onRenameChat: (id: number, title: string) => void
}

function ChatSidebar({
    chatList,
    curentChatId,
    onSelectChat,
    onCreateChat,
    onDeleteChat,
    onRenameChat
}: ChatSidebarProps) {
    const [editingChatId, setEditingChatId] = useState<number | null>(null)
    const [editingTitle, setEditingTitle] = useState('')
    //开始编辑
    const handleStartEdit = (chatId: number, currentTitle: string) => {
        setEditingChatId(chatId)
        setEditingTitle(currentTitle)
    }
    // 保存编辑的title
    const handleSaveEdit = () => {
        if (editingChatId == null) return
        onRenameChat(editingChatId, editingTitle)
        setEditingChatId(null)
        setEditingTitle('')
    }
    return (
        <div className="chat-sidebar">
            <div className="chat-sidebar-header">
                <button className='new-chat-button' onClick={onCreateChat}>
                    + 新建会话
                </button>
            </div>
            <div className="chat-sidebar-list">
                {chatList.map((chat) => (
                    <div
                        key={chat.id}
                        className={`chat-sidebar-item ${chat.id === curentChatId ? 'active' : ''}`}
                        onClick={() => onSelectChat(chat.id)}
                    >
                        {
                            editingChatId === chat.id ? (
                                <input
                                    className='chat-title-input'
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    onBlur={handleSaveEdit}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSaveEdit()
                                        }
                                    }}
                                    autoFocus
                                />
                            ) : (
                                <span
                                    className='chat-title'
                                    onDoubleClick={(e) => {
                                        e.stopPropagation()
                                        handleStartEdit(chat.id, chat.title)
                                    }}
                                >{chat.title}</span>
                            )
                        }

                        <button className='delete-chat-btn'
                            onClick={(e) => {
                                e.stopPropagation()
                                onDeleteChat(chat.id)
                            }}>x</button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ChatSidebar