import { ReactNode } from "react";
import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

interface AuthContextType {
  currentUser: {
    email?: string;
    uid?: string;
  };
}

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      console.log(user);
    });

    return () => {
      unSubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
