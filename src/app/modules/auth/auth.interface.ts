import { JwtPayload } from "jsonwebtoken";

export interface AuthJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  sessionId?: string;
}