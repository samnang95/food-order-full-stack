import { LoyaltyProfileModel } from '../models/loyalty_profile_model';

const STORAGE_KEY = 'bitecraft_loyalty_profile';

export class LoyaltyLocalDataSource {
  getProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = {
          userId: 'guest',
          pointsBalance: 480,
          lifetimePoints: 1480,
          streakDays: 3,
          lastCheckInDate: null,
          pointsHistory: [
            {
              id: 'tx_3',
              title: 'Day 3 Streak Check-in Bonus',
              points: 50,
              type: 'earned',
              date: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: 'tx_2',
              title: 'Artisan Smash Burger Order #A9024',
              points: 120,
              type: 'earned',
              date: new Date(Date.now() - 172800000).toISOString(),
            },
            {
              id: 'tx_1',
              title: 'BiteCraft Welcome Club Bonus',
              points: 200,
              type: 'earned',
              date: new Date(Date.now() - 345600000).toISOString(),
            },
          ],
          redeemedVouchers: [],
        };
        this.saveProfile(initial);
        return LoyaltyProfileModel.fromJson(initial);
      }
      return LoyaltyProfileModel.fromJson(JSON.parse(raw));
    } catch (err) {
      console.error('Failed to load loyalty profile:', err);
      return LoyaltyProfileModel.fromJson(null);
    }
  }

  saveProfile(profileData) {
    try {
      const json = profileData instanceof Object && 'pointsBalance' in profileData
        ? LoyaltyProfileModel.toJson(profileData)
        : profileData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
    } catch (err) {
      console.error('Failed to save loyalty profile:', err);
    }
  }
}
