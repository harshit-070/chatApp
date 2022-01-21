import React, { useCallback, useContext, useEffect, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { useContacts } from "./ContactsProvider";
import { useSocket } from "./SocketProvider";

const ConversationContext = React.createContext();

export function useConversations() {
  return useContext(ConversationContext);
}

export function ConversationProvider({ id, children }) {
  const [conversations, setConversations] = useLocalStorage("conversation", []);
  const [selectedConversationIndex, setSelectedConversationIndex] = useState(0);
  const { contacts } = useContacts();
  const socket = useSocket();
  function createConversation(recipients) {
    setConversations((prevConversation) => [
      ...prevConversation,
      { recipients, messages: [] },
    ]);
  }

  const formatedConversations = conversations.map((conversation, index) => {
    const recipients = conversation.recipients.map((recipient) => {
      const contact = contacts.find((contact) => contact.id === recipient);
      const name = (contact && contact.name) || recipient;
      return { id: recipient, name };
    });
    const messages = conversation.messages.map((message) => {
      const contact = contacts.find((contact) => contact.id === message.sender);
      const name = (contact && contact.name) || message.sender;
      const fromMe = id === message.sender;
      return { ...message, senderName: name, fromMe };
    });
    const selected = index === selectedConversationIndex;
    return { ...conversation, messages, recipients, selected };
  });

  const addMessageToConversation = useCallback(
    ({ recipients, text, sender }) => {
      setConversations((prevConversation) => {
        let madeChanges = false;
        const newMessage = { sender, text };
        const newConversations = prevConversation.map((conversation) => {
          if (arrayEquality(conversation.recipients, recipients)) {
            madeChanges = true;
            return {
              ...conversation,
              messages: [...conversation.messages, newMessage],
            };
          }
          return conversation;
        });

        if (madeChanges) {
          return newConversations;
        } else {
          return [...prevConversation, { recipients, messages: [newMessage] }];
        }
      });
    },
    [setConversations]
  );

  useEffect(() => {
    if (socket == null) return;
    socket.on("receive-message", addMessageToConversation);

    return () => socket.off("receive-message");
  }, [socket, addMessageToConversation]);

  function sendMessage(recipients, text) {
    socket.emit("send-message", { recipients, text });
    addMessageToConversation({ recipients, text, sender: id });
  }

  const value = {
    conversations: formatedConversations,
    selectedConversation: formatedConversations[selectedConversationIndex],
    selectConversationIndex: setSelectedConversationIndex,
    sendMessage,
    createConversation,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

function arrayEquality(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  a.sort();
  b.sort();

  return a.every((element, index) => {
    return element === b[index];
  });
}
