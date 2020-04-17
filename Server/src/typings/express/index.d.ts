
declare namespace Express {
  export interface Request {
    token?: string;
    decoded: { userId: number; iat: number };
  }
  export interface Response {
    token?: any;
  }
}
