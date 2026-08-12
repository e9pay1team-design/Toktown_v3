import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CharacterConfig, ResidentProfile } from '../types';

export const DEFAULT_CHARACTER: CharacterConfig = {
  skin: 0,
  hairStyle: 0,
  hairColor: 0,
  outfit: 0,
  outfitColor: 0,
};

interface ProfileState {
  /** 온보딩(주민 등록) 완료 여부 */
  onboarded: boolean;
  profile: ResidentProfile | null;
  register: (nickname: string, character: CharacterConfig) => void;
  updateCharacter: (character: CharacterConfig) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      onboarded: false,
      profile: null,
      register: (nickname, character) =>
        set({
          onboarded: true,
          profile: {
            nickname,
            character,
            residentSince: new Date().toISOString().slice(0, 10),
          },
        }),
      updateCharacter: (character) =>
        set((s) => (s.profile ? { profile: { ...s.profile, character } } : s)),
      reset: () => set({ onboarded: false, profile: null }),
    }),
    { name: 'toktown:profile' },
  ),
);
