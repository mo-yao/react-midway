import { BookEntity } from '../entity/book';
import { PickVO } from '../../../utils/vo.utils';

// eslint-disable-next-line prettier/prettier
export class BookVO extends PickVO(BookEntity, []) {}
