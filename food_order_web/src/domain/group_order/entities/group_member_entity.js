/**
 * Domain entity representing a participant in a Group Order session.
 */
export class GroupMemberEntity {
  constructor({
    id = '',
    name = 'Guest Friend',
    avatar = '',
    color = '#f97316',
    isHost = false,
    joinedAt = new Date(),
  } = {}) {
    this.id = id || `member_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    this.name = name;
    this.avatar = avatar;
    this.color = color;
    this.isHost = Boolean(isHost);
    this.joinedAt = joinedAt instanceof Date ? joinedAt : new Date(joinedAt);
  }

  get initials() {
    if (!this.name) return '??';
    const parts = this.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}

export const MEMBER_AVATAR_COLORS = [
  '#f97316', // Orange
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#6366f1', // Indigo
];
