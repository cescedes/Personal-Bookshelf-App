export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  year: string;
  thumbnail: string;
  status: "read" | "to-read";
  liked: boolean | null;
  user_id: string; // Add this line
  added_at?: string;
}
