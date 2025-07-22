import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import Modal from "react-modal";

Modal.setAppElement("#root");

const ContactMessage = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://geoduke.runasp.net/api/admin/contactmessages",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(res.data);
    } catch {
      toast.error("Failed to fetch messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;
    try {
      await axios.delete(
        `https://geoduke.runasp.net/api/admin/contactmessages/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Message deleted successfully!");
      fetchMessages();
    } catch {
      toast.error("Failed to delete message.");
    }
  };

  const handleShowMore = (msg, name) => {
    setModalMessage(msg);
    setModalTitle(name);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    setModalTitle("");
  };

  return (
    <div className="min-h-screen  py-10 px-4 bg-white">
      <h1 className="text-2xl font-bold text-primary mb-8">Contact Messages</h1>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="animate-spin inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4"></span>
          <span className="text-primary font-semibold text-lg">Loading...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-baseTwo to-gray-300 text-gray-700">
                <th className="py-3 px-4 font-semibold text-sm">Name</th>
                <th className="py-3 px-4 font-semibold text-sm">Email</th>
                <th className="py-3 px-4 font-semibold text-sm">Phone</th>
                <th className="py-3 px-4 font-semibold text-sm">Message</th>
                <th className="py-3 px-4 font-semibold text-sm">CV</th>
                <th className="py-3 px-4 font-semibold text-sm">Date</th>
                <th className="py-3 px-4 font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg, idx) => (
                <tr
                  key={msg.id}
                  className={`border-b border-gray-100 transition-colors ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="py-2.5 px-4 font-medium text-gray-800">
                    {msg.name}
                  </td>
                  <td className="py-2.5 px-4 text-gray-500 font-medium">
                    {msg.email}
                  </td>
                  <td className="py-2.5 px-4 text-gray-700 font-medium">
                    {msg.phone}
                  </td>
                  <td className="py-2.5 px-4 text-gray-700 max-w-xs break-words font-medium">
                    {msg.message.length > 100 ? (
                      <>
                        {msg.message.slice(0, 100)}...
                        <button
                          className="ml-2 text-primary underline text-xs font-semibold"
                          onClick={() => handleShowMore(msg.message, msg.name)}
                        >
                          Show More
                        </button>
                      </>
                    ) : (
                      msg.message
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {msg.asset?.url ? (
                      <a
                        href={msg.asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition text-xs font-semibold"
                        title="Preview or Download CV"
                      >
                        View CV
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">No CV</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-gray-400 font-medium">
                    {msg.createdAt?.split("T")[0]}
                  </td>
                  <td className="py-2.5 px-4">
                    <button
                      className="rounded-full p-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 transition"
                      onClick={() => handleDelete(msg.id)}
                      title="Delete"
                    >
                      <FaTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal for full message */}
      <Modal
        isOpen={showModal}
        onRequestClose={closeModal}
        contentLabel="Full Message"
        className="max-w-lg w-full mx-auto mt-24 bg-white rounded-xl shadow-lg p-8 outline-none overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <h2 className="text-xl font-bold mb-4 text-primary flex items-center justify-between">
          Message from: {modalTitle}
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-red-500 text-2xl"
          >
            &times;
          </button>
        </h2>
        <div className="text-gray-800 whitespace-pre-line break-words">
          {modalMessage}
        </div>
      </Modal>
    </div>
  );
};

export default ContactMessage;
