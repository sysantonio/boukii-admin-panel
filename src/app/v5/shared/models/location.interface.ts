export interface Location {
  id: number;
  name: string;
  address: string;
  description?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}