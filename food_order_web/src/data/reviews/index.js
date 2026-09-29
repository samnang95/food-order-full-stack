import { ReviewLocalDataSource } from './datasources/review_local_datasource';
import { ReviewRemoteDataSource } from './datasources/review_remote_datasource';
import { ReviewRepositoryImpl } from './repositories/review_repository_impl';

const reviewLocalDataSource = new ReviewLocalDataSource();
const reviewRemoteDataSource = new ReviewRemoteDataSource();
export const reviewRepository = new ReviewRepositoryImpl(reviewLocalDataSource, reviewRemoteDataSource);

export { ReviewModel } from './models/review_model';
export { ReviewLocalDataSource } from './datasources/review_local_datasource';
export { ReviewRemoteDataSource } from './datasources/review_remote_datasource';
export { ReviewRepositoryImpl } from './repositories/review_repository_impl';
