
export interface TeamState {
  name: string;
  points: number;
  wins: number;
}

export interface GameState {
  nos: TeamState;
  eles: TeamState;
}

export type WallpaperType = 
  | 'leather' | 'felt' | 'wood' | 'carbon' 
  | 'team-fla' | 'team-cor' | 'team-spfc' | 'team-pal' | 'team-gre' | 'team-cam' | 'team-mir'
  | 'custom-image';

export type ModalType = 'none' | 'rules' | 'about' | 'reset-points' | 'reset-wins' | 'reset-all';
