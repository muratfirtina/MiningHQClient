import { Job } from "./job";

export class ListJob {
    index: number;
    size: number;
    count: number;
    pages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    items: Job[];
    
}