package com.agriscan.security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Component
public class TokenBlacklist {

    /** token → unix-epoch-second of expiry */
    private final Map<String, Long> revoked = new ConcurrentHashMap<>();

    /**
     * Revoke a token until its stated expiry time.
     *
     * @param token     raw JWT string
     * @param expiresAt the token's own expiry (from its "exp" claim)
     */
    public void revoke(String token, Instant expiresAt) {
        purgeExpired();
        revoked.put(token, expiresAt.getEpochSecond());
    }

    /**
     * @return true if the token has been explicitly revoked
     */
    public boolean isRevoked(String token) {
        Long expiresAt = revoked.get(token);
        if (expiresAt == null) return false;

        
        if (Instant.now().getEpochSecond() > expiresAt) {
            revoked.remove(token);
            return false;
        }
        return true;
    }

    
    private void purgeExpired() {
        long now = Instant.now().getEpochSecond();
        revoked.entrySet().removeIf(e -> e.getValue() < now);
    }
}