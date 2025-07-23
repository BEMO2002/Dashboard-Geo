import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Modal from "react-modal";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { IoCloseSharp } from "react-icons/io5";
import { Editor } from "@tinymce/tinymce-react";
Modal.setAppElement("#root");

const initialForm = {
  title: "",
  brief: "",
  client: "",
  value: "",
  description: "",
  imageFiles: [],
};

const Projects = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;
  const [imagePreviews, setImagePreviews] = useState([]); // [{src, file, isNew} or {src, id, isNew:false}]

  useEffect(() => {
    fetchProjects(currentPage);
    // eslint-disable-next-line
  }, [currentPage]);

  const fetchProjects = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.geoduke.com/admin/projects?pageSize=${pageSize}&pageNumber=${page}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProjects(res.data);
    } catch {
      toast.error("Failed to fetch projects.");
    } finally {
      setLoading(false);
    }
  };

  // Open modal for add or edit
  const openModal = (project = null) => {
    if (project) {
      setEditMode(true);
      setSelectedId(project.id);
      setForm({
        title: project.title,
        brief: project.brief,
        client: project.client,
        value: project.value,
        description: project.description,
        imageFiles: [],
      });
      // Show all images as preview (old images)
      setImagePreviews(
        project.images?.map((img) => ({
          src: img.url,
          id: img.id,
          isNew: false,
        })) || []
      );
    } else {
      setEditMode(false);
      setSelectedId(null);
      setForm(initialForm);
      setImagePreviews([]);
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
  };

  // Handle form input
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFiles") {
      if (files && files.length > 0) {
        // Append new images
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
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle TinyMCE change
  const handleDescriptionChange = (content) => {
    setForm((prev) => ({ ...prev, description: content }));
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

  // Handle add/edit submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    const formData = new FormData();
    formData.append("Title", form.title);
    formData.append("Brief", form.brief);
    formData.append("Client", form.client);
    formData.append("Value", form.value);
    formData.append("Description", form.description);
    // Only new images
    if (imagePreviews.length > 0) {
      imagePreviews.forEach((img) => {
        if (img.isNew && img.file) {
          formData.append("ImageFiles", img.file);
        }
      });
    }
    if (editMode && selectedId) {
      formData.append("id", selectedId);
    }
    try {
      if (editMode && selectedId) {
        await axios.put(
          "https://api.geoduke.com/admin/projects",
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Project updated successfully!");
      } else {
        await axios.post(
          "https://api.geoduke.com/admin/projects",
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Project added successfully!");
      }
      fetchProjects(currentPage);
      closeModal();
    } catch {
      toast.error("Failed to save project.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      await axios.delete(
        `https://api.geoduke.com/admin/projects/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Project deleted successfully!");
      fetchProjects(currentPage);
    } catch {
      toast.error("Failed to delete project.");
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-primary">Projects</h1>
        <button
          className="flex items-center gap-2 bg-primary text-white hover:text-primary px-4 py-2 rounded hover:bg-white border duration-300 border-primary transition"
          onClick={() => openModal()}
        >
          <FaPlus /> Add Project
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
            {projects.map((item) => (
              <div
                key={item.id}
                className="rounded-xl shadow p-4 flex flex-col"
              >
                <img
                  src={
                    item.images?.find((img) => img.isMain)?.url ||
                    item.images?.[0]?.url
                  }
                  alt={item.title}
                  className="w-full h-40 object-cover rounded mb-3"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-primary mb-1">
                    {item.title}
                  </h2>
                  <div className=" font-semibold mb-1 text-gray-700">
                    {item.brief}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    Client: {item.client}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    Value: {item.value}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    {item.createdAt?.split("T")[0]}
                  </div>
                  <div
                    className="text-sm text-gray-700 mb-2 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
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
              disabled={projects.length < pageSize}
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
        contentLabel={editMode ? "Edit Project" : "Add Project"}
        className="max-w-3xl w-full h-[840px] mx-auto mb-10 bg-white rounded-xl shadow-lg p-12 outline-none overflow-y-scroll"
        overlayClassName="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <h2 className="text-xl font-bold mb-4 text-primary flex items-center justify-between">
          {editMode ? "Edit Project" : "Add Project"}
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
            <label className="block mb-1 font-semibold">Brief</label>
            <input
              type="text"
              name="brief"
              value={form.brief}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Client</label>
            <input
              type="text"
              name="client"
              value={form.client}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Value</label>
            <input
              type="text"
              name="value"
              value={form.value}
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
          <button
            type="submit"
            className="w-full bg-primary text-white hover:text-primary py-2 rounded font-semibold hover:bg-white border border-primary transition-colors flex items-center justify-center gap-2"
            disabled={loadingSubmit}
          >
            {loadingSubmit && (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></span>
            )}
            {editMode ? "Update Project" : "Add Project"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
