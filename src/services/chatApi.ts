export async function sendChatMessage(text: string) {
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_DASHSCOPE_API_KEY}`,

        },
        body: JSON.stringify({
            model: 'qwen3.6-plus',
            messages: [
                {
                    role: 'user',
                    content: text
                },
                {
                    role: 'system',
                    content: "你是一个简介友好的中文助手"
                }
            ]
        })
    })
    const data = await response.json()
    if (!response.ok) {
        throw new Error(data?.message || '请求失败')
    }
    return data.choices?.[0].message?.content || '没有拿到回复内容'
}
//格式化年月日
export function formatteDate(time: number) {
    const date = new Date(time)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需+1并补零
    const day = String(date.getDate()).padStart(2, '0');
    const hours = date.getHours();        // 获取小时
    const minutes = date.getMinutes();    // 获取分钟
    const seconds = date.getSeconds();
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// const BASE_URL = 'https://chat-server-production-72d5.up.railway.app'
const BASE_URL = 'http://localhost:3000'

// 保存消息到数据库
export async function saveMessage(session_id: string, role: string, content: string) {
    const token = localStorage.getItem('token')
    await fetch(`${BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
             'authorization':token|| '' 
         },
        body: JSON.stringify({ session_id, role, content })
    })
}

// 获取某个会话的历史消息
export async function getMessages(session_id: string) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/messages/${session_id}`,{
        headers:{
            'authorization':token|| '' 
        }
    })
    return response.json()
}
//保存会话
export async function saveSession(id: string, title: string) {
    console.log('saveSession called', id, title);
const token = localStorage.getItem('token')
    await fetch(`${BASE_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' ,
            'authorization':token|| ''
        },
        body: JSON.stringify({ id, title })
    })
}
//获取所有会话
export async function getSessions() {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/sessions`,
      {  headers:{
            'authorization':token|| '' 
        }}
    )
    return response.json()
}
export async function register(email:string,password:string) {
    const response = await fetch(`${BASE_URL}/auth/register`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email,password})
        })
        return response.json()
}
export async function login(email:string,password:string) {
    const response = await fetch(`${BASE_URL}/auth/login`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email,password})
        })
        return response.json()
}

export async function deleteSession(id:string) {
    const token  = localStorage.getItem('token')
    await fetch(`${BASE_URL}/sessions/${id}`,{
        method:'DELETE',
        headers:{
            'authorization':token||''
        }
    })
}