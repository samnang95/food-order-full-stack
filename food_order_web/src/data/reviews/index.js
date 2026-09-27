import { ReviewLocalDataSource } from './datasources/review_local_datasource';
import { ReviewRepositoryImpl } from './repositories/review_repository_impl';

const reviewLocalDataSource = new ReviewLocalDataSource();
export const reviewRepository = new ReviewRepositoryImpl(reviewLocalDataSource);

export { ReviewModel } from './models/review_model';
export { ReviewLocalDataSource } from './datasources/review_local_datasource';
export { ReviewRepositoryImpl } from './repositories/review_repository_impl';
