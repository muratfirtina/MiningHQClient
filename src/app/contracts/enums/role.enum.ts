// Legacy enum - kept for backward compatibility
export enum Role {
  Admin = 'Admin',
  Moderator = 'Moderator',
  HRAssistant = 'HRAssistant'
}

// System roles - use these constants instead of enum for new code
// This supports dynamic roles and operation claims from backend
export class SystemRoles {
  static readonly Admin = 'Admin';
  static readonly Moderator = 'Moderator';
  static readonly HRAssistant = 'HRAssistant';
}

// Export Role type as string union for flexibility
export type RoleType = string;

export const RoleDisplayNames: { [key: string]: string } = {
  'Admin': 'Yönetici',
  'Moderator': 'Moderatör',
  'HRAssistant': 'İnsan Kaynakları Yardımcısı'
};
