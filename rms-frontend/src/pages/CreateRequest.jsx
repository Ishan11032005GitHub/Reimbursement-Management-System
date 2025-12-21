import { useState } from "react";
import Select from "react-select";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import "./CreateRequest.css";

const categoryOptions = [
  { value: "LOCAL TAXI CONVEYANCE", label: "Local Taxi Conveyance" },
  { value: "DOMESTIC TRAVEL", label: "Domestic Travel" },
  { value: "INTERNATIONAL TRAVEL", label: "International Travel" },
  { value: "FOOD", label: "Food" },
  { value: "MISCELLANEOUS", label: "Miscellaneous" }
];

export default function CreateRequest() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState(null);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validate = () => {
    if (!title.trim()) return "Title is required";
    if (!amount || amount <= 0) return "Amount must be greater than 0";
    if (!date) return "Date is required";
    if (!category) return "Category is required";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("amount", amount);
      formData.append("date", date);
      formData.append("category", category.value);
      if (file) formData.append("file", file);

      await api.post("/requests", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setSuccess("Request created successfully");
      setTitle("");
      setAmount("");
      setDate("");
      setCategory(null);
      setFile(null);
    } catch {
      setError("Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="create-container">
        <h2 className="create-title">CREATE REQUEST</h2>
        <p className="create-subtitle">
          Fill in the details below to submit a new reimbursement request.
        </p>


        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}

        <form className="create-card" onSubmit={submit}>
          <div className="field">
            <label>Title : </label>
            <input
              value={title}
              placeholder="Enter Title"
              onChange={e => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="field">
            <label>Amount : </label>
            <input
              type="number"
              placeholder="Enter Amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="field">
            <label>Date : </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="field">
            <label>Category (searchable)</label>
            <Select
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              isSearchable
              isDisabled={loading}
            />
          </div>

          <div className="field">
            <label>File upload</label>
            <input
              type="file"
              onChange={e => setFile(e.target.files[0])}
              disabled={loading}
            />
          </div>

          <button disabled={loading}>
            {loading ? "Submitting..." : "Create Request"}
          </button>
        </form>
      </div>
    </>
  );
}
