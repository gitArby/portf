export type Language = 'cs' | 'en';

export type ThemeName = 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'pink' | 'custom';

export type ViewId =
  | 'home-view'
  | 'about-view'
  | 'skills-view'
  | 'certificates-view'
  | 'calculator-view'
  | 'terminal-view'
  | 'experience-view'
  | 'lol-stats-view'
  | 'games-view'
  | 'projects-view'
  | 'ipsum-view'
  | 'faq-view'
  | 'contact-view';

export type NotificationType = 'info' | 'success' | 'error';

export interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
}

export interface LanyardActivity {
  type: number;
  name: string;
  details?: string;
  state?: string;
  application_id?: string;
  emoji?: {
    id?: string;
    name?: string;
    animated?: boolean;
  };
  timestamps?: {
    start?: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
}

export interface LanyardSpotify {
  track_id: string;
  timestamps: {
    start: number;
    end: number;
  };
  song: string;
  artist: string;
  album_art_url: string;
  album: string;
}

export interface LanyardData {
  discord_user: {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    public_flags?: number;
    bot?: boolean;
    global_name?: string;
    display_name?: string;
  };
  discord_status: 'online' | 'idle' | 'dnd' | 'offline';
  activities: LanyardActivity[];
  spotify: LanyardSpotify | null;
  listening_to_spotify: boolean;
}
