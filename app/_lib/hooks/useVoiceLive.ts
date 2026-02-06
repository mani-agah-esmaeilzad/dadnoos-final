import { useCallback, useEffect, useRef, useState } from 'react'

import { apiService, ApiError } from '@/app/_lib/services/api'

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string | null
      if (!result) return reject(new Error('Failed to read blob'))
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

const base64ToBlob = (base64: string, mimeType: string = 'audio/mpeg') => {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

export function useVoiceLive(autoPlayResponses: boolean = true) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'connecting' | 'live' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [transcripts, setTranscripts] = useState<string[]>([])
  const [responses, setResponses] = useState<{ id: string; text: string; audioUrl?: string }[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioUrlsRef = useRef<string[]>([])
  const sessionIdRef = useRef<string | null>(null)

  const cleanupAudioUrls = useCallback(() => {
    audioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    audioUrlsRef.current = []
  }, [])

  const stopRecording = useCallback(
    async (notifyServer: boolean) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      streamRef.current?.getTracks().forEach((track) => track.stop())
      mediaRecorderRef.current = null
      streamRef.current = null
      cleanupAudioUrls()
      const activeSessionId = sessionIdRef.current
      if (notifyServer && activeSessionId) {
        try {
          await apiService.stopVoiceLiveSession(activeSessionId)
        } catch (err) {
          console.error('Failed to stop live session', err)
        }
      }
      sessionIdRef.current = null
      setSessionId(null)
      setStatus('idle')
    },
    [cleanupAudioUrls]
  )

  const start = useCallback(async () => {
    if (status === 'connecting' || status === 'live') return
    setError(null)
    setTranscripts([])
    setResponses([])
    cleanupAudioUrls()
    setStatus('connecting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      let mediaRecorder: MediaRecorder
      try {
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus',
        })
      } catch {
        mediaRecorder = new MediaRecorder(stream)
      }
      const session = await apiService.startVoiceLiveSession()
      setSessionId(session.session_id)
      sessionIdRef.current = session.session_id

      mediaRecorder.addEventListener('dataavailable', async (event) => {
        if (!event.data || event.data.size === 0) return
        const activeSessionId = sessionIdRef.current
        if (!activeSessionId) return
        try {
          const base64 = await blobToBase64(event.data)
          const result = await apiService.sendVoiceLiveChunk(
            activeSessionId,
            base64,
            event.data.type?.split(';')[0] || 'audio/webm'
          )
          const transcriptValue = typeof result?.transcript === 'string' ? result.transcript.trim() : ''
          if (transcriptValue) {
            setTranscripts((prev) => [...prev, transcriptValue])
          }
          const response = result?.response
          const responseText = typeof response?.text === 'string' ? response.text.trim() : ''
          if (responseText) {
            let audioUrl: string | undefined
            if (typeof response?.audio_base64 === 'string' && response.audio_base64) {
              const blob = base64ToBlob(
                response.audio_base64,
                response.mime_type || 'audio/mpeg'
              )
              audioUrl = URL.createObjectURL(blob)
              audioUrlsRef.current.push(audioUrl)
              if (autoPlayResponses) {
                const audio = new Audio(audioUrl)
                audio.play().catch((err) => console.error('Live audio playback failed', err))
              }
            }
            setResponses((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                text: responseText,
                audioUrl,
              },
            ])
          }
        } catch (err) {
          console.error('Failed to send live chunk', err)
          if (err instanceof ApiError) {
            if (err.status === 410) {
              setError('جلسه معتبر نیست یا منقضی شده. دوباره تلاش کنید.')
              await stopRecording(false)
              setStatus('error')
              return
            }
            const detail = err.data?.detail || err.message || 'ارسال بسته صوتی ناموفق بود'
            setError(detail)
            if (err.status && err.status >= 500) {
              await stopRecording(false)
              setStatus('error')
            }
          } else {
            setError('ارسال بسته صوتی ناموفق بود')
          }
        }
      })

      mediaRecorder.start(2000)
      mediaRecorderRef.current = mediaRecorder
      streamRef.current = stream
      setStatus('live')
    } catch (err) {
      console.error('Failed to start voice live session', err)
      setError('عدم دسترسی به میکروفون یا سرویس صوتی')
      setStatus('error')
    }
  }, [status, autoPlayResponses, stopRecording, cleanupAudioUrls])

  const stop = useCallback(() => {
    void stopRecording(true)
  }, [stopRecording])

  useEffect(() => {
    return () => {
      stopRecording(true)
      cleanupAudioUrls()
    }
  }, [stopRecording, cleanupAudioUrls])

  return {
    start,
    stop,
    status,
    error,
    sessionId,
    transcripts,
    responses,
    isLive: status === 'live',
  }
}
