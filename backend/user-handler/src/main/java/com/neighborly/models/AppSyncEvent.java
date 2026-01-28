package com.neighborly.models;

import java.util.Map;

/**
 * Model representing an AWS AppSync Lambda resolver event.
 *
 * AppSync sends events in this format when invoking Lambda resolvers.
 */
public class AppSyncEvent {
    private String typeName;
    private String fieldName;
    private Map<String, Object> arguments;
    private Identity identity;
    private Map<String, Object> source;
    private Map<String, Object> request;
    private Map<String, Object> prev;
    private Map<String, Object> stash;

    /**
     * Identity information from Cognito or API Key auth.
     */
    public static class Identity {
        private String sub;
        private String issuer;
        private String username;
        private Map<String, Object> claims;
        private String sourceIp;
        private String defaultAuthStrategy;

        public String getSub() {
            return sub;
        }

        public void setSub(String sub) {
            this.sub = sub;
        }

        public String getIssuer() {
            return issuer;
        }

        public void setIssuer(String issuer) {
            this.issuer = issuer;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public Map<String, Object> getClaims() {
            return claims;
        }

        public void setClaims(Map<String, Object> claims) {
            this.claims = claims;
        }

        public String getSourceIp() {
            return sourceIp;
        }

        public void setSourceIp(String sourceIp) {
            this.sourceIp = sourceIp;
        }

        public String getDefaultAuthStrategy() {
            return defaultAuthStrategy;
        }

        public void setDefaultAuthStrategy(String defaultAuthStrategy) {
            this.defaultAuthStrategy = defaultAuthStrategy;
        }
    }

    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public Map<String, Object> getArguments() {
        return arguments;
    }

    public void setArguments(Map<String, Object> arguments) {
        this.arguments = arguments;
    }

    public Identity getIdentity() {
        return identity;
    }

    public void setIdentity(Identity identity) {
        this.identity = identity;
    }

    public Map<String, Object> getSource() {
        return source;
    }

    public void setSource(Map<String, Object> source) {
        this.source = source;
    }

    public Map<String, Object> getRequest() {
        return request;
    }

    public void setRequest(Map<String, Object> request) {
        this.request = request;
    }

    public Map<String, Object> getPrev() {
        return prev;
    }

    public void setPrev(Map<String, Object> prev) {
        this.prev = prev;
    }

    public Map<String, Object> getStash() {
        return stash;
    }

    public void setStash(Map<String, Object> stash) {
        this.stash = stash;
    }

    /**
     * Helper to get the authenticated user's ID (Cognito sub).
     */
    public String getUserId() {
        if (identity != null && identity.getSub() != null) {
            return identity.getSub();
        }
        return null;
    }
}
