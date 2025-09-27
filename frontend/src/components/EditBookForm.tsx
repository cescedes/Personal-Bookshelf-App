import { useState } from "react";
import { Book } from "../types";
import { supabase } from "../supabaseClient";

interface Props {
  book: Book;
  onSaved: (book: Book) => void;
  onCancel: () => void;
}

export default function EditBookForm({ book, onSaved, onCancel }: Props) {
  const [title, setTitle] = useState(book.title);
  const [status, setStatus] = useState<Book["status"]>(book.status);
  const [liked, setLiked] = useState<boolean | null>(book.liked ?? null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updated: Partial<Book> = { ...book, title, status, liked };
    const { data, error } = await supabase.from("books").update(updated).eq("id", book.id).select();
    setSaving(false);
    if (error) {
      console.error(error);
      alert("Failed to save changes");
    } else {
      onSaved(data![0]);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: 2 }} required />
      <select value={status} onChange={(e) => setStatus(e.target.value as Book["status"])}>
        <option value="to-read">To read</option>
        <option value="read">Read</option>
      </select>
      <select value={liked === null ? "unset" : liked ? "liked" : "disliked"} 
              onChange={(e) => setLiked(e.target.value === "liked" ? true : e.target.value === "disliked" ? false : null)}>
        <option value="unset">—</option>
        <option value="liked">Liked</option>
        <option value="disliked">Disliked</option>
      </select>
      <button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}
