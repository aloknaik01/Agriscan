package com.agriscan.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;


@Component
public class RateLimiter {

    // analyze: 20 req/min per key
    private final Cache<String, AtomicInteger> analyzeCache = Caffeine.newBuilder()
        .expireAfterWrite(1, TimeUnit.MINUTES)
        .maximumSize(5_000)
        .build();

    // general: 200 req/min per key
    private final Cache<String, AtomicInteger> generalCache = Caffeine.newBuilder()
        .expireAfterWrite(1, TimeUnit.MINUTES)
        .maximumSize(10_000)
        .build();

    private static final int ANALYZE_LIMIT = 20;
    private static final int GENERAL_LIMIT = 200;

    /**
     * @return true if the request is within the allowed rate.
     */
    public boolean allowAnalyze(String key) {
        return allow(analyzeCache, key, ANALYZE_LIMIT);
    }

    public boolean allowGeneral(String key) {
        return allow(generalCache, key, GENERAL_LIMIT);
    }

    /** Resolve a stable key: prefer authenticated email, fall back to IP. */
    public String resolveKey(HttpServletRequest request, String authenticatedEmail) {
        if (authenticatedEmail != null && !authenticatedEmail.isBlank()) {
            return "user:" + authenticatedEmail;
        }
        return "ip:" + getClientIp(request);
    }

    // Internal 
    private boolean allow(Cache<String, AtomicInteger> cache, String key, int limit) {
        AtomicInteger counter = cache.get(key, k -> new AtomicInteger(0));
        return counter.incrementAndGet() <= limit;
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}