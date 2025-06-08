const API_ROOT = 'http://localhost:8000/api/v1';

const config = {
  API_ROOT,
  HOUR_HEIGHT_PX: 80,
  APPOINTMENT_ENDPOINT: `${API_ROOT}/appointments`,
  DEPARTMENT_ENDPOINT: `${API_ROOT}/departments`,
} as const;

export default config;
