export type Message = {
  id: number
  role: 'user' | 'bot'
  content: string
  createdAt?:number
  showTime?:boolean
  status?:'sending'|'success'|'failed'
}