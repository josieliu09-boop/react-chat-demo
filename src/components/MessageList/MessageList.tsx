import { useEffect,useRef } from "react"
import MessageItem from "../MessageItem/MessageItem"
import './MessageList.css'
import type { Message } from "../../types/message";
type MessageListProps = {
    messages: Message[],
    loading: boolean
    onRetry: (id: number) => void,
}

function MessageList({ messages, loading,onRetry }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement | null>(null)

    useEffect(()=>{
        bottomRef.current?.scrollIntoView({behavior:'smooth'})
    },[messages,loading])
    return (
        <div className="message-list">
            {messages.map((message) => (
                <MessageItem
                    key={message.id}
                    id={message.id}
                    role={message.role}
                    content={message.content}
                    createdAt={message.createdAt}
                    showTime={message.showTime}
                    status={message.status}
                    onRetry={onRetry}
                   
                />
            ))}
            {loading && <div className="loading">你好，我正在思考中...</div>}
            <div ref={bottomRef}></div>
        </div>
    )
}

export default MessageList