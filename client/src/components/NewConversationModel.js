import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useContacts } from "../Context/ContactsProvider";
import { useConversations } from "../Context/ConversationProvider";

export default function NewConversationModel({ closeModal }) {
  const [selectContactIds, setSelectContactIds] = useState([]);
  const { contacts } = useContacts();
  const { createConversation } = useConversations();

  function handleCheckboxChange(contactId) {
    setSelectContactIds((prevSelectedContactsIds) => {
      if (prevSelectedContactsIds.includes(contactId)) {
        return prevSelectedContactsIds.filter((prevId) => prevId !== contactId);
      } else {
        return [...prevSelectedContactsIds, contactId];
      }
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    createConversation(selectContactIds);
    closeModal();
  }

  return (
    <>
      <Modal.Header closeButton>Create Contact</Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {contacts.map((contact) => (
            <Form.Group controlId={contact.id} key={contact.id}>
              <Form.Check
                type="checkbox"
                value={selectContactIds.includes(contact.id)}
                label={contact.name}
                onChange={() => handleCheckboxChange(contact.id)}
              ></Form.Check>
            </Form.Group>
          ))}
          <Button type="submit">Create</Button>
        </Form>
      </Modal.Body>
    </>
  );
}
