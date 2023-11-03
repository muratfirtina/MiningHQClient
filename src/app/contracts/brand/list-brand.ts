import { Brand } from "./brand";

export class ListBrand {
    index: number;
    size: number;
    count: number;
    pages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    items: Brand[];
}