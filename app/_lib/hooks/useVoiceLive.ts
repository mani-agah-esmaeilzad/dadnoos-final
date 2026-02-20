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

const writeString = (view: DataView, offset: number, value: string) => {
  for (let i = 0; i < value.length; i += 1) {
    view.setUint8(offset + i, value.charCodeAt(i))
  }
}

const encodeWavFromSamples = (samples: Float32Array, sampleRate: number) => {
  const numChannels = 1
  const bytesPerSample = 2
  const blockAlign = numChannels * bytesPerSample
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample)
  const view = new DataView(buffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + samples.length * bytesPerSample, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bytesPerSample * 8, true)
  writeString(view, 36, 'data')
  view.setUint32(40, samples.length * bytesPerSample, true)

  let offset = 44
  for (let i = 0; i < samples.length; i += 1) {
    const sample = samples[i] ?? 0
    const clamped = Math.max(-1, Math.min(1, sample))
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true)
    offset += bytesPerSample
  }

  return buffer
}

const encodeWav = (audioBuffer: AudioBuffer) => {
  const numChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const numFrames = audioBuffer.length
  const bytesPerSample = 2
  const blockAlign = numChannels * bytesPerSample
  const buffer = new ArrayBuffer(44 + numFrames * blockAlign)
  const view = new DataView(buffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + numFrames * blockAlign, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bytesPerSample * 8, true)
  writeString(view, 36, 'data')
  view.setUint32(40, numFrames * blockAlign, true)

  let offset = 44
  for (let i = 0; i < numFrames; i += 1) {
    for (let channel = 0; channel < numChannels; channel += 1) {
      const sample = audioBuffer.getChannelData(channel)[i] ?? 0
      const clamped = Math.max(-1, Math.min(1, sample))
      view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true)
      offset += bytesPerSample
    }
  }

  return buffer
}

const blobToWavBase64 = async (blob: Blob): Promise<string> => {
  const arrayBuffer = await blob.arrayBuffer()
  const AudioContextRef =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextRef) {
    throw new Error('AudioContext not supported')
  }
  const audioContext = new AudioContextRef()
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0))
    const wavBuffer = encodeWav(audioBuffer)
    const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' })
    return await blobToBase64(wavBlob)
  } finally {
    await audioContext.close().catch(() => undefined)
  }
}

const samplesToWavBase64 = async (samples: Float32Array, sampleRate: number) => {
  const wavBuffer = encodeWavFromSamples(samples, sampleRate)
  const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' })
  return await blobToBase64(wavBlob)
}

export function useVoiceLive(autoPlayResponses: boolean = true) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'connecting' | 'live' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [transcripts, setTranscripts] = useState<string[]>([])
  const [responses, setResponses] = useState<{ id: string; text: string; audioUrl?: string }[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const chunkTimerRef = useRef<number | null>(null)
  const sampleQueueRef = useRef<Float32Array[]>([])
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
      if (chunkTimerRef.current) {
        window.clearInterval(chunkTimerRef.current)
      }
      chunkTimerRef.current = null
      processorRef.current?.disconnect()
      sourceRef.current?.disconnect()
      processorRef.current = null
      sourceRef.current = null
      sampleQueueRef.current = []
      if (audioContextRef.current) {
        await audioContextRef.current.close().catch(() => undefined)
      }
      audioContextRef.current = null
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

  const handleChunkResult = useCallback(
    async (base64: string, mimeType: string) => {
      const activeSessionId = sessionIdRef.current
      if (!activeSessionId) return
      try {
        const result = await apiService.sendVoiceLiveChunk(activeSessionId, base64, mimeType)
        const transcriptValue = typeof result?.transcript === 'string' ? result.transcript.trim() : ''
        if (transcriptValue) {
          setTranscripts((prev) => [...prev, transcriptValue])
        }
        const response = result?.response
        const responseText = typeof response?.text === 'string' ? response.text.trim() : ''
        if (responseText) {
          let audioUrl: string | undefined
          if (typeof response?.audio_base64 === 'string' && response.audio_base64) {
            const blob = base64ToBlob(response.audio_base64, response.mime_type || 'audio/mpeg')
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
    },
    [autoPlayResponses, stopRecording]
  )

  const start = useCallback(async () => {
    if (status === 'connecting' || status === 'live') return
    setError(null)
    setTranscripts([])
    setResponses([])
    cleanupAudioUrls()
    setStatus('connecting')
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setError('مرورگر شما از دسترسی به میکروفون پشتیبانی نمی‌کند.')
        setStatus('error')
        return
      }
      const AudioContextRef =
        window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (typeof MediaRecorder === 'undefined' && !AudioContextRef) {
        setError('مرورگر شما ضبط صوت را پشتیبانی نمی‌کند.')
        setStatus('error')
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const session = await apiService.startVoiceLiveSession()
      setSessionId(session.session_id)
      sessionIdRef.current = session.session_id

      if (AudioContextRef) {
        const audioContext = new AudioContextRef()
        if (audioContext.state === 'suspended') {
          await audioContext.resume().catch(() => undefined)
        }
        audioContextRef.current = audioContext
        const source = audioContext.createMediaStreamSource(stream)
        sourceRef.current = source
        const processor = audioContext.createScriptProcessor(4096, 1, 1)
        processorRef.current = processor
        const gain = audioContext.createGain()
        gain.gain.value = 0
        processor.onaudioprocess = (event) => {
          const input = event.inputBuffer.getChannelData(0)
          if (!input || input.length === 0) return
          sampleQueueRef.current.push(new Float32Array(input))
        }
        source.connect(processor)
        processor.connect(gain)
        gain.connect(audioContext.destination)

        chunkTimerRef.current = window.setInterval(() => {
          const chunks = sampleQueueRef.current
          if (!chunks.length) return
          const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
          if (totalLength === 0) {
            sampleQueueRef.current = []
            return
          }
          const merged = new Float32Array(totalLength)
          let offset = 0
          for (const chunk of chunks) {
            merged.set(chunk, offset)
            offset += chunk.length
          }
          sampleQueueRef.current = []
          void (async () => {
            try {
              const base64 = await samplesToWavBase64(merged, audioContext.sampleRate)
              await handleChunkResult(base64, 'audio/wav')
            } catch (chunkError) {
              console.warn('Live audio WAV encoding failed, falling back to MediaRecorder.', chunkError)
            }
          })()
        }, 2000)
      } else {
        let mediaRecorder: MediaRecorder
        try {
          mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=opus',
          })
        } catch {
          mediaRecorder = new MediaRecorder(stream)
        }
        mediaRecorder.addEventListener('dataavailable', async (event) => {
          if (!event.data || event.data.size === 0) return
          try {
            let mimeType = event.data.type?.split(';')[0] || 'audio/webm'
            let base64 = await blobToBase64(event.data)
            if (mimeType.includes('webm') || mimeType.includes('ogg')) {
              try {
                base64 = await blobToWavBase64(event.data)
                mimeType = 'audio/wav'
              } catch (conversionError) {
                console.warn('Live audio WAV conversion failed, falling back to raw blob.', conversionError)
              }
            }
            await handleChunkResult(base64, mimeType)
          } catch (err) {
            console.error('Failed to send live chunk', err)
          }
        })
        mediaRecorder.start(2000)
        mediaRecorderRef.current = mediaRecorder
      }
      streamRef.current = stream
      setStatus('live')
    } catch (err) {
      console.error('Failed to start voice live session', err)
      if (err instanceof ApiError) {
        const detail = err.data?.detail || err.message || 'خطا در شروع مکالمه زنده'
        setError(detail)
      } else {
        setError('عدم دسترسی به میکروفون یا سرویس صوتی')
      }
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setStatus('error')
    }
  }, [status, handleChunkResult, stopRecording, cleanupAudioUrls])

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
