import { useState } from "react";
import { supabase } from "../supabaseClient";

interface Props {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const signUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: username + "@demo.com", // pseudo-email
      password,
    });
    if (error) console.error(error);
    else alert("Account created! You can now log in.");
  };

  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username + "@demo.com",
      password,
    });
    if (error) console.error(error);
    else onLogin(data.user);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={signUp}>Sign Up</button>
      <button onClick={signIn}>Login</button>
    </div>
  );
}
