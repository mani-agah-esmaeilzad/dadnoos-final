// const API_BASE_URL = "/api/proxy"
// const API_BASE_URL = "http://65.109.221.120:8001/api/v1"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

export interface AuthResponse {
  access_token: string
  expires_at: string
  expires_in: number
}

export interface UserInfoResponse {
  id: string
  username: string
}

export interface ChatRequest {
  chat_id: string
  message?: string
  images?: any
  attachments?: any
  prompt?: string
  module?: string
}

export interface ChatResponse {
  response: string
}

export interface Conversation {
  chat_id: string
  created_at: string
  title: string
}

export interface Message {
  timestamp: string
  role: 'user' | 'assistant'
  content: string
  content_json?: any
  text_parts: string[]
  image_count: number
  image_urls: string[]
}

export interface SubscriptionPlan {
  id: string
  code?: string
  title: string
  duration_days: number
  token_quota: number
  message_quota?: number
  is_organizational: boolean
  price_cents?: number
}

export interface PaymentSummary {
  id: string
  gross_amount: number
  discount_amount: number
  net_amount: number
  currency: string
  discount_code: string | null
  status: string
  created_at: string
}

export interface UserSubscription {
  id: string
  plan_id: string | null
  plan_code?: string | null
  plan_title?: string | null
  plan_price_cents?: number
  upgrade_credit_cents?: number
  token_quota: number
  tokens_used: number
  remaining_tokens: number
  message_quota?: number
  messages_used?: number
  remaining_messages?: number
  started_at: string
  expires_at: string
  active: boolean
  upgrade_from_subscription_id?: string | null
}

export interface BillingResponse {
  has_subscription: boolean
  subscription?: UserSubscription | null
}

export interface SubscribeResponse extends UserSubscription {
  payment?: PaymentSummary
}

export interface PaymentRecord {
  id: string
  plan_id: string
  plan_code?: string | null
  plan_title?: string | null
  gross_amount: number
  discount_amount: number
  net_amount: number
  currency: string
  status: string
  discount_code?: string | null
  upgrade_from_subscription_id?: string | null
  created_at: string
}

export interface PlansResponse {
  plans: SubscriptionPlan[]
}

export interface VoiceLiveChunkResponse {
  transcript?: string
  response?: {
    text: string
    audio_base64?: string
    mime_type?: string
  }
}

export interface FeedbackPayload {
  title: string
  message: string
  type: 'idea' | 'report'
}

export interface FeedbackResponse {
  id: string
}

export class ApiError extends Error {
  status: number
  data?: any
  constructor(message: string, status: number, data?: any) {
    super(message)
    this.status = status
    this.data = data
  }
}

class ApiService {
  private baseUrl: string
  public token: string | null = null

  constructor() {
    this.baseUrl = API_BASE_URL
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken')
    }
  }

  public setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('authToken', token)
    } else {
      localStorage.removeItem('authToken')
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, { ...options, headers })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Not Found')
      }

      if (response.status === 401) {
        this.setToken(null)
      }

      const contentType = response.headers.get('content-type') ?? ''
      let errorData: any = null

      if (contentType.includes('application/json')) {
        errorData = await response.json().catch(() => null)
      } else {
        const text = await response.text().catch(() => '')
        errorData = { message: text }
      }

      throw new ApiError(
        errorData?.detail || errorData?.message || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      )
    }

    if (response.status === 204) {
      return {} as T
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      return response.json() as Promise<T>
    }

    const text = await response.text()
    return text as unknown as T
  }

  async requestOtp(phone: string): Promise<string> {
    return this.request<string>('/api/v1/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    })
  }

  async verifyOtp(phone: string, code: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/v1/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    })

    if (response.access_token) {
      this.setToken(response.access_token)
    }

    return response
  }

  async getCurrentUser(): Promise<UserInfoResponse> {
    return this.request<UserInfoResponse>('/api/v1/auth/me', {
      method: 'GET',
    })
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>('/api/v1/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async sendMessageStream(request: ChatRequest): Promise<Response> {
    const url = `${this.baseUrl}/api/v1/chat/stream`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const body = JSON.stringify(request ?? {})

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `HTTP error! status: ${response.status}` }))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    return response
  }

  async speechToText(base64Audio: string, mimeType: string = "audio/mpeg"): Promise<{ text: string }> {
    const url = `${this.baseUrl}/api/v1/audio/stt`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        base64_audio: base64Audio,
        mime_type: mimeType,
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `HTTP error! status: ${response.status}` }))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async textToSpeech(
    text: string,
    options: {
      response_format?: 'mp3' | 'wav' | 'opus' | 'flac' | 'aac' | 'pcm'
      voice?: string | { name: string; languageCode?: string }
      speed?: number
      instructions?: string
    } = {}
  ): Promise<Blob> {
    const url = `${this.baseUrl}/api/v1/audio/tts`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        input: text,
        voice: options.voice,
        response_format: options.response_format,
        speed: options.speed,
        instructions: options.instructions,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `HTTP error! status: ${response.status}` }))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get('Content-Type') || 'audio/mpeg'
    const buffer = await response.arrayBuffer()
    return new Blob([buffer], { type: contentType })
  }

  async startVoiceLiveSession(): Promise<{ session_id: string; expires_in: number }> {
    return this.request('/api/v1/audio/live', {
      method: 'POST',
      body: JSON.stringify({ action: 'start' }),
    })
  }

  async sendVoiceLiveChunk(sessionId: string, base64Audio: string, mimeType: string) {
    return this.request<VoiceLiveChunkResponse>('/api/v1/audio/live', {
      method: 'POST',
      body: JSON.stringify({
        action: 'chunk',
        session_id: sessionId,
        base64_audio: base64Audio,
        mime_type: mimeType,
      }),
    })
  }

  async stopVoiceLiveSession(sessionId: string) {
    return this.request('/api/v1/audio/live', {
      method: 'POST',
      body: JSON.stringify({
        action: 'stop',
        session_id: sessionId,
      }),
    })
  }

  async getPlans(includeOrg: boolean = false): Promise<{ plans: SubscriptionPlan[] }> {
    const params = includeOrg ? '?include_org=true' : ''
    const response = await this.request<{ plans: SubscriptionPlan[] }>(`/api/billing/plans${params}`, {
      method: 'GET',
    })
    return response
  }

  async getBilling(): Promise<BillingResponse> {
    return this.request<BillingResponse>('/api/billing/me', { method: 'GET' })
  }

  async subscribePlan(planId: string, discountCode?: string): Promise<SubscribeResponse> {
    const payload: Record<string, string> = { plan_id: planId }
    if (discountCode?.trim()) {
      payload.discount_code = discountCode.trim()
    }
    return this.request<SubscribeResponse>('/api/billing/subscribe', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getPayments(): Promise<{ payments: PaymentRecord[] }> {
    return this.request<{ payments: PaymentRecord[] }>('/api/billing/payments', {
      method: 'GET',
    })
  }

  async submitFeedback(payload: FeedbackPayload): Promise<FeedbackResponse> {
    return this.request<FeedbackResponse>('/api/v1/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    return this.request<Conversation[]>(`/api/v1/history/${userId}`)
  }

  async getMessagesByConversation(userId: string, chatId: string): Promise<Message[]> {
    return this.request<Message[]>(`/api/v1/history/${userId}/${chatId}`)
  }

  async updateChatTitle(userId: string, chatId: string, title: string): Promise<string> {
    return this.request<string>(`/api/v1/history/${userId}/${chatId}/title`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    })
  }

  async deleteConversation(userId: string, chatId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/v1/history/${userId}/${chatId}`, {
      method: 'DELETE'
    })
  }
}

export const apiService = new ApiService()
export { ApiService }
