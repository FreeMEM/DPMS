import axiosWrapper from '../utils/AxiosWrapper';

// Get axios instance with token
const getAxios = () => {
  const client = axiosWrapper();
  const token = localStorage.getItem('token');
  if (token) {
    client.defaults.headers.common['Authorization'] = `Token ${token}`;
  }
  return client;
};

// Editions API
export const editionsAPI = {
  list: (params) => getAxios().get('/api/editions/', { params }),
  get: (id) => getAxios().get(`/api/editions/${id}/`),
  create: (data) => getAxios().post('/api/editions/', data),
  update: (id, data) => getAxios().put(`/api/editions/${id}/`, data),
  delete: (id) => getAxios().delete(`/api/editions/${id}/`),
  getCompos: (id) => getAxios().get(`/api/editions/${id}/compos/`),
  getProductions: (id, params) => getAxios().get(`/api/editions/${id}/productions/`, { params }),
};

// Compos API
export const composAPI = {
  list: () => getAxios().get('/api/compos/'),
  get: (id) => getAxios().get(`/api/compos/${id}/`),
  create: (data) => getAxios().post('/api/compos/', data),
  update: (id, data) => getAxios().put(`/api/compos/${id}/`, data),
  delete: (id) => getAxios().delete(`/api/compos/${id}/`),
  getProductions: (id, params) => getAxios().get(`/api/compos/${id}/productions/`, { params }),
};

// Productions API
export const productionsAPI = {
  list: (params) => getAxios().get('/api/productions/', { params }),
  get: (id) => getAxios().get(`/api/productions/${id}/`),
  create: (data) => getAxios().post('/api/productions/', data),
  update: (id, data) => getAxios().put(`/api/productions/${id}/`, data),
  delete: (id) => getAxios().delete(`/api/productions/${id}/`),
  myProductions: () => getAxios().get('/api/productions/my_productions/'),
};

// Files API
export const filesAPI = {
  list: () => getAxios().get('/api/files/'),
  get: (id) => getAxios().get(`/api/files/${id}/`),
  upload: (formData) => {
    const client = getAxios();
    return client.post('/api/files/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, data) => getAxios().put(`/api/files/${id}/`, data),
  delete: (id) => getAxios().delete(`/api/files/${id}/`),
  download: (id) => getAxios().get(`/api/files/${id}/download/`, { responseType: 'blob' }),
};

// HasCompos API
export const hasComposAPI = {
  list: (params) => getAxios().get('/api/hascompos/', { params }),
  get: (id) => getAxios().get(`/api/hascompos/${id}/`),
  create: (data) => getAxios().post('/api/hascompos/', data),
  update: (id, data) => getAxios().put(`/api/hascompos/${id}/`, data),
  delete: (id) => getAxios().delete(`/api/hascompos/${id}/`),
};

// Gallery API
export const galleryAPI = {
  list: (params) => getAxios().get('/api/gallery/', { params }),
  get: (id) => getAxios().get(`/api/gallery/${id}/`),
  upload: (formData) => {
    const client = getAxios();
    return client.post('/api/gallery/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, data) => getAxios().put(`/api/gallery/${id}/`, data),
  delete: (id) => getAxios().delete(`/api/gallery/${id}/`),
  myImages: (params) => getAxios().get('/api/gallery/my_images/', { params }),
  byEdition: (editionId) => getAxios().get(`/api/gallery/by-edition/${editionId}/`),
  editionsWithImages: () => getAxios().get('/api/gallery/editions_with_images/'),
};
