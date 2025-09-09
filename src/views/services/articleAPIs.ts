import type { GetAllParams } from '@/types/pages/widgetTypes'
import instance from '../../services/AxiosGlobal'

interface UploadResponse {
  message: string
  location: string
  url: string
  filename: string
}

const getAllArticle = (data: GetAllParams) => {
  return instance.post('article', data)
}

const getArticleDetail = (id: string) => {
  return instance.get(`article/${id}`)
}

const deleteArticle = (id: string) => {
  return instance.delete(`article/${id}`)
}

const updateArticle = (id: string, data: any) => {
  return instance.put(`article/${id}`, data)
}

const uploadImage = (formData: FormData, onUploadProgress?: (progressEvent: any) => void) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')

  return instance.post<UploadResponse>('upload-direct', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
      'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true,
    onUploadProgress
  })
}

const deleteContentImage = (filename: string) => {
  return instance.delete(`files/${filename}`)
}

const articleAPIs = {
  getAllArticle,
  getArticleDetail,
  uploadImage,
  deleteContentImage,
  deleteArticle,
  updateArticle
}

export default articleAPIs
