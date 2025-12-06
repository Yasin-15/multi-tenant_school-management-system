/**
 * Import Modal Component to be added to Students.jsx
 * Add these state variables at the top with other st ate:
 * 
const [isImportModalOpen, setIsImportModalOpen] = useState(false);
const [importFile, setImportFile] = useState(null);
const [importing, setImporting] = useState(false);
const [importResults, setImportResults] = useState(null);
 *
 * Add Upload and Download to imports:
 * import { Plus, Search, Edit, Trash2, Eye, X, RefreshCw, Upload, Download } from 'lucide-react';
 * 
 * Add these handler functions before the filteredStudents function:
 */

const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setImportFile(file);
        setImportResults(null);
    }
};

const handleImportExcel = async () => {
    if (!importFile) {
        toast.error('Please select a file to import');
        return;
    }

    setImporting(true);
    try {
        const response = await studentService.importFromExcel(importFile);
        setImportResults(response.data);
        toast.success(response.message || 'Import completed successfully!');

        // Refresh the students list if there were successful imports
        if (response.data.successCount > 0) {
            fetchStudents();
        }
    } catch (error) {
        console.error('Error importing students:', error);
        toast.error(error.response?.data?.message || 'Failed to import students');
    } finally {
        setImporting(false);
    }
};

const handleDownloadTemplate = () => {
    studentService.downloadTemplate();
    toast.success('Template download started');
};

const handleOpenImportModal = () => {
    setImportFile(null);
    setImportResults(null);
    setIsImportModalOpen(true);
};

/**
 * Update the header buttons section to include the Import button:
 * 
 *       <div className="flex gap-2">
 *         <Button onClick={handleOpenImportModal} variant="outline">
 *           <Upload className="w-4 h-4 mr-2" />
 *           Import from Excel
 *         </Button>
 *         <Button onClick={handleOpenAddModal}>
 *           <Plus className="w-4 h-4 mr-2" />
 *           Add Student
 *         </Button>
 *       </div>
 * 
 * Add this modal component before the closing </div> and export statement:
 */

export const ImportStudentsModal = ({
    isOpen,
    onClose,
    importFile,
    importing,
    importResults,
    onFileChange,
    onImport,
    onDownloadTemplate
}) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Import Students from Excel"
        size="large"
    >
        <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📝 Import Instructions</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Download the template file to see the required format</li>
                    <li>• Fill in student information (required fields marked with *)</li>
                    <li>• Ensure dates are in YYYY-MM-DD format</li>
                    <li>• Class names must match existing classes in your system</li>
                    <li>• Student IDs will be auto-generated if not provided</li>
                </ul>
            </div>

            {/* Download Template Button */}
            <div>
                <Button onClick={onDownloadTemplate} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Excel Template
                </Button>
            </div>

            {/* File Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Excel File
                </label>
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={onFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {importFile && (
                    <p className="text-sm text-gray-600 mt-2">
                        Selected: {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)
                    </p>
                )}
            </div>

            {/* Import Results */}
            {importResults && (
                <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Import Results</h4>

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-gray-700">{importResults.total}</p>
                            <p className="text-sm text-gray-600">Total</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-green-700">{importResults.successCount}</p>
                            <p className="text-sm text-green-600">Success</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-red-700">{importResults.errorCount}</p>
                            <p className="text-sm text-red-600">Errors</p>
                        </div>
                    </div>

                    {/* Success List */}
                    {importResults.success.length > 0 && (
                        <div className="mb-4">
                            <h5 className="font-medium text-green-700 mb-2">✓ Successfully Imported ({importResults.successCount})</h5>
                            <div className="max-h-40 overflow-y-auto bg-green-50 rounded-lg p-3">
                                {importResults.success.slice(0, 5).map((item) => (
                                    <div key={item.row} className="text-sm text-green-800 py-1">
                                        Row {item.row}: {item.name} ({item.email}) - ID: {item.studentId}
                                    </div>
                                ))}
                                {importResults.success.length > 5 && (
                                    <p className="text-sm text-green-600 mt-2">
                                        ... and {importResults.success.length - 5} more
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error List */}
                    {importResults.errors.length > 0 && (
                        <div>
                            <h5 className="font-medium text-red-700 mb-2">✗ Errors ({importResults.errorCount})</h5>
                            <div className="max-h-40 overflow-y-auto bg-red-50 rounded-lg p-3">
                                {importResults.errors.map((item) => (
                                    <div key={item.row} className="text-sm text-red-800 py-1 border-b border-red-100 last:border-0">
                                        <span className="font-medium">Row {item.row}:</span> {item.email || 'Unknown'} - {item.error}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                    onClick={onClose}
                    variant="outline"
                >
                    {importResults ? 'Close' : 'Cancel'}
                </Button>
                {!importResults && (
                    <Button
                        onClick={onImport}
                        disabled={!importFile || importing}
                    >
                        {importing ? 'Importing...' : 'Import Students'}
                    </Button>
                )}
            </div>
        </div>
    </Modal>
);
