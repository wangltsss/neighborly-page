// --- MOCK DATA ---

export const LOCATIONS = {
  'Canada': {
    name: 'Canada',
    provinces: {
      'ON': {
        name: 'Ontario',
        cities: ['Toronto', 'Ottawa', 'Waterloo', 'Mississauga']
      },
      'BC': {
        name: 'British Columbia',
        cities: ['Vancouver', 'Victoria', 'Burnaby', 'Kelowna']
      },
      'QC': {
        name: 'Quebec',
        cities: ['Montreal', 'Quebec City', 'Laval']
      },
      'AB': {
        name: 'Alberta',
        cities: ['Calgary', 'Edmonton']
      }
    }
  }
};

export const MOCK_BUILDINGS = [
  {
    id: '1',
    name: 'The Harbourfront Lofts',
    address: '200 Queens Quay W, Toronto, ON',
    province: 'ON',
    city: 'Toronto',
    residents: 142,
    verified: true,
    imageColor: 'bg-indigo-100',
  },
  {
    id: '2',
    name: 'Pacific Point Tower',
    address: '1200 Pacific Blvd, Vancouver, BC',
    province: 'BC',
    city: 'Vancouver',
    residents: 89,
    verified: true,
    imageColor: 'bg-orange-100',
  },
  {
    id: '3',
    name: 'Le Plateau Apartments',
    address: '45 Rue Saint-Denis, Montreal, QC',
    province: 'QC',
    city: 'Montreal',
    residents: 215,
    verified: false,
    imageColor: 'bg-emerald-100',
  },
  {
    id: '4',
    name: 'Liberty Village Condos',
    address: '80 East Liberty St, Toronto, ON',
    province: 'ON',
    city: 'Toronto',
    residents: 320,
    verified: true,
    imageColor: 'bg-blue-100',
  },
  {
    id: '5',
    name: 'Icon Bond',
    address: '300 Phillip St, Waterloo, ON',
    province: 'ON',
    city: 'Waterloo',
    residents: 540,
    verified: true,
    imageColor: 'bg-purple-100',
  }
];
