import { useMemo, useRef, useState } from "react";
import Select from "react-select";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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

  const validate = () => {
    if (!title.trim()) return "Title is required";
    if (!amount || Number(amount) <= 0) return "Amount must be greater than 0";
    if (!date) return "Date is required";
    if (!category) return "Category is required";
    return null;
  };

  const selectStyles = useMemo(
    () => ({
      control: (base) => ({
        ...base,
        borderRadius: 8,
        borderColor: "#ccc",
        minHeight: 40
      })
    }),
    []
  );

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setDate("");
    setCategory(null);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("amount", amount);
      formData.append("date", date);
      formData.append("category", category.value);
      if (file) formData.append("file", file);

      const res = await api.post("/requests", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Request created");

      const newId = res.data?.id;
      resetForm();

      // Go directly to the created request (best UX)
      if (newId) navigate(`/requests/${newId}`);
      else navigate("/requests");
    } catch (e2) {
      toast.error(e2.response?.data?.message || "Failed to create request");
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
              styles={selectStyles}
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
