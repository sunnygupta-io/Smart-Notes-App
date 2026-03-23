import client from "./client";
import type {AdminUserListResponse, PlatformStats, MessageResponse, User, Note} from '../types/index'


export const listAllUsers = (params: {
    page?: number
    page_size?: number
    is_active?: boolean
    role?: string
} )=> 
    client.get<AdminUserListResponse>('/admin/users', {params})


export const getUserDetail = (user_id: number)=>
    client.get<User>(`/admin/users/${user_id}`)

export const getUserNotes = (user_id: number, params?: { page?: number; page_size?: number }) =>
    client.get<Note[]>(`/admin/users/${user_id}/notes`, { params })

export const deactivateUser = (user_id: number)=>
    client.patch<User>(`/admin/users/${user_id}/deactivate`)

export const reactivateUser = (user_id: number) =>
  client.patch<User>(`/admin/users/${user_id}/reactivate`)

export const deleteUser = (user_id: number) =>
  client.delete<MessageResponse>(`/admin/users/${user_id}`)

export const getPlatformStats = () =>
  client.get<PlatformStats>('/admin/stats')