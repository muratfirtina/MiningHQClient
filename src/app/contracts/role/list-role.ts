import { Role } from "./role";

export class ListRole {
  index: number;
  size: number;
  count: number;
  pages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: Role[];
}
