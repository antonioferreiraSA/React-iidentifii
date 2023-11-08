import React, { useState } from "react";
import Add from "../images/addAvatar.png";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../images/iiDentifii-Logo.png";

const Register = () => {
  const [errors, setErrors] = useState({
    displayName: "",
    email: "",
    password: "",
    file: "",
    general: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateDisplayName = (value: any) => {
    if (value.trim() === "") {
      setErrors({ ...errors, displayName: "Display name is required" });
    } else {
      setErrors({ ...errors, displayName: "" });
    }
  };

  const validateEmail = (value: any) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(value)) {
      setErrors({ ...errors, email: "Invalid email format" });
    } else {
      setErrors({ ...errors, email: "" });
    }
  };

  const validatePassword = (value: any) => {
    if (value.length < 8) {
      setErrors({
        ...errors,
        password: "Password must be at least 8 characters long",
      });
    } else {
      setErrors({ ...errors, password: "" });
    }
  };

  const validateFile = (file: any) => {
    if (!file) {
      setErrors({ ...errors, file: "Please upload an avatar" });
    } else {
      setErrors({ ...errors, file: "" });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (errors.displayName || errors.email || errors.password || errors.file) {
      setErrors({ ...errors, general: "Please fix the errors in the form" });
      return;
    }

    setErrors({ ...errors, general: "" });
    setLoading(true);

    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    try {
      // Create user
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // Create a unique image name
      const date = new Date().getTime();
      const storageRef = ref(storage, `${displayName + date}`);

      await uploadBytesResumable(storageRef, file).then(() => {
        getDownloadURL(storageRef).then(async downloadURL => {
          try {
            // Update profile
            await updateProfile(res.user, {
              displayName,
              photoURL: downloadURL,
            });
            // Create user on firestore
            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              photoURL: downloadURL,
            });

            // Create empty user chats on firestore
            await setDoc(doc(db, "userChats", res.user.uid), {});
            navigate("/");
          } catch (err) {
            console.log(err);
            setErrors({ ...errors, general: "Something went wrong" });
            setLoading(false);
          }
        });
      });
    } catch (err) {
      setErrors({ ...errors, general: "Something went wrong" });
      setLoading(false);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <img src={Logo} width="200" height="40" alt="Logo" />
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
          <input
            required
            type="text"
            placeholder="display name"
            onChange={e => validateDisplayName(e.target.value)}
          />
          {errors.displayName && (
            <span className="formError">{errors.displayName}</span>
          )}
          <input
            required
            type="email"
            placeholder="email"
            onChange={e => validateEmail(e.target.value)}
          />
          {errors.email && <span className="formError">{errors.email}</span>}
          <input
            required
            type="password"
            placeholder="password"
            onChange={e => validatePassword(e.target.value)}
          />
          {errors.password && (
            <span className="formError">{errors.password}</span>
          )}
          <input
            required
            style={{ display: "none" }}
            type="file"
            id="file"
            onChange={e => validateFile(e.target.files[0])}
          />
          <label htmlFor="file">
            <img src={Add} alt="" />
            <span>Add an avatar</span>
          </label>
          {errors.file && <span>{errors.file}</span>}
          <button
            disabled={
              loading ||
              errors.displayName ||
              errors.email ||
              errors.password ||
              errors.general
            }
          >
            Sign up
          </button>
          {loading && "Uploading image, please wait..."}
          {errors.general && (
            <span className="formError">{errors.general}</span>
          )}
        </form>
        <p>
          You already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
