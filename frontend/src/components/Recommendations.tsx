import { useState } from "react";
import { Book } from "../types";
import { supabase } from "../supabaseClient";

interface Props {
  likedBooks: Book[];
  allBooks: Book[];
  onAdd: (book: Book) => void;
  userId: string;
}

export default function Recommendations({ likedBooks, allBooks, onAdd, userId }: Props) {
  const [recs, setRecs] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    if (!likedBooks.length && !allBooks.length) {
      setRecs([]);
      return;
    }

    try {
      setLoading(true);

      const weightedBooks = likedBooks.length
        ? [...likedBooks, ...likedBooks, ...allBooks]
        : allBooks;

      const genres = weightedBooks.map((b) => b.genre).filter(Boolean);
      if (!genres.length) return setRecs([]);

      const genreCounts: Record<string, number> = {};
      genres.forEach((g) => (genreCounts[g] = (genreCounts[g] || 0) + 1));
      const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
      const topGenres = sortedGenres.slice(0, 3).map(([g]) => g);
      const chosenGenre = topGenres[Math.floor(Math.random() * topGenres.length)];

      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(
          chosenGenre
        )}&maxResults=20&key=${import.meta.env.VITE_GOOGLE_API_KEY}`
      );
      const data = await res.json();

      let items: Book[] = (data.items || []).map((item: any) => ({
        id: 0,
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.[0] || "",
        genre: item.volumeInfo.categories?.[0] || "",
        year: item.volumeInfo.publishedDate?.substring(0, 4) || "",
        thumbnail: item.volumeInfo.imageLinks?.thumbnail || "",
        status: "to-read",
        liked: null,
      }));

      const existingTitles = new Set(allBooks.map((b) => b.title.toLowerCase()));
      items = items.filter((item) => !existingTitles.has(item.title.toLowerCase()));
      items = items.sort(() => Math.random() - 0.5);

      setRecs(items.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (book: Book) => {
    const { data, error } = await supabase
      .from("books")
      .insert({ ...book, user_id: userId })
      .select();
    if (error) console.error(error);
    else onAdd(data![0]);
  };

  return (
    <div className="recommendations">
      <button className="rec-button" onClick={fetchRecommendations}>
        Recommend me a book!
      </button>

      {loading && <p>Loading recommendations…</p>}

      <div className="rec-grid">
        {recs.map((book, i) => (
          <div key={i} className="rec-item">
            {book.thumbnail ? (
              <img src={book.thumbnail} alt={book.title} />
            ) : (
              <div className="rec-placeholder" />
            )}
            <div className="rec-title">{book.title}</div>
            {book.author && <div className="rec-author">{book.author}</div>}
            <div style={{ marginTop: 8 }}>
              <button className="rec-add-btn" onClick={() => handleAdd(book)}>
                ➕ Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
