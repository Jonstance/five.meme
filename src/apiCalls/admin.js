import axios from "axios";
const API_URL = "/api"; // Replace with your actual API URL

const handleRes = (error, data, errorMessage) => {
  if (error) {
    return {
      error,
      errorMessage,
    };
  } else {
    return {
      error,
      data,
    };
  }
};

export const fetchAllPools = async () => {
  try {
    const allPoolsRes = await axios.get(`${API_URL}/projects`);
    return handleRes(false, allPoolsRes.data, null);
  } catch (error) {
    return handleRes(true, null, error.message);
  }
};

export const verifyProject = async (verificationType, projectId, token) => {
  try {
    const verifyRes = await axios.post(
      `${API_URL}/admin/verify`,

      {
        id: projectId,
        verification: verificationType,
      },
      {
        headers: { Authorization: token },
      }
    );
    return handleRes(false, verifyRes.data, null);
  } catch (error) {
    return handleRes(true, null, error.response.data);
  }
};

export const cancelProject = async (projectId, token) => {
  try {
    const cancelRes = await axios.get(`${API_URL}/admin/cancel/${projectId}`, {
      headers: { Authorization: token },
    });
    return handleRes(false, cancelRes.data, null);
  } catch (error) {
    return handleRes(true, null, error.response.data);
  }
};

// export const signUp = async (email, password) => {
//   try {
//     const signUpRes = await axios.post(`${API_URL}/admin/signup`, {
//       email,
//       password,
//     });
//     return handleRes(false, signUpRes.data, null);
//   } catch (error) {
//     return handleRes(true, null, error.message);
//   }
// };

export const logIn = async (email, password) => {
  try {
    const loginRes = await axios.post(`${API_URL}/admin/login`, {
      email,
      password,
    });
    return handleRes(false, loginRes.data, null);
  } catch (error) {
    return handleRes(true, null, error.message);
  }
};

export const logOut = async (email, password) => {
  try {
    const signUpRes = await axios.get(`${API_URL}/admin/signout`);
    return handleRes(false, signUpRes.data, null);
  } catch (error) {
    return handleRes(true, null, error.message);
  }
};
