import { relations } from 'drizzle-orm/relations';
import {
  ssoProvidersInAuth,
  ssoDomainsInAuth,
  samlProvidersInAuth,
  usersInAuth,
  mfaFactorsInAuth,
  sessionsInAuth,
  refreshTokensInAuth,
  flowStateInAuth,
  samlRelayStatesInAuth,
  mfaAmrClaimsInAuth,
  identitiesInAuth,
  oneTimeTokensInAuth,
  mfaChallengesInAuth,
  oauthClientsInAuth,
  users,
  conversations,
  usertypes,
  messages,
  animals,
  animalPhotos,
  oauthAuthorizationsInAuth,
  oauthConsentsInAuth
} from './schema';

export const ssoDomainsInAuthRelations = relations(
  ssoDomainsInAuth,
  ({ one }) => ({
    ssoProvidersInAuth: one(ssoProvidersInAuth, {
      fields: [ssoDomainsInAuth.ssoProviderId],
      references: [ssoProvidersInAuth.id]
    })
  })
);

export const ssoProvidersInAuthRelations = relations(
  ssoProvidersInAuth,
  ({ many }) => ({
    ssoDomainsInAuths: many(ssoDomainsInAuth),
    samlProvidersInAuths: many(samlProvidersInAuth),
    samlRelayStatesInAuths: many(samlRelayStatesInAuth)
  })
);

export const samlProvidersInAuthRelations = relations(
  samlProvidersInAuth,
  ({ one }) => ({
    ssoProvidersInAuth: one(ssoProvidersInAuth, {
      fields: [samlProvidersInAuth.ssoProviderId],
      references: [ssoProvidersInAuth.id]
    })
  })
);

export const mfaFactorsInAuthRelations = relations(
  mfaFactorsInAuth,
  ({ one, many }) => ({
    usersInAuth: one(usersInAuth, {
      fields: [mfaFactorsInAuth.userId],
      references: [usersInAuth.id]
    }),
    mfaChallengesInAuths: many(mfaChallengesInAuth)
  })
);

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
  mfaFactorsInAuths: many(mfaFactorsInAuth),
  identitiesInAuths: many(identitiesInAuth),
  oneTimeTokensInAuths: many(oneTimeTokensInAuth),
  sessionsInAuths: many(sessionsInAuth),
  users: many(users),
  oauthAuthorizationsInAuths: many(oauthAuthorizationsInAuth),
  oauthConsentsInAuths: many(oauthConsentsInAuth)
}));

export const refreshTokensInAuthRelations = relations(
  refreshTokensInAuth,
  ({ one }) => ({
    sessionsInAuth: one(sessionsInAuth, {
      fields: [refreshTokensInAuth.sessionId],
      references: [sessionsInAuth.id]
    })
  })
);

export const sessionsInAuthRelations = relations(
  sessionsInAuth,
  ({ one, many }) => ({
    refreshTokensInAuths: many(refreshTokensInAuth),
    mfaAmrClaimsInAuths: many(mfaAmrClaimsInAuth),
    oauthClientsInAuth: one(oauthClientsInAuth, {
      fields: [sessionsInAuth.oauthClientId],
      references: [oauthClientsInAuth.id]
    }),
    usersInAuth: one(usersInAuth, {
      fields: [sessionsInAuth.userId],
      references: [usersInAuth.id]
    })
  })
);

export const samlRelayStatesInAuthRelations = relations(
  samlRelayStatesInAuth,
  ({ one }) => ({
    flowStateInAuth: one(flowStateInAuth, {
      fields: [samlRelayStatesInAuth.flowStateId],
      references: [flowStateInAuth.id]
    }),
    ssoProvidersInAuth: one(ssoProvidersInAuth, {
      fields: [samlRelayStatesInAuth.ssoProviderId],
      references: [ssoProvidersInAuth.id]
    })
  })
);

export const flowStateInAuthRelations = relations(
  flowStateInAuth,
  ({ many }) => ({
    samlRelayStatesInAuths: many(samlRelayStatesInAuth)
  })
);

export const mfaAmrClaimsInAuthRelations = relations(
  mfaAmrClaimsInAuth,
  ({ one }) => ({
    sessionsInAuth: one(sessionsInAuth, {
      fields: [mfaAmrClaimsInAuth.sessionId],
      references: [sessionsInAuth.id]
    })
  })
);

export const identitiesInAuthRelations = relations(
  identitiesInAuth,
  ({ one }) => ({
    usersInAuth: one(usersInAuth, {
      fields: [identitiesInAuth.userId],
      references: [usersInAuth.id]
    })
  })
);

export const oneTimeTokensInAuthRelations = relations(
  oneTimeTokensInAuth,
  ({ one }) => ({
    usersInAuth: one(usersInAuth, {
      fields: [oneTimeTokensInAuth.userId],
      references: [usersInAuth.id]
    })
  })
);

export const mfaChallengesInAuthRelations = relations(
  mfaChallengesInAuth,
  ({ one }) => ({
    mfaFactorsInAuth: one(mfaFactorsInAuth, {
      fields: [mfaChallengesInAuth.factorId],
      references: [mfaFactorsInAuth.id]
    })
  })
);

export const oauthClientsInAuthRelations = relations(
  oauthClientsInAuth,
  ({ many }) => ({
    sessionsInAuths: many(sessionsInAuth),
    oauthAuthorizationsInAuths: many(oauthAuthorizationsInAuth),
    oauthConsentsInAuths: many(oauthConsentsInAuth)
  })
);

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    user_adopterId: one(users, {
      fields: [conversations.adopterId],
      references: [users.userId],
      relationName: 'conversations_adopterId_users_userId'
    }),
    user_rehomerId: one(users, {
      fields: [conversations.rehomerId],
      references: [users.userId],
      relationName: 'conversations_rehomerId_users_userId'
    }),
    animal: one(animals, {
      fields: [conversations.animalId],
      references: [animals.animalId]
    }),
    messages: many(messages)
  })
);

export const usersRelations = relations(users, ({ one, many }) => ({
  conversations_adopterId: many(conversations, {
    relationName: 'conversations_adopterId_users_userId'
  }),
  conversations_rehomerId: many(conversations, {
    relationName: 'conversations_rehomerId_users_userId'
  }),
  usersInAuth: one(usersInAuth, {
    fields: [users.userId],
    references: [usersInAuth.id]
  }),
  usertype: one(usertypes, {
    fields: [users.userTypeId],
    references: [usertypes.userTypeId]
  }),
  messages: many(messages),
  animals: many(animals)
}));

export const usertypesRelations = relations(usertypes, ({ many }) => ({
  users: many(users)
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.senderId],
    references: [users.userId]
  }),
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.conversationId]
  })
}));

export const animalsRelations = relations(animals, ({ one, many }) => ({
  user: one(users, {
    fields: [animals.rehomerId],
    references: [users.userId]
  }),
  animalPhotos: many(animalPhotos)
}));

export const animalPhotosRelations = relations(animalPhotos, ({ one }) => ({
  animal: one(animals, {
    fields: [animalPhotos.animalId],
    references: [animals.animalId]
  })
}));

export const oauthAuthorizationsInAuthRelations = relations(
  oauthAuthorizationsInAuth,
  ({ one }) => ({
    oauthClientsInAuth: one(oauthClientsInAuth, {
      fields: [oauthAuthorizationsInAuth.clientId],
      references: [oauthClientsInAuth.id]
    }),
    usersInAuth: one(usersInAuth, {
      fields: [oauthAuthorizationsInAuth.userId],
      references: [usersInAuth.id]
    })
  })
);

export const oauthConsentsInAuthRelations = relations(
  oauthConsentsInAuth,
  ({ one }) => ({
    oauthClientsInAuth: one(oauthClientsInAuth, {
      fields: [oauthConsentsInAuth.clientId],
      references: [oauthClientsInAuth.id]
    }),
    usersInAuth: one(usersInAuth, {
      fields: [oauthConsentsInAuth.userId],
      references: [usersInAuth.id]
    })
  })
);
