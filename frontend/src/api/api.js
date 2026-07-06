import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// ------------------------
// Upload Video
// ------------------------
export const uploadVideo = async (source) => {
  const response = await api.post("/upload", {
    source,
  });

  return response.data;
};


// ------------------------
// Get Processing Status
// ------------------------
export const getStatus = async (videoId) => {
  const response = await api.get(`/status/${videoId}`);
  return response.data;
};


// ------------------------
// Get All Videos
// ------------------------
export const getVideos = async () => {
  const response = await api.get("/videos");
  return response.data;
};


// ------------------------
// Get Single Video
// ------------------------
export const getVideo = async (videoId) => {
  const response = await api.get(`/videos/${videoId}`);
  return response.data;
};


// ------------------------
// Chat
// ------------------------
export const chatWithVideo = async (videoId, question) => {
  const response = await api.post("/chat", {
    video_id: videoId,
    question,
  });

  return response.data;
};


// ------------------------
// Delete Video
export const deleteVideo = async (videoId) => {
  const res = await api.delete(`/videos/${videoId}`);
  return res.data;
};
export const uploadLocalFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/upload-file/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
export const getChatHistory = async (videoId) => {
  const res = await api.get(`/history/${videoId}`);
  return res.data;
};

export const clearChatHistory = async (videoId) => {
  const res = await api.delete(`/history/${videoId}`);
  return res.data;
};

api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;


export const register = async (username, email, password) => {

    const res = await api.post("/auth/register", {
        username,
        email,
        password,
    });

    return res.data;
};
export const login = async (email, password) => {
    const res = await api.post("/auth/login", {
        email,
        password,
    });

    return res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post("/auth/forgot-password", {
    email,
  });

  return res.data;
};

export const resetPassword = async (token, newPassword) => {
  const res = await api.post("/auth/reset-password", {
    token,
    new_password: newPassword,
  });

  return res.data;
};