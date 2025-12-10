import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Signup() {

    const [credentials, setcredentials] = useState({ name: "", email: "", password: "", geolocation: "" })
    const [passwordError, setPasswordError] = useState("");

    const validatePassword = (password) => {
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasMinLength = password.length >= 6;

        if (!hasMinLength) return "Password must be at least 6 characters";
        if (!hasUppercase) return "Password must contain an uppercase letter (A-Z)";
        if (!hasLowercase) return "Password must contain a lowercase letter (a-z)";
        if (!hasNumber) return "Password must contain a number (0-9)";
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const pwdError = validatePassword(credentials.password);
        if (pwdError) {
            alert(pwdError);
            return;
        }

        const response = await fetch("http://localhost:5000/api/createuser", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: credentials.name, email: credentials.email, password: credentials.password, location: credentials.geolocation })
        });
        const json = await response.json()
        console.log(json);

        if (!json.success) {
            if (json.errors) {
                alert("Validation errors:\n" + json.errors.map(e => e.message).join("\n"));
            } else {
                alert(json.message || "Error creating account");
            }
        } else {
            alert("Signup successful! Please login.");
        }
    }
    const onChange = (event) => {
        setcredentials({ ...credentials, [event.target.name]: event.target.value })
        if (event.target.name === 'password') {
            setPasswordError(validatePassword(event.target.value));
        }
    }
    return (
        <>
            <div className='container'>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Name</label>
                        <input type="text" className="form-control" name='name' value={credentials.name} onChange={onChange} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                        <input type="email" className="form-control" name='email' value={credentials.email} onChange={onChange} id="exampleInputEmail1" aria-describedby="emailHelp" />
                        <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                        <input type="password" className="form-control" name='password' value={credentials.password} onChange={onChange} id="exampleInputPassword1" />
                        {passwordError && <small className="text-danger d-block mt-2">⚠️ {passwordError}</small>}
                        {!passwordError && credentials.password && <small className="text-success d-block mt-2">✓ Password is valid</small>}
                        <small className="form-text text-muted d-block mt-2">
                            Password must: be 6+ characters, have uppercase (A-Z), lowercase (a-z), and number (0-9)
                        </small>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="exampleInputPassword1" className="form-label">Address</label>
                        <input type="text" className="form-control" name='geolocation' value={credentials.geolocation} onChange={onChange} id="exampleInputPassword1" />
                    </div>
                    <button type="submit" className=" m-3 btn btn-success">Submit</button>
                    <Link to="/login" className='m-3 btn btn-danger'>Already a user </Link>
                </form>
            </div>
        </>


    )
}
