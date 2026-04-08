import React, { useState } from 'react';
import axios from 'axios';

// Destructure userId AND onResultReceived from props
const StressForm = ({ userId, onResultReceived }) => {
    const [formData, setFormData] = useState({
        bmi: '',
        resting_hr_bpm: '',
        spo2_avg_pct: '',
        sleep_duration_hours: '',
        mood: 3,
        working_hours: '',
        screen_time: ''
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Prepare the payload including the userId for database tracking
            const payload = {
                user_id: userId,
                bmi: parseFloat(formData.bmi),
                resting_hr_bpm: parseFloat(formData.resting_hr_bpm),
                spo2_avg_pct: parseFloat(formData.spo2_avg_pct),
                sleep_duration_hours: parseFloat(formData.sleep_duration_hours),
                mood: parseInt(formData.mood),
                working_hours: parseFloat(formData.working_hours),
                screen_time: parseFloat(formData.screen_time),
            };

            // Send data to your FastAPI backend
            // Note: Using 127.0.0.1 is more stable for local development than 'localhost'
            const response = await axios.post('http://127.0.0.1:8000/predict', payload);
            
            // Update local state to show results on the screen
            setResult(response.data);

            // CRITICAL: Send the result to App.js so the Voice Assistant can access it
            if (onResultReceived) {
                onResultReceived(response.data);
            }

        } catch (error) {
            console.error("API Error:", error);
            alert("Connection to backend failed. Please check if your FastAPI server is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="row g-4">
            {/* Input Form Section */}
            <div className="col-lg-6">
                <div className="card shadow-sm border-0 p-4 h-100">
                    <h4 className="mb-4 fw-bold">Health Metrics</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label small fw-bold">BMI</label>
                                <input type="number" step="0.1" name="bmi" className="form-control" onChange={handleChange} required />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label small fw-bold">Heart Rate (BPM)</label>
                                <input type="number" name="resting_hr_bpm" className="form-control" onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label small fw-bold">SpO2 (%)</label>
                                <input type="number" name="spo2_avg_pct" className="form-control" onChange={handleChange} required />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label small fw-bold">Sleep (Hrs)</label>
                                <input type="number" step="0.1" name="sleep_duration_hours" className="form-control" onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-bold">Mood Level (1-5)</label>
                            <input type="range" name="mood" min="1" max="5" className="form-range" value={formData.mood} onChange={handleChange} />
                            <div className="d-flex justify-content-between small text-muted">
                                <span>Low</span><span>Neutral</span><span>High</span>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label small fw-bold">Working Hours</label>
                                <input type="number" step="0.1" name="working_hours" className="form-control" onChange={handleChange} required />
                            </div>
                            <div className="col-md-6 mb-4">
                                <label className="form-label small fw-bold">Screen Time (Hrs)</label>
                                <input type="number" step="0.1" name="screen_time" className="form-control" onChange={handleChange} required />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-2 fw-bold shadow-sm" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Analyzing...
                                </>
                            ) : "Predict Stress Level"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Assessment Result Section */}
            <div className="col-lg-6">
                {result ? (
                    <div className="card shadow-sm border-0 p-4 bg-white h-100 border-start border-4 border-primary">
                        <h4 className="mb-3 fw-bold">AI Assessment</h4>
                        <div className={`alert text-center mb-4 ${
                            result.stress_level === 'High' ? 'alert-danger' : 
                            result.stress_level === 'Medium' ? 'alert-warning' : 'alert-success'
                        }`}>
                            <h2 className="mb-0 fw-bold">{result.stress_level} Stress</h2>
                        </div>
                        
                        <h6 className="fw-bold">Summary</h6>
                        <p className="text-muted small mb-4">{result.summary}</p>

                        <h6 className="fw-bold text-danger">Contributing Factors</h6>
                        <ul className="small mb-4">
                            {result.factors.map((f, i) => <li key={i} className="mb-1">{f}</li>)}
                        </ul>

                        <div className="bg-light p-3 rounded-3">
                            <h6 className="fw-bold text-primary">Personalized Recommendations</h6>
                            <ul className="mb-0 small">
                                {result.recommendations.map((r, i) => <li key={i} className="mb-1">{r}</li>)}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="h-100 d-flex flex-column align-items-center justify-content-center border rounded-3 bg-white p-5 text-center shadow-sm">
                        <div className="mb-3 opacity-25">
                            <div className="bg-primary rounded-circle" style={{width: '60px', height: '60px'}}></div>
                        </div>
                        <p className="text-muted fw-medium">Submit your metrics to see your stress analysis and recommendations.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StressForm;