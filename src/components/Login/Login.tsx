import { useState } from "react"
import { login, register } from '../../services/chatApi'

function Login({ onLogin }: { onLogin: (token: string) => void }) {
    const [isRegister, setIsRegister] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = async () => {
        if (isRegister) {
            const data = await register(email, password)
            if (data.id) {
                setMessage('注册成功，请登录')
                setIsRegister(false)
            }
        } else {
            const data = await login(email, password)
            if (data.token) {
                localStorage.setItem('token', data.token)
                onLogin(data.token)
            } else {
                setMessage('登录失败，请检查邮箱密码')
            }
        }
    }

    // const handlogin = async()=>{
    //     const data = await login(email,password)
    //     if (data.token) {
    //         localStorage.setItem('token',data.token)
    //         onLogin(data.token)
    //     }
    // }
    return (
    <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7fb'
    }}>
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '48px 40px',
            width: '360px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
        }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 600 }}>
                {isRegister ? '创建账号' : '欢迎回来'}
            </h2>
            <p style={{ margin: '0 0 32px', color: '#6b7280', fontSize: '14px' }}>
                {isRegister ? '填写信息开始使用' : '登录继续使用 AI Chat'}
            </p >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input
                    placeholder="邮箱地址"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '14px',
                        outline: 'none'
                    }}
                />
                <input
                    placeholder="密码"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '14px',
                        outline: 'none'
                    }}
                />
                <button
                    onClick={handleSubmit}
                    style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#2563eb',
                        color: 'white',
                        fontSize: '15px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        marginTop: '8px'
                    }}
                >
                    {isRegister ? '注册' : '登录'}
                </button>
            </div>
            {message && (
                <p style={{ marginTop: '16px', fontSize: '14px', color: '#16a34a', textAlign: 'center' }}>
                    {message}
                </p >
            )}
            <p
                onClick={() => setIsRegister(!isRegister)}
                style={{
                    marginTop: '24px',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#2563eb',
                    cursor: 'pointer'
                }}
            >
                {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
            </p >
        </div>
    </div>
)

}
export default Login