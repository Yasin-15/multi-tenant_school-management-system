import api from './api';

const createExam = async (examData) => {
    const response = await api.post('/exams', examData);
    return response.data;
};

const getExams = async (params) => {
    const response = await api.get('/exams', { params });
    return response.data;
};

const getExamById = async (id) => {
    const response = await api.get(`/exams/${id}`);
    return response.data;
};

const submitExam = async (submissionData) => {
    const response = await api.post('/exams/submit', submissionData);
    return response.data;
};

const getResults = async (params) => {
    const response = await api.get('/exams/results', { params });
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
