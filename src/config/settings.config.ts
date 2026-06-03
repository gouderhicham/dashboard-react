export type TSettingsThemeMode = 'light' | 'dark' | 'system';

export type TSettingsContainer = 'default' | 'fluid' | 'fixed';

export interface ISettings {
  themeMode: TSettingsThemeMode;
  container: TSettingsContainer;
}

// Default settings for the application
const defaultSettings: ISettings = {
  themeMode: 'light', // Default to light mode for the application
  container: 'fixed' // Default container layout is set to fixed
};

export { defaultSettings };
