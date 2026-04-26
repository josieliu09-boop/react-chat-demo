import { useState } from "react";
import './ChatInput.css'

type ChatInputProps = {
    onSend: (Text: string) => void,
    onClear: () => void,
    disabled: boolean
}



export function ChatInput({ onSend, onClear, disabled }: ChatInputProps) {
    const [inputValue, setInputValue] = useState('')
    const handleSubmit = () => {
        if (!inputValue.trim()) return
        onSend(inputValue)
        setInputValue('')
    }
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit()
        }
    }

    return (
        <div className="chat-input">
            <input
                placeholder="请输入内容..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                type="text" />
            <button onClick={handleSubmit}>发送</button>
            <button onClick={onClear} disabled={disabled}>清空聊天</button>
        </div>
    )
}

export default ChatInput