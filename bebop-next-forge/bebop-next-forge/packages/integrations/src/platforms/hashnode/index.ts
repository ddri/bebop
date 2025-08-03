// Hashnode platform integration exports
export { HashnodeClient } from './client';
export { HashnodeAdapter } from './adapter';

export type {
  HashnodeCredentials,
  HashnodeConfig,
  HashnodePost,
  HashnodePublication,
  HashnodeSeries,
  HashnodeUser,
  PublishPostInput,
  UpdatePostInput,
  CreateSeriesInput,
  HashnodeResponse,
  PublishPostResponse,
  UpdatePostResponse,
  RemovePostResponse,
  CreateSeriesResponse,
  UserResponse,
  PublicationResponse,
} from './types';

export {
  HashnodeCredentialsSchema,
  HashnodeConfigSchema,
  HashnodePostInputSchema,
  HASHNODE_API_ENDPOINT,
  HASHNODE_RATE_LIMITS,
} from './types';

export {
  PUBLISH_POST_MUTATION,
  UPDATE_POST_MUTATION,
  REMOVE_POST_MUTATION,
  CREATE_SERIES_MUTATION,
  GET_USER_QUERY,
  GET_PUBLICATION_QUERY,
  GET_PUBLICATION_SERIES_QUERY,
  createPublishPostInput,
  createTagsInput,
} from './queries';
