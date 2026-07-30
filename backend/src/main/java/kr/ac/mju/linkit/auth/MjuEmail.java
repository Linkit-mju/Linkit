package kr.ac.mju.linkit.auth;

import java.util.Locale;
import java.util.regex.Pattern;

public final class MjuEmail {

    public static final String DOMAIN = "@mju.ac.kr";
    private static final Pattern PATTERN = Pattern.compile("^[^\\s@]+@mju\\.ac\\.kr$");

    private MjuEmail() {
    }

    public static String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    public static boolean isValid(String email) {
        return PATTERN.matcher(normalize(email)).matches();
    }
}
