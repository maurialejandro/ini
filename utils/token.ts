import { auth } from "../configs/firebase-server";

export const decodeToken = async (token: string) => await auth.verifyIdToken(token);

export const userIsAdmin = async (token: string) => {
  
  const decoded = await decodeToken(token);
  return decoded.permisos === "Administrador";
};

export const tokenIsValid = async (token: string) => {
  const decoded = await decodeToken(token);
  return decoded
}