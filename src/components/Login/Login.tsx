import { useState } from "react"
import {login} from '../../services/chatApi'

function Login({onLogin}:{onLogin:(token:string)=>void}) {
    const [email,setEmail]= useState('')
    const [password,setPassword]=useState('')

    const handlogin = async()=>{
        const data = await login(email,password)
        if (data.token) {
            localStorage.setItem('token',data.token)
            onLogin(data.token)
        }
    }
    return (
        <div>
            <input
            placeholder="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
             />
             <input
             placeholder="password"
             type="password"
             value={password}
             onChange={(e)=>setPassword(e.target.value)}
              />
              <button onClick={handlogin}>登录</button>
        </div>
    )
}
export default Login