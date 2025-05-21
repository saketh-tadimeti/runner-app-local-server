// Issues fresh tokens from the given refresh token.
//
// Error codes:
// 401 token or user_id invalid
// 400 payload incorrect
// 401 ERROR_CODE_UNAUTHENTICATED_INVALID_TOKEN
// 401 ERROR_CODE_UNAUTHENTICATED_TOKEN_MISSING
// 400 BAD REQUEST
// 500 INTERNAL SERVER ERROR
rpc Refresh(RefreshRequest) returns (RefreshResponse) {
option (google.api.http) = {
post: "/v1/token/refresh"
body: "\*"
};
}

    message RefreshRequest {
    // User ID
    string user_id = 1;
    // Ozone's refresh token. If empty, guest token is issued. If not empty, session is assumed to be an authenticated one.
    // Refresh token is validated and a new access token is issued.
    // This is only set for authenticated sessions.
    string refresh_token = 2;
    // Domains for which the cookies is to be fetched. If empty, no cookies are returned.
    repeated string cookie_domains = 3;
    // Unique identifier for the client application.
    string client_id = 4;
    // Current access_token of the user session. This is used to validate and refresh a guest user session.
    // To refresh a guest session, access token is validated and if valid, a rotated refresh token with a new access token is issued.
    // This is only set for guest sessions.
    string guest_access_token = 5;

}

message RefreshResponse {
// Ozone rotated refresh token. On every refresh request, the refresh token gets rotated and returned.
string refresh_token = 1;
// Ozone access token.
string access_token = 2;
// Legacy Authorization code used for backward compatibility. This info will be controlled via feature flag on the service side
string authorization = 3;
// Map of [domain, cookie] for each domain. This holds the cookie generated for each domain in map. At the time of refresh,
// the api responds with a fresh cookie which can be used by the client for its subsequent calls. This can be utilised
// to avoid redirects and handshakes at the client level.
map<string, SetCookie> cookies = 4;
// Expiry time of the access token in seconds.
uint32 expires_at = 5;
// Since protobuf does not allow a map[string][]string, adding an Object of type []string to store the array
// of cookie values.
message SetCookie {
repeated string value = 1;
}
}

// Error codes:
// 404 NOT FOUND
// 400 BAD REQUEST
// 401 user is not allowed to login
// 500 INTERNAL SERVER ERROR
rpc SendVerificationCode(SendVerificationCodeRequest) returns (SendVerificationCodeResponse) {
option (google.api.http) = {
post: "/v1/accounts/sendVerificationCode"
body: "\*"
};
}

// Signs a user out of the given session. User will have to sign in by authenticating again.
//
// Error codes:
// 401 ERROR_CODE_UNAUTHENTICATED_INVALID_TOKEN
// 400 BAD REQUEST
// 500 INTERNAL SERVER ERROR
rpc SignOut(SignOutRequest) returns (SignOutResponse) {
option (google.api.http) = {
post: "/v1/accounts/signOut"
body: "\*"
};
}

message SendVerificationCodeRequest {
// The phone number to send the verification code to in E.164 format.
// One of phone_number or user_id or email MUST be set
string phone_number = 1;

    // The user_id to login
    string user_id = 2;

    // Android only. Used by Google Play Services to identify the app for
    // auto-retrieval.  The Android app's signature hash for Google Play
    // Service's SMS Retriever API.
    string app_signature_hash = 3;

    // Device ID. This device id will be used for device binding and hence should be unique per user.
    // Note that the device id, however, will not be constant across app reinstalls on the same device as per
    // android and IOS guidelines.
    // https://developer.apple.com/documentation/uikit/uidevice/1620059-identifierforvendor
    // https://developer.android.com/training/articles/user-data-ids
    string device_id = 4;

    // The Email ID to send the verification code to support email based login and sign up.
    // One of phone_number or user_id or email MUST be set
    // Standard email validation is done on the email ID.
    string email = 5;

    // This is the client id of the app which is requesting the verification code for the user.
    // Unique identifier for the client application.
    string client_id = 6;

    // Login mechanism used to determine the mode of authentication.
    // If not specified, the default login mechanism will be determined based on the request.
    // This is useful when the client wants to explicitly specify the login mechanism.
    LoginMechanism login_mechanism = 7;

    // LoginMechanism is the enum for the different login mechanisms.
    // This is used to determine the login flow.
    enum LoginMechanism {
        // Default action.
        LOGIN_MECHANISM_INVALID = 0;
        LOGIN_MECHANISM_SMS = 1;
        LOGIN_MECHANISM_FEDERATED_IDP = 2;
        LOGIN_MECHANISM_EMAIL = 3;
        LOGIN_MECHANISM_WHATSAPP = 4;
        LOGIN_MECHANISM_IVRS = 5;
    }
    // DeviceContext represents device related context. Device context uniquely identifies a device through device_id and
    // contains relevant attributes associated with the device. Device context also contains information on the app version
    // installed on the device.
    // The device_id remains constant for multiple requests made from the same device.
    // Device context is useful if a functionality depends on particular device(experiment), device_type(user experience -
    // iOS/Android/Web) or version of the app(feature whitelisting).
    DeviceContext device_context = 8;

    // LocationContext represents spatial context. Context could be granular at a lat lng level or
    // more coarse defined at a city level, or a combination of both.
    // LocationContext is used to execute location specific login in BL and domains.
    LocationContext location_context = 9;

    // This is used to determine the country code of the phone number.
    // This is useful when the client wants to explicitly specify the country code.
    // If not specified, the default country code will be India.
    string country_code = 10;

}

message SendVerificationCodeResponse {
// The user_id of the user (useful when login happened with phone_number)
string user_id = 1;

    // Encrypted session information. This can be used in signInWithPhoneNumber
    // to authenticate the phone number.
    string session_info = 2;
    // tid is a unique id created for a certain ttl when a user logs into the app.
    // This field contains the refreshed tid in case of the expiry of the previous tid sent in the request headers.
    string tid = 3;
    // Session ID.sid is a unique id representing continous activity by a customer on a particular device.
    string sid = 4;
    // Unique device id for the device where an user is accessing the app/website from. This id doesn't change for the
    // device. The lifecycle of the device_id is independent of App installs. The device_id will not change across
    // reinstalls of the App.
    // Note: Device IDs should not be used to serve Ads as recommended by
    // Android(https://support.google.com/googleplay/android-developer/answer/6048248?hl=en) and
    // iOS(https://developer.apple.com/documentation/adsupport/asidentifiermanager/1614151-advertisingidentifier)
    string device_id = 5;

}

message SignOutRequest{
// User ID
string user_id = 1;
// Refresh token to identify the session to be revoked. This is only used in DE app and is maintained for backward compatibility.
// Deprecated field. use login_id instead
string refresh_token = 2[deprecated = true];
// This login ID serves to recognize the session that needs to be terminated. It is distinct from the SID that tracks user activity and hence a different naming convention to avoid any confusion.
// The validity of this login identifier extends only for the duration of a user's active session.
string login_id = 3;
// This is the sign out type which can be used to sign out from all sessions or just the current session. By default, current session is signed out.
SignOutType signout_type = 4;
// Sign out type denotes the type of logout user wants to perform.
enum SignOutType {
SIGN_OUT_TYPE_INVALID = 0;
// Sign out from a session - this can be the current session or a targeted session.
SIGN_OUT_TYPE_SINGLE = 1;
// Sign out from all sessions
SIGN_OUT_TYPE_ALL = 2;
}
// Ozone's access token used to authenticate the request. This is used in case of token based authentication. Current Cookie based authentication should be able to validate the session at the ALB level.
string access_token = 5;
// Client ID of the app which is requesting the sign out. Details of the public key to validate the token will be fetched against this client ID.
string client_id = 6;
}

message SignOutResponse{
}

rpc SignInWithOTP(SignInWithOTPRequest) returns (SignInWithOTPResponse) {
option (google.api.http) = {
post: "/v1/accounts/signInWithOTP"
body: "\*"
};
}

message SignInWithOTPRequest {
// The user id of the user.
string user_id = 1 [(google.api.field_behavior) = REQUIRED];
// The Session info of the user.
// Session info is a unique identifier for the current session of the user.
// Session info is used to prevent replay attacks.
// Session info is generated by the accounts service and is returned in the response of the sendVerificationCode API(https://github.com/swiggy-private/protorepo/blob/master/seceng/ozone/v1/accounts_api.proto#L80).
string session_info = 2 [(google.api.field_behavior) = REQUIRED];
// The otp entered by the user.
string otp = 3 [(google.api.field_behavior) = REQUIRED];

// Unique identifier for the client application.
string client_id = 4 [(google.api.field_behavior) = REQUIRED];

// The login mechanism used by the client to login.
identity_provider_gateway.idpshared.v1.LoginMechanism login_mechanism = 5 [(google.api.field_behavior) = REQUIRED];

}

message SignInWithOTPResponse {
// Identity Platform Access token for the authenticated user.
// The client application can use this token to authorize or identify the user.
// This token is a JWT token and contains user claims.
string access_token = 1 [json_name = "access_token"];
// Refresh token for the authenticated user. This is a random string issued to a user to refresh the access token.
// This token is used by the client for refreshing the access token (JWT) once the access token has expired.
string refresh_token = 2 [json_name = "refresh_token"];
// Whether the authenticated new user is created by this request.
bool is_new_user = 3 [json_name = "is_new_user"];
}
