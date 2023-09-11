import { Request } from 'express-serve-static-core';

class RequestMock {
  public signedCookies: Record<string, string> = {};
  public headers: Record<string, Record<string, string>> = {};

  public setCookie( name: string, value: string ): void {
    this.signedCookies[name] = value;
  }

  public removeCookie( name: string ): void {
    delete this.signedCookies[name];
  }
}

interface ExtendedRequestMock extends Request {
  setCookie: ( name: string, value: string ) => void;
  removeCookie: ( name: string ) => void;
}

export const createRequestMock = (): ExtendedRequestMock =>
  new RequestMock() as unknown as ExtendedRequestMock;
