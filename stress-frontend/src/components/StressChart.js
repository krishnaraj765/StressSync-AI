import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  YAxisProps
} from 'recharts';

const StressChart = ({ data }) => {
    // Process the data for the chart
    const processedData = data.map(item => ({
        ...item,
        // Map string predictions to numerical values for the Y-axis
        stressValue: item.stress_prediction === 'High' ? 3 : 
                     item.stress_prediction === 'Medium' ? 2 : 1,
        // Format the timestamp for the X-axis
        displayDate: new Date(item.created_at).toLocaleDateString([], { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }));

    // Custom formatter for the Y-Axis labels
    const formatYAxis = (value) => {
        if (value === 3) return 'High';
        if (value === 2) return 'Med';
        if (value === 1) return 'Low';
        return '';
    };

    return (
        <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: '15px' }}>
            <h5 className="fw-bold mb-4 text-secondary">Stress Level Trends</h5>
            <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis 
                            dataKey="displayDate" 
                            tick={{ fontSize: 12 }} 
                            interval="preserveStartEnd"
                        />
                        <YAxis 
                            domain={[0.5, 3.5]} 
                            ticks={[1, 2, 3]} 
                            tickFormatter={formatYAxis}
                            tick={{ fontSize: 12, fontWeight: 'bold' }}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value) => [formatYAxis(value), "Stress Level"]}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="stressValue" 
                            stroke="#0d6efd" 
                            strokeWidth={4} 
                            dot={{ r: 6, fill: '#0d6efd', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-3 d-flex justify-content-center gap-4 small text-muted">
                <span><i className="bi bi-circle-fill text-success me-1"></i> Low</span>
                <span><i className="bi bi-circle-fill text-warning me-1"></i> Medium</span>
                <span><i className="bi bi-circle-fill text-danger me-1"></i> High</span>
            </div>
        </div>
    );
};

export default StressChart;