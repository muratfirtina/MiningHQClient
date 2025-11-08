import { UserOperationClaim } from "./user-operation-claim";

export class ListUserOperationClaim {
  index: number;
  size: number;
  count: number;
  pages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: UserOperationClaim[];
}
