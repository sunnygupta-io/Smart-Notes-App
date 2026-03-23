
export interface User {
    id: number
    email: string
    role: string
    is_active: boolean
    created_at: string
}

export interface Tag{
    id: number
    name: string
}

export interface Note {
    id: number
    title: string
    content: string | null
    owner_id: number
    is_archived: boolean
    created_at: string
    updated_at: string
    tags: Tag[]
}

export interface NoteSearchResponse {
    total: number
    page: number
    page_size: number
    total_pages: number
    items: Note[]
}


export interface SharedNote {
  id: number
  note_id: number
  shared_with_user_id: number
  permission: string
  created_at: string
  shared_with_email: string
}

export interface Notification {
   id: number
   message: string
   is_read: boolean
   created_at: string
}

export interface Token {
    access_token: string
    refresh_token: string
    token_type: string

}

export interface MessageResponse{
    message: string
}


export interface AdminUserListResponse{
    total: number
    page: number
    page_size: number
    total_pages: number
    items: User[]
}

export interface PlatformStats{
    users:{
        total: number
        active: number
        inactive: number
    }
    notes: {
        total: number
        archived: number
        active: number
    }
    tags:  number
    active_shares: number
    unread_notifications: number
}


export interface NoteWithPermission {
    note: Note;
    permission: 'view' | 'edit';
}