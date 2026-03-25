import client from "./client";
import type {
  SharedNote,
  MessageResponse,
  NoteWithPermission,
} from "../types/index";

export const shareNote = (
  note_id: number,
  shared_with_email: string,
  permission: "view" | "edit",
) =>
  client.post<SharedNote>(`/share/${note_id}`, {
    shared_with_email,
    permission,
  });

export const listNoteShares = (note_id: number) =>
  client.get<SharedNote[]>(`/share/${note_id}/users`);

export const getSharedWithMe = () =>
  client.get<NoteWithPermission[]>("/share/me/notes");

export const updateSharePermission = (
  note_id: number,
  user_id: number,
  permission: "view" | "edit",
) =>
  client.patch<SharedNote>(`/share/${note_id}/users/${user_id}`, {
    permission,
  });

export const revokeShare = (note_id: number, user_id: number) =>
  client.delete<MessageResponse>(`/share/${note_id}/users/${user_id}`);
