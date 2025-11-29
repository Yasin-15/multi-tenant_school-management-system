import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    FaMoneyBillWave,
    FaFileInvoiceDollar,
    FaCheckCircle,
    FaSpinner,
    FaDownload
} from 'react-icons/fa';

const Payroll = () => {
    const [loading, setLoading] = useState(false);
    const [payrolls, setPayrolls] = useState([]);
    const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [year, setYear] = useState(new Date().getFullYear());
    const [generating, setGenerating] = useState(false);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = [2023, 2024, 2025, 2026];

    const fetchPayrolls = async () => {
        try {
            setLoading(true);
            const response = await api.get('/payroll', {
                params: { month, year }
            });
            setPayrolls(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching payrolls:', error);
            setPayrolls([]);
            alert('Failed to fetch payroll records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayrolls();
    }, [month, year]);

    const handleGeneratePayroll = async () => {
        try {
            setGenerating(true);
            const response = await api.post('/payroll/generate', { month, year });
            alert(response.data.message);
            fetchPayrolls();
        } catch (error) {
            console.error('Error generating payroll:', error);
            alert(error.response?.data?.message || 'Failed to generate payroll');
        } finally {
            setGenerating(false);
        }
    };

    const handleMarkAsPaid = async (id) => {
        try {
            await api.put(`/payroll/${id}`, { status: 'paid' });
            alert('Marked as paid');
            fetchPayrolls();
        } catch (error) {
            console.error('Error updating payroll:', error);
            alert('Failed to update status');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-500" />
                    Payroll Management
                </h1>
                <div className="flex gap-4">
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button
                        onClick={handleGeneratePayroll}
                        disabled={generating}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {generating ? <FaSpinner className="animate-spin" /> : <FaFileInvoiceDollar />}
                        Generate Payroll
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Employee</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Designation</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Salary Details</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        <FaSpinner className="animate-spin inline-block text-2xl" />
                                    </td>
                                </tr>
                            ) : payrolls.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No payroll records found for this month.
                                    </td>
                                </tr>
                            ) : (
                                payrolls.map((payroll) => (
                                    <tr key={payroll._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {payroll.teacher?.user?.name || 'Unknown'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ID: {payroll.teacher?.employeeId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {payroll.teacher?.designation}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="flex justify-between w-40">
                                                    <span>Basic:</span>
                                                    <span>{payroll.salaryDetails.currency} {payroll.salaryDetails.basic}</span>
                                                </div>
                                                <div className="flex justify-between w-40 text-green-600">
                                                    <span>Allowances:</span>
                                                    <span>+{payroll.salaryDetails.allowances}</span>
                                                </div>
                                                <div className="flex justify-between w-40 text-red-600">
                                                    <span>Deductions:</span>
                                                    <span>-{payroll.salaryDetails.deductions}</span>
                                                </div>
                                                <div className="flex justify-between w-40 font-bold border-t mt-1 pt-1">
                                                    <span>Total:</span>
                                                    <span>{payroll.salaryDetails.currency} {payroll.salaryDetails.total}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${payroll.status === 'paid'
                                                    ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                                    : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                                                }`}>
                                                {payroll.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {payroll.status === 'pending' && (
                                                <button
                                                    onClick={() => handleMarkAsPaid(payroll._id)}
                                                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mr-3"
                                                    title="Mark as Paid"
                                                >
                                                    <FaCheckCircle size={20} />
                                                </button>
                                            )}
                                            <button
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                title="Download Payslip"
                                            >
                                                <FaDownload size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Payroll;
