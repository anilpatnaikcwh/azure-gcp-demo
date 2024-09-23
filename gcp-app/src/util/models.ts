export interface IUser {
  id?: string;
  name?: string;
  email?: string;
}

export interface IMessage extends IUser {
  messageId?: string;
}
