// src/utils/passwordLocal.js
import bcrypt from 'bcryptjs';

const STORAGE_KEY = 'admin_password_hash';

// Hash de la contraseña por defecto: "admin123"
const DEFAULT_HASH = bcrypt.hashSync('admin123', 10);

export const getStoredPasswordHash = () => {
  const hash = localStorage.getItem(STORAGE_KEY);
  if (!hash) {
    localStorage.setItem(STORAGE_KEY, DEFAULT_HASH);
    return DEFAULT_HASH;
  }
  return hash;
};

export const verifyPassword = (plainPassword) => {
  const hash = getStoredPasswordHash();
  return bcrypt.compareSync(plainPassword, hash);
};

export const changePassword = (currentPassword, newPassword) => {
  if (!verifyPassword(currentPassword)) {
    return false;
  }
  const newHash = bcrypt.hashSync(newPassword, 10);
  localStorage.setItem(STORAGE_KEY, newHash);
  return true;
};