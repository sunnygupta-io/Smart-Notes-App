import client from './client'
import type {Note, NoteSearchResponse, MessageResponse} from '../types/index'

export const createNote = (title: string, content: string , tag_ids: number[] = [] )=>
    client.post<Note>('/notes/',{title, content, tag_ids})

export const listNotes = (page:number =1, page_size: number=10, archived?: boolean )=>
    client.get<Note[]>('/notes/',{params: {page, page_size, archived}})

export const getNote = (id: number)=>
    client.get<Note>(`/notes/${id}`)

export const updateNote = (id: number ,data: { title?: string; content?: string; tag_ids?: number[] })=>
    client.put<Note>(`/notes/${id}`, data)

export const deleteNote = (id: number)=>
    client.delete<MessageResponse>(`/notes/${id}`)

export const toggleArchive =(id: number)=>
    client.patch<Note>(`/notes/${id}/archive`)

export const searchNotes= (params:{
    q?: string
    tag_id?: number
    archived?:boolean
    date_from?: string
    date_to?: string
    page?: number
    page_size?: number
}) => client.get<NoteSearchResponse>('/notes/search', {params})