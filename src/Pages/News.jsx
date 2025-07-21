import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Modal from "react-modal";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { IoCloseSharp } from "react-icons/io5";
import { Editor } from "@tinymce/tinymce-react";
Modal.setAppElement("#root");

const API_URL =
  "https://geoduke.runasp.net/api/admin/news?pageNumber=1&pageSize=10";

const initialForm = {
  title: "",
  subTitle: "",
  description: "",
  createdAt: "",
  imagefile: null,
};

const News = () => {
  const { token } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch news
  useEffect(() => {
    fetchNews(currentPage);
    // eslint-disable-next-line
  }, [currentPage]);

  const fetchNews = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://geoduke.runasp.net/api/admin/news?pageNumber=${page}&pageSize=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNews(res.data);
      // If API returns total count, use it. Otherwise, estimate pages from data length.
      // if (Array.isArray(res.data) && res.data.length === pageSize) {
      //   setTotalPages(page + 1); // crude estimate if no total count
      // } else {
      //   setTotalPages(page);
      // }
    } catch {
      toast.error("Failed to fetch news.");
    } finally {
      setLoading(false);
    }
  };

  // Open modal for add or edit
  const openModal = (newsItem = null) => {
    if (newsItem) {
      setEditMode(true);
      setSelectedId(newsItem.id);
      setForm({
        title: newsItem.title,
        subTitle: newsItem.subTitle,
        description: newsItem.description,
        createdAt: newsItem.createdAt,
        imagefile: null, // image upload handled separately
      });
      setImagePreview(newsItem.image?.url || null);
    } else {
      setEditMode(false);
      setSelectedId(null);
      setForm(initialForm);
      setImagePreview(null);
    }
    setModalIsOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalIsOpen(false);
    setForm(initialForm);
    setSelectedId(null);
    setEditMode(false);
    setImagePreview(null);
  };

  // Handle form input
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagefile") {
      setForm((prev) => ({ ...prev, imagefile: files[0] }));
      if (files && files[0]) {
        setImagePreview(URL.createObjectURL(files[0]));
      } else {
        setImagePreview(null);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle TinyMCE change
  const handleDescriptionChange = (content) => {
    setForm((prev) => ({ ...prev, description: content }));
  };

  // Handle add/edit submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Prepare form data
    const formData = new FormData();
    formData.append("Title", form.title);
    formData.append("SubTitle", form.subTitle);
    formData.append("Description", form.description);
    formData.append("createdAt", form.createdAt);
    if (form.imagefile) formData.append("imagefile", form.imagefile);
    try {
      if (editMode && selectedId) {
        // Edit news (PUT endpoint expects id in form-data, not in URL)
        formData.append("id", selectedId);
        await axios.put("https://geoduke.runasp.net/api/admin/news", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("News updated successfully!");
      } else {
        // Add news
        await axios.post(
          "https://geoduke.runasp.net/api/admin/news",
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("News added successfully!");
      }
      fetchNews();
      closeModal();
    } catch {
      toast.error("Failed to save news.");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news item?"))
      return;
    try {
      await axios.delete(`https://geoduke.runasp.net/api/admin/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("News deleted successfully!");
      fetchNews();
    } catch {
      toast.error("Failed to delete news.");
    }
  };

  return (
    <div className="min-h-screen  py-10 px-4 bg-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-primary">News</h1>
        <button
          className="flex items-center gap-2 bg-primary text-white hover:text-primary px-4 py-2 rounded hover:bg-white border duration-300 border-primary transition"
          onClick={() => openModal()}
        >
          <FaPlus /> Add News
        </button>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="animate-spin inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4"></span>
          <span className="text-primary font-semibold text-lg">Loading...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item) => (
              <div
                key={item.id}
                className=" rounded-xl shadow p-4 flex flex-col"
              >
                <img
                  src={item.image?.url}
                  alt={item.title}
                  className="w-full h-40 object-cover rounded mb-3 "
                />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-primary mb-1">
                    {item.title}
                  </h2>
                  <h3 className="text-base font-semibold  mb-1">
                    {item.subTitle}
                  </h3>
                  <div className="text-xs text-gray-400 mb-2">
                    {item.createdAt}
                  </div>
                  <div
                    className="text-sm text-gray-700 mb-2 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    className="text-blue-600 "
                    onClick={() => openModal(item)}
                    title="Edit"
                  >
                    <FaEdit size={20} />
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => handleDelete(item.id)}
                    title="Delete"
                  >
                    <FaTrash size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center mt-8 gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="px-4 py-1 font-bold text-primary">
              Page {currentPage}
            </span>
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={news.length < pageSize}
            >
              Next
            </button>
          </div>
        </>
      )}
      {/* Modal for Add/Edit */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel={editMode ? "Edit News" : "Add News"}
        className="max-w-3xl w-full mx-auto mt-20 bg-white h-[800px] mb-20 overflow-y-scroll rounded-xl shadow-lg p-12 outline-none"
        overlayClassName="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <h2 className="text-xl font-bold mb-4 text-primary flex items-center justify-between">
          {editMode ? "Edit News" : "Add News"}
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-red-500 text-2xl"
          >
            <IoCloseSharp size={25} />
          </button>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">SubTitle</label>
            <input
              type="text"
              name="subTitle"
              value={form.subTitle}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Description</label>
            <Editor
              apiKey="es4j3e2f7014oap60ne58m90xgsr0iu8e6hzy6joeffi2ybr"
              value={form.description}
              init={{
                height: 300,
                menubar: true,
                plugins: [
                  "advlist autolink lists link image charmap print preview anchor",
                  "searchreplace visualblocks code fullscreen",
                  "insertdatetime media table paste code help wordcount",
                  "code",
                  "table",
                  "media",
                  "emoticons",
                  "lists",
                ],
                toolbar:
                  "undo redo | formatselect | bold italic underline forecolor backcolor | " +
                  "alignleft aligncenter alignright alignjustify | " +
                  "bullist numlist advlist | outdent indent | link image media table emoticons | code | removeformat | help",
                advlist_number_styles:
                  "default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman",
                advlist_bullet_styles: "default,circle,disc,square",
                menu: {
                  tools: { title: "Tools", items: "listprops" },
                },
              }}
              onEditorChange={handleDescriptionChange}
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Date</label>
            <input
              type="date"
              name="createdAt"
              value={form.createdAt}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Image</label>
            {imagePreview && (
              <div className="flex justify-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded mb-2 border"
                />
              </div>
            )}
            <input
              type="file"
              name="imagefile"
              accept="image/*"
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white hover:text-primary py-2 rounded font-semibold hover:bg-white border border-primary transition-colors flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
            )}
            {editMode ? "Update News" : "Add News"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default News;
