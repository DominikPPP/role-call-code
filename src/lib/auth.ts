import type { User } from './types';

// In a real app, this would be a database and passwords would be securely hashed.
// This is a mock database for demonstration purposes.
export const usersData: Record<string, Omit<User, 'username'>> = {
  'adamrector': { id: '1', name: 'Adam Rector', role: 'Rector', roleCode: 'RKR' },
  'carlchancellor': { id: '2', name: 'Carl Chancellor', role: 'Chancellor', roleCode: 'KAN' },
  'paulavredu': { id: '3', name: 'Paula VREdu', role: 'Vice-Rector for Education', roleCode: 'PRK' },
  'petervrsci': { id: '4', name: 'Peter VRSci', role: 'Vice-Rector for Scientific Affairs', roleCode: 'PRN' },
  'hollyhead': { id: '5', name: 'Holly Head', role: 'Head of O.U.', roleCode: 'Head of O.U.' },
  'pennypersonnel': { id: '6', name: 'Penny Personnel', role: 'Personnel Department', roleCode: 'PD' },
  'quentinquartermaster': { id: '7', name: 'Quentin Quartermaster', role: 'Quartermaster', roleCode: 'KWE' },
  'mikempd': { id: '8', name: 'Mike MPD', role: 'Military Personnel Dept.', roleCode: 'MPD/WKW' },
  'aliceacademic': { id: '9', name: 'Alice Academic', role: 'Academic Teacher', roleCode: 'AT' },
  'nancynonacademic': { id: '10', name: 'Nancy NonAcademic', role: 'Non-Academic Employee', roleCode: 'NAE' },
};

// For demo purposes, all users share the same simple password.
export const ALL_USERS_PASSWORD = 'password';
