/**
 * Hashnode GraphQL queries and mutations for API v2.0
 */

// Queries
export const GET_USER_QUERY = `
  query GetUser($username: String!) {
    user(username: $username) {
      id
      name
      username
      profilePicture
      socialMediaLinks {
        website
        github
        twitter
        linkedin
      }
      publications(first: 10) {
        edges {
          node {
            id
            title
            displayTitle
            url
            about {
              markdown
              html
            }
            author {
              id
              name
              username
            }
            favicon
            headerColor
            preferences {
              logo
              darkMode {
                enabled
              }
              navbarItems {
                id
                type
                label
                url
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_PUBLICATION_QUERY = `
  query GetPublication($id: ObjectId!) {
    publication(id: $id) {
      id
      title
      displayTitle
      url
      about {
        markdown
        html
      }
      author {
        id
        name
        username
      }
      favicon
      headerColor
      metaTags
      preferences {
        logo
        darkMode {
          enabled
        }
        navbarItems {
          id
          type
          label
          url
        }
      }
    }
  }
`;

export const GET_PUBLICATION_SERIES_QUERY = `
  query GetPublicationSeries($publicationId: ObjectId!, $first: Int = 10) {
    publication(id: $publicationId) {
      series(first: $first) {
        edges {
          node {
            id
            name
            slug
            description {
              markdown
              html
            }
            coverImage
            posts {
              totalDocuments
            }
            createdAt
          }
        }
      }
    }
  }
`;

export const GET_POST_QUERY = `
  query GetPost($id: ObjectId!) {
    post(id: $id) {
      id
      title
      url
      slug
      content {
        markdown
        html
      }
      coverImage {
        url
        attribution
      }
      tags {
        id
        name
        slug
      }
      series {
        id
        name
        slug
      }
      publication {
        id
        title
        displayTitle
        url
      }
      seo {
        title
        description
      }
      ogMetaData {
        image
      }
      publishedAt
      updatedAt
    }
  }
`;

// Mutations
export const PUBLISH_POST_MUTATION = `
  mutation PublishPost($input: PublishPostInput!) {
    publishPost(input: $input) {
      post {
        id
        title
        url
        slug
        content {
          markdown
          html
        }
        coverImage {
          url
          attribution
        }
        tags {
          id
          name
          slug
        }
        series {
          id
          name
          slug
        }
        publication {
          id
          title
          displayTitle
          url
        }
        seo {
          title
          description
        }
        ogMetaData {
          image
        }
        publishedAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_POST_MUTATION = `
  mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(input: $input) {
      post {
        id
        title
        url
        slug
        content {
          markdown
          html
        }
        coverImage {
          url
          attribution
        }
        tags {
          id
          name
          slug
        }
        series {
          id
          name
          slug
        }
        publication {
          id
          title
          displayTitle
          url
        }
        seo {
          title
          description
        }
        ogMetaData {
          image
        }
        publishedAt
        updatedAt
      }
    }
  }
`;

export const REMOVE_POST_MUTATION = `
  mutation RemovePost($input: RemovePostInput!) {
    removePost(input: $input) {
      post {
        id
      }
    }
  }
`;

export const CREATE_SERIES_MUTATION = `
  mutation CreateSeries($input: CreateSeriesInput!) {
    createSeries(input: $input) {
      series {
        id
        name
        slug
        description {
          markdown
          html
        }
        coverImage
        posts {
          totalDocuments
        }
        createdAt
      }
    }
  }
`;

export const ADD_POST_TO_SERIES_MUTATION = `
  mutation AddPostToSeries($input: AddPostToSeriesInput!) {
    addPostToSeries(input: $input) {
      series {
        id
        name
        slug
        posts {
          totalDocuments
        }
      }
    }
  }
`;

export const REMOVE_POST_FROM_SERIES_MUTATION = `
  mutation RemovePostFromSeries($input: RemovePostFromSeriesInput!) {
    removePostFromSeries(input: $input) {
      series {
        id
        name
        slug
        posts {
          totalDocuments
        }
      }
    }
  }
`;

// Helper function to create tags input
export const createTagsInput = (tags: string[]) => {
  return tags.map((tag) => ({
    slug: tag.toLowerCase().replace(/[^a-z0-9]/g, ''),
    name: tag,
  }));
};

// Helper function to create publish post input
export const createPublishPostInput = (data: {
  title: string;
  subtitle?: string;
  publicationId: string;
  contentMarkdown: string;
  tags?: string[];
  coverImageUrl?: string;
  canonicalUrl?: string;
  seriesId?: string;
  enableTableOfContents?: boolean;
  isNewsletterActivated?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  publishAs?: string;
  disableComments?: boolean;
}) => {
  const input: {
    title: string;
    publicationId: string;
    contentMarkdown: string;
    excerpt?: string;
    tags?: Array<{ name: string; slug: string }>;
    seriesId?: string;
    subtitle?: string;
    slug?: string;
    coverImageOptions?: { coverImageURL: string };
    metaDescription?: string;
    ogImageUrl?: string;
    publishAs?: string;
    disableComments?: boolean;
    originalArticleURL?: string;
    settings?: {
      enableTableOfContent?: boolean;
      enableTableOfContents?: boolean;
      isDelisted?: boolean;
      isNewsletterActivated?: boolean;
    };
    metaTags?: {
      title?: string;
      description?: string;
      image?: string;
      ogImage?: string;
    };
  } = {
    title: data.title,
    publicationId: data.publicationId,
    contentMarkdown: data.contentMarkdown,
  };

  if (data.subtitle) {
    input.subtitle = data.subtitle;
  }

  if (data.tags && data.tags.length > 0) {
    input.tags = createTagsInput(data.tags);
  }

  if (data.coverImageUrl) {
    input.coverImageOptions = {
      coverImageURL: data.coverImageUrl,
    };
  }

  if (data.canonicalUrl) {
    input.originalArticleURL = data.canonicalUrl;
  }

  if (data.seriesId) {
    input.seriesId = data.seriesId;
  }

  if (data.publishAs) {
    input.publishAs = data.publishAs;
  }

  if (data.disableComments !== undefined) {
    input.disableComments = data.disableComments;
  }

  // Settings object
  if (
    data.enableTableOfContents !== undefined ||
    data.isNewsletterActivated !== undefined
  ) {
    input.settings = {};

    if (data.enableTableOfContents !== undefined) {
      input.settings.enableTableOfContents = data.enableTableOfContents;
    }

    if (data.isNewsletterActivated !== undefined) {
      input.settings.isNewsletterActivated = data.isNewsletterActivated;
    }
  }

  // Meta tags object
  if (data.metaTitle || data.metaDescription || data.ogImageUrl) {
    input.metaTags = {};

    if (data.metaTitle) {
      input.metaTags.title = data.metaTitle;
    }

    if (data.metaDescription) {
      input.metaTags.description = data.metaDescription;
    }

    if (data.ogImageUrl) {
      input.metaTags.image = data.ogImageUrl;
    }
  }

  return input;
};
