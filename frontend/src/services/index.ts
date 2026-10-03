import api from './api';

// User services
export const userService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: { name?: string; profileImage?: string }) => api.put('/users/me', data),
  getDashboardStats: () => api.get('/users/me/stats'),
};

// Resume services
export const resumeService = {
  upload: (formData: FormData) =>
    api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: () => api.get('/resumes'),
  getById: (id: string) => api.get(`/resumes/${id}`),
  analyze: (id: string) => api.post(`/resumes/${id}/analyze`),
  delete: (id: string) => api.delete(`/resumes/${id}`),
};

// Interview services
export const interviewService = {
  create: (data: {
    type: string;
    role: string;
    difficulty: string;
    duration?: number;
    resumeId?: string;
  }) => api.post('/interviews', data),
  getAll: () => api.get('/interviews'),
  getById: (id: string) => api.get(`/interviews/${id}`),
  startSession: (id: string) => api.post(`/interviews/${id}/start`),
  submitAnswer: (id: string, data: { questionIndex: number; answer: string; questionText?: string }) =>
    api.post(`/interviews/${id}/answer`, data),
  complete: (id: string) => api.post(`/interviews/${id}/complete`),
  getResult: (id: string) => api.get(`/interviews/${id}/result`),
};

// Feedback services
export const feedbackService = {
  getByInterview: (interviewId: string) => api.get(`/feedback/interview/${interviewId}`),
  getAll: () => api.get('/feedback'),
  getLatest: () => api.get('/feedback/latest'),
};

// Roadmap services
export const roadmapService = {
  generate: (data: {
    targetRole: string;
    resumeId?: string;
    interviewId?: string;
    careerGoal?: string;
  }) => api.post('/roadmaps/generate', data),
  getAll: () => api.get('/roadmaps'),
  getById: (id: string) => api.get(`/roadmaps/${id}`),
  getActive: () => api.get('/roadmaps/active'),
  updateProgress: (id: string, phaseIndex: number, topicIndex: number, completed: boolean) =>
    api.patch(`/roadmaps/${id}/progress`, { phaseIndex, topicIndex, completed }),
};

// AI service direct calls
export const aiService = {
  chat: (message: string, context?: object) => api.post('/ai/chat', { message, context }),
};
