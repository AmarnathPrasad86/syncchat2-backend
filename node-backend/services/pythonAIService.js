const axios = require('axios');

const BASE_URL = process.env.PYTHON_AI_BASE_URL || 'http://127.0.0.1:5000';

const postToPython = async (endpoint, data) => {
  try {
    const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 3000,
    });
    return response.data;
  } catch (error) {
    console.warn(`Python AI call failed at ${endpoint}:`, error.message);
    return null;
  }
};

const analyzeMessage = async (message) => {
  const [detect, suggest] = await Promise.all([
    postToPython('/ai/detect', { message }),
    postToPython('/ai/suggest', { message }),
  ]);

  return {
    toxic: detect?.toxic || false,
    reason: detect?.reason || '',
    suggestion: suggest?.suggestion || '',
    spam: detect?.spam || false,
  };
};

const getChatbotReply = async (message) => {
  const reply = await postToPython('/ai/reply', { message });
  return reply?.reply || `I heard: "${message}"`;
};

module.exports = {
  analyzeMessage,
  getChatbotReply,
};
