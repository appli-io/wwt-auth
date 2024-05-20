export interface IEventUrl {
  label: string;
  url: string;
  platform: 'gmeet' | 'zoom' | 'teams' | 'maps' | 'website' | 'other';
}
