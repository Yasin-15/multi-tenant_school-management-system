import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const PerformanceChart = ({ type = 'bar', data, title, xKey, yKey, dataKey }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center h-64">
                <p className="text-gray-500">No data available for {title}</p>
            </div>
        );
    }

    const renderChart = () => {
        switch (type) {
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xKey} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey={yKey} stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey={dataKey}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                );
            case 'bar':
            default:
                return (
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xKey} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey={yKey} fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="h-80">
                {renderChart()}
            </div>
        </div>
    );
};

export default PerformanceChart;
