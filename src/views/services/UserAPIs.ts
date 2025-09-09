import type { GetAllParams } from '@/types/pages/widgetTypes'
import instance from '../../services/AxiosGlobal'

const getAllUser = (data: GetAllParams) => {
  return instance.post('users', data)
}

const getUserDetail = (id: string) => {
  return instance.get(`users/${id}`)
}

const updatedUserDetail = (id: string, data: any) => {
  return instance.put(`users/${id}`, data)
}

const deleteUser = (id: string) => {
  return instance.delete(`users/${id}`)
}

const imgUserDetail = (id: string, data: FormData) => {
  return instance.post(`users/${id}/image`, data, {
    headers: {
      'Content-Type': 'multipart/form-data' // Explicitly set content type for file upload
    }
  })
}

const UserAPIs = {
  getAllUser,
  getUserDetail,
  updatedUserDetail,
  imgUserDetail,
  deleteUser
}

export default UserAPIs
