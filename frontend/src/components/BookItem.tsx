import { useState } from "react";
import { Book } from "../types";

interface Props {
  book: Book;
  onUpdated: (book: Book) => void;
  onDeleted: (id: number) => void;
  user: any; // current logged-in user
}

export default function BookItem({ book, onUpdated, onDeleted, user }: Props) {
  const [liked, setLiked] = useState(book.liked);

  const toggleLike = () => {
    const updated = { ...book, liked: !liked };
    setLiked(!liked);
    onUpdated(updated);
  };

  const canModify = !user || book.user_id === user?.id; // public demo OR owner

  return (
    <div className="book-item">
      {book.thumbnail && (
        <img
          src={book.thumbnail}
          alt={book.title}
        />
      )}
      <div className="book-title">{book.title}</div>
      <div className="book-author">{book.author}</div>

      <button
        onClick={toggleLike}
        className="like-button"
        style={{ color: liked ? "red" : "#999" }}
      >
        {liked ? "❤️" : "🤍"}
      </button>

      {canModify && (
        <div style={{ marginTop: 4 }}>
          <button
            onClick={() => onDeleted(book.id)}
            className="delete-button"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
