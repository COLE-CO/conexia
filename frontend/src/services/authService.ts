import api from './api';

export interface UserProfile {
  id: number;
  email: string;
  full_name: string | null;
  role: 'admin' | 'contador_family_office' | 'contador_cole_co';
  is_active: boolean;
  must_change_password: boolean;
  alert_deadlines_enabled: boolean;
  alert_balances_enabled: boolean;
  alert_reports_enabled: boolean;
  reminder_window_start_days: number;
  reminder_window_end_days: number;
}

export interface UpdateProfilePayload {
  full_name: string;
  email: string;
  alert_deadlines_enabled: boolean;
  alert_balances_enabled: boolean;
  alert_reports_enabled: boolean;
  reminder_window_start_days: number;
  reminder_window_end_days: number;
}

export const login = async (username: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await api.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
};

export const getMe = async () => {
  const response = await api.get<UserProfile>('/auth/me');
  return response.data;
};

export const updateMe = async (payload: UpdateProfilePayload) => {
  const response = await api.put<UserProfile>('/auth/me', payload);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const changePassword = async (newPassword: string) => {
  const response = await api.post('/auth/change-password', {
    new_password: newPassword,
  });
  return response.data;
};
