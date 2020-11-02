// https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
// $('dl > dt').map((index, item) => ({ id: $('> span', item).attr('id'), name: $(item).text() }))
// copy($('dl > dt').map((index, item) => ({ id: $('> span', item).attr('id'), name: $(item).text() })).toArray().map(i => `${i.id} = ${i.name},`).join('\n'))
export const enum HTTP_STATUS_CODE {
    'Continue' = 100,
    'Switching Protocols' = 101,
    'Processing (WebDAV; RFC 2518)' = 102,
    'Early Hints (RFC 8297)' = 103,
    
    'OK' = 200,
    'Created' = 201,
    'Accepted' = 202,
    'Non-Authoritative Information (since HTTP/1.1)' = 203,
    'No Content' = 204,
    'Reset Content' = 205,
    'Partial Content (RFC 7233)' = 206,
    'Multi-Status (WebDAV; RFC 4918)' = 207,
    'Already Reported (WebDAV; RFC 5842)' = 208,
    'IM Used (RFC 3229)' = 226,

    'Multiple Choices' = 300,
    'Moved Permanently' = 301,
    'Found (Previously "Moved temporarily")' = 302,
    'See Other (since HTTP/1.1)' = 303,
    'Not Modified (RFC 7232)' = 304,
    'Use Proxy (since HTTP/1.1)' = 305,
    'Switch Proxy' = 306,
    'Temporary Redirect (since HTTP/1.1)' = 307,
    'Permanent Redirect (RFC 7538)' = 308,

    'Bad Request' = 400,
    'Unauthorized (RFC 7235)' = 401,
    'Payment Required' = 402,
    'Forbidden' = 403,
    'Not Found' = 404,
    'Method Not Allowed' = 405,
    'Not Acceptable' = 406,
    'Proxy Authentication Required (RFC 7235)' = 407,
    'Request Timeout' = 408,
    'Conflict' = 409,
    'Gone' = 410,
    'Length Required' = 411,
    'Precondition Failed (RFC 7232)' = 412,
    'Payload Too Large (RFC 7231)' = 413,
    'URI Too Long (RFC 7231)' = 414,
    'Unsupported Media Type (RFC 7231)' = 415,
    'Range Not Satisfiable (RFC 7233)' = 416,
    'Expectation Failed' = 417,
    'Misdirected Request (RFC 7540)' = 421,
    'Unprocessable Entity (WebDAV; RFC 4918)' = 422,
    'Locked (WebDAV; RFC 4918)' = 423,
    'Failed Dependency (WebDAV; RFC 4918)' = 424,
    'Too Early (RFC 8470)' = 425,
    'Upgrade Required' = 426,
    'Precondition Required (RFC 6585)' = 428,
    'Too Many Requests (RFC 6585)' = 429,
    'Request Header Fields Too Large (RFC 6585)' = 431,
    'Unavailable For Legal Reasons (RFC 7725)' = 451,

    'Internal Server Error' = 500,
    'Not Implemented' = 501,
    'Bad Gateway' = 502,
    'Service Unavailable' = 503,
    'Gateway Timeout' = 504,
    'HTTP Version Not Supported' = 505,
    'Variant Also Negotiates (RFC 2295)' = 506,
    'Insufficient Storage (WebDAV; RFC 4918)' = 507,
    'Loop Detected (WebDAV; RFC 5842)' = 508,
    'Not Extended (RFC 2774)' = 510,
    'Network Authentication Required (RFC 6585)' = 511
}