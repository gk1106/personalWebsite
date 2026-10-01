/** Shapes for POST /api/chat, matching the backend exactly. */
export interface ChatApiRequest {
  message: string;
}

export interface ChatApiResponse {
  answer: string;
}
