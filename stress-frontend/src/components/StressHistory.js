import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StressChart from './StressChart'; // Import the chart component

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

const StressHistory = ({ userId }) => {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch data from your FastAPI history endpoint
                const res = await axios.get(`${API_BASE_URL}/history/${userId}`);
                setHistoryData(res.data);
            } catch (err) {
                console.error("Error fetching history:", err);
                setError("Could not load history. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchHistory();
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Fetching your trends...</p>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger mt-4">{error}</div>;
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark">Health History</h2>
                <span className="badge bg-primary px-3 py-2">
                    {historyData.length} Records Found
                </span>
            </div>

            {historyData.length > 0 ? (
                <>
                    {/* 1. The Visualization Chart */}
                    <div className="mb-5">
                        <StressChart data={historyData} />
                    </div>

                    {/* 2. Detailed Data Table (Optional but helpful) */}
                    <div className="card shadow-sm border-0 overflow-hidden" style={{ borderRadius: '15px' }}>
                        <div className="card-header bg-white py-3">
                            <h5 className="mb-0 fw-bold">Detailed Records</h5>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Stress Level</th>
                                        <th>Sleep</th>
                                        <th>Work Hrs</th>
                                        <th>Heart Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyData.slice().reverse().map((item) => (
                                        <tr key={item.id}>
                                            <td className="small">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <span className={`badge ${
                                                    item.stress_prediction === 'High' ? 'bg-danger' : 
                                                    item.stress_prediction === 'Medium' ? 'bg-warning text-dark' : 'bg-success'
                                                }`}>
                                                    {item.stress_prediction}
                                                </span>
                                            </td>
                                            <td>{item.sleep_duration_hours}h</td>
                                            <td>{item.working_hours}h</td>
                                            <td>{item.resting_hr_bpm} BPM</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-5 bg-white rounded shadow-sm">
                    <p className="text-muted mb-0">No records found. Complete your first assessment to see trends!</p>
                </div>
            )}
        </div>
    );
};

export default StressHistory;