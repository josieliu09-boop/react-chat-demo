import './MessageItem.css'
import { formatteDate } from '../../services/chatApi'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

type MessageItemProps = {
    id: number
    role: 'user' | 'bot',
    content: string,
    createdAt?: number
    showTime?: boolean,
    status?: 'sending' | 'success' | 'failed'
    onRetry: (id: number) => void,
}

function MessageItem({ id, role, content, createdAt, showTime, status, onRetry }: MessageItemProps) {
    return (
        <div>
            <div className={`message-item ${role}`}>
                <div className="message-content">
                   <div className="message-bubble">
  {role === 'bot' ? (
    <div className="markdown-body">
      <ReactMarkdown
        components={{
          code({ className, children }: any) {
            const match = /language-(\w+)/.exec(className || '')

            if (match) {
              return (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              )
            }

            return <code className={className}>{children}</code>
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  ) : (
    content
  )}
</div>
                    {/* <div className="message-bubble">
                     {role === 'bot'?(<div className='markdown-body'><ReactMarkdown>{content}</ReactMarkdown></div>):content}
                    </div> */}
                    {showTime && createdAt && (

                        <div>
                            <span>{status==='sending'?<span>发送中...</span>:''}
                                {role === 'user' && status === 'failed' && <div>
                                    <span>发送失败</span>
                                    <button onClick={() => onRetry(id)}>重试</button></div>}
                            </span>
                            <div className={`message-time${role}`}>{formatteDate(createdAt)}</div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
export default MessageItem