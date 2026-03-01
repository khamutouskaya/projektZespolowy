export interface UserPayload {
  // Z obiektu user w odpowiedzi backendu
  id: string;
  email: string;
  personalityType: string;
  isAdmin: boolean;

  // Standardowe pola JWT (do sprawdzania exp)
  exp: number;
  iss: string;
  aud: string;
}
