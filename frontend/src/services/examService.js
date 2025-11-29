import axios from 'axios';

const API_URL = 'http://localhost:5000/api/exams';

// Configure axios with auth token
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return { headers: { Authorization: `Bearer ${user?.token}` } };
};

const createExam = async (examData) => {
    const response = await axios.post(API_URL, examData, getAuthHeader());
    return response.data;
};

const getExams = async (params) => {
    const response = await axios.get(API_URL, { ...getAuthHeader(), params });
    return response.data;
};

const getExamById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
};

const submitExam = async (submissionData) => {
    const response = await axios.post(`${API_URL}/submit`, submissionData, getAuthHeader());
    return response.data;
};

const getResults = async (params) => {
    const response = await axios.get(`${API_URL}/results`, { ...getAuthHeader(), params });
    return response.data;
};

const examService = {
    createExam,
    getExams,
    getExamById,
    submitExam,
    getResults
};

export default examService;
