export interface QuarryModerator {
  id: string;
  userId: string;
  quarryId: string;
  createdDate: Date;
}

export interface CreateQuarryModerator {
  userId: string;
  quarryId: string;
}

export interface UserQuarry {
  id: string;
  name: string;
}

export interface UserQuarriesResponse {
  quarries: UserQuarry[];
}
