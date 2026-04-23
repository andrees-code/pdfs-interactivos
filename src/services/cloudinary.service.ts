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

const ensureNamedFile = (file: File | Blob, fallbackName = 'upload.bin') => {
  if (file instanceof File) return file
  return new File([file], fallbackName, {
    type: file.type || 'application/octet-stream',
  })
}

export const cloudinaryService = {
  async uploadFile(file: File | Blob, options: CloudinaryUploadOptions = {}): Promise<CloudinaryUploadResult> {
    const resourceType = options.resourceType || 'auto'

    const payloadFile = ensureNamedFile(file, options.fileName || 'upload.bin')
    const formData = new FormData()
    formData.append('file', payloadFile)

    if (options.folder) {
      formData.append('folder', options.folder)
    }

    formData.append('resourceType', resourceType)

    if (options.tags?.length) {
      formData.append('tags', options.tags.join(','))
    }

    const response = await fetch(`${UPLOAD_API}/media`, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json().catch(() => null)
    if (!response.ok || !data?.url) {
      const reason = data?.message || data?.error || `HTTP ${response.status}`
      throw new Error(`Upload failed: ${reason}`)
    }

    return {
      publicId: data.hash || '',
      secureUrl: data.url,
      resourceType: data.resource_type,
      format: data.format,
      bytes: payloadFile.size,
      width: data.width,
      height: data.height,
      originalFilename: data.original_filename,
    }
  },
}
