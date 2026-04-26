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