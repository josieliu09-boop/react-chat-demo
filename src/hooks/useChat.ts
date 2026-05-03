import { useEffect, useRef, useState } from "react";
import type { Message } from "../types/message";
import type { ChatSession } from "../types/chat";
import { sendChatMessage , saveMessage,getMessages,saveSession,getSessions} from "../services/chatApi";


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
      [createDefaultChat()]
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
        saveSession(String(chatId),trimmedTitle)
    }
    const [currentChatId, setCurrentChatId] = useState<number | null>(null)
    
    //兜底修正currentChatId
    useEffect(() => {
        if (chatList.length === 0) return
        const hasCurrentChat = chatList.some((chat) => chat.id === currentChatId)
        if (!currentChatId || !hasCurrentChat) {
            setCurrentChatId(chatList[0].id)
        }
    }, [chatList, currentChatId])
    useEffect(()=>{
        getSessions().then(
            (dbSessions)=>{
              if (dbSessions.length === 0) return  
              const formattedSessions:ChatSession[] = dbSessions.map((s:any)=>({
                id:Number(s.id),
                title:s.title,
                createdAt:new Date(s.created_at).getTime(),
                messages:[]
              }))
              setChatList(formattedSessions)
              setCurrentChatId(formattedSessions[0].id)
            }
        )
    },[])
    useEffect(()=>{
        if (!currentChatId) return
        getMessages(String(currentChatId)).then((dbMessages)=>{
            if (!Array.isArray(dbMessages)) return
            if (dbMessages.length === 0) return
            setChatList((prev)=>prev.map((chat)=>{
                if (chat.id != currentChatId) return chat
                const formattedMessages:Message[]=dbMessages.map((msg:any)=>({
                    id:msg.id,
                    role:msg.role === 'assistant'?'bot':msg.role ,
                    content:msg.content,
                    createdAt:new Date(msg.created_at).getTime(),
                    showTime:true
                }))
                return {...chat,messages:formattedMessages}
            }))
        })
    },[currentChatId])
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


//消息发送出去以后的逻辑
    const sendMessageRequest = async (messageId:number,text:string)=>{
     try {
            const reply = await sendChatMessage(text)
            await saveMessage (String(currentChatId),"user",text)
            await saveMessage(String(currentChatId),'assistant',reply)
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
    const handleCreateChat = async() => {    
        const newChat = createDefaultChat()
        await saveSession(String(newChat.id),newChat.title)
        setChatList((prev)=>[...prev,newChat])
        setCurrentChatId(newChat.id)
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