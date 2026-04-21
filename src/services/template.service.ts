import { API_BASE } from '@/config/api.js';

const getAuthHeaders = () => {
  const token = localStorage.getItem('userToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return data;
};

export const templateService = {
  getPublicTemplates: async () => {
    const res = await fetch(`${API_BASE}/templates/public`);
    return parseResponse(res);
  },

  getUserTemplates: async (userId: string) => {
    const res = await fetch(`${API_BASE}/templates/user/${userId}`, {
      headers: getAuthHeaders(),
    });
    return parseResponse(res);
  },

  getTemplateById: async (templateId: string) => {
    const res = await fetch(`${API_BASE}/templates/${templateId}`, {
      headers: getAuthHeaders(),
    });
    return parseResponse(res);
  },

  saveToGallery: async (templateId: string, userId: string) => {
    const res = await fetch(`${API_BASE}/templates/save`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ templateId, userId }),
    });
    return parseResponse(res);
  },

  removeFromGallery: async (templateId: string, userId: string) => {
    const res = await fetch(`${API_BASE}/templates/remove`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ templateId, userId }),
    });
    return parseResponse(res);
  },

  createTemplate: async (payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/templates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return parseResponse(res);
  },

  updateTemplate: async (templateId: string, payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/templates/${templateId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return parseResponse(res);
  },

  publishTemplate: async (templateId: string, userId: string) => {
    const res = await fetch(`${API_BASE}/templates/publish`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ templateId, userId }),
    });
    return parseResponse(res);
  },

  deleteTemplate: async (templateId: string, userId: string) => {
    const res = await fetch(`${API_BASE}/templates/delete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ templateId, userId }),
    });
    return parseResponse(res);
  },
};
