import { ActivityType } from './types';

export const translateActivityType = (type: ActivityType): string => {
  switch (type) {
    case 'EBikeRide':
      return 'Electro Bike';
    default:
      return type.split(/(?=[A-Z])/).join(' ');
  }
};
