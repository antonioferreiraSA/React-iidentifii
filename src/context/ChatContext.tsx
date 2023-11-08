import React, { ReactNode } from "react";
import { createContext, useContext, useReducer } from "react";
import { AuthContext } from "./AuthContext";

interface Action {
  type: string;
  payload: any; // replace 'any' with the actual type if you have one
}

export const INITIAL_STATE = {
  chatId: "null",
  user: {},
};

interface ChatContextType {
  data: typeof INITIAL_STATE;
  dispatch: React.Dispatch<any>; // replace 'any' with the actual action type if you have one
}

interface ChatContextProviderProps {
  children: ReactNode;
}

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined,
);

export const ChatContextProvider = ({ children }: ChatContextProviderProps) => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    // handle the case where AuthContext is undefined
    throw new Error("AuthContext is undefined");
  }
  const { currentUser } = authContext;
  const chatReducer = (state: typeof INITIAL_STATE, action: Action) => {
    switch (action.type) {
      case "CHANGE_USER":
        return {
          user: action.payload,
          chatId:
            currentUser &&
            currentUser.uid &&
            currentUser.uid > action.payload.uid
              ? currentUser.uid + action.payload.uid
              : action.payload.uid + (currentUser ? currentUser.uid : "null"),
        };

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
