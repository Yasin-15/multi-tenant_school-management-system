import { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, Eye } from 'lucide-react';
import { feeService } from '../../services/feeService';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { Button } from '../../components/ui/button';
import Modal from '../../components/ui/modal';

const Fees = () => {
  const [structures, setStructures] = useState([]);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [activeTab, setActiveTab] = useState('structures');
  const [formData, setFormData] = useState({});
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    paymentMethod: 'cash',
    transactionId: '',
    receiptNumber: '',
    remarks: ''
  });
  const [feeComponents, setFeeComponents] = useState([{ name: '', amount: '', frequency: 'yearly' }]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [structuresRes, paymentsRes, studentsRes, classesRes] = await Promise.all([
        feeService.getAllStructures(),
        feeService.getAllPayments(),
        studentService.getAll({ limit: 1000 }),
        classService.getAll({ limit: 1000 }),
      ]);
      setStructures(structuresRes.data || []);
      setPayments(paymentsRes.data || []);
      setStudents(studentsRes.data || []);
      setClasses(classesRes.data || []);
    } catch (error) {
      console.error('Error fetching fee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({});
    setFeeComponents([{ name: '', amount: '', frequency: 'yearly' }]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({});
    setFeeComponents([{ name: '', amount: '', frequency: 'yearly' }]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleComponentChange = (index, field, value) => {
    const updated = [...feeComponents];
    updated[index][field] = value;
    setFeeComponents(updated);
  };

  const addComponent = () => {
    setFeeComponents([...feeComponents, { name: '', amount: '', frequency: 'yearly' }]);
  };

  const removeComponent = (index) => {
    setFeeComponents(feeComponents.filter((_, i) => i !== index));
  };

  const handleSubmitStructure = async (e) => {
    e.preventDefault();
    try {
      const structureData = {
        ...formData,
        feeComponents: feeComponents.map(c => ({
          ...c,
          amount: parseFloat(c.amount),
          isMandatory: true
        }))
      };
      await feeService.createStructure(structureData);
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error creating fee structure:', error);
      alert('Failed to create fee structure');
    }
  };

  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    try {
      const invoiceData = {
        studentId: formData.studentId,
        feeStructureId: formData.feeStructureId,
        dueDate: formData.dueDate,
        discount: parseFloat(formData.discount || 0),
        discountReason: formData.discountReason,
        lateFee: parseFloat(formData.lateFee || 0),
      };
      await feeService.createInvoice(invoiceData);
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice');
    }
  };

  const handleDeleteStructure = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      try {
        await feeService.deleteStructure(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting structure:', error);
        alert('Failed to delete fee structure');
      }
    }
  };

  const handleOpenPaymentModal = (payment) => {
    const remainingAmount = payment.totalAmount - payment.paidAmount;
    
    // Prevent opening modal if payment is already complete
    if (remainingAmount <= 0) {
      alert('This invoice is already fully paid.');
      return;
    }
    
    setSelectedPayment(payment);
    setPaymentFormData({
      amount: remainingAmount.toString(),
      paymentMethod: 'cash',
      transactionId: '',
      receiptNumber: '',
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
      receiptNumber: '',
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
      alert('Payment recorded successfully!');
      await fetchData();
      handleClosePaymentModal();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment. Please try again.');
    }
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedPayment(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fee Management</h1>
        <Button onClick={handleOpenModal}>
          <Plus className="w-4 h-4 mr-2" />
          {activeTab === 'structures' ? 'Add Structure' : 'Create Invoice'}
        </Button>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('structures')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'structures'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Fee Structures
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Invoices & Payments
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'structures' ? (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {structures.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No fee structures found
                    </td>
                  </tr>
                ) : (
                  structures.map((structure) => (
                    <tr key={structure._id}>
                      <td className="px-6 py-4">{structure.name}</td>
                      <td className="px-6 py-4">{structure.class?.name || 'All Classes'}</td>
                      <td className="px-6 py-4">{structure.academicYear}</td>
                      <td className="px-6 py-4">${structure.totalAmount}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteStructure(structure._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{payment.invoiceNumber}</td>
                      <td className="px-6 py-4">
                        {payment.student?.user?.firstName} {payment.student?.user?.lastName}
                      </td>
                      <td className="px-6 py-4">${payment.totalAmount}</td>
                      <td className="px-6 py-4">
                        <span className={payment.paidAmount > 0 ? 'font-semibold text-green-600' : ''}>
                          ${payment.paidAmount}
                        </span>
                      </td>
                      <td className="px-6 py-4">{new Date(payment.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                          payment.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                          payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(payment)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {payment.status !== 'paid' && (
                            <button
                              onClick={() => handleOpenPaymentModal(payment)}
                              className="text-green-600 hover:text-green-800"
                              title="Record Payment"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={activeTab === 'structures' ? 'Add Fee Structure' : 'Create Invoice'}
      >
        {activeTab === 'structures' ? (
          <form onSubmit={handleSubmitStructure} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Structure Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Annual Tuition Fee"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class (Optional)
              </label>
              <select
                name="class"
                value={formData.class || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year *
              </label>
              <input
                type="text"
                name="academicYear"
                required
                value={formData.academicYear || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., 2024-2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fee Components *
              </label>
              {feeComponents.map((component, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Component name"
                    value={component.name}
                    onChange={(e) => handleComponentChange(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={component.amount}
                    onChange={(e) => handleComponentChange(index, 'amount', e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <select
                    value={component.frequency}
                    onChange={(e) => handleComponentChange(index, 'frequency', e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="one_time">One Time</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half_yearly">Half Yearly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  {feeComponents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeComponent(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addComponent}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Component
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">Create Structure</Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitInvoice} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student *
              </label>
              <select
                name="studentId"
                required
                value={formData.studentId || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.user?.firstName} {student.user?.lastName} - {student.rollNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Structure *
              </label>
              <select
                name="feeStructureId"
                required
                value={formData.feeStructureId || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Fee Structure</option>
                {structures.map((structure) => (
                  <option key={structure._id} value={structure._id}>
                    {structure.name} - ${structure.totalAmount}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                required
                value={formData.dueDate || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Reason
              </label>
              <input
                type="text"
                name="discountReason"
                value={formData.discountReason || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Scholarship, Early payment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Late Fee
              </label>
              <input
                type="number"
                name="lateFee"
                value={formData.lateFee || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="0"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">Create Invoice</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        title="Record Payment"
      >
        {selectedPayment && (
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Student:</span>
                <span className="font-medium">
                  {selectedPayment.student?.user?.firstName} {selectedPayment.student?.user?.lastName}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Invoice #:</span>
                <span className="font-medium">{selectedPayment.invoiceNumber}</span>
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
                max={Math.max(0.01, selectedPayment.totalAmount - selectedPayment.paidAmount)}
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
                Receipt Number
              </label>
              <input
                type="text"
                name="receiptNumber"
                value={paymentFormData.receiptNumber}
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClosePaymentModal}>
                Cancel
              </Button>
              <Button type="submit">Record Payment</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Payment Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        title="Payment Details"
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Invoice Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Invoice Number:</span>
                  <span className="font-medium">{selectedPayment.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Student:</span>
                  <span className="font-medium">
                    {selectedPayment.student?.user?.firstName} {selectedPayment.student?.user?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fee Structure:</span>
                  <span className="font-medium">{selectedPayment.feeStructure?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Due Date:</span>
                  <span className="font-medium">{new Date(selectedPayment.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                    selectedPayment.status === 'paid' ? 'bg-green-100 text-green-800' :
                    selectedPayment.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                    selectedPayment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedPayment.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Amount Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="font-medium">${selectedPayment.totalAmount}</span>
                </div>
                {selectedPayment.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">-${selectedPayment.discount}</span>
                  </div>
                )}
                {selectedPayment.lateFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Late Fee:</span>
                    <span className="font-medium text-red-600">+${selectedPayment.lateFee}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Paid Amount:</span>
                  <span className="font-medium text-green-600">${selectedPayment.paidAmount}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Remaining:</span>
                  <span className="font-bold text-lg">${selectedPayment.totalAmount - selectedPayment.paidAmount}</span>
                </div>
              </div>
            </div>

            {selectedPayment.payments && selectedPayment.payments.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Payment History</h3>
                <div className="space-y-2">
                  {selectedPayment.payments.map((payment, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-white">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Payment #{index + 1}</span>
                        <span className="font-semibold">${payment.amount}</span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Method: {payment.paymentMethod}</div>
                        <div>Date: {new Date(payment.paymentDate).toLocaleDateString()}</div>
                        {payment.transactionId && <div>Transaction ID: {payment.transactionId}</div>}
                        {payment.receiptNumber && <div>Receipt #: {payment.receiptNumber}</div>}
                        {payment.remarks && <div>Remarks: {payment.remarks}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={handleCloseDetailsModal}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Fees;
