export interface UserPayload {
  // Standardowe pola JWT
  exp: number;
  iss: string;
  aud: string;

  // Claimy z backendu (z zdekodowanego tokena)
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
}
