export interface ServiceType {
    _id: string;
    name: string;
    price: number;
  }
  
  export type ServiceTypeCreate = Omit<ServiceType, '_id'>;