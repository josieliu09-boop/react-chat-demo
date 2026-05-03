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
        <div>
            <h2>{isRegister ? '注册' : '登录'}</h2>
            <input
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                placeholder="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleSubmit}>{isRegister ? '注册' : '登录'}</button>
            <p onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
            </p>
            {message && <p>{message}</p>}
        </div>
    )
}
export default Login