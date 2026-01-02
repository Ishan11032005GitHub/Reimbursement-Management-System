import { useState, useRef } from "react";
import Select from "react-select";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import "./CreateRequest.css";

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

    // ✅ RESET FORM
    setTitle("");
    setAmount("");
    setDate("");
    setCategory(null);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";

    // ✅ REDIRECT
    navigate("/requests");
  };

  return (
    <>
      <Navbar />
      <form onSubmit={submit}>
        <input value={title} onChange={e => setTitle(e.target.value)} />
        <input value={amount} onChange={e => setAmount(e.target.value)} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Select value={category} onChange={setCategory} />
        <input type="file" ref={fileRef} onChange={e => setFile(e.target.files[0])} />
        <button>Create Request</button>
      </form>
    </>
  );
}
