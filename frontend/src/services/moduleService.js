import axios from "axios";

// Get all modules
export const getModules = async () => {
  try {
    const response = await axios.get("/api/modules");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get a single module
export const getModule = async (id) => {
  try {
    const response = await axios.get(`/api/modules/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a module
export const createModule = async (moduleData) => {
  try {
    const response = await axios.post("/api/modules", moduleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Generate module content using AI
export const generateModuleContent = async (topicData) => {
  try {
    const response = await axios.post("/api/modules/generate", topicData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update a module
export const updateModule = async (id, moduleData) => {
  try {
    const response = await axios.put(`/api/modules/${id}`, moduleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a module
export const deleteModule = async (id) => {
  try {
    const response = await axios.delete(`/api/modules/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update trainee progress
export const updateProgress = async (id, progressData) => {
  try {
    const response = await axios.put(
      `/api/modules/${id}/progress`,
      progressData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get trainee progress for all modules
export const getTraineeProgress = async () => {
  try {
    const response = await axios.get("/api/modules/trainee/progress");
    return response.data;
  } catch (error) {
    throw error;
  }
};
