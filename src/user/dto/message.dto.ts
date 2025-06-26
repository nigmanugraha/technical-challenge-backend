export class SendMessageDto {
  receiverId: string;
  content: string;
}

export class ViewMessagesDto {
  targetId: string;
}
