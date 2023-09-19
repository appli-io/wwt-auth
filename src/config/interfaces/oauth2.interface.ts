import { IClient } from '@modules/oauth2/interfaces/client.interface';

export interface IOAuth2 {
  readonly microsoft: IClient | null;
  readonly google: IClient | null;
  readonly facebook: IClient | null;
  readonly github: IClient | null;
}
