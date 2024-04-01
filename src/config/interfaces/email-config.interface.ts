interface IClientAuth {
  type: string;
  user: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
}

export interface IEmailConfig {
  service: string;
  auth: IClientAuth;
}
