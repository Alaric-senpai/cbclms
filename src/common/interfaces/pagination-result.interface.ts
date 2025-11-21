import { PaginationMeta } from './pagination-meta.interface';

export interface PaginationResult<T> {
    data: T[];
    meta: PaginationMeta;
}
