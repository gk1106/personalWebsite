package com.gk.portfolio.exception;

/**
 * Generic login failure. Deliberately used for both "unknown username" and
 * "wrong password" — the response must never reveal which one it was.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Invalid username or password");
    }
}
