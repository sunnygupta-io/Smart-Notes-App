import client from "./client";
import type { User, MessageResponse } from "../types/index";

export const register = (email: string, password: string) =>
  client.post<User>("/users/register", { email, password });

export const login = async (email: string, password: string) => {
  return await client.post<MessageResponse>("/users/login", {
    email,
    password,
  });
};

export const refreshTokens = (refresh_tokens: string) =>
  client.post<MessageResponse>("/users/refresh", { refresh_tokens });

export const logout = () => client.post<MessageResponse>("/users/logout");

export const getMe = () => client.get("/users/me");

export const changePassword = (
  current_password: string,
  new_password: string,
) =>
  client.put<MessageResponse>("/users/me/password", {
    current_password,
    new_password,
  });
