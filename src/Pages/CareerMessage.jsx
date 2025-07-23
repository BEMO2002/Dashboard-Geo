import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { FaTrash } from "react-icons/fa";

const PAGE_SIZE = 10;

const CareerMessage = () => {
  const { token } = useAuth();
  const [allMessages, setAllMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Update messages for current page
    const startIdx = (page - 1) * PAGE_SIZE;
    const endIdx = startIdx + PAGE_SIZE;
    setMessages(allMessages.slice(startIdx, endIdx));
    setTotalPages(Math.ceil(allMessages.length / PAGE_SIZE) || 1);
  }, [allMessages, page]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://api.geoduke.com/admin/careermessages",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllMessages(res.data);
      setPage(1); // reset to first page on reload
    } catch {
      toast.error("Failed to fetch career messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;
    try {
      await axios.delete(`https://api.geoduke.com/admin/careermessages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Message deleted successfully!");
      fetchMessages();
    } catch {
      toast.error("Failed to delete message.");
    }
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-white">
      <h1 className="text-2xl font-bold text-primary mb-8">Career Messages</h1>
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
                <th className="py-3 px-4 font-semibold text-sm">Job Title</th>
                <th className="py-3 px-4 font-semibold text-sm">CV</th>
                <th className="py-3 px-4 font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No career messages found.
                  </td>
                </tr>
              ) : (
                messages.map((msg, idx) => (
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
                    <td className="py-2.5 px-4 text-gray-700 font-medium">
                      {msg.jobTitle}
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
                ))
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="font-semibold text-primary">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerMessage;
