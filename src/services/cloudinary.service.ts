import { UPLOAD_API } from '@/config/api.js'

type CloudinaryResourceType = 'image' | 'video' | 'raw' | 'auto'

export interface CloudinaryUploadOptions {
  resourceType?: CloudinaryResourceType
  folder?: string
  fileName?: string
  tags?: string[]
}

export interface CloudinaryUploadResult {
  publicId: string
  secureUrl: string
  resourceType: string
  format?: string
  bytes: number
  width?: number
  height?: number
  originalFilename?: string
}

interface CloudinarySignaturePayload {
  timestamp: number
  signature: string
  apiKey: string
  cloudName: string
  folder: string
  resourceType: CloudinaryResourceType
  deliveryType?: 'upload'
}

interface SignatureCacheEntry {
  payload: CloudinarySignaturePayload
  expiresAt: number
}

const SIGNATURE_TTL_MS = 45 * 1000
const signatureCache = new Map<string, SignatureCacheEntry>()

const signatureCacheKey = (options: CloudinaryUploadOptions = {}) => {
  const folder = options.folder || 'docflow-assets'
  const resourceType = options.resourceType || 'auto'
  return `${folder}::${resourceType}`
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const stringifyUploadError = (reason: unknown) => {
  if (!reason) return 'Unknown error'
  if (typeof reason === 'string') return reason
  if (typeof reason === 'object') {
    const asObj = reason as Record<string, unknown>
    return String(asObj.message || asObj.error || JSON.stringify(asObj))
  }
  return String(reason)
}

const ensureNamedFile = (file: File | Blob, fallbackName = 'upload.bin') => {
  if (file instanceof File) return file
  return new File([file], fallbackName, {
    type: file.type || 'application/octet-stream',
  })
}

export const cloudinaryService = {
  async getSignedUploadPayload(
    options: CloudinaryUploadOptions = {},
  ): Promise<CloudinarySignaturePayload> {
    const cacheKey = signatureCacheKey(options)
    const cached = signatureCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.payload
    }

    const resourceType = options.resourceType || 'auto'
    const params = new URLSearchParams()
    params.set('resourceType', resourceType)
    if (options.folder) {
      params.set('folder', options.folder)
    }

    let lastReason = 'Unknown error'
    for (let attempt = 1; attempt <= 4; attempt++) {
      const response = await fetch(`${UPLOAD_API}/signature?${params.toString()}`, {
        method: 'GET',
      })

      const data = await response.json().catch(() => null)
      const isValid =
        response.ok &&
        data?.signature &&
        data?.timestamp &&
        data?.apiKey &&
        data?.cloudName

      if (isValid) {
        const payload = data as CloudinarySignaturePayload
        signatureCache.set(cacheKey, {
          payload,
          expiresAt: Date.now() + SIGNATURE_TTL_MS,
        })
        return payload
      }

      lastReason = data?.message || data?.error || `HTTP ${response.status}`
      if (response.status !== 429 || attempt === 4) {
        break
      }

      await sleep(350 * attempt)
    }

    throw new Error(`Could not sign upload: ${lastReason}`)
  },

  async uploadFile(
    file: File | Blob,
    options: CloudinaryUploadOptions = {},
  ): Promise<CloudinaryUploadResult> {
    const resourceType = options.resourceType || 'auto'
    const signaturePayload = await this.getSignedUploadPayload(options)

    const payloadFile = ensureNamedFile(file, options.fileName || 'upload.bin')
    const formData = new FormData()
    formData.append('file', payloadFile)

    formData.append('api_key', signaturePayload.apiKey)
    formData.append('timestamp', String(signaturePayload.timestamp))
    formData.append('signature', signaturePayload.signature)
    formData.append('folder', signaturePayload.folder)
    if (signaturePayload.deliveryType) {
      formData.append('type', signaturePayload.deliveryType)
    }

    if (options.tags?.length) {
      formData.append('tags', options.tags.join(','))
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signaturePayload.cloudName}/${signaturePayload.resourceType || resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      },
    )

    const data = await response.json().catch(() => null)
    if (!response.ok || (!data?.secure_url && !data?.url)) {
      const reason = stringifyUploadError(data?.message || data?.error || `HTTP ${response.status}`)
      throw new Error(`Upload failed: ${reason}`)
    }

    return {
      publicId: data.public_id || '',
      secureUrl: data.secure_url || data.url,
      resourceType: data.resource_type || resourceType,
      format: data.format,
      bytes: payloadFile.size,
      width: data.width,
      height: data.height,
      originalFilename: data.original_filename || payloadFile.name,
    }
  },
}
