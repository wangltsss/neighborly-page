import { gql } from '@apollo/client';

/**
 * Mutation to create a new message in a channel
 */
export const CREATE_MESSAGE = gql`
  mutation CreateMessage($channelId: ID!, $content: String!, $mediaUrl: String) {
    createMessage(channelId: $channelId, content: $content, mediaUrl: $mediaUrl) {
      messageId
      channelId
      userId
      content
      mediaUrl
      sentTime
    }
  }
`;

/**
 * Mutation to update last read timestamp for a channel
 */
export const UPDATE_LAST_READ = gql`
  mutation UpdateLastRead($channelId: ID!, $lastReadTime: AWSDateTime!) {
    updateLastRead(channelId: $channelId, lastReadTime: $lastReadTime)
  }
`;

/**
 * Mutation to update user profile
 */
export const UPDATE_USER = gql`
  mutation UpdateUser($username: String, $aboutMe: String) {
    updateUser(username: $username, aboutMe: $aboutMe) {
      userId
      email
      username
      aboutMe
      joinedBuildings
      createdTime
    }
  }
`;
