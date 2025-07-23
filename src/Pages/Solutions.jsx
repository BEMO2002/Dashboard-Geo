import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaFileAlt } from "react-icons/fa";
import Modal from "react-modal";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { IoCloseSharp } from "react-icons/io5";
import { Editor } from "@tinymce/tinymce-react";
Modal.setAppElement("#root");

const initialForm = {
  title: "",
  description: "",
  overview: "",
  systemComponents: "",
  imageFiles: [],
  assetFiles: [],
};

const Solutions = () => {
  const { token } = useAuth();
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;
  const [imagePreviews, setImagePreviews] = useState([]); // [{src, file, isNew} or {src, id, isNew:false}]
  const [assetPreviews, setAssetPreviews] = useState([]); // [{name, url, file, isNew} or {name, url, id, isNew:false}]

  useEffect(() => {
    fetchSolutions(currentPage);
    // eslint-disable-next-line
  }, [currentPage]);

  const fetchSolutions = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.geoduke.com/admin/solutions?pageSize=${pageSize}&pageNumber=${page}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSolutions(res.data);
    } catch {
      toast.error("Failed to fetch solutions.");
    } finally {
      setLoading(false);
    }
  };

  // Open modal for add or edit
  const openModal = (solution = null) => {
    if (solution) {
      setEditMode(true);
      setSelectedId(solution.id);
      setForm({
        title: solution.title,
        description: solution.description,
        overview: solution.overview,
        systemComponents: solution.systemComponents,
        imageFiles: [],
        assetFiles: [],
      });
      setImagePreviews(
        solution.images?.map((img) => ({
          src: img.url,
          id: img.id,
          isNew: false,
        })) || []
      );
      setAssetPreviews(
        solution.assets?.map((asset) => ({
          name: asset.name,
          url: asset.url,
          id: asset.id,
          isNew: false,
        })) || []
      );
    } else {
      setEditMode(false);
      setSelectedId(null);
      setForm(initialForm);
      setImagePreviews([]);
      setAssetPreviews([]);
    }
    setModalIsOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalIsOpen(false);
    setForm(initialForm);
    setSelectedId(null);
    setEditMode(false);
    setImagePreviews([]);
    setAssetPreviews([]);
  };

  // Handle form input
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFiles") {
      if (files && files.length > 0) {
        const newPreviews = Array.from(files).map((file) => ({
          src: URL.createObjectURL(file),
          file,
          isNew: true,
        }));
        setImagePreviews((prev) => [...prev, ...newPreviews]);
        setForm((prev) => ({
          ...prev,
          imageFiles: [...(prev.imageFiles || []), ...Array.from(files)],
        }));
      }
    } else if (name === "assetFiles") {
      if (files && files.length > 0) {
        const newAssets = Array.from(files).map((file) => ({
          name: file.name,
          file,
          isNew: true,
        }));
        setAssetPreviews((prev) => [...prev, ...newAssets]);
        setForm((prev) => ({
          ...prev,
          assetFiles: [...(prev.assetFiles || []), ...Array.from(files)],
        }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Remove image from preview (before submit)
  const handleRemoveImage = (idx) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    setForm((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) =>
        imagePreviews[i]?.isNew && i !== idx
          ? true
          : imagePreviews[i]?.isNew
          ? false
          : true
      ),
    }));
  };

  // Remove asset from preview (before submit)
  const handleRemoveAsset = (idx) => {
    setAssetPreviews((prev) => prev.filter((_, i) => i !== idx));
    setForm((prev) => ({
      ...prev,
      assetFiles: prev.assetFiles.filter((_, i) =>
        assetPreviews[i]?.isNew && i !== idx
          ? true
          : assetPreviews[i]?.isNew
          ? false
          : true
      ),
    }));
  };

  // Handle TinyMCE change
  const handleDescriptionChange = (content) => {
    setForm((prev) => ({ ...prev, description: content }));
  };

  // Handle add/edit submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    const formData = new FormData();
    formData.append("Title", form.title);
    formData.append("Description", form.description);
    formData.append("Overview", form.overview);
    formData.append("SystemComponents", form.systemComponents);
    // Only new images
    if (imagePreviews.length > 0) {
      imagePreviews.forEach((img) => {
        if (img.isNew && img.file) {
          formData.append("ImageFiles", img.file);
        }
      });
    }
    // Only new assets
    if (assetPreviews.length > 0) {
      assetPreviews.forEach((asset) => {
        if (asset.isNew && asset.file) {
          formData.append("AssetFiles", asset.file);
        }
      });
    }
    if (editMode && selectedId) {
      formData.append("id", selectedId);
    }
    try {
      if (editMode && selectedId) {
        await axios.put(
          "https://api.geoduke.com/admin/solutions",
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Solution updated successfully!");
      } else {
        await axios.post(
          "https://api.geoduke.com/admin/solutions",
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Solution added successfully!");
      }
      fetchSolutions(currentPage);
      closeModal();
    } catch {
      toast.error("Failed to save solution.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this solution?"))
      return;
    try {
      await axios.delete(
        `https://api.geoduke.com/admin/solutions/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Solution deleted successfully!");
      fetchSolutions(currentPage);
    } catch {
      toast.error("Failed to delete solution.");
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-primary">Solutions</h1>
        <button
          className="flex items-center gap-2 bg-primary text-white hover:text-primary px-4 py-2 rounded hover:bg-white border duration-300 border-primary transition"
          onClick={() => openModal()}
        >
          <FaPlus /> Add Solution
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
            {solutions.map((item) => (
              <div
                key={item.id}
                className="rounded-xl shadow p-4 flex flex-col"
              >
                <img
                  src={item.images?.[0]?.url}
                  alt={item.title}
                  className="w-full h-40 object-cover rounded mb-3"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-primary mb-1">
                    {item.title}
                  </h2>
                  <div className="text-base font-semibold mb-1 t line-clamp-4">
                    {item.description.replace(/<[^>]+>/g, "")}
                  </div>
                  <div className="text-sm text-gray-500 mb-1 line-clamp-4">
                    Overview: {item.overview}
                  </div>
                  <div className="text-sm text-gray-500 mb-1 line-clamp-4">
                    System Components: {item.systemComponents}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    {item.createdAt?.split("T")[0]}
                  </div>
                  {/* Assets */}
                  {item.assets && item.assets.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.assets.map((asset) => (
                        <a
                          key={asset.id}
                          href={asset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-blue-700 hover:bg-blue-100 text-xs"
                        >
                          <FaFileAlt /> {asset.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    className="text-blue-600"
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
              disabled={solutions.length < pageSize}
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
        contentLabel={editMode ? "Edit Solution" : "Add Solution"}
        className="max-w-3xl w-full mx-auto mt-20 bg-white rounded-xl shadow-lg p-12 outline-none overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <h2 className="text-xl font-bold mb-4 text-primary flex items-center justify-between">
          {editMode ? "Edit Solution" : "Add Solution"}
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-red-500 text-2xl"
          >
            <IoCloseSharp size={25} />
          </button>
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto max-h-[60vh]"
        >
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
            <label className="block mb-1 font-semibold">Description</label>
            <Editor
              apiKey="es4j3e2f7014oap60ne58m90xgsr0iu8e6hzy6joeffi2ybr"
              value={form.description}
              init={{
                height: 200,
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
            <label className="block mb-1 font-semibold">Overview</label>
            <textarea
              name="overview"
              value={form.overview}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={2}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">
              System Components
            </label>
            <textarea
              name="systemComponents"
              value={form.systemComponents}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={2}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Images</label>
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mb-2">
                {imagePreviews.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img.src}
                      alt={`Preview ${idx}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 text-gray-600 hover:bg-red-500 hover:text-white transition group-hover:scale-110"
                      onClick={() => handleRemoveImage(idx)}
                      title="Remove"
                    >
                      <IoCloseSharp size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              name="imageFiles"
              accept="image/*"
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">
              Assets (Docs, PPT, ...)
            </label>
            {assetPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mb-2">
                {assetPreviews.map((asset, idx) => (
                  <div
                    key={idx}
                    className="relative group flex items-center gap-1 bg-gray-100 rounded px-2 py-1"
                  >
                    <FaFileAlt />
                    <span className="truncate max-w-[120px] text-xs">
                      {asset.name}
                    </span>
                    <button
                      type="button"
                      className="ml-1 bg-white border border-gray-300 rounded-full p-1 text-gray-600 hover:bg-red-500 hover:text-white transition group-hover:scale-110"
                      onClick={() => handleRemoveAsset(idx)}
                      title="Remove"
                    >
                      <IoCloseSharp size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              name="assetFiles"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv"
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white hover:text-primary py-2 rounded font-semibold hover:bg-white border border-primary transition-colors flex items-center justify-center gap-2"
            disabled={loadingSubmit}
          >
            {loadingSubmit && (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></span>
            )}
            {editMode ? "Update Solution" : "Add Solution"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Solutions;
