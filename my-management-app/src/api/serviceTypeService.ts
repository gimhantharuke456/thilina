import axios from 'axios';
import { ServiceType } from '../models/ServiceTypeModel';

const API_URL = 'http://localhost:8080/api/service-types'; // Update this URL as needed

export const getAllServiceTypes = async (): Promise<ServiceType[]> => {
  const response = await axios.get(`${API_URL}`);
  return response.data;
};

export const createServiceType = async (serviceType: ServiceType): Promise<ServiceType> => {
  const response = await axios.post(`${API_URL}`, serviceType);
  return response.data;
};

export const updateServiceType = async (id: string, serviceType: ServiceType): Promise<ServiceType> => {
  const response = await axios.put(`${API_URL}/${id}`, serviceType);
  return response.data;
};

export const deleteServiceType = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
