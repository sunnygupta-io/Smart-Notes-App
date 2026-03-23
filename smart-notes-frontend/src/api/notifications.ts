import client from './client'
import type {Notification, MessageResponse} from '../types/index'


export const listNotifications = (unread_only:boolean= false, page: number=1 )=> 
    client.get<Notification[]>('/notifications/',{params:{unread_only, page}})

export const getUnreadCount = ()=>
    client.get<{unread_count: number}>('notifications/unread-count')

export const markAsRead = (notification_id: number)=>
    client.patch<Notification>(`/notifications/${notification_id}/read`)

export const markAllAsRead = ()=>
    client.patch<MessageResponse>('/notifications/read-all')

export const deleteNotification = (id: number) =>
  client.delete<MessageResponse>(`/notifications/${id}`)

export const clearAllNotifications = () =>
  client.delete<MessageResponse>('/notifications/clear-all')