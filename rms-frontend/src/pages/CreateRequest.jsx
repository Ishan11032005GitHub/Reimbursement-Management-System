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
  const fileRef = useRef();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState(null);
  const [file, setFile] = useState(null);

  const submit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("amount", amount);
    formData.append("date", date);
    formData.append("category", category.value);
    if (file) formData.append("file", file);

    await api.post("/requests", formData);

    // RESET
    setTitle("");
    setAmount("");
    setDate("");
    setCategory(null);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";

    // REDIRECT
    navigate("/requests");
  };

  return (
    <>
      <Navbar />

      <div className="create-container">
        <h2 className="create-title">Create Request</h2>

        <form className="create-card" onSubmit={submit}>
          <div className="form-grid">
            <label>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} />

            <label>Amount</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />

            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />

            <label>Category</label>
            <Select
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              className="select-input"
            />

            <label>File</label>
            <input type="file" ref={fileRef} onChange={e => setFile(e.target.files[0])} />
          </div>

          <button className="create-btn">Create Request</button>
        </form>
      </div>
    </>
  );
}
