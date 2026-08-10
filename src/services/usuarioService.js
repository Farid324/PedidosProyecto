// src/services/usuarioService.js
import axios from 'axios';

const API_URL = 'http://localhost:43921/api/usuarios';

const getUsuarios = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const createUsuario = async (usuarioData) => {
  const response = await axios.post(API_URL, usuarioData);
  return response.data;
};

const updateUsuario = async (id, usuarioData) => {
  const response = await axios.put(`${API_URL}/${id}`, usuarioData);
  return response.data;
};

const deleteUsuario = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

const cambiarPassword = async (id, passwordData) => {
  const response = await axios.put(`${API_URL}/${id}/password`, passwordData);
  return response.data;
};

export default {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  cambiarPassword
};
