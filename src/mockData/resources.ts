import { ResponseResource } from '../types';

export const INITIAL_RESOURCES: ResponseResource[] = [
  {
    id: 'res-sdrf-04',
    name: 'SDRF Battalion Team #04',
    type: 'SDRF Team',
    distanceKm: 8.7,
    etaMin: 18,
    status: 'AVAILABLE',
    contact: '+91 389 2320911',
    coordinates: { lat: 23.7310, lng: 92.7150 }
  },
  {
    id: 'res-med-02',
    name: 'Civil Hospital Emergency Medical Unit',
    type: 'Medical Unit',
    distanceKm: 4.2,
    etaMin: 11,
    status: 'AVAILABLE',
    contact: '+91 389 2341200',
    coordinates: { lat: 23.7230, lng: 92.7210 }
  },
  {
    id: 'res-road-01',
    name: 'PWD Heavy Earthmover & Clearance Unit',
    type: 'Road Clearance Team',
    distanceKm: 11.3,
    etaMin: 26,
    status: 'AVAILABLE',
    contact: '+91 389 2309874',
    coordinates: { lat: 23.7380, lng: 92.7090 }
  },
  {
    id: 'res-supp-09',
    name: 'Red Cross Emergency Relief Depot',
    type: 'Emergency Supplies',
    distanceKm: 6.8,
    etaMin: 15,
    status: 'AVAILABLE',
    contact: '+91 389 2311455',
    coordinates: { lat: 23.7250, lng: 92.7280 }
  }
];
