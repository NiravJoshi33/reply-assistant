export interface GenerateReplyRequest {
  type: 'GENERATE_REPLY';
  toneId: string;
  originalTweet: string;
  additionalContext?: string;
}

export interface GenerateReplyResponse {
  success: boolean;
  text?: string;
  error?: string;
}

export type MessageRequest = GenerateReplyRequest;
export type MessageResponse = GenerateReplyResponse;
