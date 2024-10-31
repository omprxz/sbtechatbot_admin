"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { IoMdArrowDropdown } from "react-icons/io";

const AddDataset = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        setCategories(response.data.categories);
      } catch (error) {
        setError("Failed to fetch categories.");
      }
    };

    fetchCategories();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!file) {
      setError("Please select a file to upload.");
      setIsLoading(false);
      return;
    }

    const categoryToSubmit =
      selectedCategory === "Add New" ? customCategory : selectedCategory;

    if (!categoryToSubmit) {
      setError("Please select or enter a category.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/add-qnas/dataset", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          category: categoryToSubmit,
          status: selectedStatus,
        },
        withCredentials: true,
      });

      setSuccess(response.data.message);
      setFile(null);
      setSelectedCategory("");
      setCustomCategory("");
      setSelectedStatus("active");
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError("An error occurred while uploading the dataset.");
      }
      setTimeout(() => setError(""), 5000);
    }
    setIsLoading(false);
  };

  const handleOpenModal = () => {
    document.getElementById("upload_modal").showModal();
  };

  return (
    <div className="flex flex-col pt-35 gap-y-5 items-center bg-base-200">
      <div>
        {/* Instruction Button */}
        <button onClick={handleOpenModal} className="btn btn-primary">
          Open Upload Instructions
        </button>

        {/* Modal for Upload Instructions */}
        <dialog id="upload_modal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-xl">Dataset Upload Instructions</h3>
            <p className="py-2">
              Upload a file in one of the following formats: <br /><code className="bg-gray-100 rounded p-1 block mt-1">.xlsx | .xls | .csv | .txt | .json</code>
            </p>
            <ul className="list-disc list-inside text-base space-y-1 divide-y-2 divide-gray-400">
              <li>
                <strong>JSON</strong>: File should contain an array of objects
                with &quot;question&quot; and &quot;answer&quot; fields.
                <code className="bg-gray-100 rounded p-1 block mt-1 whitespace-pre">
                  {`[\n\t{\n\t\tquestion : &quot;Question 1&quot;,\n\t\tanswer: &quot;Answer 1&quot;\n\t},\n\t{\n\t\tquestion: &quot;Question 2&quot;,\n\t\tanswer: &quot;Answer 2&quot;\n\t}, \n\t.\n\t.\n\t.\n]`}
                </code>
              </li>
              <li>
                <strong>CSV</strong>: First row should contain headers, with
                &quot;question&quot; and &quot;answer&quot; columns.
                <code className="bg-gray-100 rounded p-1 block mt-1">
                  question,answer <br />
                  &quot;Question 1&quot;,&quot;Answer 1&quot; <br />
                  &quot;Question 2&quot;,&quot;Answer 2&quot;
                </code>
              </li>
              <li>
                <strong>Excel (XLS, XLSX)</strong>: First sheet with
                &quot;question&quot; in the first column and &quot;answer&quot;
                in the second column. Skip any headers.
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="bg-white relative">
                          <IoMdArrowDropdown className="text-5xl -rotate-45 absolute -bottom-4 -right-4 text-gray-500" />
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          A
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          B
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white">
                        <td className="border border-gray-300 bg-gray-100 px-4 py-2">
                          1
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-left hover:bg-green-100">
                          question
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-left hover:bg-green-100">
                          answer
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td className="border border-gray-300 bg-gray-100 px-4 py-2">
                          2
                        </td>
                        <td className="border border-gray-300 px-4 py-2 hover:bg-green-100">
                          &quot;Question 1&quot;
                        </td>
                        <td className="border border-gray-300 px-4 py-2 hover:bg-green-100">
                          &quot;Answer 1&quot;
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td className="border border-gray-300 bg-gray-100 px-4 py-2">
                          3
                        </td>
                        <td className="border border-gray-300 px-4 py-2 hover:bg-green-100">
                          &quot;Question 2&quot;
                        </td>
                        <td className="border border-gray-300 px-4 py-2 hover:bg-green-100">
                          &quot;Answer 2&quot;
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </li>
              <li>
                <strong>Text (TXT)</strong>: Questions and answers should be in
                the format: <br />
                <code className="bg-gray-100 rounded p-1 block mt-1">
                  Q: Question 1 <br />
                  A: Answer 1 <br />
                  END; <br />
                  Q: Question 2 <br />
                  A: Answer 2 <br />
                  END; <br />
                </code>
                Repeat for each question-answer pair.
              </li>
            </ul>
            <p className="py-2 text-sm text-gray-600">
              File size limit: 10 MB. Only one file can be uploaded at a time.
            </p>

            {/* Modal Action Buttons */}
            <div className="modal-action">
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
        </dialog>
      </div>

      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Upload Dataset</h2>
        {error && <p className="mt-4 text-red-600">{error}</p>}
        {success && <p className="mt-4 text-green-600">{success}</p>}
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Select Dataset File</span>
            </label>
            <input
              type="file"
              accept=".json, .csv, .xlsx, .xls, .txt"
              onChange={handleFileChange}
              className="input input-bordered py-2"
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Select Category</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                if (e.target.value !== "Add New") {
                  setCustomCategory("");
                }
              }}
              className="select select-bordered"
              required
              disabled={isLoading}
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="Add New">Add New</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          {selectedCategory === "Add New" && (
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Custom Category Name</span>
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="input input-bordered"
                required
                disabled={isLoading}
              />
            </div>
          )}
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="select select-bordered"
              disabled={isLoading}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Upload Dataset"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDataset;
