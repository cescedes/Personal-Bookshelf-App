import BookItem from "./BookItem";
import { Book } from "../types";

interface Props {
  books: Book[];
  onUpdate: (book: Book) => void;
  onDelete: (id: number) => void;
  user: any;
}

export default function BookList({ books, onUpdate, onDelete, user }: Props) {
  return (
    <div className="book-grid">
      {books.map((book) => (
        <BookItem
          key={book.id}
          book={book}
          onUpdated={onUpdate}
          onDeleted={onDelete}
          user={user}
        />
      ))}
    </div>
  );
}
