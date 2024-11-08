const CHECK_INTERVAL_MILLISECS = 2000;
const AUTH_SESSION_TIMEOUT_MILLISECS = 1000;
const initialSession = getSession();

let timeout;

// Remove the timeout when unloading to avoid execution of the
// checkCookiesAndSetTimer when the page is already submitted
addEventListener("beforeunload", () => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = undefined;
  }
});

export function checkCookiesAndSetTimer(loginRestartUrl) {
  if (initialSession) {
    // We started with a session, so there is nothing to do, exit.
    return;
  }

  const session = getSession();
  const cookieRestart = getRestart();

  if (!session) {
    // The session is not present, check again later.
    timeout = setTimeout(
      () => checkCookiesAndSetTimer(loginRestartUrl),
      CHECK_INTERVAL_MILLISECS,
    );
  } else {
    // Redirect to the login restart URL. This can typically automatically login user due the SSO
    if (cookieRestart) {
      location.href = loginRestartUrl;
    }
  }
}

export function checkAuthSession(pageAuthSessionHash) {
  setTimeout(() => {
    const cookieAuthSessionHash = getKcAuthSessionHash();
    if (cookieAuthSessionHash && cookieAuthSessionHash !== pageAuthSessionHash) {
      location.reload();
    }
  }, AUTH_SESSION_TIMEOUT_MILLISECS);
}

function getKcAuthSessionHash() {
  return getCookieByName("KC_AUTH_SESSION_HASH");
}

function getSession() {
  return getCookieByName("KEYCLOAK_SESSION");
}

function getRestart(){
  return getCookieByName("KC_RESTART");
}

function getCookieByName(name) {
  if (!document.cookie) return null;
  for (const cookie of document.cookie.split(";")) {
    const parts = cookie.split("=").map((part) => part.trim());
    const key = parts[0];
    const value = parts[1] || "";
    if (key === name) {
      return value.startsWith('"') && value.endsWith('"')
        ? value.slice(1, -1)
        : value;
    }
  }
  return null;
}
