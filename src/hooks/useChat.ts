import { useEffect, useRef, useState } from "react";
import type { Message } from "../types/message";
import type { ChatSession } from "../types/chat";
import { sendChatMessage } from "../services/chatApi";

const STORAGE_KEY = 'chat_messages'

const CHAT_LIST_STORAGE_KEY = 'chat_list'
const CURRET_CHAT_ID_STORAGE_KEY = 'current_chat_id'

const createDefaultChat = (title = '新对话'): ChatSession => (
    {
        id: Date.now(),
        title,
        createdAt: Date.now(),
        messages: [
            {
                id: 1,
                role: 'bot',
                content: '你好，我是你的AI助手。',
                showTime: false
            }
        ]
    }
)
export function useChat() {
    const [chatList, setChatList] = useState<ChatSession[]>(
        () => {
            const savedChatList = localStorage.getItem(CHAT_LIST_STORAGE_KEY)
            if (savedChatList) {
                return JSON.parse(savedChatList)
            }
            return [createDefaultChat()]
        }
    )
    const handleRenameChat = (chatId: number, newTitle: string) => {
        const trimmedTitle = newTitle.trim()
        if (!trimmedTitle) return
        setChatList((prev) =>
            prev.map((chat) =>
                chat.id === chatId ? {
                    ...chat,
                    title: trimmedTitle
                }
                    : chat
            )
        )
    }
    const [currentChatId, setCurrentChatId] = useState<number | null>(() => {
        const saveCurrentChatId = localStorage.getItem(CURRET_CHAT_ID_STORAGE_KEY)
        if (saveCurrentChatId) {
            return Number(saveCurrentChatId)
        }
        return null
    })

    //持久化chatList
    useEffect(() => {
        localStorage.setItem(CHAT_LIST_STORAGE_KEY, JSON.stringify(chatList))
    }, [chatList])
    //持久化currentChatId
    useEffect(() => {
        localStorage.setItem(CURRET_CHAT_ID_STORAGE_KEY, String(currentChatId))
    }, [currentChatId])
    //兜底修正currentChatId
    useEffect(() => {
        if (chatList.length === 0) return
        const hasCurrentChat = chatList.some((chat) => chat.id === currentChatId)
        if (!currentChatId || !hasCurrentChat) {
            setCurrentChatId(chatList[0].id)
        }
    }, [chatList, currentChatId])
    //推导值
    const currentChat = chatList.find((chat) => chat.id === currentChatId)
    const messages = currentChat?.messages || []
    // const [messages,setMessages] = useState<Message[]>(()=>{
    //     const savedMessages = localStorage.getItem(STORAGE_KEY)
    //     if (savedMessages) {
    //         return JSON.parse(savedMessages)
    //     }
    //     return [{
    //          id: 1,
    //   role: 'bot',
    //   content: '你好，我是你的AI助手。',
    //   showTime:false 
    //     }]
    // })

    const [loading, setLoading] = useState(false)
    const timeoutRef = useRef<number | null>(null)
    const generateChatTitle = (text: string) => {
        return text.trim().slice(0, 10) || '新对话'
    }


    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }, [messages])
//消息发送出去以后的逻辑
    const sendMessageRequest = async (messageId:number,text:string)=>{
     try {
            const reply = await sendChatMessage(text)
            const botMessage: Message = {
                id: Date.now() + 1,
                role: 'bot',
                content: reply,
                createdAt: Date.now(),
                showTime: true
            }
            setChatList((prev) => {
                const currentChat = prev.find((chat) => chat.id === currentChatId)
                const otherChats = prev.filter(
                    chat => chat.id !== currentChatId
                )
                if (!currentChat) return prev
                const updatedCurrentChatMessages: Message[] = currentChat.messages.map(message => {
                    if (message.id === messageId) {
                        return {
                            ...message,
                            status: 'success'
                        }
                    }
                    return message
                })
                const updatedCurrentChat: ChatSession =
                {
                    ...currentChat,
                    title: currentChat.title === '新对话' ? generateChatTitle(text) : currentChat.title,
                    messages: [...updatedCurrentChatMessages, botMessage]
                }

                return [updatedCurrentChat, ...otherChats]
            }

            )
        } catch (error) {
            const errorMessage: Message = {
                id: Date.now() + 1,
                role: 'bot',
                content: '请求失败了，请稍后再试',
                createdAt: Date.now(),
                showTime: true
            }
            setChatList((prev) => {
                const currentChat = prev.find((chat) => chat.id === currentChatId)
                const otherChats = prev.filter(
                    chat => chat.id !== currentChatId
                )
                if (!currentChat) return prev
                const updatedCurrentChatMessages: Message[] = currentChat.messages.map(message => {
                    if (message.id === messageId) {
                        return {
                            ...message,
                            status: 'failed'
                        }
                    }
                    return message
                })
                const updatedCurrentChat: ChatSession =
                {
                    ...currentChat,
                    title: currentChat.title === '新对话' ? generateChatTitle(text) : currentChat.title,
                    messages: [...updatedCurrentChatMessages, errorMessage]
                }

                return [updatedCurrentChat, ...otherChats]
            })
        } finally {
            setLoading(false)
            timeoutRef.current = null
        }
        
    }


    const handleSend = async (text: string) => {
        if (!text.trim()) return

        const userMessage: Message = {
            id: Date.now(),
            role: 'user',
            content: text,
            createdAt: Date.now(),
            showTime: true,
            status: 'sending'
        }

        setChatList((prev) => {
            const currentChat = prev.find((chat) => chat.id === currentChatId)
            const otherChats = prev.filter(
                chat => chat.id !== currentChatId
            )
            if (!currentChat) return prev
            const updatedCurrentChat =
            {
                ...currentChat,
                title: currentChat.title === '新对话' ? generateChatTitle(text) : currentChat.title,
                messages: [...currentChat.messages, userMessage]
            }


            return [updatedCurrentChat, ...otherChats]
        }

        )
        setLoading(true)
        sendMessageRequest(userMessage.id,text)
        // try {
        //     const reply = await sendChatMessage(text)
        //     const botMessage: Message = {
        //         id: Date.now() + 1,
        //         role: 'bot',
        //         content: reply,
        //         createdAt: Date.now(),
        //         showTime: true
        //     }
        //     setChatList((prev) => {
        //         const currentChat = prev.find((chat) => chat.id === currentChatId)
        //         const otherChats = prev.filter(
        //             chat => chat.id !== currentChatId
        //         )
        //         if (!currentChat) return prev
        //         const updatedCurrentChatMessages: Message[] = currentChat.messages.map(message => {
        //             if (message.id === userMessage.id) {
        //                 return {
        //                     ...message,
        //                     status: 'success'
        //                 }
        //             }
        //             return message
        //         })
        //         const updatedCurrentChat: ChatSession =
        //         {
        //             ...currentChat,
        //             title: currentChat.title === '新对话' ? generateChatTitle(text) : currentChat.title,
        //             messages: [...updatedCurrentChatMessages, botMessage]
        //         }

        //         return [updatedCurrentChat, ...otherChats]
        //     }

        //     )
        // } catch (error) {
        //     const errorMessage: Message = {
        //         id: Date.now() + 1,
        //         role: 'bot',
        //         content: '请求失败了，请稍后再试',
        //         createdAt: Date.now(),
        //         showTime: true
        //     }
        //     setChatList((prev) => {
        //         const currentChat = prev.find((chat) => chat.id === currentChatId)
        //         const otherChats = prev.filter(
        //             chat => chat.id !== currentChatId
        //         )
        //         if (!currentChat) return prev
        //         const updatedCurrentChatMessages: Message[] = currentChat.messages.map(message => {
        //             if (message.id === userMessage.id) {
        //                 return {
        //                     ...message,
        //                     status: 'failed'
        //                 }
        //             }
        //             return message
        //         })
        //         const updatedCurrentChat: ChatSession =
        //         {
        //             ...currentChat,
        //             title: currentChat.title === '新对话' ? generateChatTitle(text) : currentChat.title,
        //             messages: [...updatedCurrentChatMessages, errorMessage]
        //         }

        //         return [updatedCurrentChat, ...otherChats]
        //     })
        // } finally {
        //     setLoading(false)
        //     timeoutRef.current = null
        // }
    }
    //请求失败 重试
    const handleRetryMessage = (messageId:number) => {
          const currentChat = chatList.find((chat) => chat.id === currentChatId)
                const otherChats = chatList.filter(
                    chat => chat.id !== currentChatId
                )
                if (!currentChat) return chatList
              const retryMessage =  currentChat.messages.find(message=>message.id === messageId)
               if (!retryMessage) return chatList
  setChatList(()=>{
            const updatedMessages:Message[]=currentChat.messages.map(message =>{
                if (message.id === messageId) {
                    return{
                        ...message,
                        status:'sending'
                    }
                }
                return message
            })
                const updatedCurrentChat = {
                    ...currentChat,
                     messages: updatedMessages
                }
       return [updatedCurrentChat,...otherChats]
  })
    setLoading(true)
        sendMessageRequest(messageId,retryMessage.content)
    }
    //创建新的对话
    const handleCreateChat = () => {
        const newChatId = Date.now()
        const newChat = createDefaultChat()
        setChatList((prev) => [...prev, newChat])
        setCurrentChatId(newChatId)
    }
    //删除对话
    const handleDeleteChat = (chatId: number) => {
        const filteredChatList = chatList.filter((chat) => chatId !== chat.id)
        if (filteredChatList.length === 0) {
            const newChat = createDefaultChat()
            setChatList([newChat])
            setCurrentChatId(newChat.id)
            return
        }
        setChatList(filteredChatList)
        if (chatId === currentChatId) {
            setCurrentChatId(filteredChatList[0].id)
        }
    }
    //清空当前会话
    const handleClear = () => {
        setChatList((prev) => prev.map(
            (chat) => chat.id === currentChatId ? {
                ...chat, messages: [
                    {
                        id: 1,
                        role: 'bot',
                        content: '你好，我是你的AI助手。',
                        showTime: false
                    }
                ]
            } : chat
        ))
    }

    return {
        chatList,
        currentChatId,
        setCurrentChatId,
        handleCreateChat,
        handleDeleteChat,
        handleRenameChat,
        handleRetryMessage,
        messages,
        loading,
        handleClear,
        handleSend
    }
}