export interface IEventOrganizer {
  name: string;
  email: string;
  phone: {
    countryCode: string;
    number: string;
  };
}
