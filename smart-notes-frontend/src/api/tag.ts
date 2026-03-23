import client from './client'
import type {Tag, MessageResponse, Note} from '../types/index'


export const listTags = ()=>
    client.get<Tag[]>('/tags/')

export const createTag=(name: string)=>
    client.post<Tag>('/tags/', {name})

export const deleteTag = (id: number)=>
    client.delete<MessageResponse>(`/tags/${id}`)

export const addTagToNote =(note_id: number, tag_id:number)=>
    client.post<Note>(`/tags/notes/${note_id}/tags/${tag_id}`)


export const removeTagFromNote =(note_id: number, tag_id:number)=>
    client.delete<Note>(`/tags/notes/${note_id}/tags/${tag_id}`)

export const getNoteByTag = (tag_id: number)=>
    client.get<Note[]>(`/tags/${tag_id}/notes`)

