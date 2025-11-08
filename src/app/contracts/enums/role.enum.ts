export enum Role {
  Admin = 'Admin',
  Moderator = 'Moderator',
  HRAssistant = 'HRAssistant'
}

export const RoleDisplayNames: { [key in Role]: string } = {
  [Role.Admin]: 'Yönetici',
  [Role.Moderator]: 'Moderatör',
  [Role.HRAssistant]: 'İnsan Kaynakları Yardımcısı'
};
