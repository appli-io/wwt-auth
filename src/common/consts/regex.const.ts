// checks if a password has at least one uppercase letter and a number or special character
export const PASSWORD_REGEX = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

// checks if a string has only letters, numbers, spaces, apostrophes, dots and dashes
export const NAME_REGEX = /(^[\p{L}\d'\s\-]*$)/u; // Example: John Doe
export const SLUG_REGEX = /^[a-z\d]+(?:(|-|_)[a-z\d]+)*$/; // Example: my-slug-1
export const BCRYPT_HASH_OR_UNSET = /(UNSET|(\$2[abxy]?\$\d{1,2}\$[A-Za-z\d/]{53}))/; // Example: $2y$12$zJQ
