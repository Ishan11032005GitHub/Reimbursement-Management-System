import { useState, useRef } from "react";
import Select from "react-select";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import "./CreateRequest.css";

const categoryOptions = [
  { value: "LOCAL TAXI CONVEYANCE", label: "Local Taxi Conveyance" },
  { value: "DOMESTIC TRAVEL", label: "Domestic Travel" },
  { value: "INTERNATIONAL TRAVEL", label: "International Travel" },
  { value: "FOOD", label: "Food" },
  { value: "MISCELLANEOUS", label: "Miscellaneous" }
];

export default function CreateRequest() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState(null);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!title.trim()) return "Title is required";
    if (!amount || Number(amount) <= 0) return "Amount must be greater than 0";
    if (!date) return "Date is required";
    if (!category) return "Category is required";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) {
      setError(msg);
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

      const res = await api.post("/requests", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const requestId = res?.data?.id;
      if (!requestId) {
        throw new Error("Backend did not return request id");
      }

      // 🚀 Redirect to Open Request page
      navigate(`/requests/${requestId}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create request");
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

        <form className="create-card" onSubmit={submit}>
          <div className="form-grid">
            <label>Title</label>
            <input
              value={title}
              placeholder="Enter Title"
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />

            <label>Amount</label>
            <input
              type="number"
              placeholder="Enter Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />

            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />

            <label>Category</label>
            <Select
              className="select-input"
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              isSearchable
              isDisabled={loading}
            />

            <label>File upload</label>
            <input
              type="file"
              ref={fileRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={loading}
            />
          </div>

          <button className="create-btn" disabled={loading}>
            {loading ? "Submitting..." : "Create Request"}
          </button>
        </form>
      </div>
    </>
  );
}
