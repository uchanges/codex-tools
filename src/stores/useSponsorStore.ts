import { create } from 'zustand';
import type { SponsorModuleState } from '../types/sponsor';

const state: SponsorModuleState = { sponsorModule: null };

// Keep persisted provider records readable without contacting the sponsor feed.
export const useSponsorStore = create(() => ({
  state,
  fetchState: async () => state,
}));
