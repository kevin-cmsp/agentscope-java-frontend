export interface Result<T = any> {
    code: number
    message: string
    data: T
}

export interface LoginParams {
    username: string
    password: string
    captcha: string
    captchaKey: string
}

export interface LoginResult {
    token: string
    user: UserInfo
}

export interface UserInfo {
    id: number
    username: string
    nickname: string
    mobile: string
    email: string
    deptId: number
    postIds: number[]
    status: number
    remark: string
    creator: number
    createTime: string
    updateTime: string
    password?: string
}

export interface Menu {
    id: number
    name: string
    path: string
    component: string
    icon: string
    parentId: number
    sort: number
    type: number
    children?: Menu[]
}

export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
    time?: string
}

export interface ChatResponse {
    status: 'success' | 'error'
    content: string
    conversationId?: number
}

export interface Conversation {
    id: number
    userId: number
    title: string
    createTime: string
    updateTime: string
}

export interface Message {
    id: number
    conversationId: number
    role: 'user' | 'assistant'
    content: string
    createTime: string
}

export interface UserProfile {
    id: number
    userId: number
    interestTags: string
    frequentFeatures: string
    preferenceSummary: string
    chatStyle: string
    totalChats: number
    totalMessages: number
    profileVersion: number
    createTime: string
    updateTime: string
}

export interface MemoryStats {
    memorySize: number
    hasSummary: boolean
    needsCompression: boolean
}
