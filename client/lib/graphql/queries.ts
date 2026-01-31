import { gql } from '@apollo/client';

export const GET_BUILDING = gql`
  query GetBuilding($buildingId: ID!) {
    getBuilding(buildingId: $buildingId) {
      buildingId
      name
      address
      memberCount
    }
  }
`;

export const LIST_CHANNELS = gql`
  query ListChannels($buildingId: ID!) {
    listChannels(buildingId: $buildingId) {
      channelId
      buildingId
      name
      description
      createdTime
    }
  }
`;

export const LIST_MESSAGES = gql`
  query ListMessages($channelId: ID!, $limit: Int, $nextToken: String) {
    listMessages(channelId: $channelId, limit: $limit, nextToken: $nextToken) {
      items {
        messageId
        channelId
        userId
        content
        mediaUrl
        sentTime
      }
      nextToken
    }
  }
`;

export const GET_USER = gql`
  query GetUser($userId: ID!) {
    getUser(userId: $userId) {
      userId
      email
      username
      aboutMe
      joinedBuildings
      createdTime
    }
  }
`;

export const GET_USERS_BY_IDS = gql`
  query GetUsersByIds($userIds: [ID!]!) {
    getUsersByIds(userIds: $userIds) {
      userId
      email
      username
    }
  }
`;
