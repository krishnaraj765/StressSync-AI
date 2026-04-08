import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

const Auth = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgot, setIsForgot] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', full_name: '' });
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleAction = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        let endpoint = isLogin ? 'login' : 'register';
        let method = 'post';

        if (isForgot) {
            endpoint = 'forgot-password';
            method = 'put';
        }
        
        try {
            const res = await axios[method](`${API_BASE_URL}/${endpoint}`, formData);
            
            if (isForgot) {
                setSuccessMessage("Password updated! You can now login.");
                setIsForgot(false);
                setIsLogin(true);
                setFormData({ ...formData, password: '' }); 
            } else if (res.data.user_id) {
                localStorage.setItem('user', JSON.stringify(res.data));
                setFormData({ email: '', password: '', full_name: '' }); 
                onLoginSuccess(res.data);
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.detail || "Action failed. Try again.");
        }
    };

    return (
        <div className="card shadow-sm p-4 mx-auto" style={{ maxWidth: '400px' }}>
            <h3 className="text-center mb-4">
                {isForgot ? 'Reset Password' : isLogin ? 'Login' : 'Register'}
            </h3>
            
            {successMessage && <div className="alert alert-success py-2 small text-center" role="alert">{successMessage}</div>}
            {errorMessage && <div className="alert alert-danger py-2 small text-center" role="alert">{errorMessage}</div>}

            <form onSubmit={handleAction}>
                {!isLogin && !isForgot && (
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Full Name</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={formData.full_name}
                            onChange={e => setFormData({...formData, full_name: e.target.value})} 
                            required 
                        />
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label small fw-bold">Email</label>
                    <input 
                        type="email" 
                        className="form-control" 
                        value={formData.email}
                        autoComplete="off"
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        required 
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label small fw-bold">
                        {isForgot ? 'New Password' : 'Password'}
                    </label>
                    <input 
                        type="password" 
                        className="form-control" 
                        value={formData.password}
                        autoComplete="new-password" 
                        onChange={e => setFormData({...formData, password: e.target.value})} 
                        required 
                    />
                </div>

                <button className="btn btn-primary w-100 mb-3 fw-bold">
                    {isForgot ? 'Update Password' : isLogin ? 'Sign In' : 'Create Account'}
                </button>

                <div className="text-center small">
                    {/* Forgot Password Link - Only shows on Login screen */}
                    {isLogin && !isForgot && (
                        <p className="mb-2">
                            <span 
                                className="text-primary text-decoration-underline" 
                                onClick={() => {
                                    setIsForgot(true);
                                    setErrorMessage("");
                                    setSuccessMessage("");
                                    setFormData({ email: '', password: '', full_name: '' }); 
                                }} 
                                style={{cursor: 'pointer'}}
                            >
                                Forgot Password?
                            </span>
                        </p>
                    )}

                    {/* Register/Login Navigation */}
                    <p className="mb-0">
                        <span className="text-muted">
                            {isForgot ? "Back to " : isLogin ? "Don't have an account? " : "Already have an account? "}
                        </span>
                        <span 
                            className="text-primary text-decoration-underline" 
                            onClick={() => {
                                if (isForgot) {
                                    // FIXED: Specifically set states to return to Login
                                    setIsForgot(false);
                                    setIsLogin(true); 
                                } else {
                                    // Normal toggle between Login and Register
                                    setIsLogin(!isLogin);
                                }
                                setErrorMessage(""); 
                                setSuccessMessage("");
                                setFormData({ email: '', password: '', full_name: '' }); 
                            }} 
                            style={{cursor: 'pointer'}}
                        > 
                            {isForgot ? 'Login' : isLogin ? 'Register' : 'Login'}
                        </span>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Auth;