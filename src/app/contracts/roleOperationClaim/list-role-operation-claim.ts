import { RoleOperationClaim } from "./role-operation-claim";

export class ListRoleOperationClaim {
  index: number;
  size: number;
  count: number;
  pages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: RoleOperationClaim[];
}
