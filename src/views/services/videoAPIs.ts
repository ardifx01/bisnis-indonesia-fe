import type { GetAllParams } from '@/types/pages/widgetTypes'
import instance from '../../services/AxiosGlobal'

const getAllVideo = (data: GetAllParams) => {
  return instance.post('videos', data)
}

const getVideoDetail = (id: string) => {
  return instance.get(`videos/${id}`)
}

const updateVideo = (id: string, data: any) => {
  return instance.put(`videos/${id}`, data)
}

const deleteVideo = (id: string) => {
  return instance.delete(`videos/${id}`)
}

const videoAPIs = {
  getAllVideo,
  getVideoDetail,
  deleteVideo,
  updateVideo
}

export default videoAPIs
