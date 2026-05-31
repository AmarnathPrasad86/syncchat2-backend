const axios = require('axios');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:5000/welcome';

const generateWelcomeMessage = async (name) => {
  try {
    const response = await axios.post(PYTHON_SERVICE_URL, { name });
    if (response.data && response.data.message) {
      return response.data;
    }
    return { message: `Welcome ${name}!` };
  } catch (error) {
    console.warn('Python service call failed. Falling back to default message.', error.message);
    return { message: `Welcome ${name}!` };
  }
};

module.exports = {
  generateWelcomeMessage,
};
