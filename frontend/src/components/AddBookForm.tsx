import { useState, useEffect } from "react";
import { Book } from "../types";
import { supabase } from "../supabaseClient";

interface Props {
  onAdded: (book: Book) => void;
  user: any; // Supabase user
}

export default function AddBookForm({ onAdded, user }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"to-read" | "read">("to-read");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 3) return setSuggestions([]);
    const controller = new AbortController();

    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
            query
          )}&maxResults=5&key=${import.meta.env.VITE_GOOGLE_API_KEY}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setSuggestions(data.items || []);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchBooks, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const handleAdd = async () => {
    if (!selected) return;

    const newBook: Omit<Book, "id"> & { user_id?: string | null } = {
      title: selected.volumeInfo.title,
      author: selected.volumeInfo.authors?.[0] || "",
      genre: selected.volumeInfo.categories?.[0] || "",
      year: selected.volumeInfo.publishedDate?.substring(0, 4) || "",
      thumbnail: selected.volumeInfo.imageLinks?.thumbnail || "",
      status,
      liked: null,
      user_id: user?.id ?? null, // assign user_id for private books
    };

    const { data, error } = await supabase.from("books").insert({ ...newBook, user_id: user?.id ?? null }).select();
    if (error) console.error(error);
    else onAdded(data![0]);

    setSelected(null);
    setQuery("");
  };

  return (
    <div style={{ position: "relative", width: 400 }}>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelected(null);
        }}
        placeholder="Type book title..."
        style={{ width: "90%", padding: 8 }}
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as "to-read" | "read")}
        style={{ marginTop: 8, width: "30%", padding: 6 }}
      >
        <option value="to-read">To Read</option>
        <option value="read">Read</option>
      </select>

      {loading && <div style={{ position: "absolute", top: 70 }}>Loading…</div>}

      {suggestions.map((s) => (
        <div
          key={s.id}
          style={{ cursor: "pointer", padding: 5 }}
          onClick={() => {
            setSelected(s);
            setQuery(s.volumeInfo.title);
            setSuggestions([]);
          }}
        >
          {s.volumeInfo.title} {s.volumeInfo.authors?.[0] && `by ${s.volumeInfo.authors[0]}`}
        </div>
      ))}

      <button
        disabled={!selected}
        onClick={handleAdd}
        style={{ marginTop: 10, padding: "6px 12px" }}
      >
        Add Book
      </button>
    </div>
  );
}
