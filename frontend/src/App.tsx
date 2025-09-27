import { useEffect, useState } from "react";
import AddBookForm from "./components/AddBookForm";
import BookList from "./components/BookList";
import Recommendations from "./components/Recommendations";
import Login from "./components/Login";
import { Book } from "./types";
import { supabase } from "./supabaseClient";
import "./styles.css"; // 👈 import your CSS theme

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [user, setUser] = useState<any>(null);

  // Listen for auth changes
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch books based on user
  const fetchBooks = async () => {
    let query = supabase.from("books").select("*").order("added_at", { ascending: false });

    if (user) {
      query = query.eq("user_id", user.id); // private shelf
    } else {
      query = query.is("user_id", null); // public demo shelf
    }

    const { data, error } = await query;
    if (error) console.error(error);
    else setBooks(data ?? []);
  };

  useEffect(() => { fetchBooks(); }, [user]);

  const addBook = async (book: Book) => {
    const { data, error } = await supabase
      .from("books")
      .insert({ ...book, user_id: user?.id ?? null })
      .select();
    if (error) console.error(error);
    else setBooks(prev => [data![0], ...prev]);
  };

  const updateBook = async (book: Book) => {
    const { data, error } = await supabase
      .from("books")
      .update({
        title: book.title,
        author: book.author,
        genre: book.genre,
        year: book.year,
        thumbnail: book.thumbnail,
        status: book.status,
        liked: book.liked,
      })
      .eq("id", book.id)
      .select();
    if (error) console.error(error);
    else setBooks(prev => prev.map(b => (b.id === book.id ? data![0] : b)));
  };

  const deleteBook = async (id: number) => {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) console.error(error);
    else setBooks(prev => prev.filter(b => b.id !== id));
  };

  const likedBooks = books.filter(b => b.liked === true);
  const readBooks = books.filter(b => b.status === "read");
  const toReadBooks = books.filter(b => b.status === "to-read");

  return (
    <div className="app-container">
      <h1>Personal Bookshelf<span className="header-emoji">📖</span></h1>

      <section className="card">
        {!user ? (
          <Login onLogin={setUser} />
        ) : (
          <div>
            <p>Welcome, {user.email || "user"}!</p>
            <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
          </div>
        )}
      </section>

      <section>
        <h2>Add a Book</h2>
        <div className="card">
          <AddBookForm onAdded={addBook} user={user} />
        </div>
      </section>

      <section>
        <h2>Read</h2>
          <BookList books={readBooks} onUpdate={updateBook} onDelete={deleteBook} user={user} />
      </section>

      <section>
        <h2>To Read</h2>
          <BookList books={toReadBooks} onUpdate={updateBook} onDelete={deleteBook} user={user} />
      </section>

      <section>
        <h2>Recommendations</h2>
        <div className="card">
          <Recommendations
            likedBooks={likedBooks}
            allBooks={books}
            onAdd={addBook}
            userId={user?.id}
          />
        </div>
      </section>
    </div>
  );
}
