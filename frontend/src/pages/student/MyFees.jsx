import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { feeService } from '../../services/feeService';
import { Button } from '../../components/ui/button';
import Modal from '../../components/ui/modal';

const MyFees = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    paymentMethod: 'cash',
    transactionId: '',
    remarks: ''
  });

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const response = await feeService.getMyPayments();
      const paymentsData = response.data || [];
      setPayments(paymentsData);

      // Calculate stats
      const paid = paymentsData
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.totalAmount, 0);
      
      const pending = paymentsData
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0);
      
      const overdue = paymentsData
        .filter(p => p.status === 'overdue')
        .reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0);

      setStats({
        totalPaid: paid,
        totalPending: pending,
        totalOverdue: overdue,
      });
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentModal = (payment) => {
    setSelectedPayment(payment);
    const remainingAmount = payment.totalAmount - payment.paidAmount;
    setPaymentFormData({
      amount: remainingAmount.toString(),
      paymentMethod: 'cash',
      transactionId: '',
      remarks: ''
    });
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPayment(null);
    setPaymentFormData({
      amount: '',
      paymentMethod: 'cash',
      transactionId: '',
      remarks: ''
    });
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentFormData({ ...paymentFormData, [name]: value });
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    try {
      await feeService.addPayment(selectedPayment._id, {
        ...paymentFormData,
        amount: parseFloat(paymentFormData.amount)
      });
      alert('Payment submitted successfully!');
      await fetchFees();
      handleClosePaymentModal();
    } catch (error) {
      console.error('Error submitting payment:', error);
      alert('Failed to submit payment. Please try again.');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Fees</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Paid</p>
              <p className="text-3xl font-bold mt-2 text-green-600">${stats.totalPaid}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-3xl font-bold mt-2 text-yellow-600">${stats.totalPending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Overdue</p>
              <p className="text-3xl font-bold mt-2 text-red-600">${stats.totalOverdue}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Warning */}
      {stats.totalOverdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Overdue Payment Alert</h3>
            <p className="text-sm text-red-700 mt-1">
              You have ${stats.totalOverdue} in overdue payments. Please contact the administration office.
            </p>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => {
                const remainingAmount = payment.totalAmount - payment.paidAmount;
                const lastPayment = payment.payments && payment.payments.length > 0 
                  ? payment.payments[payment.payments.length - 1] 
                  : null;
                
                return (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {payment.feeStructure?.name || 'Fee Payment'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${payment.totalAmount}
                      {payment.paidAmount > 0 && (
                        <div className="text-xs text-gray-500">
                          Paid: ${payment.paidAmount}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lastPayment?.paymentDate ? new Date(lastPayment.paymentDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                        payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                        payment.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.status !== 'paid' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenPaymentModal(payment)}
                        >
                          Pay Now
                        </Button>
                      )}
                      {payment.status === 'paid' && (
                        <span className="text-green-600 text-sm font-medium">
                          ✓ Paid
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {payments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No fee records found
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        title="Submit Payment"
      >
        {selectedPayment && (
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Fee Type:</span>
                <span className="font-medium">{selectedPayment.feeStructure?.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span className="font-medium">${selectedPayment.totalAmount}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Already Paid:</span>
                <span className="font-medium">${selectedPayment.paidAmount}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-sm font-semibold">Remaining:</span>
                <span className="font-bold text-lg">${selectedPayment.totalAmount - selectedPayment.paidAmount}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Amount *
              </label>
              <input
                type="number"
                name="amount"
                required
                min="0.01"
                max={selectedPayment.totalAmount - selectedPayment.paidAmount}
                step="0.01"
                value={paymentFormData.amount}
                onChange={handlePaymentInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method *
              </label>
              <select
                name="paymentMethod"
                required
                value={paymentFormData.paymentMethod}
                onChange={handlePaymentInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="online">Online Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID / Reference Number
              </label>
              <input
                type="text"
                name="transactionId"
                value={paymentFormData.transactionId}
                onChange={handlePaymentInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={paymentFormData.remarks}
                onChange={handlePaymentInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Any additional notes..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your payment will be recorded and verified by the administration. 
                You will receive a confirmation once processed.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClosePaymentModal}>
                Cancel
              </Button>
              <Button type="submit">Submit Payment</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default MyFees;
