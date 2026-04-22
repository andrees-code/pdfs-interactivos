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

const getCloudinaryConfig = () => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Faltan variables de entorno de Cloudinary: VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UNSIGNED_PRESET',
    )
  }

  return { cloudName, uploadPreset }
}

const buildUploadEndpoint = (cloudName: string, resourceType: CloudinaryResourceType) => {
  return `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
}

const ensureNamedFile = (file: File | Blob, fallbackName = 'upload.bin') => {
  if (file instanceof File) return file
  return new File([file], fallbackName, {
    type: file.type || 'application/octet-stream',
  })
}

export const cloudinaryService = {
  async uploadFile(file: File | Blob, options: CloudinaryUploadOptions = {}): Promise<CloudinaryUploadResult> {
    const { cloudName, uploadPreset } = getCloudinaryConfig()
    const resourceType = options.resourceType || 'auto'

    const payloadFile = ensureNamedFile(file, options.fileName || 'upload.bin')
    const formData = new FormData()
    formData.append('file', payloadFile)
    formData.append('upload_preset', uploadPreset)

    if (options.folder) {
      formData.append('folder', options.folder)
    }

    if (options.tags?.length) {
      formData.append('tags', options.tags.join(','))
    }

    const response = await fetch(buildUploadEndpoint(cloudName, resourceType), {
      method: 'POST',
      body: formData,
    })

    const data = await response.json().catch(() => null)
    if (!response.ok || !data?.secure_url) {
      const reason = data?.error?.message || `HTTP ${response.status}`
      throw new Error(`Cloudinary upload failed: ${reason}`)
    }

    return {
      publicId: data.public_id,
      secureUrl: data.secure_url,
      resourceType: data.resource_type,
      format: data.format,
      bytes: data.bytes,
      width: data.width,
      height: data.height,
      originalFilename: data.original_filename,
    }
  },
}
