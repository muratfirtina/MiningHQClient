import { OperationClaim } from "./operation-claim";

export class ListOperationClaim {
  index: number;
  size: number;
  count: number;
  pages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: OperationClaim[];
}
