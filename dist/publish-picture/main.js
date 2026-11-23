"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/punycode.js/punycode.js
var require_punycode = __commonJS({
  "node_modules/punycode.js/punycode.js"(exports2, module2) {
    "use strict";
    var maxInt = 2147483647;
    var base = 36;
    var tMin = 1;
    var tMax = 26;
    var skew = 38;
    var damp = 700;
    var initialBias = 72;
    var initialN = 128;
    var delimiter = "-";
    var regexPunycode = /^xn--/;
    var regexNonASCII = /[^\0-\x7F]/;
    var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
    var errors = {
      "overflow": "Overflow: input needs wider integers to process",
      "not-basic": "Illegal input >= 0x80 (not a basic code point)",
      "invalid-input": "Invalid input"
    };
    var baseMinusTMin = base - tMin;
    var floor = Math.floor;
    var stringFromCharCode = String.fromCharCode;
    function error(type) {
      throw new RangeError(errors[type]);
    }
    function map(array, callback) {
      const result = [];
      let length = array.length;
      while (length--) {
        result[length] = callback(array[length]);
      }
      return result;
    }
    function mapDomain(domain, callback) {
      const parts = domain.split("@");
      let result = "";
      if (parts.length > 1) {
        result = parts[0] + "@";
        domain = parts[1];
      }
      domain = domain.replace(regexSeparators, ".");
      const labels = domain.split(".");
      const encoded = map(labels, callback).join(".");
      return result + encoded;
    }
    function ucs2decode(string) {
      const output = [];
      let counter = 0;
      const length = string.length;
      while (counter < length) {
        const value = string.charCodeAt(counter++);
        if (value >= 55296 && value <= 56319 && counter < length) {
          const extra = string.charCodeAt(counter++);
          if ((extra & 64512) == 56320) {
            output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
          } else {
            output.push(value);
            counter--;
          }
        } else {
          output.push(value);
        }
      }
      return output;
    }
    var ucs2encode = (codePoints) => String.fromCodePoint(...codePoints);
    var basicToDigit = function(codePoint) {
      if (codePoint >= 48 && codePoint < 58) {
        return 26 + (codePoint - 48);
      }
      if (codePoint >= 65 && codePoint < 91) {
        return codePoint - 65;
      }
      if (codePoint >= 97 && codePoint < 123) {
        return codePoint - 97;
      }
      return base;
    };
    var digitToBasic = function(digit, flag) {
      return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
    };
    var adapt = function(delta, numPoints, firstTime) {
      let k = 0;
      delta = firstTime ? floor(delta / damp) : delta >> 1;
      delta += floor(delta / numPoints);
      for (; delta > baseMinusTMin * tMax >> 1; k += base) {
        delta = floor(delta / baseMinusTMin);
      }
      return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
    };
    var decode3 = function(input) {
      const output = [];
      const inputLength = input.length;
      let i2 = 0;
      let n = initialN;
      let bias = initialBias;
      let basic = input.lastIndexOf(delimiter);
      if (basic < 0) {
        basic = 0;
      }
      for (let j = 0; j < basic; ++j) {
        if (input.charCodeAt(j) >= 128) {
          error("not-basic");
        }
        output.push(input.charCodeAt(j));
      }
      for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
        const oldi = i2;
        for (let w = 1, k = base; ; k += base) {
          if (index >= inputLength) {
            error("invalid-input");
          }
          const digit = basicToDigit(input.charCodeAt(index++));
          if (digit >= base) {
            error("invalid-input");
          }
          if (digit > floor((maxInt - i2) / w)) {
            error("overflow");
          }
          i2 += digit * w;
          const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
          if (digit < t) {
            break;
          }
          const baseMinusT = base - t;
          if (w > floor(maxInt / baseMinusT)) {
            error("overflow");
          }
          w *= baseMinusT;
        }
        const out = output.length + 1;
        bias = adapt(i2 - oldi, out, oldi == 0);
        if (floor(i2 / out) > maxInt - n) {
          error("overflow");
        }
        n += floor(i2 / out);
        i2 %= out;
        output.splice(i2++, 0, n);
      }
      return String.fromCodePoint(...output);
    };
    var encode2 = function(input) {
      const output = [];
      input = ucs2decode(input);
      const inputLength = input.length;
      let n = initialN;
      let delta = 0;
      let bias = initialBias;
      for (const currentValue of input) {
        if (currentValue < 128) {
          output.push(stringFromCharCode(currentValue));
        }
      }
      const basicLength = output.length;
      let handledCPCount = basicLength;
      if (basicLength) {
        output.push(delimiter);
      }
      while (handledCPCount < inputLength) {
        let m = maxInt;
        for (const currentValue of input) {
          if (currentValue >= n && currentValue < m) {
            m = currentValue;
          }
        }
        const handledCPCountPlusOne = handledCPCount + 1;
        if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
          error("overflow");
        }
        delta += (m - n) * handledCPCountPlusOne;
        n = m;
        for (const currentValue of input) {
          if (currentValue < n && ++delta > maxInt) {
            error("overflow");
          }
          if (currentValue === n) {
            let q = delta;
            for (let k = base; ; k += base) {
              const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
              if (q < t) {
                break;
              }
              const qMinusT = q - t;
              const baseMinusT = base - t;
              output.push(
                stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
              );
              q = floor(qMinusT / baseMinusT);
            }
            output.push(stringFromCharCode(digitToBasic(q, 0)));
            bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
            delta = 0;
            ++handledCPCount;
          }
        }
        ++delta;
        ++n;
      }
      return output.join("");
    };
    var toUnicode = function(input) {
      return mapDomain(input, function(string) {
        return regexPunycode.test(string) ? decode3(string.slice(4).toLowerCase()) : string;
      });
    };
    var toASCII = function(input) {
      return mapDomain(input, function(string) {
        return regexNonASCII.test(string) ? "xn--" + encode2(string) : string;
      });
    };
    var punycode2 = {
      /**
       * A string representing the current Punycode.js version number.
       * @memberOf punycode
       * @type String
       */
      "version": "2.3.1",
      /**
       * An object of methods to convert from JavaScript's internal character
       * representation (UCS-2) to Unicode code points, and back.
       * @see <https://mathiasbynens.be/notes/javascript-encoding>
       * @memberOf punycode
       * @type Object
       */
      "ucs2": {
        "decode": ucs2decode,
        "encode": ucs2encode
      },
      "decode": decode3,
      "encode": encode2,
      "toASCII": toASCII,
      "toUnicode": toUnicode
    };
    module2.exports = punycode2;
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => PublishPicture
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// node_modules/mdurl/index.mjs
var mdurl_exports = {};
__export(mdurl_exports, {
  decode: () => decode_default,
  encode: () => encode_default,
  format: () => format,
  parse: () => parse_default
});

// node_modules/mdurl/lib/decode.mjs
var decodeCache = {};
function getDecodeCache(exclude) {
  let cache = decodeCache[exclude];
  if (cache) {
    return cache;
  }
  cache = decodeCache[exclude] = [];
  for (let i2 = 0; i2 < 128; i2++) {
    const ch = String.fromCharCode(i2);
    cache.push(ch);
  }
  for (let i2 = 0; i2 < exclude.length; i2++) {
    const ch = exclude.charCodeAt(i2);
    cache[ch] = "%" + ("0" + ch.toString(16).toUpperCase()).slice(-2);
  }
  return cache;
}
function decode(string, exclude) {
  if (typeof exclude !== "string") {
    exclude = decode.defaultChars;
  }
  const cache = getDecodeCache(exclude);
  return string.replace(/(%[a-f0-9]{2})+/gi, function(seq) {
    let result = "";
    for (let i2 = 0, l = seq.length; i2 < l; i2 += 3) {
      const b1 = parseInt(seq.slice(i2 + 1, i2 + 3), 16);
      if (b1 < 128) {
        result += cache[b1];
        continue;
      }
      if ((b1 & 224) === 192 && i2 + 3 < l) {
        const b22 = parseInt(seq.slice(i2 + 4, i2 + 6), 16);
        if ((b22 & 192) === 128) {
          const chr = b1 << 6 & 1984 | b22 & 63;
          if (chr < 128) {
            result += "\uFFFD\uFFFD";
          } else {
            result += String.fromCharCode(chr);
          }
          i2 += 3;
          continue;
        }
      }
      if ((b1 & 240) === 224 && i2 + 6 < l) {
        const b22 = parseInt(seq.slice(i2 + 4, i2 + 6), 16);
        const b3 = parseInt(seq.slice(i2 + 7, i2 + 9), 16);
        if ((b22 & 192) === 128 && (b3 & 192) === 128) {
          const chr = b1 << 12 & 61440 | b22 << 6 & 4032 | b3 & 63;
          if (chr < 2048 || chr >= 55296 && chr <= 57343) {
            result += "\uFFFD\uFFFD\uFFFD";
          } else {
            result += String.fromCharCode(chr);
          }
          i2 += 6;
          continue;
        }
      }
      if ((b1 & 248) === 240 && i2 + 9 < l) {
        const b22 = parseInt(seq.slice(i2 + 4, i2 + 6), 16);
        const b3 = parseInt(seq.slice(i2 + 7, i2 + 9), 16);
        const b42 = parseInt(seq.slice(i2 + 10, i2 + 12), 16);
        if ((b22 & 192) === 128 && (b3 & 192) === 128 && (b42 & 192) === 128) {
          let chr = b1 << 18 & 1835008 | b22 << 12 & 258048 | b3 << 6 & 4032 | b42 & 63;
          if (chr < 65536 || chr > 1114111) {
            result += "\uFFFD\uFFFD\uFFFD\uFFFD";
          } else {
            chr -= 65536;
            result += String.fromCharCode(55296 + (chr >> 10), 56320 + (chr & 1023));
          }
          i2 += 9;
          continue;
        }
      }
      result += "\uFFFD";
    }
    return result;
  });
}
decode.defaultChars = ";/?:@&=+$,#";
decode.componentChars = "";
var decode_default = decode;

// node_modules/mdurl/lib/encode.mjs
var encodeCache = {};
function getEncodeCache(exclude) {
  let cache = encodeCache[exclude];
  if (cache) {
    return cache;
  }
  cache = encodeCache[exclude] = [];
  for (let i2 = 0; i2 < 128; i2++) {
    const ch = String.fromCharCode(i2);
    if (/^[0-9a-z]$/i.test(ch)) {
      cache.push(ch);
    } else {
      cache.push("%" + ("0" + i2.toString(16).toUpperCase()).slice(-2));
    }
  }
  for (let i2 = 0; i2 < exclude.length; i2++) {
    cache[exclude.charCodeAt(i2)] = exclude[i2];
  }
  return cache;
}
function encode(string, exclude, keepEscaped) {
  if (typeof exclude !== "string") {
    keepEscaped = exclude;
    exclude = encode.defaultChars;
  }
  if (typeof keepEscaped === "undefined") {
    keepEscaped = true;
  }
  const cache = getEncodeCache(exclude);
  let result = "";
  for (let i2 = 0, l = string.length; i2 < l; i2++) {
    const code2 = string.charCodeAt(i2);
    if (keepEscaped && code2 === 37 && i2 + 2 < l) {
      if (/^[0-9a-f]{2}$/i.test(string.slice(i2 + 1, i2 + 3))) {
        result += string.slice(i2, i2 + 3);
        i2 += 2;
        continue;
      }
    }
    if (code2 < 128) {
      result += cache[code2];
      continue;
    }
    if (code2 >= 55296 && code2 <= 57343) {
      if (code2 >= 55296 && code2 <= 56319 && i2 + 1 < l) {
        const nextCode = string.charCodeAt(i2 + 1);
        if (nextCode >= 56320 && nextCode <= 57343) {
          result += encodeURIComponent(string[i2] + string[i2 + 1]);
          i2++;
          continue;
        }
      }
      result += "%EF%BF%BD";
      continue;
    }
    result += encodeURIComponent(string[i2]);
  }
  return result;
}
encode.defaultChars = ";/?:@&=+$,-_.!~*'()#";
encode.componentChars = "-_.!~*'()";
var encode_default = encode;

// node_modules/mdurl/lib/format.mjs
function format(url) {
  let result = "";
  result += url.protocol || "";
  result += url.slashes ? "//" : "";
  result += url.auth ? url.auth + "@" : "";
  if (url.hostname && url.hostname.indexOf(":") !== -1) {
    result += "[" + url.hostname + "]";
  } else {
    result += url.hostname || "";
  }
  result += url.port ? ":" + url.port : "";
  result += url.pathname || "";
  result += url.search || "";
  result += url.hash || "";
  return result;
}

// node_modules/mdurl/lib/parse.mjs
function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.pathname = null;
}
var protocolPattern = /^([a-z0-9.+-]+:)/i;
var portPattern = /:[0-9]*$/;
var simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;
var delims = ["<", ">", '"', "`", " ", "\r", "\n", "	"];
var unwise = ["{", "}", "|", "\\", "^", "`"].concat(delims);
var autoEscape = ["'"].concat(unwise);
var nonHostChars = ["%", "/", "?", ";", "#"].concat(autoEscape);
var hostEndingChars = ["/", "?", "#"];
var hostnameMaxLen = 255;
var hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/;
var hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
var hostlessProtocol = {
  javascript: true,
  "javascript:": true
};
var slashedProtocol = {
  http: true,
  https: true,
  ftp: true,
  gopher: true,
  file: true,
  "http:": true,
  "https:": true,
  "ftp:": true,
  "gopher:": true,
  "file:": true
};
function urlParse(url, slashesDenoteHost) {
  if (url && url instanceof Url) return url;
  const u = new Url();
  u.parse(url, slashesDenoteHost);
  return u;
}
Url.prototype.parse = function(url, slashesDenoteHost) {
  let lowerProto, hec, slashes;
  let rest = url;
  rest = rest.trim();
  if (!slashesDenoteHost && url.split("#").length === 1) {
    const simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
      }
      return this;
    }
  }
  let proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    lowerProto = proto.toLowerCase();
    this.protocol = proto;
    rest = rest.substr(proto.length);
  }
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    slashes = rest.substr(0, 2) === "//";
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }
  if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {
    let hostEnd = -1;
    for (let i2 = 0; i2 < hostEndingChars.length; i2++) {
      hec = rest.indexOf(hostEndingChars[i2]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
        hostEnd = hec;
      }
    }
    let auth, atSign;
    if (hostEnd === -1) {
      atSign = rest.lastIndexOf("@");
    } else {
      atSign = rest.lastIndexOf("@", hostEnd);
    }
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = auth;
    }
    hostEnd = -1;
    for (let i2 = 0; i2 < nonHostChars.length; i2++) {
      hec = rest.indexOf(nonHostChars[i2]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
        hostEnd = hec;
      }
    }
    if (hostEnd === -1) {
      hostEnd = rest.length;
    }
    if (rest[hostEnd - 1] === ":") {
      hostEnd--;
    }
    const host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);
    this.parseHost(host);
    this.hostname = this.hostname || "";
    const ipv6Hostname = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
    if (!ipv6Hostname) {
      const hostparts = this.hostname.split(/\./);
      for (let i2 = 0, l = hostparts.length; i2 < l; i2++) {
        const part = hostparts[i2];
        if (!part) {
          continue;
        }
        if (!part.match(hostnamePartPattern)) {
          let newpart = "";
          for (let j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              newpart += "x";
            } else {
              newpart += part[j];
            }
          }
          if (!newpart.match(hostnamePartPattern)) {
            const validParts = hostparts.slice(0, i2);
            const notHost = hostparts.slice(i2 + 1);
            const bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = notHost.join(".") + rest;
            }
            this.hostname = validParts.join(".");
            break;
          }
        }
      }
    }
    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = "";
    }
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
    }
  }
  const hash = rest.indexOf("#");
  if (hash !== -1) {
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  const qm = rest.indexOf("?");
  if (qm !== -1) {
    this.search = rest.substr(qm);
    rest = rest.slice(0, qm);
  }
  if (rest) {
    this.pathname = rest;
  }
  if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
    this.pathname = "";
  }
  return this;
};
Url.prototype.parseHost = function(host) {
  let port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ":") {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) {
    this.hostname = host;
  }
};
var parse_default = urlParse;

// node_modules/uc.micro/build/index.mjs
var build_exports = {};
__export(build_exports, {
  Any: () => Any,
  Cc: () => Cc,
  Cf: () => Cf,
  P: () => P,
  S: () => S,
  Z: () => Z
});
var Any = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var Cc = /[\0-\x1F\x7F-\x9F]/;
var Cf = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/;
var P = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B4E\u1B4F\u1B5A-\u1B60\u1B7D-\u1B7F\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDD6E\uDEAD\uDED0\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9\uDFD4\uDFD5\uDFD7\uDFD8]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09\uDFE1]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDD6D-\uDD6F\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD839\uDDFF|\uD83A[\uDD5E\uDD5F]/;
var S = /[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C1\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2429\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E5\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD803[\uDD8E\uDD8F\uDED1-\uDED8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDC00-\uDCEF\uDCFA-\uDCFC\uDD00-\uDEB3\uDEBA-\uDED0\uDEE0-\uDEF0\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED8\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0-\uDCBB\uDCC0\uDCC1\uDCD0-\uDCD8\uDD00-\uDE57\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE8A\uDE8E-\uDEC6\uDEC8\uDECD-\uDEDC\uDEDF-\uDEEA\uDEEF-\uDEF8\uDF00-\uDF92\uDF94-\uDFEF\uDFFA]/;
var Z = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;

// node_modules/entities/dist/decode-codepoint.js
var c1 = [
  8364,
  0,
  8218,
  402,
  8222,
  8230,
  8224,
  8225,
  710,
  8240,
  352,
  8249,
  338,
  0,
  381,
  0,
  0,
  8216,
  8217,
  8220,
  8221,
  8226,
  8211,
  8212,
  732,
  8482,
  353,
  8250,
  339,
  0,
  382,
  376
];
function isInvalidCodePoint(codePoint) {
  return codePoint === 0 || codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111;
}
function replaceCodePoint(codePoint) {
  if (isInvalidCodePoint(codePoint)) {
    return 65533;
  }
  if (codePoint >= 128 && codePoint <= 159) {
    return c1[codePoint - 128] || codePoint;
  }
  return codePoint;
}
function codePointToString(codePoint) {
  return codePoint - 1 >>> 0 < 127 || codePoint - 160 >>> 0 < 55136 ? String.fromCharCode(codePoint) : String.fromCodePoint(replaceCodePoint(codePoint));
}

// node_modules/entities/dist/internal/decode-shared.js
var BASE91_INVERSE = /* @__PURE__ */ (() => {
  const table2 = new Uint8Array(127);
  let code2 = 0;
  for (let char = 33; char <= 126; char++) {
    if (char !== 34 && char !== 36 && char !== 92) {
      table2[char] = code2++;
    }
  }
  return table2;
})();
function decodeTrieDict(input, resultLength, atomCount, dict1AtomCount, ngramCount, dictSize) {
  const base = 91;
  const inputLength = input.length;
  const twoCharBias = dictSize * (base - 1);
  let pos = 0;
  const readSlotCode = () => {
    const c12 = BASE91_INVERSE[input.charCodeAt(pos++)];
    return c12 < dictSize ? c12 : c12 * base - twoCharBias + BASE91_INVERSE[input.charCodeAt(pos++)];
  };
  const dict2AtomCount = atomCount - dict1AtomCount;
  const slotCount = atomCount + ngramCount;
  const single = new Int32Array(slotCount);
  single.fill(-1, dict1AtomCount, dictSize);
  single.fill(-1, dictSize + dict2AtomCount, slotCount);
  const start = new Int32Array(slotCount);
  const length = new Int32Array(slotCount);
  function decodeDelta(count, off) {
    let previous = 0;
    let slot = off;
    const end = off + count;
    while (slot < end) {
      const code2 = BASE91_INVERSE[input.charCodeAt(pos++)];
      if (code2 < 89) {
        previous += code2;
        single[slot++] = previous;
      } else if (code2 === 89) {
        let runLength = BASE91_INVERSE[input.charCodeAt(pos++)] + 2;
        while (runLength--)
          single[slot++] = ++previous;
      } else {
        const next = BASE91_INVERSE[input.charCodeAt(pos++)];
        previous += 89 + // eslint-disable-next-line unicorn/prefer-minimal-ternary -- branches read a different number of side-effecting input bytes
        (next < 90 ? next * base + BASE91_INVERSE[input.charCodeAt(pos++)] : BASE91_INVERSE[input.charCodeAt(pos++)] * 8281 + BASE91_INVERSE[input.charCodeAt(pos++)] * base + BASE91_INVERSE[input.charCodeAt(pos++)]);
        single[slot++] = previous;
      }
    }
  }
  decodeDelta(dict1AtomCount, 0);
  decodeDelta(dict2AtomCount, dictSize);
  const references = new Int32Array(ngramCount * 2);
  let poolSize = 0;
  let ngramIndex = 0;
  function readNgramReferences(count, startSlot) {
    for (let index = 0; index < count; index++) {
      const slot = startSlot + index;
      const a = readSlotCode();
      const b = readSlotCode();
      references[ngramIndex * 2] = a;
      references[ngramIndex * 2 + 1] = b;
      ngramIndex += 1;
      start[slot] = poolSize;
      const entryLength = (single[a] < 0 ? length[a] : 1) + (single[b] < 0 ? length[b] : 1);
      length[slot] = entryLength;
      poolSize += entryLength;
    }
  }
  readNgramReferences(ngramCount - dictSize + dict1AtomCount, dictSize + dict2AtomCount);
  readNgramReferences(dictSize - dict1AtomCount, dict1AtomCount);
  const pool = new Uint16Array(poolSize);
  let write = 0;
  for (let index = 0; index < ngramIndex; index++) {
    for (let half = 0; half < 2; half++) {
      const source = references[index * 2 + half];
      const value = single[source];
      if (value < 0) {
        let read = start[source];
        const readEnd = read + length[source];
        while (read < readEnd)
          pool[write++] = pool[read++];
      } else {
        pool[write++] = value;
      }
    }
  }
  const out = new Uint16Array(resultLength);
  let outIndex = 0;
  while (pos < inputLength) {
    let slot = BASE91_INVERSE[input.charCodeAt(pos++)];
    if (slot >= dictSize) {
      slot = slot * base - twoCharBias + BASE91_INVERSE[input.charCodeAt(pos++)];
    }
    const value = single[slot];
    if (value < 0) {
      let read = start[slot];
      const readEnd = read + length[slot];
      while (read < readEnd)
        out[outIndex++] = pool[read++];
    } else {
      out[outIndex++] = value;
    }
  }
  return out;
}

// node_modules/entities/dist/generated/decode-data-html.js
var htmlDecodeTree = /* @__PURE__ */ decodeTrieDict("!}.&u%}'&}*'~!6*)%&,~!J~!J~%L~y<~!R,~~%Lu~~#GD~~#|)1#%}^%}2%+#.##%##%}&%##%'#%##&%#%#'%#&#%#&#'#%%#&#%##%#)%''%&%#%#'%#%%#%%}%%%#%#&(23#%%#&-%0%('1#(##%#'##+%'*.:1}#%#6-+(%'%%#%%%}#L'2351&('%}&/N'(0(/*-%(%%}#'+&T%7.2}#&%&#%#36/5##%&%%#&#%%#))2%%##%&&'0~!#*+&'%1~!%).'3q?&%'1~!.##%6(~!+%%%(Gw'rT~!E#<nA%#jZ~!H%(~!42##~!*31&~!G%U~#)5~#`3~!J~!Z~%]~%Y~%C~!q~!u~#kz~%#~!6'~!D~!U~!?~#T~!c%~!G#'~%7|~!G~!J~!G&~#pb~(Df}#%}*&}#%##%##%##&#-}&'#'&%#.++}%mI,#,@&(}*%}*'%&##&#%##%}&0}#.},U},%}+%}&%}#%##&}B%(}(%}+%)})%##%#&}&%##%&}<%}>%#%&}*%}(%}9%}/%})%}*%}*%}?&}&%}3%}&*#%})%#%#)}#&#-#+*%E%%'%'#%}#*V##&##I}#&&##%&%#&&Qf%%))w/0+&%#(#.%-''''++++7}>%4'',##1,#%#&%##&#'##&#*#9)%&%}#*}%,#+P(%A&%#'&##wSD',9E00#y#@}(+}&%&>~!#~!X}#*}(&&}(&}(,%}%&#+&}#&}I%#%}%)#(},'%#*}4%%#%}(''}#/##(##),%-##%%)#&}(.}&%#&}%%}*&#%},&&}&%}#%*'#%})%}D&}&%}-&}6&#&}-,%}#%})-(~+`~,=?~I9'9%~!,#%})%})%}@%}?%}(~!?~#<~#pP~#BG~#=1#%K+~#?#~%;)~#A~#mF1~#A'~'X%'~#lR~#N~'N~#r~#m#-~#i'?%#'%~#B%##%,%#~#_%#0%~#]732~,w~2+#:&#%&'0%&>%}#>##F+)#%&&#(+_}4&}-%}(&}@&}O7Fdf0@+/v4}&WU##&/0#&'('B#%}.%}'+#%}#%%&#&%#%##+#&#)#6#'#.},%}c%},%#%##%&#&%#&~#>'*-.%##%##%}#%%}%'~#)D1}#%*&~#_%%'(~#S2%'.}#~#=##*'*-%}&'%'##&&~'E%.#&~#M4}%%##&'%#~#O1##%&#'+~#<B%##%%'%+~#;#@%}#&%#&&%#(~#H1}'%'##&&~#?A}&'~#D#%32}'&&&&~#[}'(#%}'~#;C})&}%%#%~#=&%,3}%'(#%%~#^'#&&)#%'~#Y%-~#d-%'~#^%%&#&&&}#~#b~2t*&'~&(~&@~0%~e~3}%*''0})&}+~!9##-}#%-hD*)1fC#%/&/fB#40~!+#)*4~!+~!K'&:~!/*7~!.#~!H~!L':~%x&~!H#~!*~%1~!I#~!+A~#p'~!F~~#-#~,,(~.Z~!V~%;'B'mq-W~!N~%I%#&&#&}#%},%%}'%}+X#%}#&}(%}'%}<%}#%}%%'}'%}:~![)9@~%>~#UA%-%##&~!C%~!-.9:~!1~!-^2/:a~!y,D*J#-5)/4~%23,~#G~!L1~!0X3`~!2+~!!0-~&E~!W~!o,>Y&]~%cZx_&~#O*9#A#'#+I'%#)~!0B*-5A+-((F&*M#)(-7-5+'-3a5Vi~!Y~!?+[)%3),ERHm~!+:D,VG.+)?fB%%*(%)'(#&80%1'8`K8?`+'Z#&O&'H5#*9)A%%5&3))0%39+.*7#()&&*=4@**L)<'_&*+..;(#*+)./&0#3)%')-8(4ixD(&.}%,('aI:,)%,k2231T)I'#/-W7,/'Q#.'Y24+h')37</31&83##&0#),H(?'&?/1##%#&&#%''-%&&&#(&''&#.-'%#%%(,')*'&#&#'##%(%(#%('#&##%%%%('%#%#%%#%#&%##h>w+v<ayvyvcg.uuhKr}g/v|g>u9i[~>g5uI~=RvdwEg;v/g;uk!!TTSx]@RT!U!#!@VBRUU!'UTe-d0c`e&gSdicedFcrdTaqb.kYcAohdYd@a3e+d}dMdtd.aJ#bqcK`dle/e.e'dwdPdodddjbEb}ogd^ofdpduc6j?l%d{drdqc)d7bacOdQ%T#Y)X.sR[yH>6Vyv3[xwLu>vo'!*.[yBacahoj>6Rew3[xqdZa#!a&#^(X-[yG>6Vyu3[xvg3sEr|g.u/Ri9db0T#^(Xa)!-[y;>6Vylg4wKs{JwNZt3@3r=c4Z([xlg;wKt!cpq's@v7A'*a(a+!-a#[y<3Dt?3Dt'>6Vym3[xmg9rxsNJwLZt4~?r?db1T#`-!(Xa,!0[yS>6Vz%NuQs.g4wKtnJwNZtS@3r>c4Z([y%g;wKtrdga8!a(!#&T*Y-Xa#!a0<or[yc3Dtq>6Vz43[y3JwNZtf@3s!Ju}!%Dti:pm3c_%X#tjB5pkd6q!r]u?voC'*-a.a2!0a&a+[yI3DtI3Ds~3DtH>6Vyw3[xx;:s#~<5pKJwNZtE@3r~d`a)!a2T#a.(!+U.X1[yT3Dt`3Dtv>6Vz&3[y&g9rxwzcxstPu.<rAJwLZtT~?r@dZa%!a.&^*Za(/Reu[ya>6Vz23[y1g3sEr}wkg{NuQRg{ci(U#5@b`~,cg#U(2WnH5wugcRh7dX#T(Y,a'Ta!!a,[yZ<]mj>6Vz,3[y+Pv#5ReZKu+=,%!H}7ABwkaS?Rh:BcW(X#<]mrj:ubv/ARekdg%!(!a.*Ta(Y.X1!#sP>Rl*Dt6[y>>6Vyo3Wf*jOvuumvuRgRJuq*!:9<B@bX~3jVv&v@s@5Re[d/rQt{uAvo&a&a*)a2!,0Wf!3Dt0=Bs'>6Re}3[xy~<5s%JwJZt1~Gs)c;&!#2sJkNuXvzq7rxu,Re8dka4!a8(aEZ+a@Y.X1Xa)[yd=Bs(3DtP>6Vz53[y4cX#X&Re:avRe9~<5s&JwJZtQ~Gs*i^rzvdRg+Jv{%!2sbB@bX}kdga,!Za?&^*T1/!a'Dt+[y6>6Vyf3Wf%g/u;s4hGu6?Rh-JvZ,!c%#&RoX54Rivj7uyvf8RgTKvZB%*!2sGh<vu5Rgq<=C::9bb~#dZ#T&Ta6Y.X*Dt>[y93Wf)coZ(T,6VyifluvRgC@95@B@bX~/hFu34cC#T,k/unq8w8Q5RkUklwQuzunq8w8Q5Rk8d/rJu?v8w9)-&!a0a;a&aIWejg3sEr/h1s<DtDJvyZqY5aws3Jvy!&Wei~Hr1:au5@Bag>23E~5c:Z&bX};kKv?w&unuVu5Rjc;>bs)#~@:Rh.=ay<a]C;b`}Vd6s/t{uAvoaxa()!a,a7%-a#a2Dt,[yF2Wo[>6Vyt3[xuNuPRi&NuPwpi#RoWh?vf8Ri%Jv]!%Ri:KvxD!.'2WeAjZu`q9rxu,Re7woeAg-unLq(qA_/*2Wg_g3u5q^9:4E}/jTrxrzv=Wkkd~0UX#^^Xa-a1a5T&a=U1a'*aEa]!a*aPaA-adok[y54Rn>;:p3~Dp5g9rpsFNvZqjg3uJp4~<5p0Pw;5qlJwNZt*@3p1Pw:5p/Ou!5p2JvG'!6Vye=<qnJvh_[xhg3v,Rh3kOwOw-sDuev/Re^dha[a%!%!a+#Ta7)-5TaCaO!aka!a)sf[yb2>Rl!9ARiq5E}Qg=ucRkBE|oJrJ_@Wk~@Wk{JrJ_@Wk|@WkyJrJ_@Wk}@WkzJvO_[y2g-vMRmiKuYC!)&>Ri;>Ri<@3RkNc](X#@9Rk=g5vuRmhKvDB!+'=]meg3u4Rmgd)#Y'Vz3CARmfd`a+!%T'!+#Ta1Ta6TaM-sTDt9[yA9sYd'%Y#s[[xpj:ueunaXRgEjRq,v-vuqdd2'`#6Rev<32@5>:2<E}5xIo9a*X#Y(;5RePJvD_g>vyRgNj8w)v8<wggs:RgXiZt|vjx,hSq3ah!-(~@:Ro/Ou!5RhWj^v(pyw8unRhUdx-UY#^Ua.a3a70!)%UX1TaDa)'omRiRRhE[y:3Dsz=Br,>6Vyj3[xkg6ruwjcqsrPw;5r*Ku]D'Zt-@3r(~?r.i[vwv]dU1a--U#`a4(g/vsRhPOu!5RhLj:rmu9Wo!~@:wdh@g/vsRiTjXuvvNr}:RhBj^v(pyw8unRn]dz1UYa'a+^Y(!aETZalaRY.Ta?a4[yDJw1!#qLsW>6Vyrfzq-pLflpwRe|Js>%!Dt@3Dt&Jvy_[xs~HrnjMuwpsw'RecKu+D#'!t<~Grl~?rjg5u-x,gwp{ah!-(~@:Rg~Ou!5Rh'jXuvvNr}:Rh#cW#X/c;&!#2sLi[v7u7RgpJv)(!iLrxu,Re6j7v@s@5Se[e7d`aW!Za(a`T.a#!a3!&aDa-!9)Dt_=6s+3[x~~DR|h~DS6avhGun5RkZj3w)v-]mkKunB!&*]kb97R|i<ARk<c:Z(6Vy}Juh'!wziMRoS:F|vkLuauJv5vtvQRh1d='T+Y#VyO~DR|jcF#T'7R|g97R|kJv3'!ay<Rj,Jvh&!:ReXcsa6*a+#a#_aIRf9aLRf?c,Z&Rf5Rf7c.Z&Rf;Rf>cQ#%T'p-Rf8Rf=ct#%'(*!,p,Rf4p+Rf6Rf:Rf<d~'Ua%U*^UYa(!a,-!#a4YaTalaEX0a8a<Weo3Dt/3Dsx=Br93Wen~Dr;~<5p<JwNZt2@3p=Pw:5p;Ou!5r3c7&!#:p>3Ds}KvGB)_6Vyk2sM=<r7x'eovA(!hFu1ARf}cV#X&@r5j6rvwQa^Rf3c=Za'wkghJv__g;unRggA53B9=b^}%j6uduo5Jq;!(hIv%2Re`Ou4ARe_e%a#^^^Xa&!a*a2!&a6YaP!*ad!#a:aE/5Rn?[y@>6Vyp;:pE~DrY~<5pBJwNZt8@3pCh=rt3rWPw:5pAJup_[xoNuPpF9c!#'45pD5ARn)d8#X'X*3@rU72s]h>v<<sSjJpqvewOJq/(!hNw'5ReBk0s2u3w/w'5ReE5@Jq.!a+JQ!&WeU23d(#Y&RjG5]jBk!u7w&u0udARjEe#+^^^Ub#!a2/a`Z(agT1!a-a;|@TaG!aS[yV=Re~fow'RguNuPRe?bz#'>RoUWeL>:Cbb|?JwPZtVg6ruRmzJvD'!6Vz(g/vmRh~Jvy_[y(g9voRgyx*cy(#2>Ri2B9b]~9kIw9u7rluJu3Rg]dI#a%UY'@=p%CAx.gQZ&RhwwygtRm{x5g_Z'+ABqR9Woa=Bp&dV#^*Xa'!&@o{g4v]Rk;Jv{!%Rk[wkkiA5RkiwwfUB=x,fUuqC&*!>RfTg8v0RfV~ARfSd;rJsAuAv9wR'ae+/aO!a@aza/a#[yQ@Wg!2Wemg3sEr0JvB_g>uvReWg2v+Re=KupB_+[y!2AbY~-~Hr2AJwD!(h<~El>h<~El?Kun@+_:9b`}Kg-v/Ri3g;vtwyk_9]k_d=&T#*U.6qh@Ab`|K9:H|CJv[!&3Dtex'fDwC%!Rf[9WlMd[(^X,!a%Z06Vz!@WgBg=v~Rgvg,QRe@awd,#Y+jTv|Q~EfWj]uNr|~FRfXdy#Y&^Ua%!aO.!(a)Ua;=!a@aKap!a-,a!Ta]a[rSa]p?[y82sK=Bq~;:p:~<5p8Pw:5p7d'#Y'Wf(;RnRi[u4w&RgJJvG'!6Vyh=<r#ijuuv/sIKuYD'ZtG@3p9~Gr&d2#`(g<vtRgFj`u5w&rqpxRf2CJuY!+:wfnTOu!5Rg}jNs1ucv&RfwJvA!&3@q|BDcC#T,k/unq8w8Q5RkTklwQuzunq8w8Q5Rk9dga#!a'!a=#a0!:+Tb*b@aO.a4!aba8aFJv^}?!VyR~Dr<g;u%Rn.~<5p[x'e`wNZtR@3p]Pw:5pZhNvjBp.woe_g5u-r4JwF!%DtO3:ooc7&!#:p^3DtpLuGw(!+%)Dtk6Vz#2sd=<r8d'#Y([y#<x3gJt`w@!)%}MRiowzikRij=]ilxAf3,U(#B2Rf#g0v-Rm[ck{`U#]giKv3>)!&6Ri154s,KuGB_%@r68r:dJ|t`#X(9<E|u2@H|rx3gJu?w'!+'1Nu7Reg4=H~+9<wxgY95Rm]xLggZ-`(X}U2:Ri4h<uOawRmsJv__5@bb{jbV~3dka#a'a]!,#a+U=a>b6a3b%!/aKa/)!arwve^VyJ;:pR~DpTg3uJpS~<5pOPw;5qmPw:5pNOu!5pQJvG'!6Vyx=<qoJvA!{~Jup!%@qk7Rn/KvyD!}''[xz;>wkh'?Rh,x8gyt`w5D!&),(SgyccRgztJ@3pPB5p#d'(Y#<]mmifubw&RgoJvE&!82s^JvF&!8Rf,ADb]~;x=h'rNu]vK!,%'*0RnORh)4Rh*AqQg-vaRnNg;wHwkh'ba~4cE#Ta*x3gctyw@'!+%RnFRnD<4Rn@hFvK5RnCxWg[#`&a0Ua()`1Rm75Rg[c]%X#qi8Rg^NvdRj>BwzgZauwji7Rm6A4wgg]d1#&(*,.0a#Rm;Rm<Rm=Rm>Rm?Rm@RmARmBe%#^^^Xaea?aC/b+(,!a+a#!a/!>a&Ta<aKbD!2wphBRnk[yPw}hE|.=Br-3Dtm>6Vy~g6urRf.x,hPrNav!%'RnqRo%Ro#Nu;q[Pw;5r+JwNZtM@3r)d'#Y'Weh;xChL#`&RnmRnoKu}>%(!Rne~Bs-;2wjcussJv+'!aYSO}6@B<5?ba~8LrNvj!.%*ROwungw~ng~:9;Ri^>wtnig;wHRnixDh@|(UZ.x1h@|)!#:2<H|*xHn]#-UX'3Ro)z=iT}6ARns=Bwsn_wpnaRncw]aR(#UXa&Ua*a/=]iPd'#Y&Ro'WnXf{QRm2hNvj]nZd`'T~&1`{|`#9b]{}c:'!#Wl{>@=be}]?cl{{U#:5Abb}Jds#^YaF!a*b4a#a3aPa>&Tb!bH!*a_!Eau?/a&RjY<]gj>6Vz*;:pe~DrZg,QRj1JwNZtX@wihspcJvZ&!VyX9WmOJu|!|N2WmHJvh&!]ht~Bpbcn&T(!#RmQ<s7Nu;padH#X'`+WmJ@>RmKCARhnKup=!)&Wf+:RhqNuPpf9c!#'45pd5AwghpARn(Ls@w!%,)!RmP@Wfe<E|IJva!&WmNg8vsRmLd`*.`#Y'Xa!axRn*]hrA8Rhug5s@rXg8u!RmMd8#X'X*3@rV72smdI*#UY&RmICARho~GsgxVgd)Ta'U-Y&Xa!T#RnEWnA@Wffg1uDRi0hFvK5RnBxGnG&#`%owp)@wsf+bX}Ze-*1!a*^^^Ua|!#a.aq&Ya2!a>.a6!a:aO`aJDtL[y`@Wg#>6Vz12@wzoYRoZNuPRi!NuPRhzg=ucRi,@=b`{Yg=ucRi-ACJvB!&Sh[ebSh]ebi`wUuFRm4Jw2_[y0JvB!.<Ju(!&SoG}6Shd}6<Ju(!&SoH}6She}6Kur@._g5vHRieJvx!{L2G{Kx6gd'T#?Rh82Wi5cZ#X(g1w)Rm5dW-Y(Ta#!a)!#aYa=wnfE=su2>>bU{0j9udv:<svj8uQv-7RgHdE%#^'sq9sp=>Bb_{TJv`!&g/r|snj6v(us5d,#Y(56H}[978H}]Jw5!&g1rushJvB!+j;v{u5?zDhd}6}bj;v{u5?zDhe}6}ce*#`(^^^a[aea!=!a6a*aoXb1a.!aAbL!b>,b'aL!aV@Wf|2Wlg3[y/JwNZt^@3piPw:5pgJunZou3@rsJva&!Vy_g<v~Rm#JvG'!6Vz0=<r{Ju{%!:pj@WfsiXuJu3Rm:JvZ&!WfA~Bph@c4Z&Dtwax5rubx(#:awRk1@d,#Y&RfjRfid1#,Y(@Wfp2Wlrg5s@ryKu[@!,'=]ig9wlk?Rk>g5u-rqJvy'!@9RkQcH(T#=>Ri~@<wkj(Wj(KuZB*!&<7rw@9RkRcH(T#=>Ri}@<wkj)Wj)dg(Ta2Xa9X#`-!a*CARhg@@=I}d9x;c~#X%so=<sj>2@@=aybb}XjWv0Q~EfEj3vLv;<d,#Y(56H}`978H}_dgaPaFa'a/!#a3Y0a_a;a|!1(a7-[yE3[xt;:pJNvZrrg3uJrvJwNZt=@3pIh=rt3rxPw:5pGOu!5rpJvG'!6Vys=<rz@c4Z&Dt(ax5rtJvZ!&~BpH@wsfNg-vaRlNci*U#=<wei<F}a5@Jq.!a*JQ!%@qZ23d(#Y&RjH5]jCk!u7w&u0udARjFd/prq=tyvpaEa(a:.!a1aZ(@@=I}:9wpd%=<sX55w_h}@@=I{t=ay<aU@@=I}T=ay<2@@=I})?C9:9au@9Cb]}DP~=x-fAZ(2Wl1=ay<aU@@=I}>5@d##Y+jTv|vV~EfFj]uNpn~FRfGdgaK!Z2&!a8a-Tb({E!acTbM*!a(DtY[yYd'%Y#sl[y*hHvh>Re5x2c{Z}.j4uCvcawRiMd+#X+_x&d!},<5RkX;2Hzw@x,gavfB-!{CcF&T#Roe;RodwWbBg5urRgaKvHC*_6Vz+<4opieuew&Rmq@d]&Y)X,T#X0Rh}<BqP=4qS9:ReMg/ujReNJw0!/<Jui%!bd{kawwnemRelAxUa?a3#*.&UX(Ya+a/RhvRnQ<o}9Wmtd-#Y&RgSRmw9;Rmxay=Rmyg-vaRmuxEhSrNu,v-voC!%(aR.a(a7+1Ro1>Ro5CE{A9b]{@;5x#eO{:g;urRi+KrNA!%(Ro3>Ro79;Ri_Ku@>{;&!x%gX|{KunA_+g5QRj/g3u5Rj#g>uERj%wio/xRhS&!,!#^1U}wba{8>>@=be}qC@:D5ba{7Ku+A&!}x?ba}t>>@=be}se(aA^^^Uat!b0#{pa+awUazbGa#aLb9bgaWac'a5TbS=Br!d1#`%scp_Jvl!#rT>Re0JvX&!VyN=H{Fcm#U&:pY=ReaJv2&!]h0=]nUJvG'!6Vy|=<r%JrM_=]h2@Wlud'#)U'Wf'b]{i=]h/Jvh!&~BpWg=v]RnMx+ny#'Nu;pVwjnu=]nwxJnx,T#`&Reqwjnt=]nvieu9vrRjLLuYwP(#+!th@wih5pX~Gr'g5v/Rh4KunA'!-CARnP@wwiN:Rm_9x'cvw>!|l=<saKvAA!0&3@q}>w^e1bp#&Re2Re3BDx7gH#T|f5H|eKuZ>!%(:qNAH{]Jv6!+3B2B9=b^{X<5<B92:E{ZLvhwA(a;a%!igQuyRmad+#Y}m@3Rh5d8#X'X*:AqUAHzmaxwbh<aXRnVcF}RT#Nw&cj#U(BWnug/vsRntdka)(a3+.Zb7aYYan1!bVa@Xa}[y^@b[{G=H{+hFu73Rj&Pv#5ReQcK%T#sig1v{Rj'Ku+D#'!t]~Grm~?rkKuMB!01d5#`'Vy.ta3Dtu~Hroc8#'{^45s85AwZbP&!#Rn!wghxWn#KvEA!)&2RlA2RlBx:h|#(T,=]j09Wobz>x]z/@awRoTd+#Y(az]hFhCrm4d,#Y+jTv|Q~EfMj]uNr|~FRfOdCa!Xa9_X#@<plJvf!%b`{(9;Rgwc;.!#2x7cw#T|UDb]|T5Ju={(!=@E{&Jv)&!Ab`{'awJvf!~*>>@=be{#KuY>!+&4Ezyi[ugv&RjIdea+T)#UXa&T-T&a!Rh9auRmW=]kLg5vuRn+g3u4Rn-Ow6ARn,hHus5xNk?#UX(U~)/g8v0RkD~AwkkF?Ri.OuNBwkkA?Ri/d|a2`a*^UYa.!aBTZaTa'Xa;!(!2!-a#b2[yC>6Vyq3[xr2Wi?g1rusVh%s?DtF~<5rbJs;%!DtBfswKtCj[uvuSsEu3RgVx3o:u+wN'*Zt;@3rd~Grh~?rfg8w)Lq)qE&-a%!>bI|`jWv0vV~EfCjTv|vV~Ef@j]uNpn~FRfBcK#T']gWNu7x,k7q4ai(0!hHv8<RhmkMu9vrsBuev/RhlCJvB!,g<v{wchh~@:Rhji[vrv{wchi~@:RhkdS&a5UY#Ta!RgPwwiI5BwciI~@:Rh`x'iJvj'!5]iJPu8Bwch]~@:Rhach)U#h3rp]gLh@t|Ax,hTq3ah!-(~@:Ro0Ou!5RhXj^v(pyw8unRhVd|)`,^UYas!a?/a2Z'a^Ta{Tb7Ta(a#!a,Wf&9sZ3DtAadamov=Bqt3[xig8vsRm~>waiL2b`{QJv*_Ouv2qgj<v]v2BqfdR'X*X#Y-@3qr~Gqv~?p6hHv-]glPup5Lq+q?_%*b_{qF{n9b^{rOu4ARhpKvCD!+&~Bqp:5Dbb}nwoiKl&unuTuBv]v+ueunaXRf0=Jvh!0nKufu8v1w&w7q%w&uHrz:Rgnj5w,uxDJq/(!hNw'5ReCk0s2u3w/w'5ReFd>Za&!*UaA=<wkgsRnSJv^!%Refifw3vyRgOKu_B'!,<]gkiiu:w&Rh<=C@a^<B57@2F{[<B5@aW:=3away9A5aW=<B=C@a^<B57@2F{Ie-#`(^^^bCara.b8aza6!/bZ,!adTbnTbOb+aFaS!aAT9@Wf~2Wli3Dtl2@d,#Y&RfnRfmJwJZtN~GqyJva&!VyMg<v~Rm%iXuJu3Rm9Jv[_=]ih9wlkDRkCd1#`(@Wg>2Wls3cH#T(@<Rj*=>Ri|b~'#23s9h<~El.d'#Y&Dtxi^rzvdRl#d*#U%(o|B2s`hJwSaxRmDKv4B&!1:Rmdd5#`'Vx}to~Hq{x'f1v3(!BA5ba|bJv_&!Wfug1v]ReIdO+U/Y#&G}-8wze=Rh{g1v]ReHg/uQRf/by#)ibQwERl/cH#T(@<Rj+=>Ri{cNu+vlax-!(#a0qa9<Rii2;;bU{H;x<i=&X#Rk`<4wwi=C9H~8xAI(Y#<azRi@45wXI<B9;5bb~7dL(X#Xa(+!aL6Vy{g5QqOau:5au2@ay547EzbxOcU(UX-T#Ta#:Cbb|A?wjh/b_|SOw6ARgtihr}u7Rhy<d1#T)X1@@=I|~=ay<2@@=aybb}Sj3vLv;<d,#Y(56H}A978H}@dGpvs@uAu`vcw9*!aFa+ai%(b!aXa8.a?a[ozWey=sU2@G}Nch&U#Rf_WexKu+D#'!t:~Gr`~?r^j]uNr|~FRg*j^psurwJt|RmcKv)@&!)7Rkv~Br[@wxfO:Rl3co#U'6Rezj_q#vIuavjRltwzeyh@vr5JqD0!>aY?C9:9au@9Cb]}9cl#U*5;5<H||jbuus1ucv&Rfvg1v~d/pppzqFr^a--a~!aMat1(hFv;Wiz@@=Izoj5uuv-7Rix~Cw`fk2WlVcZ#X,k)u3vWs@u2]ktg;wEx'fBq(_2Wg/jTv|vV~EfoJv]!15x'hzqG!(P~EfU~CRl_j6v(us5x4i-#T(2WmZ?C2F|d>Kq<aj1!*jTqIsBv=Wl`~Cw`fi2WlWj`v0u*~>RlR=c>Z,k#u3vWs@u2]kr<c1Z+jTqIsBv=Wla~Cw`fm2WlXdmb3!a{(arZa`bkTa%TbQTa-a9+c'!aM!/[yL=Bqug.w'RifhFvyDRj.g>vgwyk^9]k^Jv3_@WfbAARkhJw2_[x|JvB_wkoIRoKwkoJRoLd'(Y#<]gm=<9<H|yd'%_X#skDtb3awwqkgNulRkgdB#^',9:p'hJwSaxRmEBwVb8@4=H|qLu+w50&!)@3qs~?pU>Awwn;;Rn=c:Z'ARn<=<qwKvC@!/&~BqqJv6!&]eVb^z^xRge'/a%+^`#Sge}6<4Rn3=]n0Pw2>Rn8Jw0!&>Rn:>Rn6cY#a7+!a&=<wkaNw~h3z_c5Z{=wjh#=]nLKv^D!&)Vyz=bW|swYb<WetcG#T(2wxa@qVx@gD#Y&b^|V5JwG&!5bb|pg/w&RgD@x=kHs=uAvn!a%%/'+RmSRh694Ro`g-vaRmRhHv-]mlxCcS#`&ba~.5cD#Ta)P~=d,#Y(56H{>978H{Dd_#{2^Y%_+qbbb{6g3sERhsbU{?dfa.,`a(Xa<!aiX#(55RiG54RiHcI#T'WiU3RiVNvdwtfcRlKNvdd,#Y&RlHRlExQgf.1*^T'X#Sgf}6Wn4=]hfPrk>Rn7Jw0!&>Rn5>Rn9Lunw?&a2!,5<oq@@wqfdRlJj5Q~=d,#Y(~ARfcOuN]fdDKw;ay(}i!547E}j?cI#T(@5bV}iCbV}hdv(^^Tb?a40,b##Tbo!a*bR!a<b|a/!aKai!aU[yK=]o^g:v>ReGJwPZtK<7Rh+h<~El,Pv#5ReR@awwxjCg,ulRjDJv6&!]j!z?aQeeg>w=Sh<eeJw;!&axEzOg,Qosc!#*:wkeJ]eJ>x'h-u(!%Ro.w~h.zPdNZ(X,Ya![x{;9ReY;wkgxRiF:x?ap#Y&RmUg<s2Rkod]+UY0TZ'!a&A9sw<=bczLNvuw{gqzNhJwSaxRmCKuLay!#&s_Rf-55b^{uJvZa!!c%#(55Ri654wmiu5RiuawLu,vp!+}^%b_}Y9;wkgxba}o>A9:=b^}zKuh=a''!3awRk3c*'!#aHRk6c+Z&Rk5Rk4Jv)&!awRjSawd9*`#0?C2@EzMj8u<uJ5RmbjQrquJu3x,k>uq@_+=ayb^|W~ARkEOuN]k@7dhzV^X/X&a-#zRzSb`zXcJzTT#2WkVKvDBzW!%FzY9;5bbzWjQrquJu3Jw3%!b`zU=ayb^zQd:#X(T-a!6Vyywxh}=b]{Jg=u1RiAdGp~qHtzv!w(wA+a+a;<!aJaYai'anasb(=azRmV:Cbb{MLq2vb!%')RjuRjrRjtRjqx3jnqCw3!%')Rk(Rk+Rk&Rk)Lq2vb!%')Rj{RjxRjzRjwLq2vb!%')RjsRjpRjfRjex3jcqCw3!%')Rk'Rk*RjkRjl9<CbbzfOu4ARhxLq2vb!%')RjyRjvRjhRjgx=joq*uKvb!%')+-Rk.Rk%Rj~Rk-Rk#Rj}x=jdq*uKvb!%')+-Rk,Rk!Rj|RjmRjjRjidAq&qKs@uAv8Aa.'*-a@a&0!aM@a5[y73Dsy3Ds|3Dt):wxgI2sHJwJZt.~Gqxwsf0ikrzt}Rl0Jvy_[xj~HqzKv_A|D!&WfP8axRoVcf,U#k(v]v+ueunaXRf1Ju}'!g8u#Ri=jQw!sCunLprq>!,')~<5qeGzq9F{W=c##%s5au:5aU3CBE|;d4#X(D!a&6Vygx(b;#(=]ed?C2F{N<capoq2r[a&!aPa9,'Pw;5s:@@=I|,55w_h|@@=IzcP~=x'fCqB_2Wl2>aU@@=I|1OuNBc1Z+jTqIsBv=Wlc~Cw`fl2WlZ~AcTa%!Z+jTqIsBv=Wlb~Cw`fh2WlYk+uNqJsBv=WlSg,u3dca3#UXaMYa)TaB-=cM|7T#<bI}l5@B932:aV2G{BOuNBJq:|M!5Ezt=<B=C@a^<B57@2F{v>cB{/T#=ay<bI{3Jv6!a.6BKq0ah&+!5E}HP~Ef{978BaU@@=Iza<7d#.Y#978BaU@@=IzH~AJq0!(@@=IzG978BaU@@=IzFe,aU*Y&^^^bvJb,b:bFad!a,c2Ta>aL.bo6!a#CbTa'T#Re{2Wlh2@G{yg6t~Ro_NvdRfticuRQRllJv3&!x&c|zs@Jw3!%RflwpfkRlpKuL;%(!Re<@G|C2GzdhIvuBwgjAg-u0RjAKQB%!(GzZ@G|5NuuRl7d='T+Y#Vy[g<v~Rm!==G|>JvA!)@wma=]m1ifuaw&RmnLs@vT'!|/+[y,g:v>ReTJw1!#qX=x!eC{bLu+wT&)ZtZauq_~Graci&U#F|89:r_Lupvq!.)&2RlG8RfaC=x!eF{_h?rpWlmd&'!#X|&]k::xJey#`'T|+<E|&2@H|%dE#(^,g;u.RiEg6vjRiC9xCkA{O|zY#g=ucRmXKs0@!&*@G|m@awRknJuh!,3d(}gY}eJvj!%Rm):Jw3!%Rm+Rm-Ls0w(&!a(a#@b[|6cZ#X'7RkxWgAOu4ARn'dH'U#Y*Vz-Wm'CARm}d]*#a%^a*T'aK!a<9bV{PC=p*Jw4!&SgxcbB5r]idw(wBRmF7xFkt#&`(Rm/Rm8E|!JuY_9:Rl5=wrgr2:bbxd@xXfB(a*#T+!.X0X1Ta/a'T&RlDRfL>RlyARl9b[z[>RfZ:RlL:RfRwlg/ARl;9;RlxKv,A/!%7s69<74=BA5ba{-8Bde#`a<XaKYa1,a'P~=wxfB2bZ}}?C972@@=I}r8@55B9;5bb}G978B2@@=aybb}3j3vLv;<Jw3&!>Rfk=ayb^}4~Ad1#`*@@=aybb{w2@>==<bbz]dx+UY#^UaF!a9!bB'Ya1.!ajXa#%olRhD[y=3Dt#Ov5BrHKuMB%!(Rf^Wep~HrJwkiQjKr|~FRg)Ku+D#'!t5~GrF~?rDdV)UY,Z/_7RkuG{<~BrBg,rlsO:235B@bX}|d?a1!#`(6Vyn5@d##Y+jTv|vV~EfIj]uNpn~FRfH7Lq2vb1!a9-978BaU@@=Iz9978BbU}#~AJq0!(@@=Iz8978BaU@@=Iz7~AJQ|}!978BbU}!JvkaK!AdUa21-U#`a+(g/vsRn~Ou!5RPj:rmu9WhOjXuvvNr}:RhAj^v(pyw8unRn[kPr}p|u7vwv]RiSBd;pppzq@qHQa?(b.!a.a`@.|xa(hFv;Wiyj5uuv-7Riw~Cw`fg2WlU978BbU|wOuNBJqG!(P~EfD~CRlQcZ#X,k)u3vWs@u2]ksg;wEx'f@q1_2Wg.j]uNpn~FRfqJv]!15x'h{qG!(@@=IzK~CRl^j6v(us5x4i,#T(2WmY?C2F{1>Kq<aj1!*jTqIsBv=Wld~Cw`fj2Wl[j`v0u*~>RlT=c>Z,k#u3vWs@u2]kq<c1Z+jTqIsBv=Wle~Cw`fn2Wl]dn1#c(a(b^a2!b/bAT(bj!aDa7bu,a_a{c0!2T0g:v>ReD2@G{42@G{5~DpM~<5rc=Bx6i>{RT#RnI@zCx]y]z:2Jv[!zr5Awyk]9]k]dD(Y+X#6Vz.g=wKtgwhaCwgmTWj2Lu,w%_+/[y-B;b^xeg3u3Rj-2@bX{*KrJ<!+'@Wg(g?QRlC@Jv`!%b[zIwsfII}8JQ_@w|kW|=Jv(%!AqcOuNBJvEzh!bYzjLs@wP#(0!oy@>RkdJwMZtc3Dtd@BcG#T'9bWxg2@2Fznd*#Y+;2x'c}w<zizixNgwa#Z'U+!/!a'!a+w~g~z6wcn{Rn}wcnzRn|5Rh%=]nJg5vuRmvNvdRlvcprJu}w*az*a#!%.a.'Bot9qT]kj@Wg'ay2Gzv@Jv`!%b[zEwsfHI}1;ck#Ux`<Cbbx_Lu+w!a&0*!wko*wwo,So,}6Juqxf!E}PigQuyRm`d3(`#8>Rn%:A5B;bZ~%KvhCa!a2!x>k7#Uxb@b{#xaRk7Jw0!)>wwhlShl}6>wwhmShm}6CJvB!.x'hhvj{!!5Bwkhhbaz}x'hivjz~!5Bwkhibaz|xEhTrNu,v-vpD!a%&/)a3a.,%Ro2t[CE{)@3re9b]{%wjo09:rgc:Z&Ro6=<riifuaw&RmoKrNA!%(Ro4>Ro89;Ri`dSaL'UYzxZb)7Rka3xRhT&!,!#^1U}vbaz{>>@=be}yC@:D5bazzKu+A&!}{?ba}y>>@=be}wxBh[t`u~vJvr!%a!a()a,a0a4RoC=]o;Ju(!%RoGRhdwjh`=]oAg>w#Ro?g5vuRo=NvdRl|Ku]C.!&;RoEJvB!%RoORoMBx'h[v+_?w~h`}~5?w~hd~!xKh]oiptu-utv.vp!#%&a30a@a'a+(a/aOp(o~p!RoDJu(!%RoHRhewjha=]oBNvdRl}g>w#Ro@g5vuRo>c[#X']o<CauRoRAd-#Y':RkpauRoQKu]C.!&;RoFJvB!%RoNRoPBx'h]v+_?w~ha}t5?w~he}ue!/UbhYacXaW^Tc&a;b:a-c/#b&aja1(!cL+!bKbt!bmcRc9aIc?8[yW3Dtt94Rg`Jv}!&SiRMzBhEebShEMNuPRe>x7gL#TzuwjirRipc<Z&>on;>z=h-MSh.Mwqczx'a7vj&!>Re4@=ResJt__NuPRi*NuPRi)j]uNr|~FRfzKrJ>_+@Wfy@Wf]2WocKrJ<!+'@Wg%g/QRl@@Jv`!&awRl<wsfFIzgLu(w*!.*&ShBMwvhIRhI9;RhNx1hK'!#Sn]Mx1hK~0!#:2<H~7cNu+w7D*'1ZtW>Rn1~?rOc:Z&Rn2=<rQ<7wjh&=BSnLMc]#X(6Vz)w[b=a!U#9wzgMc3#&(RgMRitRis<x,gKt`ax!&+SioM=BSilMc3#&(RgKRinRimKurB,!&SiQMzBhDebShDM6BJQ!(P~Efx978B2@@=I}WLrJw!!,a*&@G}O@9wkibRid@@x'fKwC!&SlDMSfLMjUv~Q~EfKKv3@a+!(hFv-]mpx/hYZ(C5RiWz<o/MwkhY?So/M@x,gbvfB*&!SgEM:SoeeehFu3:Rgbda(,^TZa)X/7Sg[eb:2RgI~BrMC@wgkc:wwkcRerx3h(uUvK!&*,SnOM4Sh*MArRg;wHRh(x=h;rJvPwI!a4',a'0@Wg&=BSh/Mg>w=Rh=g3w*wwgGRgGcW(X#;Sg}M2Gzk@Jv`!&awRl=wsfGIz`dKZ*T'Y-:RhR7RhQg5u-p`j6v(us5d,#Y+~Awkia?RicOuNBwkibba}Ld6p~tyu_vbAa'a+!a/'a3aEa8a!>Sh,ebJv{!&Sh@ebSaReb9;SgwebNuPRi(NvdRl)NuPRi'hHu^<Rm^Jvv_@Wl(g;u1Si/ebKu'B&!*Sh?eb@Wl'z@aPeb95Si.ebcpputyvjB)!,&a+0a%ShAMWeK@G}C@WfJ9;RhMwvhH9w{ia}ix,hJvRA1(!zAn[MRhHx1hJ~*!#hFv(BSn[MBJQ!(@@=I~'978B2@@=I}2db.Ua<'X}+T#a0XaG2G}E;wkg|wuh!Rh!x,hZu,@)!&So0MVy)C5RiXACJvB!&5RiY5RiZg8w)cG}*T#2@bU}=KsA>(!a.3wkhZba~(x,h^u(A!&(SoCMRhb5Bz=h[eb?w~hb~6x,h_u(A!&(SoDMRhc5Bz=h]eb?w~hc~6e)aA1T#T,^^^c-bMb&blcPaP(a/!0!bA=b5c@a(!bfbrc#2afwmhARnjwchORnp2Wlf3DtsNvdRl-2@wpa<]m0bx(#:awRk2@Jw3!%RfhwpfgRlnKQB%!(G{V@G|'NuuRl6d='T+Y#VyUg<v~Rl~==G|<Jv+'!aYShC}6@B<5?ba~8@Jw3'!g2QRljhLrpWlOd+#Y'g.w'rIg>w*wgj@g-u0Rj@Lu+wT&)ZtUauq]~GrGci&U#F|39:rELrNvj!.%*RhCwunfw~nf~:9;Ri]>wtnhg;wHRnhx3hDs@v~!/+'@Wfr@9RkSNu&Rlo=@<5GzoKs0@_+@Wl+@awRkmJuh!-3d(}pY#qWJvj!%Rm(:Jw3!%Rm,Rm*de&!1U-U#`)Re;@G|.@9Ri82@wjfvRlq=@<5GzpLvOvr!).&2RlF8Rf`C=x!eE{.Jw3_g2QRlkhLrpWlPde(!#U{s,UXa*Ta'[y'g:v>ReS;x0PZ&RnlRnn~HrKJw1}f!=x!eB|2w]aP(#Xa&a*Ta.Ua2a7=]iOd'#Y&Ro&WnWg;u.RiDg6vjRiBNvdRlzhNvj]nYJuW_2Wm3x)kFze{9d])!a.!,Y01!#&aC!a3RndC=ox~BrC@2b^{pg,rlse7x'ksuq!%Rm.E{xidw(wBRmGx9o+)X#wwo-So-}69:Rl4@xSf@a#XZ'X)X,Ta(/ARl8b[xc>RfY:RlI:RfQwlg.ARl:9;Rlwdn'#^XafaQa1X1TaHTa)@b[{zcZ#X'7RkwWg@Ou4ARn&x)kG#{,g7u/RkGdH'U#Y*Vz'Wm&CARm|bx#(A]gUbUzJj9Q~=d,#Y(56H}l978H{U7d,0#U*2>ABb_xZ978BbU{e~AJQ{g!978BbU{hxMh?ad{oUYZ.x1h?{l!#:2<H{mx3n[t{vl!,&a%3Ro(z=iS}6ARnr=Bwsn^wvn`Rnbd`*T}B0!#^X'BG{c9b]{a>>@=be}F?JvS!&BG{d7BG}(Bde#`a1X,Ya@!a'P~=wxf@2bZ}I56B2@@=aybb}08@55B9;5bb}<j3vLv;<Jw3&!>Rfg=ayb^}&OuNBKuLA!)a!P~=x#fD{f2@>==<bbzl?C972@@=Ix^d6rSu,v7w*C(0a)a6#B+a%!sQ[y?3Dt%3[xn~<5rLOu!5p@Ku+D#'!t7~GrP~?rNKvlaya7'!h+v-5qMg=t|cd,U#5AAaa5Abb{S@52B5@a[@52B5Gx[iXueu;d<#`a(!/549C;ag>23ExY5@Dah89b^~689Jv)!~2b[~1Lv'w(%*!a#bX|aPrmawRe]keu7uhv-q6rxu,q`xTo]/a5aU!bNaDXbi!b-!ao!b<bwA!#5@B932:aV2G|:d-)Y#hJrL>RhG<7@C5<H|_=Cau:5aj5@B932:bJ|ng>vIbs)#?C2F|9jPv0w.vISh-MKvUaz(.!9ABbb|[5;5<H|Eg>unwfh;9:4E|YjQsBt|vjx'hYq3!(?C2F|J:2<BaY?C2F|GOu!5x,g|p{ah!-(?C2F|c9:4E|OjXuvvNr}:Rh&i[w*t|cd+U#jJvsu)vsSn~Mkfrmu9p}u7vwv]So!McW#Xa!ax5@A5aY:5;5<H|>kJv~vYrquJu3x4ib#T)2@SmZM?C2F|Bj:rmu9@xPhI(a*a#U#`a3-5Abb|L~@:RhK9:4E|0@52B5G|#C::aY?C2F|-:2<BaY?C2F|.5Jvk!a)javYrquJu3x4ia#T)2@SmYM?C2F|HAxPhH(!a#U#`a*-5Abb|4~@:RhJ9:4E|R@52B5G|F:2<BaY?C2F|Sc^#Xa2j=Qq5CJvB!-g<v{z;hhM?C2F|Zi[vrv{z;hiM?C2F|XKsA>!a)-g<v{z;h[eb?C2F|]i[vrv{z;h]eb?C2F|^iZu.vix,hZq3ah!.(?C2F|QOu!5ShXM:2<BaY?C2F|P", 13494, 2713, 49, 25, 61);

// node_modules/entities/dist/internal/bin-trie-flags.js
var BinTrieFlags;
(function(BinTrieFlags2) {
  BinTrieFlags2[BinTrieFlags2["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
  BinTrieFlags2[BinTrieFlags2["FLAG13"] = 8192] = "FLAG13";
  BinTrieFlags2[BinTrieFlags2["BRANCH_LENGTH"] = 8064] = "BRANCH_LENGTH";
  BinTrieFlags2[BinTrieFlags2["JUMP_TABLE"] = 127] = "JUMP_TABLE";
  BinTrieFlags2[BinTrieFlags2["VALUE_MASK"] = 8191] = "VALUE_MASK";
})(BinTrieFlags || (BinTrieFlags = {}));

// node_modules/entities/dist/decode.js
var CharCodes;
(function(CharCodes2) {
  CharCodes2[CharCodes2["AMP"] = 38] = "AMP";
  CharCodes2[CharCodes2["NUM"] = 35] = "NUM";
  CharCodes2[CharCodes2["SEMI"] = 59] = "SEMI";
  CharCodes2[CharCodes2["EQUALS"] = 61] = "EQUALS";
  CharCodes2[CharCodes2["ZERO"] = 48] = "ZERO";
  CharCodes2[CharCodes2["NINE"] = 57] = "NINE";
  CharCodes2[CharCodes2["LOWER_A"] = 97] = "LOWER_A";
  CharCodes2[CharCodes2["LOWER_X"] = 120] = "LOWER_X";
})(CharCodes || (CharCodes = {}));
var TO_LOWER_BIT = 32;
var CONSUMED_SHIFT = 21;
var CODE_POINT_MASK = 2097151;
var CONSUMED_OVERFLOW = 2047;
var longNumericConsumed = 0;
function unpackConsumed(packed) {
  const consumed = packed >>> CONSUMED_SHIFT;
  return consumed === CONSUMED_OVERFLOW ? longNumericConsumed : consumed;
}
function isNumber(code2) {
  return code2 - CharCodes.ZERO >>> 0 <= 9;
}
function isHexadecimalCharacter(code2) {
  return (code2 | TO_LOWER_BIT) - CharCodes.LOWER_A >>> 0 <= 5;
}
function isAlpha(code2) {
  return (code2 | TO_LOWER_BIT) - CharCodes.LOWER_A >>> 0 <= 25;
}
function isEntityInAttributeInvalidEnd(code2) {
  return code2 === CharCodes.EQUALS || isAlpha(code2) || isNumber(code2);
}
var EntityDecoderState;
(function(EntityDecoderState2) {
  EntityDecoderState2[EntityDecoderState2["EntityStart"] = 0] = "EntityStart";
  EntityDecoderState2[EntityDecoderState2["NumericStart"] = 1] = "NumericStart";
  EntityDecoderState2[EntityDecoderState2["NumericDecimal"] = 2] = "NumericDecimal";
  EntityDecoderState2[EntityDecoderState2["NumericHex"] = 3] = "NumericHex";
  EntityDecoderState2[EntityDecoderState2["NamedEntity"] = 4] = "NamedEntity";
})(EntityDecoderState || (EntityDecoderState = {}));
var DecodingMode;
(function(DecodingMode2) {
  DecodingMode2[DecodingMode2["Legacy"] = 0] = "Legacy";
  DecodingMode2[DecodingMode2["Strict"] = 1] = "Strict";
  DecodingMode2[DecodingMode2["Attribute"] = 2] = "Attribute";
})(DecodingMode || (DecodingMode = {}));
function determineBranch(decodeTree, current, nodeIndex, char) {
  const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
  const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
  if (jumpOffset) {
    if (branchCount === 0) {
      return char === jumpOffset ? nodeIndex : -1;
    }
    const slot = char - jumpOffset;
    if (slot >>> 0 >= branchCount)
      return -1;
    const stored = decodeTree[nodeIndex + slot];
    return stored === 0 ? -1 : nodeIndex + branchCount + stored - 1 & 65535;
  }
  if (branchCount === 0)
    return -1;
  const packedKeySlots = branchCount + 1 >> 1;
  const branchEnd = nodeIndex + packedKeySlots + branchCount;
  for (let index = 0; index < branchCount; index++) {
    const packed = decodeTree[nodeIndex + (index >> 1)];
    const key = packed >> ((index & 1) << 3) & 255;
    if (key === char) {
      const pointerIndex = nodeIndex + packedKeySlots + index;
      return branchEnd + decodeTree[pointerIndex] & 65535;
    }
    if (key > char)
      return -1;
  }
  return -1;
}
function readTrieValue(decodeTree, nodeIndex, valueLength) {
  if (valueLength === 1) {
    return String.fromCharCode(decodeTree[nodeIndex] & BinTrieFlags.VALUE_MASK);
  }
  if (valueLength === 2) {
    return String.fromCharCode(decodeTree[nodeIndex + 1]);
  }
  return String.fromCharCode(decodeTree[nodeIndex + 1], decodeTree[nodeIndex + 2]);
}
function parseNumericEntity(input, numberStart, inputLength) {
  let offset = numberStart + 1;
  let cp = 0;
  let digitStart = offset;
  if (offset < inputLength && (input.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
    offset += 1;
    digitStart = offset;
    while (offset < inputLength) {
      const char = input.charCodeAt(offset);
      if (isNumber(char)) {
        cp = cp * 16 + (char - CharCodes.ZERO);
      } else if (isHexadecimalCharacter(char)) {
        cp = cp * 16 + ((char | TO_LOWER_BIT) - CharCodes.LOWER_A + 10);
      } else {
        break;
      }
      offset += 1;
    }
  } else {
    while (offset < inputLength) {
      const digit = input.charCodeAt(offset) - CharCodes.ZERO;
      if (digit >>> 0 > 9)
        break;
      cp = cp * 10 + digit;
      offset += 1;
    }
  }
  if (offset === digitStart)
    return 0;
  if (offset < inputLength && input.charCodeAt(offset) === CharCodes.SEMI) {
    offset += 1;
  }
  if (cp > 1114111)
    cp = 1114112;
  let consumed = offset - numberStart;
  if (consumed >= CONSUMED_OVERFLOW) {
    longNumericConsumed = consumed;
    consumed = CONSUMED_OVERFLOW;
  }
  return consumed << CONSUMED_SHIFT | cp;
}
function decodeWithTrie(input, isStrict, isAttribute) {
  const decodeTree = htmlDecodeTree;
  let offset = input.indexOf("&");
  if (offset < 0)
    return input;
  const inputLength = input.length;
  let chunkStart = 0;
  let result = "";
  const root = decodeTree[0];
  const rootJumpOffset = root & BinTrieFlags.JUMP_TABLE;
  const rootBranchCount = (root & BinTrieFlags.BRANCH_LENGTH) >> 7;
  do {
    const entityStart = offset + 1;
    const firstChar = input.charCodeAt(entityStart);
    let consumed;
    let value;
    if (firstChar === CharCodes.NUM) {
      const packed = parseNumericEntity(input, entityStart, inputLength);
      consumed = unpackConsumed(packed);
      if (isStrict && consumed > 0 && input.charCodeAt(entityStart + consumed - 1) !== CharCodes.SEMI) {
        consumed = 0;
      }
      value = consumed === 0 ? "" : codePointToString(packed & CODE_POINT_MASK);
    } else if (isAlpha(firstChar)) {
      consumed = 0;
      value = "";
      const rootSlotIndex = firstChar - rootJumpOffset;
      let nodeIndex;
      if (rootSlotIndex >>> 0 < rootBranchCount) {
        const stored = decodeTree[1 + rootSlotIndex];
        nodeIndex = stored === 0 ? -1 : rootBranchCount + stored & 65535;
      } else {
        nodeIndex = -1;
      }
      let bestNodeIndex = 0;
      let bestValueLength = 0;
      let current = nodeIndex < 0 ? 0 : decodeTree[nodeIndex];
      let index = entityStart + 1;
      trie: while (index < inputLength) {
        while (
          // Value-less, non-run node with a nonzero jump offset.
          (current & (BinTrieFlags.VALUE_LENGTH | BinTrieFlags.FLAG13)) === 0 && (current & BinTrieFlags.JUMP_TABLE) !== 0
        ) {
          const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
          const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
          if (branchCount === 0) {
            if (input.charCodeAt(index) !== jumpOffset)
              break trie;
            nodeIndex += 1;
          } else {
            const slot = input.charCodeAt(index) - jumpOffset;
            if (slot >>> 0 >= branchCount)
              break trie;
            const stored = decodeTree[nodeIndex + 1 + slot];
            if (stored === 0)
              break trie;
            nodeIndex = nodeIndex + branchCount + stored & 65535;
          }
          current = decodeTree[nodeIndex];
          index += 1;
          if (index >= inputLength)
            break trie;
        }
        if ((current & (BinTrieFlags.VALUE_LENGTH | BinTrieFlags.FLAG13)) === BinTrieFlags.FLAG13) {
          const runLength = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
          if (input.charCodeAt(index) !== (current & BinTrieFlags.JUMP_TABLE)) {
            break;
          }
          index += 1;
          const remaining = runLength - 1;
          let wordIndex = nodeIndex + 1;
          let charIndexInPacked = 0;
          for (; charIndexInPacked + 1 < remaining; charIndexInPacked += 2) {
            const packed = decodeTree[wordIndex];
            if (input.charCodeAt(index) !== (packed & 255))
              break trie;
            index += 1;
            if (input.charCodeAt(index) !== (packed >> 8 & 255))
              break trie;
            index += 1;
            wordIndex += 1;
          }
          if (charIndexInPacked < remaining) {
            if (input.charCodeAt(index) !== (decodeTree[wordIndex] & 255))
              break;
            index += 1;
          }
          nodeIndex += 1 + (runLength >> 1);
          current = decodeTree[nodeIndex];
          continue;
        }
        const valueLength = current >>> 14;
        const char = input.charCodeAt(index);
        if (valueLength !== 0) {
          if (char === CharCodes.SEMI) {
            consumed = index - entityStart + 1;
            value = valueLength === 1 ? String.fromCharCode(current & BinTrieFlags.VALUE_MASK) : readTrieValue(decodeTree, nodeIndex, valueLength);
            break;
          }
          if (!isStrict && (current & BinTrieFlags.FLAG13) === 0) {
            consumed = index - entityStart;
            bestNodeIndex = nodeIndex;
            bestValueLength = valueLength;
          }
          if (valueLength === 1)
            break;
        }
        const next = determineBranch(decodeTree, current, nodeIndex + (valueLength || 1), char);
        if (next < 0)
          break;
        nodeIndex = next;
        current = decodeTree[nodeIndex];
        index += 1;
      }
      if (value === "") {
        const finalVL = current >>> 14;
        if (finalVL !== 0 && !isStrict && (current & BinTrieFlags.FLAG13) === 0) {
          consumed = index - entityStart;
          bestNodeIndex = nodeIndex;
          bestValueLength = finalVL;
        }
        if (consumed > 0) {
          value = readTrieValue(decodeTree, bestNodeIndex, bestValueLength);
        }
      }
    } else {
      consumed = 0;
      value = "";
    }
    if (consumed === 0 || isAttribute && firstChar !== CharCodes.NUM && input.charCodeAt(entityStart + consumed - 1) !== CharCodes.SEMI && entityStart + consumed < inputLength && isEntityInAttributeInvalidEnd(input.charCodeAt(entityStart + consumed))) {
      offset = entityStart;
    } else {
      if (chunkStart < offset) {
        result += input.slice(chunkStart, offset);
      }
      result += value;
      offset = chunkStart = entityStart + consumed;
    }
    if (input.charCodeAt(offset) !== CharCodes.AMP) {
      offset = input.indexOf("&", offset);
    }
  } while (offset >= 0);
  return result + input.slice(chunkStart);
}
function decodeHTMLStrict(htmlString) {
  return decodeWithTrie(htmlString, true, false);
}

// node_modules/entities/dist/index.js
var EntityLevel;
(function(EntityLevel2) {
  EntityLevel2[EntityLevel2["XML"] = 0] = "XML";
  EntityLevel2[EntityLevel2["HTML"] = 1] = "HTML";
})(EntityLevel || (EntityLevel = {}));
var EncodingMode;
(function(EncodingMode2) {
  EncodingMode2[EncodingMode2["UTF8"] = 0] = "UTF8";
  EncodingMode2[EncodingMode2["ASCII"] = 1] = "ASCII";
  EncodingMode2[EncodingMode2["Extensive"] = 2] = "Extensive";
  EncodingMode2[EncodingMode2["Attribute"] = 3] = "Attribute";
  EncodingMode2[EncodingMode2["Text"] = 4] = "Text";
})(EncodingMode || (EncodingMode = {}));

// node_modules/linkify-it/build/index.mjs
var REBuilder = class {
  src_Any = Any.source;
  src_Cc = Cc.source;
  src_Z = Z.source;
  src_P = P.source;
  src_ZPCc = [
    this.src_Z,
    this.src_P,
    this.src_Cc
  ].join("|");
  src_ZCc = [this.src_Z, this.src_Cc].join("|");
  cache = {};
  opts = {
    maxLength: 1e4,
    urlAuth: false,
    schema_names: []
  };
  constructor(opts = {}) {
    this.opts = {
      ...this.opts,
      ...opts
    };
  }
  set(opts = {}) {
    this.opts = {
      ...this.opts,
      ...opts
    };
    this.cache = {};
    return this;
  }
  escapeRE(str) {
    return str.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
  }
  nestedPairRE(open, close, depth = 4) {
    const openRE = this.escapeRE(open);
    const closeRE = this.escapeRE(close);
    const atom = `(?:(?!${this.src_ZCc}|${openRE}|${closeRE}).)`;
    let pair = `${openRE}${atom}{0,1000}${closeRE}`;
    for (let level = 2; level <= depth; level++) pair = `${openRE}(?:${atom}|${pair}){0,1000}${closeRE}`;
    return pair;
  }
  get_text_separators() {
    return this.cache.text_separators ??= /[><\uff5c]/;
  }
  get_pseudo_letter() {
    return this.cache.src_pseudo_letter ??= new RegExp(`(?:(?!${this.get_text_separators().source}|${this.src_ZPCc})${this.src_Any})`);
  }
  get_ipv4_addr() {
    return this.cache.src_ip4 ??= /* @__PURE__ */ new RegExp("(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])[.]){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])");
  }
  get_ipv6_addr() {
    const h16 = "[0-9A-Fa-f]{1,4}";
    const ls32 = `(?:(?:${h16}:${h16})|${this.get_ipv4_addr().source})`;
    return this.cache.src_ip6_addr ??= new RegExp(`(?:(?:${h16}:){6}${ls32}|::(?:${h16}:){5}${ls32}|(?:${h16})?::(?:${h16}:){4}${ls32}|(?:(?:${h16}:){0,1}${h16})?::(?:${h16}:){3}${ls32}|(?:(?:${h16}:){0,2}${h16})?::(?:${h16}:){2}${ls32}|(?:(?:${h16}:){0,3}${h16})?::${h16}:${ls32}|(?:(?:${h16}:){0,4}${h16})?::${ls32}|(?:(?:${h16}:){0,5}${h16})?::${h16}|(?:(?:${h16}:){0,6}${h16})?::)`);
  }
  get_ipv6_url_host() {
    return this.cache.src_ip6_host ??= new RegExp(`\\[${this.get_ipv6_addr().source}\\]`);
  }
  get_ipv6_mail_host() {
    return this.cache.src_ipv6_mail_host ??= new RegExp(`\\[IPv6:${this.get_ipv6_addr().source}\\]`);
  }
  get_auth() {
    return this.cache.src_auth ??= new RegExp(`(?:(?:(?!${this.src_ZCc}|[@/\\[\\]()]).){1,50}@)?`);
  }
  get_port() {
    return this.cache.src_port ??= /* @__PURE__ */ new RegExp("(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?");
  }
  get_host_terminator() {
    return this.cache.src_host_terminator ??= new RegExp(`(?=$|${this.get_text_separators().source}|${this.src_ZPCc})(?!${this.opts["---"] ? "-(?!--)|" : "-|"}_|:\\d|\\.-|\\.(?!$|${this.src_ZPCc}))`);
  }
  get_path_terminator() {
    return this.cache.src_path_terminator ??= new RegExp(`${this.src_ZPCc}|${this.get_text_separators().source}`);
  }
  get_path() {
    return this.cache.src_path ??= new RegExp(`(?:[/?#](?:${this.nestedPairRE("[", "]")}|${this.nestedPairRE("(", ")")}|${this.nestedPairRE("{", "}")}|\\"(?:(?!${this.src_ZCc}|["]).){1,100}\\"|\\'(?:(?!${this.src_ZCc}|[']).){1,100}\\'|\\'(?=${this.get_pseudo_letter().source}|[-])|\\.{2,20}[:]?[a-zA-Z0-9%/&]|\\.(?!${this.src_ZCc}|[.]|$)|` + (this.opts["---"] ? "\\-(?!--(?:[^-]|$))(?:-{0,19})|" : "\\-{1,20}|") + `,(?!${this.src_ZCc}|$)|;(?!${this.src_ZCc}|$)|\\!{1,20}(?!${this.src_ZCc}|[!]|$)|\\?(?!${this.src_ZCc}|[?]|$)|` + this.get_path_extra().source + `[\\\\/:%@#&=_~*]|(?!${this.get_path_terminator().source}).){1,${this.opts.maxLength}}|\\/)?`);
  }
  get_mail_name() {
    return this.cache.src_mail_name ??= /* @__PURE__ */ new RegExp("[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9](?:[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9]|[.](?=[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9])){0,63}");
  }
  get_xn() {
    return this.cache.src_xn ??= /* @__PURE__ */ new RegExp("xn--[a-z0-9\\-]{1,59}");
  }
  get_tld() {
    if (this.cache.tld) return this.cache.tld;
    const tlds_src = [...new Set(this.opts.tlds || [])].sort().reverse().join("|");
    this.cache.tld = new RegExp(`${tlds_src || "$#none#$"}|${this.get_xn().source}`);
    return this.cache.tld;
  }
  get_domain_root() {
    return this.cache.src_domain_root ??= new RegExp("(?:" + this.get_xn().source + `|${this.get_pseudo_letter().source}{1,63})`);
  }
  get_domain() {
    return this.cache.src_domain ??= new RegExp("(?:" + this.get_xn().source + `|(?:${this.get_pseudo_letter().source})|(?:${this.get_pseudo_letter().source}(?:-|${this.get_pseudo_letter().source}){0,61}${this.get_pseudo_letter().source}))`);
  }
  get_url_host_port() {
    return this.cache.url_host_port ??= new RegExp("(?:" + this.get_ipv6_url_host().source + `|(?:(?:(?:${this.get_domain().source})\\.){0,10}${this.get_domain().source}))` + this.get_port().source + this.get_host_terminator().source);
  }
  get_fuzzy_url_host_port() {
    return this.cache.fuzzy_url_host_port ??= new RegExp("(?:" + (this.opts.fuzzyIP ? this.get_ipv4_addr().source + "|" : "") + `(?:(?:(?:${this.get_domain().source})\\.){1,10}(?:${this.get_tld().source})))` + this.get_host_terminator().source);
  }
  get_mail_host() {
    return this.cache.src_mail_host ??= new RegExp("(?:" + this.get_ipv6_mail_host().source + `|(?:(?:(?:${this.get_domain().source})\\.){0,4}${this.get_domain().source}))` + this.get_host_terminator().source);
  }
  get_fuzzy_mail_host() {
    return this.cache.src_fuzzy_mail_host ??= new RegExp("(?:" + this.get_ipv6_mail_host().source + `|(?:(?:(?:${this.get_domain().source})[.]){1,4}${this.get_domain_root().source}))` + this.get_host_terminator().source);
  }
  get_path_extra() {
    return this.cache.src_path_extra ??= /* @__PURE__ */ new RegExp("");
  }
  get_fuzzy_mail_host_search() {
    return this.cache.mail_fuzzy_host_search ??= new RegExp(`@${this.get_fuzzy_mail_host().source}`, "ig");
  }
  get_fuzzy_link_search() {
    return this.cache.link_fuzzy_search ??= new RegExp(`(^|(?![.:/\\-_@])(?:[$+<=>^\`|\uFF5C]|${this.src_ZPCc}))(?:(?![$+<=>^\`|\uFF5C])${this.get_fuzzy_url_host_port().source}${this.get_path().source})`, "ig");
  }
  get_http_validator() {
    return this.cache.http_validator ??= new RegExp("\\/\\/" + (this.opts.urlAuth ? this.get_auth().source : "") + this.get_url_host_port().source + this.get_path().source, "iy");
  }
  get_relative_proto_validator() {
    return this.cache.relative_proto_validator ??= new RegExp((this.opts.urlAuth ? this.get_auth().source : "") + `(?:localhost|${this.get_ipv6_url_host().source}|(?:(?:${this.get_domain().source})[.]){1,10}${this.get_domain_root().source})` + this.get_port().source + this.get_host_terminator().source + this.get_path().source, "iy");
  }
  get_mail_name_validator() {
    return this.cache.mail_name_validator ??= new RegExp(`(?:^|${this.get_text_separators().source}|"|\\(|${this.src_ZCc})(${this.get_mail_name().source})$`);
  }
  get_mailto_validator() {
    return this.cache.mailto_validator ??= new RegExp(`${this.get_mail_name().source}@${this.get_mail_host().source}`, "iy");
  }
  get_schema_names() {
    return this.cache.schema_names ??= new RegExp((this.opts.schema_names || []).map((name) => this.escapeRE(name)).join("|"));
  }
  get_schema_search() {
    return this.cache.schema_search ??= new RegExp(`(^|(?!_)(?:[><\uFF5C]|${this.src_ZPCc}))(${this.get_schema_names().source})`, "ig");
  }
  get_schema_at_start() {
    return this.cache.schema_at_start ??= new RegExp(`^${this.get_schema_search().source}`, "i");
  }
};
var web_schema = {
  validate: (text2, pos, self) => {
    const re = self.re.get_http_validator();
    re.lastIndex = pos;
    const m = re.exec(text2);
    return m ? m[0].length : 0;
  },
  normalize: (match, self) => self.normalize(match)
};
var defaultSchemas = {
  "http:": web_schema,
  "https:": web_schema,
  "ftp:": web_schema,
  "//": {
    validate: function(text2, pos, self) {
      const re = self.re.get_relative_proto_validator();
      re.lastIndex = pos;
      const m = re.exec(text2);
      if (m) {
        if (pos >= 3 && text2[pos - 3] === ":") return 0;
        if (pos >= 3 && text2[pos - 3] === "/") return 0;
        return m[0].length;
      }
      return 0;
    },
    normalize: (match, self) => self.normalize(match)
  },
  "mailto:": {
    validate: function(text2, pos, self) {
      const re = self.re.get_mailto_validator();
      re.lastIndex = pos;
      const m = re.exec(text2);
      return m ? m[0].length : 0;
    },
    normalize: (match, self) => self.normalize(match)
  }
};
var tlds_2ch = "a:cdefgilmnoqrstuwxz|b:abdefghijmnorstvwyz|c:acdfghiklmnoruvwxyz|d:ejkmoz|e:cegrstu|f:ijkmor|g:abdefghilmnpqrstuwy|h:kmnrtu|i:delmnoqrst|j:emop|k:eghimnprwyz|l:abcikrstuvy|m:acdeghklmnopqrstuvwxyz|n:acefgilopruz|o:m|p:aefghklmnrstwy|q:a|r:eosuw|s:abcdeghijklmnortuvxyz|t:cdfghjklmnortvwz|u:agksyz|v:aceginu|w:fs|y:et|z:amw";
var tlds_default = "biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|\u0440\u0444";
function unpackTlds() {
  const result = tlds_default.split("|");
  tlds_2ch.split("|").forEach((item) => {
    const sep = item.indexOf(":");
    const prefix = item.slice(0, sep);
    for (const suffix of item.slice(sep + 1)) result.push(prefix + suffix);
  });
  return result;
}
var defaultOptions = {
  fuzzyLink: false,
  fuzzyEmail: true,
  fuzzyIP: false,
  "---": false,
  tlds: unpackTlds(),
  urlAuth: false,
  maxLength: 1e4
};
var Match = class {
  /** Prefix (protocol) for matched string. Empty for fuzzy links. */
  schema;
  /** First position of matched string. */
  index;
  /** Next position after matched string. */
  lastIndex;
  /** Matched string. */
  raw;
  /** Normalized text of matched string. */
  text;
  /** Normalized URL of matched string. */
  url;
  constructor(text2, schema, index, lastIndex) {
    const raw = text2.slice(index, lastIndex);
    this.schema = schema.toLowerCase();
    this.index = index;
    this.lastIndex = lastIndex;
    this.raw = raw;
    this.text = raw;
    this.url = raw;
  }
};
var LinkifyIt = class {
  __opts__;
  __schemas__;
  re;
  /**
  * Creates new linkifier instance.
  *
  * By default understands:
  *
  * - `http(s)://...` , `ftp://...`, `mailto:...` & `//...` links
  * - "fuzzy" emails (foo@bar.com).
  *
  * See {@link LinkifyConstructorOptions} for available options.
  *
  * @param options Recognition options.
  *
  * @example
  * ```javascript
  * import { LinkifyIt } from 'linkify-it'
  *
  * const linkify = new LinkifyIt({ fuzzyLink: true })
  *
  * linkify
  *   .tlds(require('tlds'))       // Reload with full TLD list
  *   .tlds('onion', true)         // Add unofficial `.onion` domain
  *   .add('ftp:', null)           // Disable `ftp:` protocol
  *   .set({ fuzzyIP: true })      // Enable IPs in fuzzy links
  *
  * console.log(linkify.test('Site github.com!')) // true
  * console.log(linkify.match('Site github.com!'))
  * ```
  */
  constructor(options = {}) {
    const { rebuilder, ...linkifyOptions } = options;
    this.__opts__ = {
      ...defaultOptions,
      ...linkifyOptions
    };
    this.__schemas__ = { ...defaultSchemas };
    this.re = rebuilder || new REBuilder();
    this.re.set({
      ...this.__opts__,
      schema_names: Object.keys(this.__schemas__)
    });
  }
  /**
  * Add new rule definition.
  *
  * `schema` is a link prefix (usually, protocol name with `:` at the end,
  * `skype:` for example). `linkify-it` makes sure that prefix is not
  * preceded with alphanumeric char and symbols. Only whitespaces and
  * punctuation allowed.
  *
  * `definition` is a rule to check tail after link prefix. To disable an
  * existing rule, pass `null`.
  *
  * @param schema Rule name (fixed pattern prefix).
  * @param definition Schema definition, or `null` to disable the rule.
  *
  * See [twitter mentions example](https://github.com/markdown-it/linkify-it/blob/master/examples/twitter.mjs).
  */
  add(schema, definition = null) {
    if (!definition) delete this.__schemas__[schema];
    else {
      const def = {
        normalize: (match, self) => self.normalize(match),
        ...definition
      };
      this.__schemas__[schema] = def;
    }
    this.re.set({
      ...this.__opts__,
      schema_names: Object.keys(this.__schemas__)
    });
    return this;
  }
  /**
  * Set recognition options for links without schema.
  *
  * @param options Recognition options.
  */
  set(options = {}) {
    this.__opts__ = {
      ...this.__opts__,
      ...options
    };
    this.re.set({
      ...this.__opts__,
      schema_names: Object.keys(this.__schemas__)
    });
    return this;
  }
  /**
  * Searches linkifiable pattern and returns `true` on success or `false` on fail.
  *
  * @param text Text to scan.
  */
  test(text2) {
    if (!text2.length) return false;
    let m, re;
    re = this.re.get_schema_search();
    re.lastIndex = 0;
    while ((m = re.exec(text2)) !== null) if (this.testSchemaAt(text2, m[2], re.lastIndex)) return true;
    if (this.__opts__.fuzzyLink && this.__schemas__["http:"]) {
      re = this.re.get_fuzzy_link_search();
      re.lastIndex = 0;
      if (re.exec(text2) !== null) return true;
    }
    if (this.__opts__.fuzzyEmail && this.__schemas__["mailto:"]) {
      if (text2.indexOf("@") >= 0) {
        const mailHostRe = this.re.get_fuzzy_mail_host_search();
        const mailNameRe = this.re.get_mail_name_validator();
        mailHostRe.lastIndex = 0;
        while ((m = mailHostRe.exec(text2)) !== null) {
          const name = text2.slice(Math.max(0, m.index - 65), m.index);
          if (mailNameRe.test(name)) return true;
        }
      }
    }
    return false;
  }
  /**
  * Similar to {@link LinkifyIt.test} but checks only specific protocol tail exactly
  * at given position. Returns length of found pattern (0 on fail).
  *
  * @param text Text to scan.
  * @param schema Rule (schema) name.
  * @param pos Text offset to check from.
  */
  testSchemaAt(text2, schema, pos) {
    if (!this.__schemas__[schema.toLowerCase()]) return 0;
    return this.__schemas__[schema.toLowerCase()].validate(text2.slice(0, pos + this.__opts__.maxLength), pos, this);
  }
  /**
  * Returns array of found link descriptions or `null` on fail. We strongly
  * recommend to use {@link LinkifyIt.test} first, for best speed.
  *
  * @param text Text to scan.
  */
  match(text2) {
    const result = [];
    const schemaRe = this.re.get_schema_search();
    let fuzzyLinkRe;
    let mailHostRe;
    let mailNameRe;
    let fuzzyLinkCandidate;
    let fuzzyEmailCandidate;
    let schemaPrefix;
    let schemaDone = false;
    let fuzzyLinkDone = false;
    let fuzzyEmailDone = false;
    let pos = 0;
    if (!text2.length) return null;
    schemaRe.lastIndex = 0;
    if (this.__opts__.fuzzyLink && this.__schemas__["http:"]) {
      fuzzyLinkRe = this.re.get_fuzzy_link_search();
      fuzzyLinkRe.lastIndex = 0;
    }
    if (this.__opts__.fuzzyEmail && this.__schemas__["mailto:"]) {
      mailHostRe = this.re.get_fuzzy_mail_host_search();
      mailHostRe.lastIndex = 0;
      mailNameRe = this.re.get_mail_name_validator();
    }
    for (; ; ) {
      const scanFrom = Math.max(pos - 1, 0);
      if (mailHostRe && mailNameRe && !fuzzyEmailDone && (!fuzzyEmailCandidate || fuzzyEmailCandidate.index < pos)) {
        if (mailHostRe.lastIndex < scanFrom) mailHostRe.lastIndex = scanFrom;
        for (; ; ) {
          const m = mailHostRe.exec(text2);
          if (!m) {
            fuzzyEmailDone = true;
            fuzzyEmailCandidate = void 0;
            break;
          }
          const name = mailNameRe.exec(text2.slice(Math.max(0, m.index - 65), m.index));
          if (!name) continue;
          fuzzyEmailCandidate = {
            schema: "mailto:",
            index: m.index - name[1].length,
            lastIndex: m.index + m[0].length
          };
          if (fuzzyEmailCandidate.index >= pos) break;
          if (mailHostRe.lastIndex < scanFrom) mailHostRe.lastIndex = scanFrom;
        }
      }
      if (fuzzyLinkRe && !fuzzyLinkDone && (!fuzzyLinkCandidate || fuzzyLinkCandidate.index < pos)) {
        if (fuzzyLinkRe.lastIndex < scanFrom) fuzzyLinkRe.lastIndex = scanFrom;
        for (; ; ) {
          const m = fuzzyLinkRe.exec(text2);
          if (!m) {
            fuzzyLinkDone = true;
            fuzzyLinkCandidate = void 0;
            break;
          }
          fuzzyLinkCandidate = {
            schema: "",
            index: m.index + m[1].length,
            lastIndex: m.index + m[0].length
          };
          if (fuzzyLinkCandidate.index >= pos) break;
          if (fuzzyLinkRe.lastIndex < scanFrom) fuzzyLinkRe.lastIndex = scanFrom;
        }
      }
      let fuzzyCandidate = fuzzyEmailCandidate;
      if (!fuzzyCandidate || fuzzyLinkCandidate && (fuzzyLinkCandidate.index < fuzzyCandidate.index || fuzzyLinkCandidate.index === fuzzyCandidate.index && fuzzyLinkCandidate.lastIndex > fuzzyCandidate.lastIndex)) fuzzyCandidate = fuzzyLinkCandidate;
      let schemaCandidate;
      if (!schemaDone) for (; ; ) {
        if (!schemaPrefix) {
          if (schemaRe.lastIndex < scanFrom) schemaRe.lastIndex = scanFrom;
          const m = schemaRe.exec(text2);
          if (!m) {
            schemaDone = true;
            break;
          }
          schemaPrefix = {
            schema: m[2],
            index: m.index + m[1].length,
            lastIndex: m.index + m[0].length
          };
        }
        if (schemaPrefix.index < pos) {
          schemaPrefix = void 0;
          continue;
        }
        if (fuzzyCandidate && schemaPrefix.index > fuzzyCandidate.index) break;
        const prefix = schemaPrefix;
        schemaPrefix = void 0;
        const len = this.testSchemaAt(text2, prefix.schema, prefix.lastIndex);
        if (len) {
          schemaCandidate = {
            schema: prefix.schema,
            index: prefix.index,
            lastIndex: prefix.lastIndex + len
          };
          break;
        }
      }
      let candidate = schemaCandidate;
      if (!candidate || fuzzyEmailCandidate && (fuzzyEmailCandidate.index < candidate.index || fuzzyEmailCandidate.index === candidate.index && fuzzyEmailCandidate.lastIndex > candidate.lastIndex)) candidate = fuzzyEmailCandidate;
      if (!candidate || fuzzyLinkCandidate && (fuzzyLinkCandidate.index < candidate.index || fuzzyLinkCandidate.index === candidate.index && fuzzyLinkCandidate.lastIndex > candidate.lastIndex)) candidate = fuzzyLinkCandidate;
      if (!candidate) break;
      if (candidate === fuzzyEmailCandidate) fuzzyEmailCandidate = void 0;
      else if (candidate === fuzzyLinkCandidate) fuzzyLinkCandidate = void 0;
      const match = new Match(text2, candidate.schema, candidate.index, candidate.lastIndex);
      if (match.schema) this.__schemas__[match.schema].normalize(match, this);
      else this.normalize(match);
      result.push(match);
      pos = candidate.lastIndex;
    }
    if (result.length) return result;
    return null;
  }
  /**
  * Returns fully-formed (not fuzzy) link if it starts at the beginning
  * of the string, and null otherwise.
  *
  * @param text Text to scan.
  */
  matchAtStart(text2) {
    if (!text2.length) return null;
    const m = this.re.get_schema_at_start().exec(text2);
    if (!m) return null;
    const len = this.testSchemaAt(text2, m[2], m[0].length);
    if (!len) return null;
    const match = new Match(text2, m[2], m.index + m[1].length, m.index + m[0].length + len);
    this.__schemas__[match.schema].normalize(match, this);
    return match;
  }
  /**
  * Load (or merge) new TLDs list. Those are used for fuzzy links (without
  * prefix) to avoid false positives. By default this algorithm is used:
  *
  * - hostname with any 2-letter root zones are ok.
  * - biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф
  *   are ok.
  * - encoded (`xn--...`) root zones are ok.
  *
  * If list is replaced, then exact match for 2-chars root zones will be checked.
  *
  * @param list List of TLDs.
  * @param keepOld Merge with current list if `true` (`false` by default).
  */
  tlds(list2, keepOld = false) {
    list2 = Array.isArray(list2) ? list2 : [list2];
    if (!keepOld) this.__opts__.tlds = list2;
    else this.__opts__.tlds = this.__opts__.tlds.concat(list2);
    this.re.set({
      ...this.__opts__,
      schema_names: Object.keys(this.__schemas__)
    });
    return this;
  }
  /**
  * Default normalizer (if schema does not define its own).
  *
  * @param match Match to normalize.
  */
  normalize(match) {
    if (!match.schema) match.url = `http://${match.url}`;
    if (match.schema === "mailto:" && !/^mailto:/i.test(match.url)) match.url = `mailto:${match.url}`;
  }
};

// node_modules/markdown-it/dist/markdown-it.mjs
var import_punycode = __toESM(require_punycode(), 1);
var __defProp2 = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
  let target = {};
  for (var name in all) __defProp2(target, name, {
    get: all[name],
    enumerable: true
  });
  if (!no_symbols) __defProp2(target, Symbol.toStringTag, { value: "Module" });
  return target;
};
var utils_exports = /* @__PURE__ */ __exportAll({
  arrayReplaceAt: () => arrayReplaceAt,
  asciiTrim: () => asciiTrim,
  callable: () => callable,
  escapeHtml: () => escapeHtml,
  escapeRE: () => escapeRE,
  fromCodePoint: () => fromCodePoint,
  isMdAsciiPunct: () => isMdAsciiPunct,
  isPunctChar: () => isPunctChar,
  isPunctCharCode: () => isPunctCharCode,
  isSpace: () => isSpace,
  isValidEntityCode: () => isValidEntityCode,
  isWhiteSpace: () => isWhiteSpace,
  lib: () => lib,
  normalizeReference: () => normalizeReference,
  unescapeAll: () => unescapeAll,
  unescapeMd: () => unescapeMd
});
function callable(cls) {
  const wrapper = function(...args) {
    return Reflect.construct(cls, args, new.target && new.target !== wrapper ? new.target : cls);
  };
  Object.defineProperty(wrapper, "name", { value: cls.name });
  Object.setPrototypeOf(wrapper, cls);
  wrapper.prototype = cls.prototype;
  return wrapper;
}
function arrayReplaceAt(src, pos, newElements) {
  return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
}
function isValidEntityCode(c) {
  if (c >= 55296 && c <= 57343) return false;
  if (c >= 64976 && c <= 65007) return false;
  if ((c & 65535) === 65535 || (c & 65535) === 65534) return false;
  if (c >= 0 && c <= 8) return false;
  if (c === 11) return false;
  if (c >= 14 && c <= 31) return false;
  if (c >= 127 && c <= 159) return false;
  if (c > 1114111) return false;
  return true;
}
function fromCodePoint(c) {
  if (c > 65535) {
    c -= 65536;
    const surrogate1 = 55296 + (c >> 10);
    const surrogate2 = 56320 + (c & 1023);
    return String.fromCharCode(surrogate1, surrogate2);
  }
  return String.fromCharCode(c);
}
var UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g;
var UNESCAPE_ALL_RE = new RegExp(`${UNESCAPE_MD_RE.source}|${/&([a-z#][a-z0-9]{1,31});/gi.source}`, "gi");
var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;
function replaceEntityPattern(match, name) {
  if (name.charCodeAt(0) === 35 && DIGITAL_ENTITY_TEST_RE.test(name)) {
    const code2 = name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    if (isValidEntityCode(code2)) return fromCodePoint(code2);
    return match;
  }
  const decoded = decodeHTMLStrict(match);
  if (decoded !== match) return decoded;
  return match;
}
function unescapeMd(str) {
  if (str.indexOf("\\") < 0) return str;
  return str.replace(UNESCAPE_MD_RE, "$1");
}
function unescapeAll(str) {
  if (str.indexOf("\\") < 0 && str.indexOf("&") < 0) return str;
  return str.replace(UNESCAPE_ALL_RE, function(match, escaped, entity2) {
    if (escaped) return escaped;
    return replaceEntityPattern(match, entity2);
  });
}
var HTML_ESCAPE_TEST_RE = /[&<>"]/;
var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
var HTML_REPLACEMENTS = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
}
function escapeHtml(str) {
  if (HTML_ESCAPE_TEST_RE.test(str)) return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  return str;
}
var REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;
function escapeRE(str) {
  return str.replace(REGEXP_ESCAPE_RE, "\\$&");
}
function isSpace(code2) {
  switch (code2) {
    case 9:
    case 32:
      return true;
  }
  return false;
}
function isWhiteSpace(code2) {
  if (code2 >= 8192 && code2 <= 8202) return true;
  switch (code2) {
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 32:
    case 160:
    case 5760:
    case 8239:
    case 8287:
    case 12288:
      return true;
  }
  return false;
}
function isPunctChar(ch) {
  return P.test(ch) || S.test(ch);
}
function isPunctCharCode(code2) {
  return isPunctChar(fromCodePoint(code2));
}
function isMdAsciiPunct(ch) {
  switch (ch) {
    case 33:
    case 34:
    case 35:
    case 36:
    case 37:
    case 38:
    case 39:
    case 40:
    case 41:
    case 42:
    case 43:
    case 44:
    case 45:
    case 46:
    case 47:
    case 58:
    case 59:
    case 60:
    case 61:
    case 62:
    case 63:
    case 64:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
    case 123:
    case 124:
    case 125:
    case 126:
      return true;
    default:
      return false;
  }
}
function normalizeReference(str) {
  str = str.trim().replace(/\s+/g, " ");
  return str.toLowerCase().toUpperCase();
}
function isAsciiTrimmable(c) {
  return c === 32 || c === 9 || c === 10 || c === 13;
}
function asciiTrim(str) {
  let start = 0;
  for (; start < str.length; start++) if (!isAsciiTrimmable(str.charCodeAt(start))) break;
  let end = str.length - 1;
  for (; end >= start; end--) if (!isAsciiTrimmable(str.charCodeAt(end))) break;
  return str.slice(start, end + 1);
}
var lib = {
  mdurl: mdurl_exports,
  ucmicro: build_exports
};
function parseLinkLabel(state, start, disableNested) {
  let level, found, marker, prevPos;
  const max2 = state.posMax;
  const oldPos = state.pos;
  state.pos = start + 1;
  level = 1;
  while (state.pos < max2) {
    marker = state.src.charCodeAt(state.pos);
    if (marker === 93) {
      level--;
      if (level === 0) {
        found = true;
        break;
      }
    }
    prevPos = state.pos;
    state.md.inline.skipToken(state);
    if (marker === 91) {
      if (prevPos === state.pos - 1) level++;
      else if (disableNested) {
        state.pos = oldPos;
        return -1;
      }
    }
  }
  let labelEnd = -1;
  if (found) labelEnd = state.pos;
  state.pos = oldPos;
  return labelEnd;
}
function parseLinkDestination(str, start, max2) {
  let code2;
  let pos = start;
  const result = {
    ok: false,
    pos: 0,
    str: ""
  };
  if (str.charCodeAt(pos) === 60) {
    pos++;
    while (pos < max2) {
      code2 = str.charCodeAt(pos);
      if (code2 === 10) return result;
      if (code2 === 60) return result;
      if (code2 === 62) {
        result.pos = pos + 1;
        result.str = unescapeAll(str.slice(start + 1, pos));
        result.ok = true;
        return result;
      }
      if (code2 === 92 && pos + 1 < max2) {
        pos += 2;
        continue;
      }
      pos++;
    }
    return result;
  }
  let level = 0;
  while (pos < max2) {
    code2 = str.charCodeAt(pos);
    if (code2 === 32) break;
    if (code2 < 32 || code2 === 127) break;
    if (code2 === 92 && pos + 1 < max2) {
      if (str.charCodeAt(pos + 1) === 32) {
        pos++;
        continue;
      }
      pos += 2;
      continue;
    }
    if (code2 === 40) {
      level++;
      if (level > 32) return result;
    }
    if (code2 === 41) {
      if (level === 0) break;
      level--;
    }
    pos++;
  }
  if (start === pos) return result;
  if (level !== 0) return result;
  result.str = unescapeAll(str.slice(start, pos));
  result.pos = pos;
  result.ok = true;
  return result;
}
function parseLinkTitle(str, start, max2, prev_state) {
  let code2;
  let pos = start;
  const state = {
    ok: false,
    can_continue: false,
    pos: 0,
    str: "",
    marker: 0
  };
  if (prev_state) {
    state.str = prev_state.str;
    state.marker = prev_state.marker;
  } else {
    if (pos >= max2) return state;
    let marker = str.charCodeAt(pos);
    if (marker !== 34 && marker !== 39 && marker !== 40) return state;
    start++;
    pos++;
    if (marker === 40) marker = 41;
    state.marker = marker;
  }
  while (pos < max2) {
    code2 = str.charCodeAt(pos);
    if (code2 === state.marker) {
      state.pos = pos + 1;
      state.str += unescapeAll(str.slice(start, pos));
      state.ok = true;
      return state;
    } else if (code2 === 40 && state.marker === 41) return state;
    else if (code2 === 92 && pos + 1 < max2) pos++;
    pos++;
  }
  state.can_continue = true;
  state.str += unescapeAll(str.slice(start, pos));
  return state;
}
var helpers_exports = /* @__PURE__ */ __exportAll({
  parseLinkDestination: () => parseLinkDestination,
  parseLinkLabel: () => parseLinkLabel,
  parseLinkTitle: () => parseLinkTitle
});
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}
function toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i2 = e.call(t, r || "default");
    if ("object" != _typeof(i2)) return i2;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function toPropertyKey(t) {
  var i2 = toPrimitive(t, "string");
  return "symbol" == _typeof(i2) ? i2 : i2 + "";
}
function _defineProperty(e, r, t) {
  return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
var Token = class {
  constructor(type, tag, nesting) {
    _defineProperty(
      this,
      /**
      * Source map info. Format: `[ line_begin, line_end ]`
      */
      "map",
      null
    );
    _defineProperty(
      this,
      /**
      * nesting level, the same as `state.level`
      */
      "level",
      0
    );
    _defineProperty(
      this,
      /**
      * An array of child nodes (inline and img tokens)
      */
      "children",
      null
    );
    _defineProperty(
      this,
      /**
      * In a case of self-closing tag (code, html, fence, etc.),
      * it has contents of this tag.
      */
      "content",
      ""
    );
    _defineProperty(
      this,
      /**
      * '*' or '_' for emphasis, fence string for fence, etc.
      */
      "markup",
      ""
    );
    _defineProperty(
      this,
      /**
      * Additional information:
      *
      * - Info string for "fence" tokens
      * - The value "auto" for autolink "link_open" and "link_close" tokens
      * - The string value of the item marker for ordered-list "list_item_open" tokens
      */
      "info",
      ""
    );
    _defineProperty(
      this,
      /**
      * True for block-level tokens, false for inline tokens.
      * Used in renderer to calculate line breaks
      */
      "block",
      false
    );
    _defineProperty(
      this,
      /**
      * If it's true, ignore this element when rendering. Used for tight lists
      * to hide paragraphs.
      */
      "hidden",
      false
    );
    this.type = type;
    this.tag = tag;
    this.attrs = null;
    this.nesting = nesting;
    this.meta = null;
  }
  /**
  * Search attribute index by name.
  */
  attrIndex(name) {
    if (!this.attrs) return -1;
    const attrs = this.attrs;
    for (let i2 = 0, len = attrs.length; i2 < len; i2++) if (attrs[i2][0] === name) return i2;
    return -1;
  }
  /**
  * Add `[ name, value ]` attribute to list. Init attrs if necessary
  */
  attrPush(attrData) {
    if (this.attrs) this.attrs.push(attrData);
    else this.attrs = [attrData];
  }
  /**
  * Set `name` attribute to `value`. Override old value if exists.
  */
  attrSet(name, value) {
    const idx = this.attrIndex(name);
    const attrData = [name, value];
    if (idx < 0) this.attrPush(attrData);
    else this.attrs[idx] = attrData;
  }
  /**
  * Get the value of attribute `name`, or null if it does not exist.
  */
  attrGet(name) {
    const idx = this.attrIndex(name);
    let value = null;
    if (idx >= 0) value = this.attrs[idx][1];
    return value;
  }
  /**
  * Join value to existing attribute via space. Or create new attribute if not
  * exists. Useful to operate with token classes.
  */
  attrJoin(name, value) {
    const idx = this.attrIndex(name);
    if (idx < 0) this.attrPush([name, value]);
    else this.attrs[idx][1] = `${this.attrs[idx][1]} ${value}`;
  }
};
var Ruler = class {
  constructor() {
    _defineProperty(
      this,
      /** @internal */
      "__rules__",
      []
    );
    _defineProperty(
      this,
      /** @internal */
      "__cache__",
      null
    );
  }
  /** @internal */
  __find__(name) {
    for (let i2 = 0; i2 < this.__rules__.length; i2++) if (this.__rules__[i2].name === name) return i2;
    return -1;
  }
  /** @internal */
  __compile__() {
    const chains = /* @__PURE__ */ new Set();
    this.__rules__.forEach((rule) => {
      if (!rule.enabled) return;
      rule.alt.forEach((altName) => {
        if (altName) chains.add(altName);
      });
    });
    this.__cache__ = /* @__PURE__ */ Object.create(null);
    this.__cache__[""] = [];
    this.__rules__.forEach((rule) => {
      if (rule.enabled) this.__cache__[""].push(rule.fn);
    });
    chains.forEach((chain) => {
      this.__cache__[chain] = [];
      this.__rules__.forEach((rule) => {
        if (rule.enabled && rule.alt.indexOf(chain) >= 0) this.__cache__[chain].push(rule.fn);
      });
    });
  }
  /**
  * Replace rule by name with new function & options. Throws error if name not
  * found.
  *
  * @example Replace existing typographer replacement rule with new one
  * ```javascript
  * import MarkdownIt from 'markdown-it'
  * const md = new MarkdownIt()
  *
  * md.core.ruler.at('replacements', function replace(state) {
  *   //...
  * });
  * ```
  */
  at(name, fn, options = {}) {
    const index = this.__find__(name);
    if (index === -1) throw new Error(`Parser rule not found: ${name}`);
    this.__rules__[index].fn = fn;
    this.__rules__[index].alt = options.alt || [];
    this.__cache__ = null;
  }
  /**
  * Add new rule to chain before one with given name. See also
  * {@link Ruler.after}, {@link Ruler.push}.
  *
  * @example
  * ```javascript
  * import MarkdownIt from 'markdown-it'
  * const md = new MarkdownIt()
  *
  * md.block.ruler.before('paragraph', 'my_rule', function replace(state) {
  *   //...
  * });
  * ```
  */
  before(beforeName, ruleName, fn, options = {}) {
    const index = this.__find__(beforeName);
    if (index === -1) throw new Error(`Parser rule not found: ${beforeName}`);
    this.__rules__.splice(index, 0, {
      name: ruleName,
      enabled: true,
      fn,
      alt: options.alt || []
    });
    this.__cache__ = null;
  }
  /**
  * Add new rule to chain after one with given name. See also
  * {@link Ruler.before}, {@link Ruler.push}.
  *
  * @example
  * ```javascript
  * import MarkdownIt from 'markdown-it'
  * const md = new MarkdownIt()
  *
  * md.inline.ruler.after('text', 'my_rule', function replace(state) {
  *   //...
  * });
  * ```
  */
  after(afterName, ruleName, fn, options = {}) {
    const index = this.__find__(afterName);
    if (index === -1) throw new Error(`Parser rule not found: ${afterName}`);
    this.__rules__.splice(index + 1, 0, {
      name: ruleName,
      enabled: true,
      fn,
      alt: options.alt || []
    });
    this.__cache__ = null;
  }
  /**
  * Push new rule to the end of chain. See also
  * {@link Ruler.before}, {@link Ruler.after}.
  *
  * @example
  * ```javascript
  * import MarkdownIt from 'markdown-it'
  * const md = new MarkdownIt()
  *
  * md.core.ruler.push('my_rule', function replace(state) {
  *   //...
  * });
  * ```
  */
  push(ruleName, fn, options = {}) {
    this.__rules__.push({
      name: ruleName,
      enabled: true,
      fn,
      alt: options.alt || []
    });
    this.__cache__ = null;
  }
  /**
  * Enable rules with given names. If any rule name not found - throw Error.
  * Errors can be disabled by second param.
  *
  * See also {@link Ruler.disable}, {@link Ruler.enableOnly}.
  *
  * Returns list of found rule names (if no exception happened).
  */
  enable(list2, ignoreInvalid = false) {
    if (!Array.isArray(list2)) list2 = [list2];
    const result = [];
    list2.forEach((name) => {
      const idx = this.__find__(name);
      if (idx < 0) {
        if (ignoreInvalid) return;
        throw new Error(`Rules manager: invalid rule name ${name}`);
      }
      this.__rules__[idx].enabled = true;
      result.push(name);
    });
    this.__cache__ = null;
    return result;
  }
  /**
  * Enable rules with given names, and disable everything else. If any rule name
  * not found - throw Error. Errors can be disabled by second param.
  *
  * See also {@link Ruler.disable}, {@link Ruler.enable}.
  */
  enableOnly(list2, ignoreInvalid = false) {
    if (!Array.isArray(list2)) list2 = [list2];
    this.__rules__.forEach((rule) => {
      rule.enabled = false;
    });
    this.enable(list2, ignoreInvalid);
  }
  /**
  * Disable rules with given names. If any rule name not found - throw Error.
  * Errors can be disabled by second param.
  *
  * See also {@link Ruler.enable}, {@link Ruler.enableOnly}.
  *
  * Returns list of found rule names (if no exception happened).
  */
  disable(list2, ignoreInvalid = false) {
    if (!Array.isArray(list2)) list2 = [list2];
    const result = [];
    list2.forEach((name) => {
      const idx = this.__find__(name);
      if (idx < 0) {
        if (ignoreInvalid) return;
        throw new Error(`Rules manager: invalid rule name ${name}`);
      }
      this.__rules__[idx].enabled = false;
      result.push(name);
    });
    this.__cache__ = null;
    return result;
  }
  /**
  * Return array of active functions (rules) for given chain name. It analyzes
  * rules configuration, compiles caches if not exists and returns result.
  *
  * Default chain name is `''` (empty string). It can't be skipped. That's
  * done intentionally, to keep signature monomorphic for high speed.
  */
  getRules(chainName) {
    if (!this.__cache__) this.__compile__();
    return this.__cache__[chainName] || [];
  }
};
var default_rules = {};
default_rules.code_inline = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  return `<code${slf.renderAttrs(token)}>${escapeHtml(token.content)}</code>`;
};
default_rules.code_block = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  return `<pre${slf.renderAttrs(token)}><code>${escapeHtml(tokens[idx].content)}</code></pre>
`;
};
default_rules.fence = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  const info = token.info ? unescapeAll(token.info).trim() : "";
  let langName = "";
  let langAttrs = "";
  if (info) {
    const arr = info.split(/(\s+)/g);
    langName = arr[0];
    langAttrs = arr.slice(2).join("");
  }
  let highlighted;
  if (options.highlight) highlighted = options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content);
  else highlighted = escapeHtml(token.content);
  if (highlighted.indexOf("<pre") === 0) return highlighted + "\n";
  if (info) {
    const i2 = token.attrIndex("class");
    const tmpAttrs = token.attrs ? token.attrs.slice() : [];
    if (i2 < 0) tmpAttrs.push(["class", `${options.langPrefix}${langName}`]);
    else {
      tmpAttrs[i2] = [tmpAttrs[i2][0], tmpAttrs[i2][1]];
      tmpAttrs[i2][1] += ` ${options.langPrefix}${langName}`;
    }
    const tmpToken = { attrs: tmpAttrs };
    return `<pre><code${slf.renderAttrs(tmpToken)}>${highlighted}</code></pre>
`;
  }
  return `<pre><code${slf.renderAttrs(token)}>${highlighted}</code></pre>
`;
};
default_rules.image = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  token.attrs[token.attrIndex("alt")][1] = slf.renderInlineAsText(token.children, options, env);
  return slf.renderToken(tokens, idx, options);
};
default_rules.hardbreak = function(tokens, idx, options) {
  return options.xhtmlOut ? "<br />\n" : "<br>\n";
};
default_rules.softbreak = function(tokens, idx, options) {
  return options.breaks ? options.xhtmlOut ? "<br />\n" : "<br>\n" : "\n";
};
default_rules.text = function(tokens, idx) {
  return escapeHtml(tokens[idx].content);
};
default_rules.html_block = function(tokens, idx) {
  return tokens[idx].content;
};
default_rules.html_inline = function(tokens, idx) {
  return tokens[idx].content;
};
var Renderer = class {
  constructor() {
    _defineProperty(
      this,
      /**
      * Contains render rules for tokens. Can be updated and extended.
      *
      * See [source code](https://github.com/markdown-it/markdown-it/blob/master/src/renderer.ts)
      * for more details and examples.
      *
      * @example Custom render rules
      * ```javascript
      * import MarkdownIt from 'markdown-it'
      * const md = new MarkdownIt()
      *
      * md.renderer.rules.strong_open  = function () { return '<b>'; };
      * md.renderer.rules.strong_close = function () { return '</b>'; };
      *
      * const result = md.renderInline(...);
      * ```
      *
      * @example Each rule is called as independent static function with fixed signature
      * ```javascript
      * function my_token_render(tokens, idx, options, env, renderer) {
      *   // ...
      *   return renderedHTML;
      * }
      * ```
      */
      "rules",
      Object.assign({}, default_rules)
    );
  }
  /**
  * Render token attributes to string.
  */
  renderAttrs(token) {
    let i2, l, result;
    if (!token.attrs) return "";
    result = "";
    for (i2 = 0, l = token.attrs.length; i2 < l; i2++) result += ` ${escapeHtml(token.attrs[i2][0])}="${escapeHtml(String(token.attrs[i2][1]))}"`;
    return result;
  }
  /**
  * Default token renderer. Can be overriden by custom function
  * in {@link Renderer.rules}.
  */
  renderToken(tokens, idx, options) {
    const token = tokens[idx];
    let result = "";
    if (token.hidden) return "";
    let prev = idx - 1;
    while (prev >= 0 && tokens[prev].hidden && tokens[prev].nesting === 0) prev--;
    if (token.block && token.nesting !== -1 && prev >= 0 && tokens[prev].hidden && tokens[prev].nesting === -1) result += "\n";
    result += (token.nesting === -1 ? "</" : "<") + token.tag;
    result += this.renderAttrs(token);
    if (token.nesting === 0 && options.xhtmlOut) result += " /";
    let needLf = false;
    if (token.block) {
      needLf = true;
      if (token.nesting === 1) {
        let next = idx + 1;
        while (next < tokens.length && tokens[next].hidden && tokens[next].nesting === 0) next++;
        if (next < tokens.length) {
          const nextToken = tokens[next];
          if (nextToken.type === "inline" || nextToken.hidden) needLf = false;
          else if (nextToken.nesting === -1 && nextToken.tag === token.tag) needLf = false;
        }
      }
    }
    result += needLf ? ">\n" : ">";
    return result;
  }
  /**
  * The same as {@link Renderer.render}, but for single token of `inline` type.
  */
  renderInline(tokens, options, env) {
    let result = "";
    const rules = this.rules;
    for (let i2 = 0, len = tokens.length; i2 < len; i2++) {
      const type = tokens[i2].type;
      if (typeof rules[type] !== "undefined") result += rules[type](tokens, i2, options, env, this);
      else result += this.renderToken(tokens, i2, options);
    }
    return result;
  }
  /**
  * Special kludge for image `alt` attributes to conform CommonMark spec.
  * Don't try to use it! Spec requires to show `alt` content with stripped markup,
  * instead of simple escaping.
  */
  renderInlineAsText(tokens, options, env) {
    let result = "";
    for (let i2 = 0, len = tokens.length; i2 < len; i2++) switch (tokens[i2].type) {
      case "text":
      case "code_inline":
        result += tokens[i2].content;
        break;
      case "image":
        result += this.renderInlineAsText(tokens[i2].children, options, env);
        break;
      case "html_inline":
      case "html_block":
        result += tokens[i2].content;
        break;
      case "softbreak":
      case "hardbreak":
        result += "\n";
    }
    return result;
  }
  /**
  * Takes token stream and generates HTML. Probably, you will never need to call
  * this method directly.
  */
  render(tokens, options, env) {
    let result = "";
    const rules = this.rules;
    for (let i2 = 0, len = tokens.length; i2 < len; i2++) {
      const type = tokens[i2].type;
      if (type === "inline") result += this.renderInline(tokens[i2].children, options, env);
      else if (typeof rules[type] !== "undefined") result += rules[type](tokens, i2, options, env, this);
      else result += this.renderToken(tokens, i2, options);
    }
    return result;
  }
};
var StateCore = class {
  constructor(src, md2, env) {
    _defineProperty(this, "tokens", []);
    _defineProperty(this, "inlineMode", false);
    _defineProperty(this, "Token", Token);
    this.src = src;
    this.env = env;
    this.md = md2;
  }
};
var UNNORMALIZED_NEWLINE_RE = /\r\n?/g;
var NULL_RE = /\0/g;
function normalize(state) {
  let str;
  str = state.src.replace(UNNORMALIZED_NEWLINE_RE, "\n");
  str = str.replace(NULL_RE, "\uFFFD");
  state.src = str;
}
function block(state) {
  let token;
  if (state.inlineMode) {
    token = new state.Token("inline", "", 0);
    token.content = state.src;
    token.map = [0, 1];
    token.children = [];
    state.tokens.push(token);
  } else state.md.block.parse(state.src, state.md, state.env, state.tokens);
}
function strip_references(state) {
  const tokens = state.tokens;
  let last = 0;
  for (let curr = 0; curr < tokens.length; curr++) {
    if (tokens[curr].type === "reference_definition") continue;
    if (curr !== last) tokens[last] = tokens[curr];
    last++;
  }
  if (tokens.length !== last) tokens.length = last;
}
function inline(state) {
  const tokens = state.tokens;
  for (let i2 = 0, l = tokens.length; i2 < l; i2++) {
    const tok = tokens[i2];
    if (tok.type === "inline") state.md.inline.parse(tok.content, state.md, state.env, tok.children);
  }
}
function isLinkOpen$1(str) {
  return /^<a[>\s]/i.test(str);
}
function isLinkClose$1(str) {
  return /^<\/a\s*>/i.test(str);
}
function linkify$1(state) {
  const blockTokens = state.tokens;
  if (!state.md.options.linkify) return;
  for (let j = 0, l = blockTokens.length; j < l; j++) {
    if (blockTokens[j].type !== "inline" || !state.md.linkify.test(blockTokens[j].content)) continue;
    const tokens = blockTokens[j].children;
    const replacements = [];
    let htmlLinkLevel = 0;
    for (let i2 = tokens.length - 1; i2 >= 0; i2--) {
      const currentToken = tokens[i2];
      if (currentToken.type === "link_close") {
        i2--;
        while (tokens[i2].level !== currentToken.level && tokens[i2].type !== "link_open") i2--;
        continue;
      }
      if (currentToken.type === "html_inline") {
        if (isLinkOpen$1(currentToken.content) && htmlLinkLevel > 0) htmlLinkLevel--;
        if (isLinkClose$1(currentToken.content)) htmlLinkLevel++;
      }
      if (htmlLinkLevel > 0) continue;
      if (currentToken.type === "text" && state.md.linkify.test(currentToken.content)) {
        const text2 = currentToken.content;
        let links = state.md.linkify.match(text2);
        const nodes = [];
        let level = currentToken.level;
        let lastPos = 0;
        if (links.length > 0 && links[0].index === 0 && i2 > 0 && tokens[i2 - 1].type === "text_special") links = links.slice(1);
        for (let ln2 = 0; ln2 < links.length; ln2++) {
          const url = links[ln2].url;
          const fullUrl = state.md.normalizeLink(url);
          if (!state.md.validateLink(fullUrl)) continue;
          let urlText = links[ln2].text;
          if (!links[ln2].schema) urlText = state.md.normalizeLinkText(`http://${urlText}`).replace(/^http:\/\//, "");
          else if (links[ln2].schema === "mailto:" && !/^mailto:/i.test(urlText)) urlText = state.md.normalizeLinkText(`mailto:${urlText}`).replace(/^mailto:/, "");
          else urlText = state.md.normalizeLinkText(urlText);
          const pos = links[ln2].index;
          if (pos > lastPos) {
            const token = new state.Token("text", "", 0);
            token.content = text2.slice(lastPos, pos);
            token.level = level;
            nodes.push(token);
          }
          const token_o = new state.Token("link_open", "a", 1);
          token_o.attrs = [["href", fullUrl]];
          token_o.level = level++;
          token_o.markup = "linkify";
          token_o.info = "auto";
          nodes.push(token_o);
          const token_t = new state.Token("text", "", 0);
          token_t.content = urlText;
          token_t.level = level;
          nodes.push(token_t);
          const token_c = new state.Token("link_close", "a", -1);
          token_c.level = --level;
          token_c.markup = "linkify";
          token_c.info = "auto";
          nodes.push(token_c);
          lastPos = links[ln2].lastIndex;
        }
        if (lastPos < text2.length) {
          const token = new state.Token("text", "", 0);
          token.content = text2.slice(lastPos);
          token.level = level;
          nodes.push(token);
        }
        replacements.push({
          index: i2,
          nodes
        });
      }
    }
    if (replacements.length > 0) {
      let newTokensLength = tokens.length;
      for (const replacement of replacements) newTokensLength += replacement.nodes.length - 1;
      const newTokens = new Array(newTokensLength);
      let replacementIndex = 0;
      let newTokenIndex = 0;
      replacements.reverse();
      for (let i2 = 0; i2 < tokens.length; i2++) {
        const replacement = replacements[replacementIndex];
        if ((replacement === null || replacement === void 0 ? void 0 : replacement.index) === i2) {
          for (const node of replacement.nodes) newTokens[newTokenIndex++] = node;
          replacementIndex++;
        } else newTokens[newTokenIndex++] = tokens[i2];
      }
      blockTokens[j].children = newTokens;
    }
  }
}
var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;
var SCOPED_ABBR_TEST_RE = /\((c|tm|r)\)/i;
var SCOPED_ABBR_RE = /\((c|tm|r)\)/gi;
var SCOPED_ABBR = {
  c: "\xA9",
  r: "\xAE",
  tm: "\u2122"
};
function replaceFn(match, name) {
  return SCOPED_ABBR[name.toLowerCase()];
}
function replace_scoped(inlineTokens) {
  let inside_autolink = 0;
  for (let i2 = inlineTokens.length - 1; i2 >= 0; i2--) {
    const token = inlineTokens[i2];
    if (token.type === "text" && !inside_autolink) token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
    if (token.type === "link_open" && token.info === "auto") inside_autolink--;
    if (token.type === "link_close" && token.info === "auto") inside_autolink++;
  }
}
function replace_rare(inlineTokens) {
  let inside_autolink = 0;
  for (let i2 = inlineTokens.length - 1; i2 >= 0; i2--) {
    const token = inlineTokens[i2];
    if (token.type === "text" && !inside_autolink) {
      if (RARE_RE.test(token.content)) token.content = token.content.replace(/\+-/g, "\xB1").replace(/\.{2,}/g, "\u2026").replace(/([?!])…/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---(?=[^-]|$)/gm, "$1\u2014").replace(/(^|\s)--(?=\s|$)/gm, "$1\u2013").replace(/(^|[^-\s])--(?=[^-\s]|$)/gm, "$1\u2013");
    }
    if (token.type === "link_open" && token.info === "auto") inside_autolink--;
    if (token.type === "link_close" && token.info === "auto") inside_autolink++;
  }
}
function replace(state) {
  let blkIdx;
  if (!state.md.options.typographer) return;
  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
    if (state.tokens[blkIdx].type !== "inline") continue;
    if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) replace_scoped(state.tokens[blkIdx].children);
    if (RARE_RE.test(state.tokens[blkIdx].content)) replace_rare(state.tokens[blkIdx].children);
  }
}
var QUOTE_TEST_RE = /['"]/;
var QUOTE_RE = /['"]/g;
var APOSTROPHE = "\u2019";
var MAX_OPENERS = 1e3;
function truncateStack(stack, heads, length) {
  while (stack.length > length) {
    const item = stack.pop();
    if (item.isSingleQuote) heads.single = item.prevSameQuoteIdx;
    else heads.double = item.prevSameQuoteIdx;
  }
}
function addReplacement(replacements, tokenIdx, pos, ch) {
  if (!replacements[tokenIdx]) replacements[tokenIdx] = [];
  replacements[tokenIdx].push({
    pos,
    ch
  });
}
function applyReplacements(str, replacements) {
  let result = "";
  let lastPos = 0;
  replacements.sort((a, b) => a.pos - b.pos);
  for (let i2 = 0; i2 < replacements.length; i2++) {
    const replacement = replacements[i2];
    result += str.slice(lastPos, replacement.pos) + replacement.ch;
    lastPos = replacement.pos + 1;
  }
  return result + str.slice(lastPos);
}
function process_inlines(tokens, state) {
  let j;
  const stack = [];
  const heads = {
    single: -1,
    double: -1
  };
  const replacements = {};
  for (let i2 = 0; i2 < tokens.length; i2++) {
    const token = tokens[i2];
    const thisLevel = tokens[i2].level;
    for (j = stack.length - 1; j >= 0; j--) if (stack[j].level <= thisLevel) break;
    truncateStack(stack, heads, j + 1);
    if (token.type !== "text") continue;
    const text2 = token.content;
    let pos = 0;
    const max2 = text2.length;
    OUTER: while (pos < max2) {
      QUOTE_RE.lastIndex = pos;
      const t = QUOTE_RE.exec(text2);
      if (!t) break;
      let canOpen = true;
      let canClose = true;
      pos = t.index + 1;
      const isSingle = t[0] === "'";
      let lastChar = 32;
      if (t.index - 1 >= 0) lastChar = text2.charCodeAt(t.index - 1);
      else for (j = i2 - 1; j >= 0; j--) {
        if (tokens[j].type === "softbreak" || tokens[j].type === "hardbreak") break;
        if (!tokens[j].content) continue;
        lastChar = tokens[j].content.charCodeAt(tokens[j].content.length - 1);
        break;
      }
      let nextChar = 32;
      if (pos < max2) nextChar = text2.charCodeAt(pos);
      else for (j = i2 + 1; j < tokens.length; j++) {
        if (tokens[j].type === "softbreak" || tokens[j].type === "hardbreak") break;
        if (!tokens[j].content) continue;
        nextChar = tokens[j].content.charCodeAt(0);
        break;
      }
      const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctCharCode(lastChar);
      const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctCharCode(nextChar);
      const isLastWhiteSpace = isWhiteSpace(lastChar);
      const isNextWhiteSpace = isWhiteSpace(nextChar);
      if (isNextWhiteSpace) canOpen = false;
      else if (isNextPunctChar) {
        if (!(isLastWhiteSpace || isLastPunctChar)) canOpen = false;
      }
      if (isLastWhiteSpace) canClose = false;
      else if (isLastPunctChar) {
        if (!(isNextWhiteSpace || isNextPunctChar)) canClose = false;
      }
      if (nextChar === 34 && t[0] === '"') {
        if (lastChar >= 48 && lastChar <= 57) canClose = canOpen = false;
      }
      if (canOpen && canClose) {
        canOpen = isLastPunctChar;
        canClose = isNextPunctChar;
      }
      if (!canOpen && !canClose) {
        if (isSingle) addReplacement(replacements, i2, t.index, APOSTROPHE);
        continue;
      }
      if (canClose) {
        j = isSingle ? heads.single : heads.double;
        if (j >= 0 && stack[j].level === thisLevel) {
          const item = stack[j];
          let openQuote;
          let closeQuote;
          if (isSingle) {
            openQuote = state.md.options.quotes[2];
            closeQuote = state.md.options.quotes[3];
          } else {
            openQuote = state.md.options.quotes[0];
            closeQuote = state.md.options.quotes[1];
          }
          addReplacement(replacements, i2, t.index, closeQuote);
          addReplacement(replacements, item.tokenIdx, item.contentPos, openQuote);
          truncateStack(stack, heads, j);
          continue OUTER;
        }
      }
      if (canOpen) {
        if (stack.length >= MAX_OPENERS) return;
        stack.push({
          tokenIdx: i2,
          contentPos: t.index,
          isSingleQuote: isSingle,
          level: thisLevel,
          prevSameQuoteIdx: isSingle ? heads.single : heads.double
        });
        if (isSingle) heads.single = stack.length - 1;
        else heads.double = stack.length - 1;
      } else if (canClose && isSingle) addReplacement(replacements, i2, t.index, APOSTROPHE);
    }
  }
  Object.keys(replacements).forEach(function(tokenIdx) {
    const idx = Number(tokenIdx);
    tokens[idx].content = applyReplacements(tokens[idx].content, replacements[tokenIdx]);
  });
}
function smartquotes(state) {
  if (!state.md.options.typographer) return;
  for (let blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
    if (state.tokens[blkIdx].type !== "inline" || !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) continue;
    process_inlines(state.tokens[blkIdx].children, state);
  }
}
function join_alt(tokens) {
  let curr, last;
  const max2 = tokens.length;
  for (curr = 0; curr < max2; curr++) if (tokens[curr].type === "text_special") tokens[curr].type = "text";
  for (curr = last = 0; curr < max2; curr++) if (tokens[curr].type === "text" && curr + 1 < max2 && tokens[curr + 1].type === "text") tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
  else {
    if (curr !== last) tokens[last] = tokens[curr];
    last++;
  }
  if (curr !== last) tokens.length = last;
}
function text_join(state) {
  let curr, last;
  const blockTokens = state.tokens;
  const l = blockTokens.length;
  for (let j = 0; j < l; j++) {
    if (blockTokens[j].type !== "inline") continue;
    const tokens = blockTokens[j].children;
    const max2 = tokens.length;
    for (curr = 0; curr < max2; curr++) {
      if (tokens[curr].type === "text_special") tokens[curr].type = "text";
      if (tokens[curr].children) join_alt(tokens[curr].children);
    }
    for (curr = last = 0; curr < max2; curr++) if (tokens[curr].type === "text" && curr + 1 < max2 && tokens[curr + 1].type === "text") tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
    else {
      if (curr !== last) tokens[last] = tokens[curr];
      last++;
    }
    if (curr !== last) tokens.length = last;
  }
}
var _rules$2 = [
  ["normalize", normalize],
  ["block", block],
  ["strip_references", strip_references],
  ["inline", inline],
  ["linkify", linkify$1],
  ["replacements", replace],
  ["smartquotes", smartquotes],
  ["text_join", text_join]
];
var ParserCore = class {
  constructor() {
    _defineProperty(
      this,
      /**
      * {@link Ruler} instance. Keep configuration of core rules.
      */
      "ruler",
      new Ruler()
    );
    _defineProperty(this, "State", StateCore);
    for (let i2 = 0; i2 < _rules$2.length; i2++) this.ruler.push(_rules$2[i2][0], _rules$2[i2][1]);
  }
  /**
  * Executes core chain rules.
  */
  process(state) {
    const rules = this.ruler.getRules("");
    for (let i2 = 0, l = rules.length; i2 < l; i2++) rules[i2](state);
  }
};
var StateBlock = class {
  constructor(src, md2, env, tokens) {
    _defineProperty(this, "bMarks", []);
    _defineProperty(this, "eMarks", []);
    _defineProperty(this, "tShift", []);
    _defineProperty(this, "sCount", []);
    _defineProperty(this, "bsCount", []);
    _defineProperty(this, "blkIndent", 0);
    _defineProperty(this, "line", 0);
    _defineProperty(this, "lineMax", 0);
    _defineProperty(this, "tight", false);
    _defineProperty(this, "listIndent", -1);
    _defineProperty(this, "parentType", "root");
    _defineProperty(this, "level", 0);
    _defineProperty(this, "Token", Token);
    this.src = src;
    this.md = md2;
    this.env = env;
    this.tokens = tokens;
    const s = this.src;
    for (let start = 0, pos = 0, indent = 0, offset = 0, len = s.length, indent_found = false; pos < len; pos++) {
      const ch = s.charCodeAt(pos);
      if (!indent_found) {
        if (isSpace(ch)) {
          indent++;
          if (ch === 9) offset += 4 - offset % 4;
          else offset++;
          continue;
        } else indent_found = true;
      }
      if (ch === 10 || pos === len - 1) {
        if (ch !== 10) pos++;
        this.bMarks.push(start);
        this.eMarks.push(pos);
        this.tShift.push(indent);
        this.sCount.push(offset);
        this.bsCount.push(0);
        indent_found = false;
        indent = 0;
        offset = 0;
        start = pos + 1;
      }
    }
    this.bMarks.push(s.length);
    this.eMarks.push(s.length);
    this.tShift.push(0);
    this.sCount.push(0);
    this.bsCount.push(0);
    this.lineMax = this.bMarks.length - 1;
  }
  push(type, tag, nesting) {
    const token = new Token(type, tag, nesting);
    token.block = true;
    if (nesting < 0) this.level--;
    token.level = this.level;
    if (nesting > 0) this.level++;
    this.tokens.push(token);
    return token;
  }
  isEmpty(line) {
    return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
  }
  skipEmptyLines(from) {
    for (let max2 = this.lineMax; from < max2; from++) if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) break;
    return from;
  }
  skipSpaces(pos) {
    for (let max2 = this.src.length; pos < max2; pos++) if (!isSpace(this.src.charCodeAt(pos))) break;
    return pos;
  }
  skipSpacesBack(pos, min) {
    if (pos <= min) return pos;
    while (pos > min) if (!isSpace(this.src.charCodeAt(--pos))) return pos + 1;
    return pos;
  }
  skipChars(pos, code2) {
    for (let max2 = this.src.length; pos < max2; pos++) if (this.src.charCodeAt(pos) !== code2) break;
    return pos;
  }
  skipCharsBack(pos, code2, min) {
    if (pos <= min) return pos;
    while (pos > min) if (code2 !== this.src.charCodeAt(--pos)) return pos + 1;
    return pos;
  }
  getLines(begin, end, indent, keepLastLF) {
    if (begin >= end) return "";
    const queue = new Array(end - begin);
    for (let i2 = 0, line = begin; line < end; line++, i2++) {
      let lineIndent = 0;
      const lineStart = this.bMarks[line];
      let first = lineStart;
      let last;
      if (line + 1 < end || keepLastLF) last = this.eMarks[line] + 1;
      else last = this.eMarks[line];
      while (first < last && lineIndent < indent) {
        const ch = this.src.charCodeAt(first);
        if (isSpace(ch)) {
          if (ch === 9) lineIndent += 4 - (lineIndent + this.bsCount[line]) % 4;
          else lineIndent++;
        } else if (first - lineStart < this.tShift[line]) lineIndent++;
        else break;
        first++;
      }
      if (lineIndent > indent) queue[i2] = new Array(lineIndent - indent + 1).join(" ") + this.src.slice(first, last);
      else queue[i2] = this.src.slice(first, last);
    }
    return queue.join("");
  }
};
var MAX_AUTOCOMPLETED_CELLS = 65536;
function getLine(state, line) {
  const pos = state.bMarks[line] + state.tShift[line];
  const max2 = state.eMarks[line];
  return state.src.slice(pos, max2);
}
function escapedSplit(str) {
  const result = [];
  const max2 = str.length;
  let pos = 0;
  let ch = str.charCodeAt(pos);
  let isEscaped = false;
  let lastPos = 0;
  let current = "";
  while (pos < max2) {
    if (ch === 124) {
      if (!isEscaped) {
        result.push(current + str.substring(lastPos, pos));
        current = "";
        lastPos = pos + 1;
      } else {
        current += str.substring(lastPos, pos - 1);
        lastPos = pos;
      }
    }
    isEscaped = ch === 92;
    pos++;
    ch = str.charCodeAt(pos);
  }
  result.push(current + str.substring(lastPos));
  return result;
}
function table(state, startLine, endLine, silent) {
  if (startLine + 2 > endLine) return false;
  let nextLine = startLine + 1;
  if (state.sCount[nextLine] < state.blkIndent) return false;
  if (state.sCount[nextLine] - state.blkIndent >= 4) return false;
  let pos = state.bMarks[nextLine] + state.tShift[nextLine];
  if (pos >= state.eMarks[nextLine]) return false;
  const firstCh = state.src.charCodeAt(pos++);
  if (firstCh !== 124 && firstCh !== 45 && firstCh !== 58) return false;
  if (pos >= state.eMarks[nextLine]) return false;
  const secondCh = state.src.charCodeAt(pos++);
  if (secondCh !== 124 && secondCh !== 45 && secondCh !== 58 && !isSpace(secondCh)) return false;
  if (firstCh === 45 && isSpace(secondCh)) return false;
  while (pos < state.eMarks[nextLine]) {
    const ch = state.src.charCodeAt(pos);
    if (ch !== 124 && ch !== 45 && ch !== 58 && !isSpace(ch)) return false;
    pos++;
  }
  let lineText = getLine(state, startLine + 1);
  let columns = lineText.split("|");
  const aligns = [];
  for (let i2 = 0; i2 < columns.length; i2++) {
    const t = columns[i2].trim();
    if (!t) {
      if (i2 === 0 || i2 === columns.length - 1) continue;
      else return false;
    }
    if (!/^:?-+:?$/.test(t)) return false;
    if (t.charCodeAt(t.length - 1) === 58) aligns.push(t.charCodeAt(0) === 58 ? "center" : "right");
    else if (t.charCodeAt(0) === 58) aligns.push("left");
    else aligns.push("");
  }
  lineText = getLine(state, startLine).trim();
  if (lineText.indexOf("|") === -1) return false;
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  columns = escapedSplit(lineText);
  if (columns.length && columns[0] === "") columns.shift();
  if (columns.length && columns[columns.length - 1] === "") columns.pop();
  const columnCount = columns.length;
  if (columnCount === 0 || columnCount !== aligns.length) return false;
  if (silent) return true;
  const oldParentType = state.parentType;
  state.parentType = "table";
  const terminatorRules = state.md.block.ruler.getRules("blockquote");
  const token_to = state.push("table_open", "table", 1);
  const tableLines = [startLine, 0];
  token_to.map = tableLines;
  const token_tho = state.push("thead_open", "thead", 1);
  token_tho.map = [startLine, startLine + 1];
  const token_htro = state.push("tr_open", "tr", 1);
  token_htro.map = [startLine, startLine + 1];
  for (let i2 = 0; i2 < columns.length; i2++) {
    const token_ho = state.push("th_open", "th", 1);
    if (aligns[i2]) token_ho.attrs = [["style", `text-align:${aligns[i2]}`]];
    const token_il = state.push("inline", "", 0);
    token_il.content = columns[i2].trim();
    token_il.children = [];
    state.push("th_close", "th", -1);
  }
  state.push("tr_close", "tr", -1);
  state.push("thead_close", "thead", -1);
  let tbodyLines;
  let autocompletedCells = 0;
  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < state.blkIndent) break;
    let terminate = false;
    for (let i2 = 0, l = terminatorRules.length; i2 < l; i2++) if (terminatorRules[i2](state, nextLine, endLine, true)) {
      terminate = true;
      break;
    }
    if (terminate) break;
    lineText = getLine(state, nextLine).trim();
    if (!lineText) break;
    if (state.sCount[nextLine] - state.blkIndent >= 4) break;
    columns = escapedSplit(lineText);
    if (columns.length && columns[0] === "") columns.shift();
    if (columns.length && columns[columns.length - 1] === "") columns.pop();
    autocompletedCells += columnCount - columns.length;
    if (autocompletedCells > MAX_AUTOCOMPLETED_CELLS) break;
    if (nextLine === startLine + 2) {
      const token_tbo = state.push("tbody_open", "tbody", 1);
      token_tbo.map = tbodyLines = [startLine + 2, 0];
    }
    const token_tro = state.push("tr_open", "tr", 1);
    token_tro.map = [nextLine, nextLine + 1];
    for (let i2 = 0; i2 < columnCount; i2++) {
      const token_tdo = state.push("td_open", "td", 1);
      if (aligns[i2]) token_tdo.attrs = [["style", `text-align:${aligns[i2]}`]];
      const token_il = state.push("inline", "", 0);
      token_il.content = columns[i2] ? columns[i2].trim() : "";
      token_il.children = [];
      state.push("td_close", "td", -1);
    }
    state.push("tr_close", "tr", -1);
  }
  if (tbodyLines) {
    state.push("tbody_close", "tbody", -1);
    tbodyLines[1] = nextLine;
  }
  state.push("table_close", "table", -1);
  tableLines[1] = nextLine;
  state.parentType = oldParentType;
  state.line = nextLine;
  return true;
}
function code(state, startLine, endLine) {
  if (state.sCount[startLine] - state.blkIndent < 4) return false;
  let nextLine = startLine + 1;
  let last = nextLine;
  while (nextLine < endLine) {
    if (state.isEmpty(nextLine)) {
      nextLine++;
      continue;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      nextLine++;
      last = nextLine;
      continue;
    }
    break;
  }
  state.line = last;
  const token = state.push("code_block", "code", 0);
  token.content = state.getLines(startLine, last, 4 + state.blkIndent, false) + "\n";
  token.map = [startLine, state.line];
  return true;
}
function fence(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max2 = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  if (pos + 3 > max2) return false;
  const marker = state.src.charCodeAt(pos);
  if (marker !== 126 && marker !== 96) return false;
  let mem = pos;
  pos = state.skipChars(pos, marker);
  let len = pos - mem;
  if (len < 3) return false;
  const markup = state.src.slice(mem, pos);
  const params = state.src.slice(pos, max2);
  if (marker === 96) {
    if (params.indexOf(String.fromCharCode(marker)) >= 0) return false;
  }
  if (silent) return true;
  let nextLine = startLine;
  let haveEndMarker = false;
  for (; ; ) {
    nextLine++;
    if (nextLine >= endLine) break;
    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
    max2 = state.eMarks[nextLine];
    if (pos < max2 && state.sCount[nextLine] < state.blkIndent) break;
    if (state.src.charCodeAt(pos) !== marker) continue;
    if (state.sCount[nextLine] - state.blkIndent >= 4) continue;
    pos = state.skipChars(pos, marker);
    if (pos - mem < len) continue;
    pos = state.skipSpaces(pos);
    if (pos < max2) continue;
    haveEndMarker = true;
    break;
  }
  len = state.sCount[startLine];
  state.line = nextLine + (haveEndMarker ? 1 : 0);
  const token = state.push("fence", "code", 0);
  token.info = params;
  token.content = state.getLines(startLine + 1, nextLine, len, true);
  token.markup = markup;
  token.map = [startLine, state.line];
  return true;
}
function blockquote(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max2 = state.eMarks[startLine];
  const oldLineMax = state.lineMax;
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  if (state.src.charCodeAt(pos) !== 62) return false;
  if (silent) return true;
  const oldBMarks = [];
  const oldBSCount = [];
  const oldSCount = [];
  const oldTShift = [];
  const terminatorRules = state.md.block.ruler.getRules("blockquote");
  const oldParentType = state.parentType;
  state.parentType = "blockquote";
  let lastLineEmpty = false;
  let nextLine;
  for (nextLine = startLine; nextLine < endLine; nextLine++) {
    const isOutdented = state.sCount[nextLine] < state.blkIndent;
    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max2 = state.eMarks[nextLine];
    if (pos >= max2) break;
    if (state.src.charCodeAt(pos++) === 62 && !isOutdented) {
      let initial = state.sCount[nextLine] + 1;
      let spaceAfterMarker;
      let adjustTab;
      if (state.src.charCodeAt(pos) === 32) {
        pos++;
        initial++;
        adjustTab = false;
        spaceAfterMarker = true;
      } else if (state.src.charCodeAt(pos) === 9) {
        spaceAfterMarker = true;
        if ((state.bsCount[nextLine] + initial) % 4 === 3) {
          pos++;
          initial++;
          adjustTab = false;
        } else adjustTab = true;
      } else spaceAfterMarker = false;
      let offset = initial;
      oldBMarks.push(state.bMarks[nextLine]);
      state.bMarks[nextLine] = pos;
      while (pos < max2) {
        const ch = state.src.charCodeAt(pos);
        if (isSpace(ch)) {
          if (ch === 9) offset += 4 - (offset + state.bsCount[nextLine] + (adjustTab ? 1 : 0)) % 4;
          else offset++;
        } else break;
        pos++;
      }
      lastLineEmpty = pos >= max2;
      oldBSCount.push(state.bsCount[nextLine]);
      state.bsCount[nextLine] = state.sCount[nextLine] + 1 + (spaceAfterMarker ? 1 : 0);
      oldSCount.push(state.sCount[nextLine]);
      state.sCount[nextLine] = offset - initial;
      oldTShift.push(state.tShift[nextLine]);
      state.tShift[nextLine] = pos - state.bMarks[nextLine];
      continue;
    }
    if (lastLineEmpty) break;
    let terminate = false;
    for (let i2 = 0, l = terminatorRules.length; i2 < l; i2++) if (terminatorRules[i2](state, nextLine, endLine, true)) {
      terminate = true;
      break;
    }
    if (terminate) {
      state.lineMax = nextLine;
      if (state.blkIndent !== 0) {
        oldBMarks.push(state.bMarks[nextLine]);
        oldBSCount.push(state.bsCount[nextLine]);
        oldTShift.push(state.tShift[nextLine]);
        oldSCount.push(state.sCount[nextLine]);
        state.sCount[nextLine] -= state.blkIndent;
      }
      break;
    }
    oldBMarks.push(state.bMarks[nextLine]);
    oldBSCount.push(state.bsCount[nextLine]);
    oldTShift.push(state.tShift[nextLine]);
    oldSCount.push(state.sCount[nextLine]);
    state.sCount[nextLine] = -1;
  }
  const oldIndent = state.blkIndent;
  state.blkIndent = 0;
  const token_o = state.push("blockquote_open", "blockquote", 1);
  token_o.markup = ">";
  const lines = [startLine, 0];
  token_o.map = lines;
  state.md.block.tokenize(state, startLine, nextLine);
  const token_c = state.push("blockquote_close", "blockquote", -1);
  token_c.markup = ">";
  state.lineMax = oldLineMax;
  state.parentType = oldParentType;
  lines[1] = state.line;
  for (let i2 = 0; i2 < oldTShift.length; i2++) {
    state.bMarks[i2 + startLine] = oldBMarks[i2];
    state.tShift[i2 + startLine] = oldTShift[i2];
    state.sCount[i2 + startLine] = oldSCount[i2];
    state.bsCount[i2 + startLine] = oldBSCount[i2];
  }
  state.blkIndent = oldIndent;
  return true;
}
function hr(state, startLine, endLine, silent) {
  const max2 = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  const marker = state.src.charCodeAt(pos++);
  if (marker !== 42 && marker !== 45 && marker !== 95) return false;
  let cnt = 1;
  while (pos < max2) {
    const ch = state.src.charCodeAt(pos++);
    if (ch !== marker && !isSpace(ch)) return false;
    if (ch === marker) cnt++;
  }
  if (cnt < 3) return false;
  if (silent) return true;
  state.line = startLine + 1;
  const token = state.push("hr", "hr", 0);
  token.map = [startLine, state.line];
  token.markup = Array(cnt + 1).join(String.fromCharCode(marker));
  return true;
}
function skipBulletListMarker(state, startLine) {
  const max2 = state.eMarks[startLine];
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  const marker = state.src.charCodeAt(pos++);
  if (marker !== 42 && marker !== 45 && marker !== 43) return -1;
  if (pos < max2) {
    if (!isSpace(state.src.charCodeAt(pos))) return -1;
  }
  return pos;
}
function skipOrderedListMarker(state, startLine) {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max2 = state.eMarks[startLine];
  let pos = start;
  if (pos + 1 >= max2) return -1;
  let ch = state.src.charCodeAt(pos++);
  if (ch < 48 || ch > 57) return -1;
  for (; ; ) {
    if (pos >= max2) return -1;
    ch = state.src.charCodeAt(pos++);
    if (ch >= 48 && ch <= 57) {
      if (pos - start >= 10) return -1;
      continue;
    }
    if (ch === 41 || ch === 46) break;
    return -1;
  }
  if (pos < max2) {
    ch = state.src.charCodeAt(pos);
    if (!isSpace(ch)) return -1;
  }
  return pos;
}
function markTightParagraphs(state, idx) {
  const level = state.level + 2;
  for (let i2 = idx + 2, l = state.tokens.length - 2; i2 < l; i2++) if (state.tokens[i2].level === level && state.tokens[i2].type === "paragraph_open") {
    state.tokens[i2 + 2].hidden = true;
    state.tokens[i2].hidden = true;
    i2 += 2;
  }
}
function list(state, startLine, endLine, silent) {
  let max2, pos, start, token;
  let nextLine = startLine;
  let tight = true;
  if (state.sCount[nextLine] - state.blkIndent >= 4) return false;
  if (state.listIndent >= 0 && state.sCount[nextLine] - state.listIndent >= 4 && state.sCount[nextLine] < state.blkIndent) return false;
  let isTerminatingParagraph = false;
  if (silent && state.parentType === "paragraph") {
    if (state.sCount[nextLine] >= state.blkIndent) isTerminatingParagraph = true;
  }
  let isOrdered;
  let markerValue;
  let posAfterMarker;
  if ((posAfterMarker = skipOrderedListMarker(state, nextLine)) >= 0) {
    isOrdered = true;
    start = state.bMarks[nextLine] + state.tShift[nextLine];
    markerValue = Number(state.src.slice(start, posAfterMarker - 1));
    if (isTerminatingParagraph && markerValue !== 1) return false;
  } else if ((posAfterMarker = skipBulletListMarker(state, nextLine)) >= 0) isOrdered = false;
  else return false;
  if (isTerminatingParagraph) {
    if (state.skipSpaces(posAfterMarker) >= state.eMarks[nextLine]) return false;
  }
  if (silent) return true;
  const markerCharCode = state.src.charCodeAt(posAfterMarker - 1);
  const listTokIdx = state.tokens.length;
  if (isOrdered) {
    token = state.push("ordered_list_open", "ol", 1);
    if (markerValue !== 1) token.attrs = [["start", markerValue]];
  } else token = state.push("bullet_list_open", "ul", 1);
  const listLines = [nextLine, 0];
  token.map = listLines;
  token.markup = String.fromCharCode(markerCharCode);
  let prevEmptyEnd = false;
  const terminatorRules = state.md.block.ruler.getRules("list");
  const oldParentType = state.parentType;
  state.parentType = "list";
  while (nextLine < endLine) {
    pos = posAfterMarker;
    max2 = state.eMarks[nextLine];
    const initial = state.sCount[nextLine] + posAfterMarker - (state.bMarks[nextLine] + state.tShift[nextLine]);
    let offset = initial;
    while (pos < max2) {
      const ch = state.src.charCodeAt(pos);
      if (ch === 9) offset += 4 - (offset + state.bsCount[nextLine]) % 4;
      else if (ch === 32) offset++;
      else break;
      pos++;
    }
    const contentStart = pos;
    let indentAfterMarker;
    if (contentStart >= max2) indentAfterMarker = 1;
    else indentAfterMarker = offset - initial;
    if (indentAfterMarker > 4) indentAfterMarker = 1;
    const indent = initial + indentAfterMarker;
    token = state.push("list_item_open", "li", 1);
    token.markup = String.fromCharCode(markerCharCode);
    const itemLines = [nextLine, 0];
    token.map = itemLines;
    if (isOrdered) token.info = state.src.slice(start, posAfterMarker - 1);
    const oldTight = state.tight;
    const oldTShift = state.tShift[nextLine];
    const oldSCount = state.sCount[nextLine];
    const oldListIndent = state.listIndent;
    state.listIndent = state.blkIndent;
    state.blkIndent = indent;
    state.tight = true;
    state.tShift[nextLine] = contentStart - state.bMarks[nextLine];
    state.sCount[nextLine] = offset;
    if (contentStart >= max2 && state.isEmpty(nextLine + 1)) state.line = Math.min(state.line + 2, endLine);
    else state.md.block.tokenize(state, nextLine, endLine);
    if (!state.tight || prevEmptyEnd) tight = false;
    prevEmptyEnd = state.line - nextLine > 1 && state.isEmpty(state.line - 1);
    state.blkIndent = state.listIndent;
    state.listIndent = oldListIndent;
    state.tShift[nextLine] = oldTShift;
    state.sCount[nextLine] = oldSCount;
    state.tight = oldTight;
    token = state.push("list_item_close", "li", -1);
    token.markup = String.fromCharCode(markerCharCode);
    nextLine = state.line;
    itemLines[1] = nextLine;
    if (nextLine >= endLine) break;
    if (state.sCount[nextLine] < state.blkIndent) break;
    if (state.sCount[nextLine] - state.blkIndent >= 4) break;
    let terminate = false;
    for (let i2 = 0, l = terminatorRules.length; i2 < l; i2++) if (terminatorRules[i2](state, nextLine, endLine, true)) {
      terminate = true;
      break;
    }
    if (terminate) break;
    if (isOrdered) {
      posAfterMarker = skipOrderedListMarker(state, nextLine);
      if (posAfterMarker < 0) break;
      start = state.bMarks[nextLine] + state.tShift[nextLine];
    } else {
      posAfterMarker = skipBulletListMarker(state, nextLine);
      if (posAfterMarker < 0) break;
    }
    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) break;
  }
  if (isOrdered) token = state.push("ordered_list_close", "ol", -1);
  else token = state.push("bullet_list_close", "ul", -1);
  token.markup = String.fromCharCode(markerCharCode);
  listLines[1] = nextLine;
  state.line = nextLine;
  state.parentType = oldParentType;
  if (tight) markTightParagraphs(state, listTokIdx);
  return true;
}
var MAX_LABEL_LENGTH = 999;
function countCodePoints(str) {
  let length = str.length;
  for (let i2 = 0; i2 < str.length - 1; i2++) {
    const high = str.charCodeAt(i2);
    if (high < 55296 || high > 56319) continue;
    const low = str.charCodeAt(i2 + 1);
    if (low >= 56320 && low <= 57343) {
      length--;
      i2++;
    }
  }
  return length;
}
function lineEnd(state, line) {
  return Math.min(state.eMarks[line] + 1, state.src.length);
}
function getNextLinePos(state, nextLine) {
  const endLine = state.lineMax;
  if (nextLine >= endLine || state.isEmpty(nextLine)) return -1;
  let isContinuation = false;
  if (state.sCount[nextLine] - state.blkIndent > 3) isContinuation = true;
  if (state.sCount[nextLine] < 0) isContinuation = true;
  if (!isContinuation) {
    const terminatorRules = state.md.block.ruler.getRules("reference");
    const oldParentType = state.parentType;
    state.parentType = "reference";
    let terminate = false;
    for (let i2 = 0, l = terminatorRules.length; i2 < l; i2++) if (terminatorRules[i2](state, nextLine, endLine, true)) {
      terminate = true;
      break;
    }
    state.parentType = oldParentType;
    if (terminate) return -1;
  }
  return state.bMarks[nextLine] + state.tShift[nextLine];
}
function reference(state, startLine, _endLine, silent) {
  const src = state.src;
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let nextLine = startLine + 1;
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  if (src.charCodeAt(pos) !== 91) return false;
  let max2 = lineEnd(state, startLine);
  let rawLabel = "";
  let labelEnd = -1;
  let segmentStart = ++pos;
  while (pos < max2) {
    if (rawLabel.length + pos - segmentStart > MAX_LABEL_LENGTH * 2) return false;
    let ch = src.charCodeAt(pos);
    if (ch === 91) return false;
    if (ch === 93) {
      labelEnd = pos;
      break;
    }
    if (ch === 92) ch = src.charCodeAt(++pos);
    if (ch === 10 && pos < max2) {
      const nextPos = getNextLinePos(state, nextLine);
      if (nextPos < 0) return false;
      rawLabel += src.slice(segmentStart, max2);
      pos = segmentStart = nextPos;
      max2 = lineEnd(state, nextLine++);
      continue;
    }
    pos++;
  }
  if (labelEnd < 0 || src.charCodeAt(labelEnd + 1) !== 58) return false;
  rawLabel += src.slice(segmentStart, labelEnd);
  if (rawLabel.length > MAX_LABEL_LENGTH && countCodePoints(rawLabel) > MAX_LABEL_LENGTH) return false;
  pos = labelEnd + 2;
  while (pos < max2) {
    const ch = src.charCodeAt(pos);
    if (ch === 10) {
      const nextPos = getNextLinePos(state, nextLine);
      if (nextPos < 0) break;
      pos = nextPos;
      max2 = lineEnd(state, nextLine++);
    } else if (isSpace(ch)) pos++;
    else break;
  }
  const destRes = state.md.helpers.parseLinkDestination(src, pos, max2);
  if (!destRes.ok) return false;
  const href = state.md.normalizeLink(destRes.str);
  if (!state.md.validateLink(href)) return false;
  pos = destRes.pos;
  const destEndPos = pos;
  const destEndMax = max2;
  const destEndLineNo = nextLine;
  while (pos < max2) {
    const ch = src.charCodeAt(pos);
    if (ch === 10) {
      const nextPos = getNextLinePos(state, nextLine);
      if (nextPos < 0) break;
      pos = nextPos;
      max2 = lineEnd(state, nextLine++);
    } else if (isSpace(ch)) pos++;
    else break;
  }
  const titleStart = pos;
  let titleRes = state.md.helpers.parseLinkTitle(src, pos, max2);
  while (titleRes.can_continue) {
    const nextPos = getNextLinePos(state, nextLine);
    if (nextPos < 0) break;
    pos = nextPos;
    max2 = lineEnd(state, nextLine++);
    titleRes = state.md.helpers.parseLinkTitle(src, pos, max2, titleRes);
  }
  let title;
  if (titleStart !== destEndPos && titleRes.ok) {
    title = titleRes.str;
    pos = titleRes.pos;
  } else {
    title = "";
    pos = destEndPos;
    max2 = destEndMax;
    nextLine = destEndLineNo;
  }
  while (pos < max2) {
    if (!isSpace(src.charCodeAt(pos))) break;
    pos++;
  }
  if (pos < max2 && src.charCodeAt(pos) !== 10) {
    if (title) {
      title = "";
      pos = destEndPos;
      max2 = destEndMax;
      nextLine = destEndLineNo;
      while (pos < max2) {
        if (!isSpace(src.charCodeAt(pos))) break;
        pos++;
      }
    }
  }
  if (pos < max2 && src.charCodeAt(pos) !== 10) return false;
  const label = normalizeReference(rawLabel);
  if (!label) return false;
  if (silent) return true;
  if (typeof state.env.references === "undefined") state.env.references = {};
  if (typeof state.env.references[label] === "undefined") state.env.references[label] = {
    title,
    href
  };
  const token = state.push("reference_definition", "", 0);
  token.map = [startLine, nextLine];
  token.hidden = true;
  const meta = /* @__PURE__ */ Object.create(null);
  meta.label = label;
  token.meta = meta;
  state.line = nextLine;
  return true;
}
var html_blocks_default = [
  "address",
  "article",
  "aside",
  "base",
  "basefont",
  "blockquote",
  "body",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "legend",
  "li",
  "link",
  "main",
  "menu",
  "menuitem",
  "nav",
  "noframes",
  "ol",
  "optgroup",
  "option",
  "p",
  "param",
  "search",
  "section",
  "summary",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul"
];
var open_tag = `<[A-Za-z][A-Za-z0-9\\-]*(?:\\s+[a-zA-Z_:][a-zA-Z0-9:._-]*(?:\\s*=\\s*(?:[^"'=<>\`\\x00-\\x20]+|'[^']*'|"[^"]*"))?)*\\s*\\/?>`;
var close_tag = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>";
new RegExp(`^(?:${open_tag}|${close_tag}|<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->|<[?][\\s\\S]*?[?]>|<![A-Za-z][^>]*>|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>)`);
var HTML_OPEN_CLOSE_TAG_RE = new RegExp(`^(?:${open_tag}|${close_tag})`);
var HTML_SEQUENCES = [
  [
    /^<(script|pre|style|textarea)(?=(\s|>|$))/i,
    /<\/(script|pre|style|textarea)>/i,
    true
  ],
  [
    /^<!--/,
    /-->/,
    true
  ],
  [
    /^<\?/,
    /\?>/,
    true
  ],
  [
    /^<![A-Za-z]/,
    />/,
    true
  ],
  [
    /^<!\[CDATA\[/,
    /\]\]>/,
    true
  ],
  [
    new RegExp(`^</?(${html_blocks_default.join("|")})(?=(\\s|/?>|$))`, "i"),
    /^$/,
    true
  ],
  [
    new RegExp(`${HTML_OPEN_CLOSE_TAG_RE.source}\\s*$`),
    /^$/,
    false
  ]
];
function html_block(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max2 = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  if (!state.md.options.html) return false;
  if (state.src.charCodeAt(pos) !== 60) return false;
  let lineText = state.src.slice(pos, max2);
  let i2 = 0;
  for (; i2 < HTML_SEQUENCES.length; i2++) if (HTML_SEQUENCES[i2][0].test(lineText)) break;
  if (i2 === HTML_SEQUENCES.length) return false;
  if (silent) return HTML_SEQUENCES[i2][2];
  let nextLine = startLine + 1;
  const endsOnBlankLine = HTML_SEQUENCES[i2][1].test("");
  if (!HTML_SEQUENCES[i2][1].test(lineText)) for (; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < state.blkIndent) {
      if (endsOnBlankLine || !state.isEmpty(nextLine)) break;
    }
    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max2 = state.eMarks[nextLine];
    lineText = state.src.slice(pos, max2);
    if (HTML_SEQUENCES[i2][1].test(lineText)) {
      if (lineText.length !== 0) nextLine++;
      break;
    }
  }
  state.line = nextLine;
  const token = state.push("html_block", "", 0);
  token.map = [startLine, nextLine];
  token.content = state.getLines(startLine, nextLine, state.blkIndent, true);
  return true;
}
function heading(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max2 = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  let ch = state.src.charCodeAt(pos);
  if (ch !== 35 || pos >= max2) return false;
  let level = 1;
  ch = state.src.charCodeAt(++pos);
  while (ch === 35 && pos < max2 && level <= 6) {
    level++;
    ch = state.src.charCodeAt(++pos);
  }
  if (level > 6 || pos < max2 && !isSpace(ch)) return false;
  if (silent) return true;
  max2 = state.skipSpacesBack(max2, pos);
  const tmp = state.skipCharsBack(max2, 35, pos);
  if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) max2 = tmp;
  state.line = startLine + 1;
  const token_o = state.push("heading_open", `h${level}`, 1);
  token_o.markup = "########".slice(0, level);
  token_o.map = [startLine, state.line];
  const token_i = state.push("inline", "", 0);
  token_i.content = asciiTrim(state.src.slice(pos, max2));
  token_i.map = [startLine, state.line];
  token_i.children = [];
  const token_c = state.push("heading_close", `h${level}`, -1);
  token_c.markup = "########".slice(0, level);
  return true;
}
function lheading(state, startLine, endLine) {
  const terminatorRules = state.md.block.ruler.getRules("paragraph");
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  const oldParentType = state.parentType;
  state.parentType = "paragraph";
  let level = 0;
  let marker;
  let nextLine = startLine + 1;
  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    if (state.sCount[nextLine] - state.blkIndent > 3) continue;
    if (state.sCount[nextLine] >= state.blkIndent) {
      let pos = state.bMarks[nextLine] + state.tShift[nextLine];
      const max2 = state.eMarks[nextLine];
      if (pos < max2) {
        marker = state.src.charCodeAt(pos);
        if (marker === 45 || marker === 61) {
          pos = state.skipChars(pos, marker);
          pos = state.skipSpaces(pos);
          if (pos >= max2) {
            level = marker === 61 ? 1 : 2;
            break;
          }
        }
      }
    }
    if (state.sCount[nextLine] < 0) continue;
    let terminate = false;
    for (let i2 = 0, l = terminatorRules.length; i2 < l; i2++) if (terminatorRules[i2](state, nextLine, endLine, true)) {
      terminate = true;
      break;
    }
    if (terminate) break;
  }
  if (!level) {
    state.parentType = oldParentType;
    return false;
  }
  const content = asciiTrim(state.getLines(startLine, nextLine, state.blkIndent, false));
  state.line = nextLine + 1;
  const token_o = state.push("heading_open", `h${level}`, 1);
  token_o.markup = String.fromCharCode(marker);
  token_o.map = [startLine, state.line];
  const token_i = state.push("inline", "", 0);
  token_i.content = content;
  token_i.map = [startLine, state.line - 1];
  token_i.children = [];
  const token_c = state.push("heading_close", `h${level}`, -1);
  token_c.markup = String.fromCharCode(marker);
  state.parentType = oldParentType;
  return true;
}
function paragraph(state, startLine, endLine) {
  const terminatorRules = state.md.block.ruler.getRules("paragraph");
  const oldParentType = state.parentType;
  let nextLine = startLine + 1;
  state.parentType = "paragraph";
  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    if (state.sCount[nextLine] - state.blkIndent > 3) continue;
    if (state.sCount[nextLine] < 0) continue;
    let terminate = false;
    for (let i2 = 0, l = terminatorRules.length; i2 < l; i2++) if (terminatorRules[i2](state, nextLine, endLine, true)) {
      terminate = true;
      break;
    }
    if (terminate) break;
  }
  const content = asciiTrim(state.getLines(startLine, nextLine, state.blkIndent, false));
  state.line = nextLine;
  const token_o = state.push("paragraph_open", "p", 1);
  token_o.map = [startLine, state.line];
  const token_i = state.push("inline", "", 0);
  token_i.content = content;
  token_i.map = [startLine, state.line];
  token_i.children = [];
  state.push("paragraph_close", "p", -1);
  state.parentType = oldParentType;
  return true;
}
var _rules$1 = [
  [
    "table",
    table,
    ["paragraph", "reference"]
  ],
  ["code", code],
  [
    "fence",
    fence,
    [
      "paragraph",
      "reference",
      "blockquote",
      "list"
    ]
  ],
  [
    "blockquote",
    blockquote,
    [
      "paragraph",
      "reference",
      "blockquote",
      "list"
    ]
  ],
  [
    "hr",
    hr,
    [
      "paragraph",
      "reference",
      "blockquote",
      "list"
    ]
  ],
  [
    "list",
    list,
    [
      "paragraph",
      "reference",
      "blockquote"
    ]
  ],
  ["reference", reference],
  [
    "html_block",
    html_block,
    [
      "paragraph",
      "reference",
      "blockquote"
    ]
  ],
  [
    "heading",
    heading,
    [
      "paragraph",
      "reference",
      "blockquote"
    ]
  ],
  ["lheading", lheading],
  ["paragraph", paragraph]
];
var ParserBlock = class {
  constructor() {
    _defineProperty(
      this,
      /**
      * {@link Ruler} instance. Keep configuration of block rules.
      */
      "ruler",
      new Ruler()
    );
    _defineProperty(this, "State", StateBlock);
    for (let i2 = 0; i2 < _rules$1.length; i2++) this.ruler.push(_rules$1[i2][0], _rules$1[i2][1], { alt: (_rules$1[i2][2] || []).slice() });
  }
  tokenize(state, startLine, endLine) {
    const rules = this.ruler.getRules("");
    const len = rules.length;
    const maxNesting = state.md.options.maxNesting;
    let line = startLine;
    let hasEmptyLines = false;
    while (line < endLine) {
      state.line = line = state.skipEmptyLines(line);
      if (line >= endLine) break;
      if (state.sCount[line] < state.blkIndent) break;
      if (state.level >= maxNesting) {
        state.line = endLine;
        break;
      }
      const prevLine = state.line;
      let ok = false;
      for (let i2 = 0; i2 < len; i2++) {
        ok = rules[i2](state, line, endLine, false);
        if (ok) {
          if (prevLine >= state.line) throw new Error("block rule didn't increment state.line");
          break;
        }
      }
      if (!ok) throw new Error("none of the block rules matched");
      state.tight = !hasEmptyLines;
      if (state.isEmpty(state.line - 1)) hasEmptyLines = true;
      line = state.line;
      if (line < endLine && state.isEmpty(line)) {
        hasEmptyLines = true;
        line++;
        state.line = line;
      }
    }
  }
  /**
  * Process input string and push block tokens into `outTokens`
  */
  parse(src, md2, env, outTokens) {
    if (!src) return;
    const state = new this.State(src, md2, env, outTokens);
    this.tokenize(state, state.line, state.lineMax);
  }
};
var StateInline = class {
  constructor(src, md2, env, outTokens) {
    _defineProperty(this, "pos", 0);
    _defineProperty(this, "level", 0);
    _defineProperty(this, "pending", "");
    _defineProperty(this, "pendingLevel", 0);
    _defineProperty(this, "cache", {});
    _defineProperty(this, "backticks", {});
    _defineProperty(this, "backticksScanned", false);
    _defineProperty(this, "skipHtmlSpecial", false);
    _defineProperty(this, "linkLevel", 0);
    _defineProperty(this, "delimiters", []);
    _defineProperty(this, "_prev_delimiters", []);
    _defineProperty(this, "Token", Token);
    this.src = src;
    this.env = env;
    this.md = md2;
    this.tokens = outTokens;
    this.tokens_meta = Array(outTokens.length);
    this.posMax = this.src.length;
  }
  pushPending() {
    const token = new Token("text", "", 0);
    token.content = this.pending;
    token.level = this.pendingLevel;
    this.tokens.push(token);
    this.pending = "";
    return token;
  }
  push(type, tag, nesting) {
    if (this.pending) this.pushPending();
    const token = new Token(type, tag, nesting);
    let token_meta = void 0;
    if (nesting < 0) {
      this.level--;
      this.delimiters = this._prev_delimiters.pop();
    }
    token.level = this.level;
    if (nesting > 0) {
      this.level++;
      this._prev_delimiters.push(this.delimiters);
      this.delimiters = [];
      token_meta = { delimiters: this.delimiters };
    }
    this.pendingLevel = this.level;
    this.tokens.push(token);
    this.tokens_meta.push(token_meta);
    return token;
  }
  scanDelims(start, canSplitWord) {
    const max2 = this.posMax;
    const marker = this.src.charCodeAt(start);
    let lastChar;
    if (start === 0) lastChar = 32;
    else if (start === 1) {
      lastChar = this.src.charCodeAt(0);
      if ((lastChar & 63488) === 55296) lastChar = 65533;
    } else {
      lastChar = this.src.charCodeAt(start - 1);
      if ((lastChar & 64512) === 56320) {
        const highSurr = this.src.charCodeAt(start - 2);
        lastChar = (highSurr & 64512) === 55296 ? 65536 + (highSurr - 55296 << 10) + (lastChar - 56320) : 65533;
      } else if ((lastChar & 64512) === 55296) lastChar = 65533;
    }
    let pos = start;
    while (pos < max2 && this.src.charCodeAt(pos) === marker) pos++;
    const count = pos - start;
    let nextChar = pos < max2 ? this.src.charCodeAt(pos) : 32;
    if ((nextChar & 64512) === 55296) {
      const lowSurr = this.src.charCodeAt(pos + 1);
      nextChar = (lowSurr & 64512) === 56320 ? 65536 + (nextChar - 55296 << 10) + (lowSurr - 56320) : 65533;
    } else if ((nextChar & 64512) === 56320) nextChar = 65533;
    const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctCharCode(lastChar);
    const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctCharCode(nextChar);
    const isLastWhiteSpace = isWhiteSpace(lastChar);
    const isNextWhiteSpace = isWhiteSpace(nextChar);
    const left_flanking = !isNextWhiteSpace && (!isNextPunctChar || isLastWhiteSpace || isLastPunctChar);
    const right_flanking = !isLastWhiteSpace && (!isLastPunctChar || isNextWhiteSpace || isNextPunctChar);
    return {
      can_open: left_flanking && (canSplitWord || !right_flanking || isLastPunctChar),
      can_close: right_flanking && (canSplitWord || !left_flanking || isNextPunctChar),
      length: count
    };
  }
};
function isTerminatorChar(ch) {
  switch (ch) {
    case 10:
    case 33:
    case 35:
    case 36:
    case 37:
    case 38:
    case 42:
    case 43:
    case 45:
    case 58:
    case 60:
    case 61:
    case 62:
    case 64:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
    case 123:
    case 125:
    case 126:
      return true;
    default:
      return false;
  }
}
function text(state, silent) {
  let pos = state.pos;
  while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) pos++;
  if (pos === state.pos) return false;
  if (!silent) state.pending += state.src.slice(state.pos, pos);
  state.pos = pos;
  return true;
}
function isAsciiAlpha(code2) {
  return code2 >= 65 && code2 <= 90 || code2 >= 97 && code2 <= 122;
}
function isSchemeChar(code2) {
  return code2 >= 65 && code2 <= 90 || code2 >= 97 && code2 <= 122 || code2 >= 48 && code2 <= 57 || code2 === 43 || code2 === 45 || code2 === 46;
}
function linkify(state, silent) {
  if (!state.md.options.linkify) return false;
  if (state.linkLevel > 0) return false;
  const pos = state.pos;
  const max2 = state.posMax;
  if (pos + 3 > max2) return false;
  if (state.src.charCodeAt(pos) !== 58) return false;
  if (state.src.charCodeAt(pos + 1) !== 47) return false;
  if (state.src.charCodeAt(pos + 2) !== 47) return false;
  const protoMin = pos - Math.min(10, state.pending.length, pos);
  let protoStart = pos;
  while (protoStart > protoMin && isSchemeChar(state.src.charCodeAt(protoStart - 1))) protoStart--;
  if (protoStart === pos || !isAsciiAlpha(state.src.charCodeAt(protoStart))) return false;
  const protoLength = pos - protoStart;
  const link2 = state.md.linkify.matchAtStart(state.src.slice(protoStart));
  if (!link2) return false;
  let url = link2.url;
  if (url.length <= protoLength) return false;
  let urlEnd = url.length;
  while (urlEnd > 0 && url.charCodeAt(urlEnd - 1) === 42) urlEnd--;
  if (urlEnd !== url.length) url = url.slice(0, urlEnd);
  const fullUrl = state.md.normalizeLink(url);
  if (!state.md.validateLink(fullUrl)) return false;
  if (!silent) {
    state.pending = state.pending.slice(0, -protoLength);
    const token_o = state.push("link_open", "a", 1);
    token_o.attrs = [["href", fullUrl]];
    token_o.markup = "linkify";
    token_o.info = "auto";
    const token_t = state.push("text", "", 0);
    token_t.content = state.md.normalizeLinkText(url);
    const token_c = state.push("link_close", "a", -1);
    token_c.markup = "linkify";
    token_c.info = "auto";
  }
  state.pos += url.length - protoLength;
  return true;
}
function newline(state, silent) {
  let pos = state.pos;
  if (state.src.charCodeAt(pos) !== 10) return false;
  const pmax = state.pending.length - 1;
  const max2 = state.posMax;
  if (!silent) {
    if (pmax >= 0 && state.pending.charCodeAt(pmax) === 32) {
      if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 32) {
        let ws = pmax - 1;
        while (ws >= 1 && state.pending.charCodeAt(ws - 1) === 32) ws--;
        state.pending = state.pending.slice(0, ws);
        state.push("hardbreak", "br", 0);
      } else {
        state.pending = state.pending.slice(0, -1);
        state.push("softbreak", "br", 0);
      }
    } else state.push("softbreak", "br", 0);
  }
  pos++;
  while (pos < max2 && isSpace(state.src.charCodeAt(pos))) pos++;
  state.pos = pos;
  return true;
}
var ESCAPED = [];
for (let i2 = 0; i2 < 256; i2++) ESCAPED.push(0);
"\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(ch) {
  ESCAPED[ch.charCodeAt(0)] = 1;
});
function escape(state, silent) {
  let pos = state.pos;
  const max2 = state.posMax;
  if (state.src.charCodeAt(pos) !== 92) return false;
  pos++;
  if (pos >= max2) return false;
  let ch1 = state.src.charCodeAt(pos);
  if (ch1 === 10) {
    if (!silent) state.push("hardbreak", "br", 0);
    pos++;
    while (pos < max2) {
      ch1 = state.src.charCodeAt(pos);
      if (!isSpace(ch1)) break;
      pos++;
    }
    state.pos = pos;
    return true;
  }
  if (ch1 === 32) {
    if (!silent) {
      const token = state.push("text_special", "", 0);
      token.content = "\\";
      token.markup = "\\";
      token.info = "escape";
    }
    state.pos = pos;
    return true;
  }
  let escapedStr = state.src[pos];
  if (ch1 >= 55296 && ch1 <= 56319 && pos + 1 < max2) {
    const ch2 = state.src.charCodeAt(pos + 1);
    if (ch2 >= 56320 && ch2 <= 57343) {
      escapedStr += state.src[pos + 1];
      pos++;
    }
  }
  const origStr = "\\" + escapedStr;
  if (!silent) {
    const token = state.push("text_special", "", 0);
    if (ch1 < 256 && ESCAPED[ch1] !== 0) token.content = escapedStr;
    else token.content = origStr;
    token.markup = origStr;
    token.info = "escape";
  }
  state.pos = pos + 1;
  return true;
}
function buildLastRuns(src) {
  const lastRuns = {};
  let pos = 0;
  while ((pos = src.indexOf("`", pos)) !== -1) {
    const start = pos;
    while (src.charCodeAt(++pos) === 96) ;
    lastRuns[pos - start] = start;
  }
  return lastRuns;
}
function backtick(state, silent) {
  var _state$backticks$open;
  const start = state.pos;
  if (state.src.charCodeAt(start) !== 96) return false;
  const max2 = state.posMax;
  let pos = start + 1;
  while (pos < max2 && state.src.charCodeAt(pos) === 96) pos++;
  const marker = state.src.slice(start, pos);
  const openerLength = marker.length;
  if (!state.backticksScanned) {
    state.backticks = buildLastRuns(state.src);
    state.backticksScanned = true;
  }
  if (((_state$backticks$open = state.backticks[openerLength]) !== null && _state$backticks$open !== void 0 ? _state$backticks$open : -1) >= pos) {
    let matchEnd = pos;
    let matchStart;
    while ((matchStart = state.src.indexOf("`", matchEnd)) !== -1 && matchStart < max2) {
      matchEnd = matchStart + 1;
      while (state.src.charCodeAt(matchEnd) === 96) matchEnd++;
      if (matchEnd > max2) break;
      if (matchEnd - matchStart === openerLength) {
        if (!silent) {
          const token = state.push("code_inline", "code", 0);
          token.markup = marker;
          let content = state.src.slice(pos, matchStart).replace(/\n/g, " ");
          if (content.startsWith(" ") && content.endsWith(" ") && /[^ ]/.test(content)) content = content.slice(1, -1);
          token.content = content;
        }
        state.pos = matchEnd;
        return true;
      }
    }
  }
  if (!silent) state.pending += marker;
  state.pos = pos;
  return true;
}
function strikethrough_tokenize(state, silent) {
  const start = state.pos;
  const marker = state.src.charCodeAt(start);
  if (silent) return false;
  if (marker !== 126) return false;
  const scanned = state.scanDelims(state.pos, true);
  let len = scanned.length;
  const ch = String.fromCharCode(marker);
  if (len < 2) return false;
  let token;
  if (len % 2) {
    token = state.push("text", "", 0);
    token.content = ch;
    len--;
  }
  for (let i2 = 0; i2 < len; i2 += 2) {
    token = state.push("text", "", 0);
    token.content = ch + ch;
    state.delimiters.push({
      marker,
      length: 0,
      token: state.tokens.length - 1,
      end: -1,
      open: scanned.can_open,
      close: scanned.can_close
    });
  }
  state.pos += scanned.length;
  return true;
}
function postProcess$1(state, delimiters) {
  let token;
  const loneMarkers = [];
  const max2 = delimiters.length;
  for (let i2 = 0; i2 < max2; i2++) {
    const startDelim = delimiters[i2];
    if (startDelim.marker !== 126) continue;
    if (startDelim.end === -1) continue;
    const endDelim = delimiters[startDelim.end];
    token = state.tokens[startDelim.token];
    token.type = "s_open";
    token.tag = "s";
    token.nesting = 1;
    token.markup = "~~";
    token.content = "";
    token = state.tokens[endDelim.token];
    token.type = "s_close";
    token.tag = "s";
    token.nesting = -1;
    token.markup = "~~";
    token.content = "";
    if (state.tokens[endDelim.token - 1].type === "text" && state.tokens[endDelim.token - 1].content === "~") loneMarkers.push(endDelim.token - 1);
  }
  while (loneMarkers.length) {
    const i2 = loneMarkers.pop();
    let j = i2 + 1;
    while (j < state.tokens.length && state.tokens[j].type === "s_close") j++;
    j--;
    if (i2 !== j) {
      token = state.tokens[j];
      state.tokens[j] = state.tokens[i2];
      state.tokens[i2] = token;
    }
  }
}
function strikethrough_postProcess(state) {
  const tokens_meta = state.tokens_meta;
  const max2 = state.tokens_meta.length;
  postProcess$1(state, state.delimiters);
  for (let curr = 0; curr < max2; curr++) {
    var _tokens_meta$curr;
    const delimiters = (_tokens_meta$curr = tokens_meta[curr]) === null || _tokens_meta$curr === void 0 ? void 0 : _tokens_meta$curr.delimiters;
    if (delimiters) postProcess$1(state, delimiters);
  }
}
var strikethrough_default = {
  tokenize: strikethrough_tokenize,
  postProcess: strikethrough_postProcess
};
function emphasis_tokenize(state, silent) {
  const start = state.pos;
  const marker = state.src.charCodeAt(start);
  if (silent) return false;
  if (marker !== 95 && marker !== 42) return false;
  const scanned = state.scanDelims(state.pos, marker === 42);
  for (let i2 = 0; i2 < scanned.length; i2++) {
    const token = state.push("text", "", 0);
    token.content = String.fromCharCode(marker);
    state.delimiters.push({
      marker,
      length: scanned.length,
      token: state.tokens.length - 1,
      end: -1,
      open: scanned.can_open,
      close: scanned.can_close
    });
  }
  state.pos += scanned.length;
  return true;
}
function postProcess(state, delimiters) {
  const max2 = delimiters.length;
  for (let i2 = max2 - 1; i2 >= 0; i2--) {
    const startDelim = delimiters[i2];
    if (startDelim.marker !== 95 && startDelim.marker !== 42) continue;
    if (startDelim.end === -1) continue;
    const endDelim = delimiters[startDelim.end];
    const isStrong = i2 > 0 && delimiters[i2 - 1].end === startDelim.end + 1 && delimiters[i2 - 1].marker === startDelim.marker && delimiters[i2 - 1].token === startDelim.token - 1 && delimiters[startDelim.end + 1].token === endDelim.token + 1;
    const ch = String.fromCharCode(startDelim.marker);
    const token_o = state.tokens[startDelim.token];
    token_o.type = isStrong ? "strong_open" : "em_open";
    token_o.tag = isStrong ? "strong" : "em";
    token_o.nesting = 1;
    token_o.markup = isStrong ? ch + ch : ch;
    token_o.content = "";
    const token_c = state.tokens[endDelim.token];
    token_c.type = isStrong ? "strong_close" : "em_close";
    token_c.tag = isStrong ? "strong" : "em";
    token_c.nesting = -1;
    token_c.markup = isStrong ? ch + ch : ch;
    token_c.content = "";
    if (isStrong) {
      state.tokens[delimiters[i2 - 1].token].content = "";
      state.tokens[delimiters[startDelim.end + 1].token].content = "";
      i2--;
    }
  }
}
function emphasis_post_process(state) {
  const tokens_meta = state.tokens_meta;
  const max2 = state.tokens_meta.length;
  postProcess(state, state.delimiters);
  for (let curr = 0; curr < max2; curr++) {
    var _tokens_meta$curr;
    const delimiters = (_tokens_meta$curr = tokens_meta[curr]) === null || _tokens_meta$curr === void 0 ? void 0 : _tokens_meta$curr.delimiters;
    if (delimiters) postProcess(state, delimiters);
  }
}
var emphasis_default = {
  tokenize: emphasis_tokenize,
  postProcess: emphasis_post_process
};
function link(state, silent) {
  let code2, label, res, ref;
  let href = "";
  let title = "";
  let start = state.pos;
  let parseReference = true;
  if (state.src.charCodeAt(state.pos) !== 91) return false;
  const oldPos = state.pos;
  const max2 = state.posMax;
  const labelStart = state.pos + 1;
  const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos, true);
  if (labelEnd < 0) return false;
  let pos = labelEnd + 1;
  if (pos < max2 && state.src.charCodeAt(pos) === 40) {
    parseReference = false;
    pos++;
    for (; pos < max2; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (!isSpace(code2) && code2 !== 10) break;
    }
    if (pos >= max2) return false;
    start = pos;
    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok) {
      href = state.md.normalizeLink(res.str);
      if (state.md.validateLink(href)) pos = res.pos;
      else href = "";
      start = pos;
      for (; pos < max2; pos++) {
        code2 = state.src.charCodeAt(pos);
        if (!isSpace(code2) && code2 !== 10) break;
      }
      res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
      if (pos < max2 && start !== pos && res.ok) {
        title = res.str;
        pos = res.pos;
        for (; pos < max2; pos++) {
          code2 = state.src.charCodeAt(pos);
          if (!isSpace(code2) && code2 !== 10) break;
        }
      }
    }
    if (pos >= max2 || state.src.charCodeAt(pos) !== 41) parseReference = true;
    pos++;
  }
  if (parseReference) {
    if (typeof state.env.references === "undefined") return false;
    if (pos < max2 && state.src.charCodeAt(pos) === 91) {
      start = pos + 1;
      pos = state.md.helpers.parseLinkLabel(state, pos);
      if (pos >= 0) label = state.src.slice(start, pos++);
      else pos = labelEnd + 1;
    } else pos = labelEnd + 1;
    if (!label) label = state.src.slice(labelStart, labelEnd);
    label = normalizeReference(label);
    ref = state.env.references[label];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }
  if (!silent) {
    state.pos = labelStart;
    state.posMax = labelEnd;
    const token_o = state.push("link_open", "a", 1);
    const attrs = [["href", href]];
    token_o.attrs = attrs;
    if (title) attrs.push(["title", title]);
    if (label) {
      const meta = /* @__PURE__ */ Object.create(null);
      meta.label = label;
      token_o.meta = meta;
    }
    state.linkLevel++;
    state.md.inline.tokenize(state);
    state.linkLevel--;
    state.push("link_close", "a", -1);
  }
  state.pos = pos;
  state.posMax = max2;
  return true;
}
function image(state, silent) {
  let code2, content, label, pos, ref, res, title, start;
  let href = "";
  const oldPos = state.pos;
  const max2 = state.posMax;
  if (state.src.charCodeAt(state.pos) !== 33) return false;
  if (state.src.charCodeAt(state.pos + 1) !== 91) return false;
  const labelStart = state.pos + 2;
  const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);
  if (labelEnd < 0) return false;
  pos = labelEnd + 1;
  if (pos < max2 && state.src.charCodeAt(pos) === 40) {
    pos++;
    for (; pos < max2; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (!isSpace(code2) && code2 !== 10) break;
    }
    if (pos >= max2) return false;
    start = pos;
    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok) {
      href = state.md.normalizeLink(res.str);
      if (state.md.validateLink(href)) pos = res.pos;
      else href = "";
    }
    start = pos;
    for (; pos < max2; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (!isSpace(code2) && code2 !== 10) break;
    }
    res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
    if (pos < max2 && start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;
      for (; pos < max2; pos++) {
        code2 = state.src.charCodeAt(pos);
        if (!isSpace(code2) && code2 !== 10) break;
      }
    } else title = "";
    if (pos >= max2 || state.src.charCodeAt(pos) !== 41) {
      state.pos = oldPos;
      return false;
    }
    pos++;
  } else {
    if (typeof state.env.references === "undefined") return false;
    if (pos < max2 && state.src.charCodeAt(pos) === 91) {
      start = pos + 1;
      pos = state.md.helpers.parseLinkLabel(state, pos);
      if (pos >= 0) label = state.src.slice(start, pos++);
      else pos = labelEnd + 1;
    } else pos = labelEnd + 1;
    if (!label) label = state.src.slice(labelStart, labelEnd);
    label = normalizeReference(label);
    ref = state.env.references[label];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }
  if (!silent) {
    content = state.src.slice(labelStart, labelEnd);
    const tokens = [];
    state.md.inline.parse(content, state.md, state.env, tokens);
    const token = state.push("image", "img", 0);
    const attrs = [["src", href], ["alt", ""]];
    token.attrs = attrs;
    token.children = tokens;
    token.content = content;
    if (title) attrs.push(["title", title]);
    if (label) {
      const meta = /* @__PURE__ */ Object.create(null);
      meta.label = label;
      token.meta = meta;
    }
  }
  state.pos = pos;
  state.posMax = max2;
  return true;
}
var EMAIL_RE = /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/;
var AUTOLINK_RE = /^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;
function autolink(state, silent) {
  let pos = state.pos;
  if (state.src.charCodeAt(pos) !== 60) return false;
  const start = state.pos;
  const max2 = state.posMax;
  for (; ; ) {
    if (++pos >= max2) return false;
    const ch = state.src.charCodeAt(pos);
    if (ch === 60) return false;
    if (ch === 62) break;
  }
  const url = state.src.slice(start + 1, pos);
  if (AUTOLINK_RE.test(url)) {
    const fullUrl = state.md.normalizeLink(url);
    if (!state.md.validateLink(fullUrl)) return false;
    if (!silent) {
      const token_o = state.push("link_open", "a", 1);
      token_o.attrs = [["href", fullUrl]];
      token_o.markup = "autolink";
      token_o.info = "auto";
      const token_t = state.push("text", "", 0);
      token_t.content = state.md.normalizeLinkText(url);
      const token_c = state.push("link_close", "a", -1);
      token_c.markup = "autolink";
      token_c.info = "auto";
    }
    state.pos += url.length + 2;
    return true;
  }
  if (EMAIL_RE.test(url)) {
    const fullUrl = state.md.normalizeLink(`mailto:${url}`);
    if (!state.md.validateLink(fullUrl)) return false;
    if (!silent) {
      const token_o = state.push("link_open", "a", 1);
      token_o.attrs = [["href", fullUrl]];
      token_o.markup = "autolink";
      token_o.info = "auto";
      const token_t = state.push("text", "", 0);
      token_t.content = state.md.normalizeLinkText(url);
      const token_c = state.push("link_close", "a", -1);
      token_c.markup = "autolink";
      token_c.info = "auto";
    }
    state.pos += url.length + 2;
    return true;
  }
  return false;
}
function isLinkOpen(str) {
  return /^<a[>\s]/i.test(str);
}
function isLinkClose(str) {
  return /^<\/a\s*>/i.test(str);
}
function isLetter(ch) {
  const lc2 = ch | 32;
  return lc2 >= 97 && lc2 <= 122;
}
function scanSpecial(state, pos) {
  const src = state.src;
  let start;
  let terminator;
  if (src.startsWith("<!--", pos)) {
    if (src.startsWith(">", pos + 4)) return pos + 5;
    if (src.startsWith("->", pos + 4)) return pos + 6;
    start = pos + 4;
    terminator = "-->";
  } else if (src.startsWith("<![CDATA[", pos)) {
    start = pos + 9;
    terminator = "]]>";
  } else if (src.charCodeAt(pos + 1) === 63) {
    start = pos + 2;
    terminator = "?>";
  } else if (isLetter(src.charCodeAt(pos + 2))) {
    start = pos + 3;
    terminator = ">";
  } else return -1;
  if (state.skipHtmlSpecial) return -1;
  const end = src.indexOf(terminator, start);
  if (end < 0) {
    state.skipHtmlSpecial = true;
    return -1;
  }
  return end + terminator.length;
}
function html_inline(state, silent) {
  if (!state.md.options.html) return false;
  const max2 = state.posMax;
  const pos = state.pos;
  if (state.src.charCodeAt(pos) !== 60 || pos + 2 >= max2) return false;
  let end;
  const ch = state.src.charCodeAt(pos + 1);
  if (ch === 33 || ch === 63) end = scanSpecial(state, pos);
  else if (ch === 47 || isLetter(ch)) {
    const match = state.src.slice(pos).match(HTML_OPEN_CLOSE_TAG_RE);
    end = match ? pos + match[0].length : -1;
  } else return false;
  if (end < 0) return false;
  if (!silent) {
    const token = state.push("html_inline", "", 0);
    token.content = state.src.slice(pos, end);
    if (isLinkOpen(token.content)) state.linkLevel++;
    if (isLinkClose(token.content)) state.linkLevel--;
  }
  state.pos = end;
  return true;
}
var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i;
var NAMED_RE = /^&([a-z][a-z0-9]{1,31});/i;
function entity(state, silent) {
  const pos = state.pos;
  const max2 = state.posMax;
  if (state.src.charCodeAt(pos) !== 38) return false;
  if (pos + 1 >= max2) return false;
  if (state.src.charCodeAt(pos + 1) === 35) {
    const match = state.src.slice(pos).match(DIGITAL_RE);
    if (match) {
      if (!silent) {
        const code2 = match[1][0].toLowerCase() === "x" ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
        const token = state.push("text_special", "", 0);
        token.content = isValidEntityCode(code2) ? fromCodePoint(code2) : fromCodePoint(65533);
        token.markup = match[0];
        token.info = "entity";
      }
      state.pos += match[0].length;
      return true;
    }
  } else {
    const match = state.src.slice(pos).match(NAMED_RE);
    if (match) {
      const decoded = decodeHTMLStrict(match[0]);
      if (decoded !== match[0]) {
        if (!silent) {
          const token = state.push("text_special", "", 0);
          token.content = decoded;
          token.markup = match[0];
          token.info = "entity";
        }
        state.pos += match[0].length;
        return true;
      }
    }
  }
  return false;
}
function processDelimiters(delimiters) {
  const openersBottom = {};
  const max2 = delimiters.length;
  if (!max2) return;
  let headerIdx = 0;
  let lastTokenIdx = -2;
  const jumps = [];
  for (let closerIdx = 0; closerIdx < max2; closerIdx++) {
    const closer = delimiters[closerIdx];
    jumps.push(0);
    if (delimiters[headerIdx].marker !== closer.marker || lastTokenIdx !== closer.token - 1) headerIdx = closerIdx;
    lastTokenIdx = closer.token;
    closer.length = closer.length || 0;
    if (!closer.close) continue;
    if (!openersBottom.hasOwnProperty(closer.marker)) openersBottom[closer.marker] = [
      -1,
      -1,
      -1,
      -1,
      -1,
      -1
    ];
    const minOpenerIdx = openersBottom[closer.marker][(closer.open ? 3 : 0) + closer.length % 3];
    let openerIdx = headerIdx - jumps[headerIdx] - 1;
    let newMinOpenerIdx = openerIdx;
    for (; openerIdx > minOpenerIdx; openerIdx -= jumps[openerIdx] + 1) {
      const opener = delimiters[openerIdx];
      if (opener.marker !== closer.marker) continue;
      if (opener.open && opener.end < 0) {
        let isOddMatch = false;
        if (opener.close || closer.open) {
          if ((opener.length + closer.length) % 3 === 0) {
            if (opener.length % 3 !== 0 || closer.length % 3 !== 0) isOddMatch = true;
          }
        }
        if (!isOddMatch) {
          const lastJump = openerIdx > 0 && !delimiters[openerIdx - 1].open ? jumps[openerIdx - 1] + 1 : 0;
          jumps[closerIdx] = closerIdx - openerIdx + lastJump;
          jumps[openerIdx] = lastJump;
          closer.open = false;
          opener.end = closerIdx;
          opener.close = false;
          newMinOpenerIdx = -1;
          lastTokenIdx = -2;
          break;
        }
      }
    }
    if (newMinOpenerIdx !== -1) openersBottom[closer.marker][(closer.open ? 3 : 0) + (closer.length || 0) % 3] = newMinOpenerIdx;
  }
}
function link_pairs(state) {
  const tokens_meta = state.tokens_meta;
  const max2 = state.tokens_meta.length;
  processDelimiters(state.delimiters);
  for (let curr = 0; curr < max2; curr++) {
    var _tokens_meta$curr;
    const delimiters = (_tokens_meta$curr = tokens_meta[curr]) === null || _tokens_meta$curr === void 0 ? void 0 : _tokens_meta$curr.delimiters;
    if (delimiters) processDelimiters(delimiters);
  }
}
function fragments_join(state) {
  let curr, last;
  let level = 0;
  const tokens = state.tokens;
  const max2 = state.tokens.length;
  for (curr = last = 0; curr < max2; curr++) {
    if (tokens[curr].nesting < 0) level--;
    tokens[curr].level = level;
    if (tokens[curr].nesting > 0) level++;
    if (tokens[curr].type === "text" && curr + 1 < max2 && tokens[curr + 1].type === "text") tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
    else {
      if (curr !== last) tokens[last] = tokens[curr];
      last++;
    }
  }
  if (curr !== last) tokens.length = last;
}
var _rules = [
  ["text", text],
  ["linkify", linkify],
  ["newline", newline],
  ["escape", escape],
  ["backticks", backtick],
  ["strikethrough", strikethrough_default.tokenize],
  ["emphasis", emphasis_default.tokenize],
  ["link", link],
  ["image", image],
  ["autolink", autolink],
  ["html_inline", html_inline],
  ["entity", entity]
];
var _rules2 = [
  ["balance_pairs", link_pairs],
  ["strikethrough", strikethrough_default.postProcess],
  ["emphasis", emphasis_default.postProcess],
  ["fragments_join", fragments_join]
];
var ParserInline = class {
  constructor() {
    _defineProperty(
      this,
      /**
      * {@link Ruler} instance. Keep configuration of inline rules.
      */
      "ruler",
      new Ruler()
    );
    _defineProperty(
      this,
      /**
      * {@link Ruler} instance. Second ruler used for post-processing
      * (e.g. in emphasis-like rules).
      */
      "ruler2",
      new Ruler()
    );
    _defineProperty(this, "State", StateInline);
    for (let i2 = 0; i2 < _rules.length; i2++) this.ruler.push(_rules[i2][0], _rules[i2][1]);
    for (let i2 = 0; i2 < _rules2.length; i2++) this.ruler2.push(_rules2[i2][0], _rules2[i2][1]);
  }
  skipToken(state) {
    const pos = state.pos;
    const rules = this.ruler.getRules("");
    const len = rules.length;
    const maxNesting = state.md.options.maxNesting;
    const cache = state.cache;
    if (typeof cache[pos] !== "undefined") {
      state.pos = cache[pos];
      return;
    }
    let ok = false;
    if (state.level < maxNesting) for (let i2 = 0; i2 < len; i2++) {
      state.level++;
      ok = rules[i2](state, true);
      state.level--;
      if (ok) {
        if (pos >= state.pos) throw new Error("inline rule didn't increment state.pos");
        break;
      }
    }
    else state.pos = state.posMax;
    if (!ok) state.pos++;
    cache[pos] = state.pos;
  }
  tokenize(state) {
    const rules = this.ruler.getRules("");
    const len = rules.length;
    const end = state.posMax;
    const maxNesting = state.md.options.maxNesting;
    while (state.pos < end) {
      const prevPos = state.pos;
      let ok = false;
      if (state.level < maxNesting) for (let i2 = 0; i2 < len; i2++) {
        ok = rules[i2](state, false);
        if (ok) {
          if (prevPos >= state.pos) throw new Error("inline rule didn't increment state.pos");
          break;
        }
      }
      if (ok) {
        if (state.pos >= end) break;
        continue;
      }
      state.pending += state.src[state.pos++];
    }
    if (state.pending) state.pushPending();
  }
  /**
  * Process input string and push inline tokens into `outTokens`
  */
  parse(str, md2, env, outTokens) {
    const state = new this.State(str, md2, env, outTokens);
    this.tokenize(state);
    const rules = this.ruler2.getRules("");
    const len = rules.length;
    for (let i2 = 0; i2 < len; i2++) rules[i2](state);
  }
};
var config = {
  default: {
    options: {
      html: false,
      xhtmlOut: false,
      breaks: false,
      langPrefix: "language-",
      linkify: false,
      typographer: false,
      quotes: "\u201C\u201D\u2018\u2019",
      highlight: null,
      maxNesting: 100
    },
    components: {
      core: {},
      block: {},
      inline: {}
    }
  },
  zero: {
    options: {
      html: false,
      xhtmlOut: false,
      breaks: false,
      langPrefix: "language-",
      linkify: false,
      typographer: false,
      quotes: "\u201C\u201D\u2018\u2019",
      highlight: null,
      maxNesting: 20
    },
    components: {
      core: { rules: [
        "normalize",
        "block",
        "strip_references",
        "inline",
        "text_join"
      ] },
      block: { rules: ["paragraph"] },
      inline: {
        rules: ["text"],
        rules2: ["balance_pairs", "fragments_join"]
      }
    }
  },
  commonmark: {
    options: {
      html: true,
      xhtmlOut: true,
      breaks: false,
      langPrefix: "language-",
      linkify: false,
      typographer: false,
      quotes: "\u201C\u201D\u2018\u2019",
      highlight: null,
      maxNesting: 20
    },
    components: {
      core: { rules: [
        "normalize",
        "block",
        "strip_references",
        "inline",
        "text_join"
      ] },
      block: { rules: [
        "blockquote",
        "code",
        "fence",
        "heading",
        "hr",
        "html_block",
        "lheading",
        "list",
        "reference",
        "paragraph"
      ] },
      inline: {
        rules: [
          "autolink",
          "backticks",
          "emphasis",
          "entity",
          "escape",
          "html_inline",
          "image",
          "link",
          "newline",
          "text"
        ],
        rules2: [
          "balance_pairs",
          "emphasis",
          "fragments_join"
        ]
      }
    }
  }
};
var BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
var GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;
var RECODE_HOSTNAME_FOR = [
  "http:",
  "https:",
  "mailto:"
];
var MarkdownIt = class {
  /**
  * Link validation function. CommonMark allows too much in links. By default
  * we disable `javascript:`, `vbscript:`, `file:` schemas, and almost all `data:...` schemas
  * except some embedded image types.
  *
  * You can change this behaviour:
  *
  * @example
  * ```javascript
  * import MarkdownIt from 'markdown-it'
  * const md = new MarkdownIt()
  *
  * // enable everything
  * md.validateLink = function () { return true; }
  * ```
  */
  validateLink(url) {
    const str = url.trim().toLowerCase();
    return BAD_PROTO_RE.test(str) ? GOOD_DATA_RE.test(str) : true;
  }
  /**
  * Function used to encode link url to a machine-readable format,
  * which includes url-encoding, punycode, etc.
  */
  normalizeLink(url) {
    const parsed = parse_default(url, true);
    if (parsed.hostname) {
      if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) try {
        parsed.hostname = import_punycode.default.toASCII(parsed.hostname);
      } catch (er) {
      }
    }
    if (parsed.auth) parsed.auth = encode_default(parsed.auth);
    if (parsed.hostname) parsed.hostname = encode_default(parsed.hostname);
    if (parsed.pathname) parsed.pathname = encode_default(parsed.pathname);
    if (parsed.search) parsed.search = encode_default(parsed.search);
    if (parsed.hash) parsed.hash = encode_default(parsed.hash);
    return format(parsed);
  }
  /**
  * Function used to decode link url to a human-readable format`
  */
  normalizeLinkText(url) {
    const parsed = parse_default(url, true);
    if (parsed.hostname) {
      if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) try {
        parsed.hostname = import_punycode.default.toUnicode(parsed.hostname);
      } catch (er) {
      }
    }
    return decode_default(format(parsed), decode_default.defaultChars + "%");
  }
  constructor(...args) {
    _defineProperty(
      this,
      /**
      * Instance of {@link ParserInline}. You may need it to add new rules when
      * writing plugins. For simple rules control use {@link MarkdownIt.disable}
      * and {@link MarkdownIt.enable}.
      */
      "inline",
      new ParserInline()
    );
    _defineProperty(
      this,
      /**
      * Instance of {@link ParserBlock}. You may need it to add new rules when
      * writing plugins. For simple rules control use {@link MarkdownIt.disable}
      * and {@link MarkdownIt.enable}.
      */
      "block",
      new ParserBlock()
    );
    _defineProperty(
      this,
      /**
      * Instance of {@link ParserCore} chain executor. You may need it to add new
      * rules when writing plugins. For simple rules control use
      * {@link MarkdownIt.disable} and {@link MarkdownIt.enable}.
      */
      "core",
      new ParserCore()
    );
    _defineProperty(
      this,
      /**
      * Instance of {@link Renderer}. Use it to modify output look. Or to add rendering
      * rules for new token types, generated by plugins.
      *
      * See {@link Renderer} docs and
      * [source code](https://github.com/markdown-it/markdown-it/blob/master/src/renderer.ts).
      *
      * @example
      * ```javascript
      * import MarkdownIt from 'markdown-it'
      * const md = new MarkdownIt()
      *
      * function myToken(tokens, idx, options, env, self) {
      *   //...
      *   return result;
      * };
      *
      * md.renderer.rules['my_token'] = myToken
      * ```
      */
      "renderer",
      new Renderer()
    );
    _defineProperty(
      this,
      /**
      * [linkify-it](https://github.com/markdown-it/linkify-it) instance.
      * Used by [linkify](https://github.com/markdown-it/markdown-it/blob/master/src/rules_core/linkify.ts)
      * rule.
      */
      "linkify",
      new LinkifyIt()
    );
    _defineProperty(
      this,
      /**
      * Assorted utility functions, useful to write plugins. See details
      * [here](https://github.com/markdown-it/markdown-it/blob/master/src/common/utils.ts).
      */
      "utils",
      utils_exports
    );
    _defineProperty(
      this,
      /**
      * Link components parser functions, useful to write plugins. See details
      * [here](https://github.com/markdown-it/markdown-it/blob/master/src/helpers).
      */
      "helpers",
      Object.assign({}, helpers_exports)
    );
    const [presetNameOrOptions, options] = args;
    if (typeof presetNameOrOptions === "string") {
      this.configure(presetNameOrOptions);
      if (options) this.set(options);
    } else {
      this.configure("default");
      this.set(presetNameOrOptions || {});
    }
  }
  /**
  * Set parser options (in the same format as in constructor). Probably, you
  * will never need it, but you can change options after constructor call.
  *
  * __Note:__ To achieve the best possible performance, don't modify a
  * `markdown-it` instance options on the fly. If you need multiple configurations
  * it's best to create multiple instances and initialize each with separate
  * config.
  *
  * @example
  * ```javascript
  * import MarkdownIt from 'markdown-it'
  *
  * const md = new MarkdownIt()
  *   .set({ html: true, breaks: true })
  *   .set({ typographer: true })
  * ```
  */
  set(options) {
    Object.assign(this.options, options);
    return this;
  }
  /**
  * Batch load of all options and compenent settings. This is internal method,
  * and you probably will not need it. But if you will - see available presets
  * and data structure [here](https://github.com/markdown-it/markdown-it/tree/master/src/presets)
  *
  * We strongly recommend to use presets instead of direct config loads. That
  * will give better compatibility with next versions.
  */
  configure(presets) {
    let p;
    if (typeof presets === "string") {
      const presetName = presets;
      p = config[presetName];
      if (!p) throw new Error(`Wrong 'markdown-it' preset "${presetName}", check name`);
    } else p = presets;
    if (!p) throw new Error("Wrong `markdown-it` preset, can't be empty");
    if (p.options) this.options = { ...p.options };
    const components = p.components;
    if (components) {
      var _components$inline;
      [
        "core",
        "block",
        "inline"
      ].forEach((name) => {
        var _components$name;
        const rules = (_components$name = components[name]) === null || _components$name === void 0 ? void 0 : _components$name.rules;
        if (rules) this[name].ruler.enableOnly(rules);
      });
      const rules2 = (_components$inline = components.inline) === null || _components$inline === void 0 ? void 0 : _components$inline.rules2;
      if (rules2) this.inline.ruler2.enableOnly(rules2);
    }
    return this;
  }
  /**
  * Enable list or rules. It will automatically find appropriate components,
  * containing rules with given names. If rule not found, and `ignoreInvalid`
  * not set - throws exception.
  *
  * @example
  * ```javascript
  * import MarkdownIt from 'markdown-it'
  *
  * const md = new MarkdownIt()
  *   .enable(['sub', 'sup'])
  *   .disable('smartquotes')
  * ```
  */
  enable(list2, ignoreInvalid = false) {
    let result = [];
    if (!Array.isArray(list2)) list2 = [list2];
    [
      "core",
      "block",
      "inline"
    ].forEach((chain) => {
      result = result.concat(this[chain].ruler.enable(list2, true));
    });
    result = result.concat(this.inline.ruler2.enable(list2, true));
    const missed = list2.filter((name) => result.indexOf(name) < 0);
    if (missed.length && !ignoreInvalid) throw new Error(`MarkdownIt. Failed to enable unknown rule(s): ${missed}`);
    return this;
  }
  /**
  * The same as {@link MarkdownIt.enable}, but turn specified rules off.
  */
  disable(list2, ignoreInvalid = false) {
    let result = [];
    if (!Array.isArray(list2)) list2 = [list2];
    [
      "core",
      "block",
      "inline"
    ].forEach((chain) => {
      result = result.concat(this[chain].ruler.disable(list2, true));
    });
    result = result.concat(this.inline.ruler2.disable(list2, true));
    const missed = list2.filter((name) => result.indexOf(name) < 0);
    if (missed.length && !ignoreInvalid) throw new Error(`MarkdownIt. Failed to disable unknown rule(s): ${missed}`);
    return this;
  }
  /**
  * Load specified plugin with given params into current parser instance.
  * It's just a sugar to call `plugin(md, params)` with curring.
  *
  * @example
  * ```javascript
  * import MarkdownIt from 'markdown-it'
  * import iterator from 'markdown-it-for-inline'
  *
  * const md = new MarkdownIt()
  *   .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
  *     tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar')
  *   })
  * ```
  */
  use(plugin, ...params) {
    plugin.apply(plugin, [this, ...params]);
    return this;
  }
  /**
  * Parse input string and return list of block tokens (special token type
  * "inline" will contain list of inline tokens). You should not call this
  * method directly, until you write custom renderer (for example, to produce
  * AST).
  *
  * `env` is used to pass data between "distributed" rules and return additional
  * metadata like reference info, needed for the renderer. It also can be used to
  * inject data in specific cases. Usually, you will be ok to pass `{}`,
  * and then pass updated object to renderer.
  */
  parse(src, env) {
    if (typeof src !== "string") throw new Error("Input data should be a String");
    const state = new this.core.State(src, this, env);
    this.core.process(state);
    return state.tokens;
  }
  /**
  * Render markdown string into html. It does all magic for you :).
  *
  * `env` can be used to inject additional metadata (`{}` by default).
  * But you will not need it with high probability. See also comment
  * in {@link MarkdownIt.parse}.
  */
  render(src, env = {}) {
    return this.renderer.render(this.parse(src, env), this.options, env);
  }
  /**
  * The same as {@link MarkdownIt.parse} but skip all block rules. It returns
  * the block tokens list with the single `inline` element, containing parsed
  * inline tokens in `children` property. Also updates `env` object.
  */
  parseInline(src, env) {
    const state = new this.core.State(src, this, env);
    state.inlineMode = true;
    this.core.process(state);
    return state.tokens;
  }
  /**
  * Similar to {@link MarkdownIt.render} but for single paragraph content.
  * Result will NOT be wrapped into `<p>` tags.
  */
  renderInline(src, env = {}) {
    return this.renderer.render(this.parseInline(src, env), this.options, env);
  }
};
_defineProperty(MarkdownIt, "Token", Token);
_defineProperty(MarkdownIt, "Ruler", Ruler);
_defineProperty(MarkdownIt, "Renderer", Renderer);
_defineProperty(MarkdownIt, "ParserCore", ParserCore);
_defineProperty(MarkdownIt, "StateCore", StateCore);
_defineProperty(MarkdownIt, "ParserBlock", ParserBlock);
_defineProperty(MarkdownIt, "StateBlock", StateBlock);
_defineProperty(MarkdownIt, "ParserInline", ParserInline);
_defineProperty(MarkdownIt, "StateInline", StateInline);
var MarkdownItCallable = callable(MarkdownIt);

// src/article.ts
var md = new MarkdownItCallable({ html: false });
md.inline.ruler.before("image", "vault-image", (state, silent) => {
  const match = /^!\[\[([^\]\n]+)\]\]/.exec(state.src.slice(state.pos));
  if (!match) return false;
  if (!silent) {
    const [src, label = ""] = match[1].split("|");
    const token = state.push("image", "img", 0);
    token.attrSet("src", src.trim());
    if (/^[1-9]\d*$/.test(label.trim()) && Number.isSafeInteger(Number(label))) {
      token.attrSet("data-width", label.trim());
    }
    token.content = label;
  }
  state.pos += match[0].length;
  return true;
});
md.renderer.rules.image = (tokens, i2) => {
  const source = md.utils.escapeHtml(String(tokens[i2].attrGet("src") ?? ""));
  const width = tokens[i2].attrGet("data-width");
  return '<img data-source="' + source + '"' + (width ? ' data-width="' + width + '"' : "") + " />";
};
md.inline.ruler.before("link", "vault-link", (state, silent) => {
  if (!state.env?.publicText || !state.src.startsWith("[[", state.pos)) return false;
  const match = /^\[\[([^\]\n]+)\]\]/.exec(state.src.slice(state.pos));
  if (!match) return false;
  const [target, alias] = match[1].split("|");
  const [path, heading3] = target.split("#");
  if (!silent) state.pending += alias?.trim() || path.split("/").pop()?.replace(/\.md$/i, "") || heading3 || "";
  state.pos += match[0].length;
  return true;
});
function renderArticle(doc, markdown, title, publicText = false) {
  const template = doc.createElement("template");
  template.innerHTML = md.render(markdown, { publicText });
  const root = template.content;
  if (root.firstElementChild?.tagName !== "H1") {
    const heading3 = doc.createElement("h1");
    heading3.textContent = title;
    root.prepend(heading3);
  }
  return root;
}
function article(doc, markdown, title) {
  const root = renderArticle(doc, markdown, title);
  const blocks = [];
  function visit(el, depth, quoted) {
    if (el.matches("ul,ol")) {
      let number = Number(el.getAttribute("start") || 1);
      for (const item of Array.from(el.children)) {
        const start = blocks.length;
        let inline2 = doc.createElement("p");
        const flush = () => {
          if (inline2.textContent?.trim() || inline2.querySelector("img")) visit(inline2, depth + 1, quoted);
          inline2 = doc.createElement("p");
        };
        for (const child2 of Array.from(item.childNodes)) {
          if (child2.nodeType === 1 && child2.matches("ul,ol,p,blockquote,pre,h1,h2,h3,h4,h5,h6")) {
            flush();
            visit(child2, depth + 1, quoted);
          } else inline2.append(child2.cloneNode(true));
        }
        flush();
        const first = blocks[start];
        if (first) first.dataset.marker = el.tagName === "OL" ? number++ + "." : "\u2022";
      }
      return;
    }
    if (el.tagName === "BLOCKQUOTE") {
      for (const child2 of el.children) visit(child2, depth, true);
      return;
    }
    const emit = (block2) => {
      if (depth) block2.style.marginLeft = Math.min(depth, 8) * 52 + "px";
      if (quoted) block2.classList.add("quoted");
      blocks.push(block2);
    };
    const range = doc.createRange();
    range.selectNodeContents(el);
    const emitText = () => {
      const block2 = el.cloneNode(false);
      block2.append(range.cloneContents());
      if (block2.textContent?.trim() || block2.querySelector("br") || el.tagName === "HR") emit(block2);
    };
    for (const img of el.querySelectorAll("img")) {
      range.setEndBefore(img);
      emitText();
      const figure = doc.createElement("figure");
      figure.append(img.cloneNode(true));
      emit(figure);
      range.setStartAfter(img);
      range.setEnd(el, el.childNodes.length);
    }
    emitText();
  }
  for (const child2 of root.children) visit(child2, 0, false);
  return blocks;
}
function textArticle(doc, markdown, fallback) {
  const root = renderArticle(doc, markdown, fallback, true);
  const heading3 = root.firstElementChild;
  const title = heading3.textContent?.trim() || fallback;
  heading3.remove();
  for (const link2 of root.querySelectorAll("a")) {
    if (!/^(https?:\/\/|mailto:)/i.test(link2.getAttribute("href") || "")) link2.replaceWith(...link2.childNodes);
  }
  const body = doc.createElement("div");
  body.append(root);
  return { title, body };
}

// src/layout.ts
var pageWidth = 1080;
var pageHeight = 1440;
var pageTemplates = {
  classic: {
    label: "\u7ECF\u5178\u767D\u5E95",
    paper: "#ffffff",
    ink: "#242425",
    accent: "#aeb5bb",
    top: 78,
    bottom: 78,
    side: 80,
    fontSize: 36,
    lineHeight: 1.58,
    gap: 25
  },
  warm: {
    label: "\u6696\u7EB8\u4FBF\u7B7E",
    paper: "#fbf2e2",
    ink: "#372d27",
    accent: "#9a4c3c",
    top: 114,
    bottom: 92,
    side: 96,
    fontSize: 36,
    lineHeight: 1.72,
    gap: 28
  }
};
var defaultTemplate = "classic";
var fontFamily = '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",Arial,sans-serif';
function pictureBounds(id) {
  const { top, bottom, side } = pageTemplates[id];
  return { width: pageWidth - 2 * side, height: pageHeight - top - bottom };
}
var templateCSS = Object.entries(pageTemplates).map(([key, template]) => {
  const page = `.page[data-template="${key}"]`;
  const { top, bottom, side, paper, ink, accent, fontSize, lineHeight, gap } = template;
  return `
${page}{padding:${top}px ${side}px ${bottom}px;background:${paper};color:${ink};font:${fontSize}px/${lineHeight} ${fontFamily}}
${page}>*+*{margin-top:${gap}px}
${page} .quoted{border-left-color:${accent}}
${page} figure img{max-height:${pageHeight - top - bottom}px}
`;
}).join("");
var pageCSS = `
*{box-sizing:border-box}
body{margin:0}
.page{display:flow-root;width:${pageWidth}px;height:${pageHeight}px;overflow-wrap:anywhere;line-break:strict}
.page>*{position:relative;margin:0}
h1,h2,h3,h4,h5,h6{line-height:1.3;font-weight:700}
h1{font-size:62px}h2{font-size:49px}h3{font-size:43px}h4{font-size:39px}h5{font-size:37px}h6{font-size:36px}
a{color:#244e65;text-decoration:underline}
.quoted{border-left:5px solid;padding-left:25px;color:#49515a}
[data-marker]::before{content:attr(data-marker);position:absolute;right:calc(100% + 8px);top:0}
pre,code{font-family:ui-monospace,monospace;font-size:.9em;background:#f2f3f4;white-space:pre-wrap}
figure img{display:block;max-width:100%;height:auto;margin:auto}
hr{height:2px;border:0;background:#d0d0d0}
table{border-collapse:collapse;width:100%;font-size:30px}td,th{border:1px solid #bbb;padding:6px}
${templateCSS}
.page[data-template="warm"]{position:relative}
.page[data-template="warm"]::before{content:"";position:absolute;top:68px;inset-inline:${pageTemplates.warm.side}px;border-top:3px solid ${pageTemplates.warm.accent}}
.page[data-template="warm"] a{color:#854334}
.page[data-template="warm"] .quoted{color:#695343}
.page[data-template="warm"] pre,.page[data-template="warm"] code{background:#f1e4d0}
.page[data-template="warm"] hr{background:#d8c3aa}
.page[data-template="warm"] td,.page[data-template="warm"] th{border-color:#cdb69d}
`;
function sizePicture(img, id) {
  const { width, height } = pictureBounds(id);
  const preferred = Number(img.dataset.width) || img.naturalWidth;
  img.style.width = Math.min(preferred, width, height * img.naturalWidth / img.naturalHeight) + "px";
  img.height = img.naturalHeight;
}
var heading2 = (el) => /^H[1-6]$/.test(el.tagName);
var minImageScale = 0.85;
function shortParagraph(block2, lines) {
  if (block2?.tagName !== "P") return false;
  const lineHeight = parseFloat(block2.ownerDocument.defaultView.getComputedStyle(block2).lineHeight);
  return block2.getBoundingClientRect().height <= lines * lineHeight + 0.1;
}
function fitFigure(figure, floor) {
  if (figure.getBoundingClientRect().bottom <= floor + 0.01) return true;
  const img = figure.querySelector("img");
  const bounds = img.getBoundingClientRect();
  const scale = (floor - bounds.top) / bounds.height;
  if (img.dataset.width || scale < minImageScale) return false;
  const preferred = img.style.width;
  img.style.width = bounds.width * scale + "px";
  if (figure.getBoundingClientRect().bottom <= floor + 0.02) return true;
  img.style.width = preferred;
  return false;
}
function split(block2, floor) {
  const doc = block2.ownerDocument;
  const walker = doc.createTreeWalker(block2, NodeFilter.SHOW_TEXT);
  const range = doc.createRange();
  const segmenter = new Intl.Segmenter(void 0, { granularity: "grapheme" });
  let last;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const ends = Array.from(segmenter.segment(node.data), (s) => s.index + s.segment.length);
    let low = 0, high = ends.length;
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      range.setStart(node, mid === 1 ? 0 : ends[mid - 2]);
      range.setEnd(node, ends[mid - 1]);
      if (range.getBoundingClientRect().bottom <= floor) low = mid;
      else high = mid - 1;
    }
    if (low) last = { node, offset: ends[low - 1] };
    if (low < ends.length) break;
  }
  if (!last) return null;
  range.selectNodeContents(block2);
  range.setStart(last.node, last.offset);
  const tail = block2.cloneNode(false);
  tail.removeAttribute("data-marker");
  tail.append(range.extractContents());
  return tail;
}
function paginate(doc, blocks, id = defaultTemplate) {
  if (!doc.head.querySelector("style[data-pp-layout]")) {
    const style = doc.createElement("style");
    style.dataset.ppLayout = "";
    style.textContent = pageCSS;
    doc.head.append(style);
  }
  const pages = [];
  function nextPage() {
    const page2 = doc.createElement("article");
    page2.className = "page";
    page2.dataset.template = id;
    doc.body.append(page2);
    pages.push(page2);
    return page2;
  }
  let page = nextPage();
  const floor = () => page.getBoundingClientRect().bottom - pageTemplates[id].bottom;
  for (let index = 0; index < blocks.length; index++) {
    let block2 = blocks[index];
    if (block2.tagName === "FIGURE") {
      page.append(block2);
      if (!fitFigure(block2, floor())) {
        const prev = block2.previousElementSibling;
        const previousHeading = prev?.previousElementSibling;
        const title = previousHeading && heading2(previousHeading) ? previousHeading : null;
        const carry = prev && prev === blocks[index - 1] && shortParagraph(prev, 3) && (title ?? prev).previousElementSibling;
        const oldPage = page;
        page = nextPage();
        if (carry) {
          if (title) page.append(title);
          page.append(prev);
        }
        page.append(block2);
        if (carry && !fitFigure(block2, floor())) {
          if (title) oldPage.append(title);
          oldPage.append(prev);
        }
      }
      const next = blocks[index + 1];
      if (!block2.previousElementSibling && next?.tagName === "P") {
        page.append(next);
        if (shortParagraph(next, 5)) {
          const reserve = next.getBoundingClientRect().bottom - block2.getBoundingClientRect().bottom;
          fitFigure(block2, floor() - reserve);
        }
        next.remove();
      }
      continue;
    }
    while (true) {
      page.append(block2);
      const hasEarlier = !!block2.previousElementSibling;
      if (heading2(block2) && hasEarlier && blocks[index + 1]) {
        const next = blocks[index + 1];
        page.append(next);
        const bounds = next.getBoundingClientRect();
        const fitsOpening = next.tagName === "FIGURE" ? fitFigure(next, floor()) : bounds.top + Math.min(bounds.height, parseFloat(doc.defaultView.getComputedStyle(next).lineHeight)) <= floor();
        next.remove();
        if (!fitsOpening) {
          block2.remove();
          page = nextPage();
          continue;
        }
      }
      if (block2.getBoundingClientRect().bottom <= floor() + 0.01) break;
      if (block2.matches("table") || heading2(block2) && hasEarlier) {
        if (!hasEarlier) throw new Error("\u6B64\u5185\u5BB9\u8D85\u8FC7\u5355\u9875\u9AD8\u5EA6\uFF0C\u8BF7\u62C6\u5206\u8868\u683C\u6216\u8C03\u6574\u914D\u56FE\u540E\u91CD\u8BD5\u3002");
        block2.remove();
        page = nextPage();
        continue;
      }
      const full = block2;
      const lineHeight = parseFloat(doc.defaultView.getComputedStyle(full).lineHeight);
      let remainder = null;
      for (const limit of [floor(), floor() - lineHeight / 2]) {
        const prefix = full.cloneNode(true);
        full.replaceWith(prefix);
        const tail = split(prefix, limit);
        if (tail?.hasChildNodes() && prefix.hasChildNodes() && prefix.getBoundingClientRect().bottom <= floor() + 0.01) {
          remainder = tail;
          break;
        }
        prefix.replaceWith(full);
      }
      if (remainder) block2 = remainder;
      else {
        if (!hasEarlier) throw new Error("\u65E0\u6CD5\u5B8C\u6574\u6392\u5165\u6B64\u6BB5\u5185\u5BB9\uFF0C\u8BF7\u68C0\u67E5\u683C\u5F0F\u540E\u91CD\u8BD5\u3002");
        full.remove();
      }
      page = nextPage();
    }
  }
  return pages;
}
var exportScale = 2;
async function renderPNG(page) {
  const doc = page.ownerDocument;
  const wrap = doc.createElement("div");
  const style = doc.createElement("style");
  style.textContent = pageCSS;
  wrap.append(style, page.cloneNode(true));
  const xml = new XMLSerializer().serializeToString(wrap);
  const width = pageWidth * exportScale;
  const height = pageHeight * exportScale;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${pageWidth} ${pageHeight}"><foreignObject width="${pageWidth}" height="${pageHeight}">${xml}</foreignObject></svg>`;
  const image2 = doc.createElement("img");
  image2.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  await image2.decode();
  const canvas = doc.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(image2, 0, 0);
  return new Promise((resolve2, reject) => canvas.toBlob((blob) => blob ? resolve2(blob) : reject(new Error("PNG \u751F\u6210\u5931\u8D25")), "image/png"));
}

// node_modules/docx/dist/index.mjs
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);
function _typeof2(o) {
  "@babel/helpers - typeof";
  return _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof2(o);
}
function toPrimitive2(t, r) {
  if ("object" != _typeof2(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i2 = e.call(t, r || "default");
    if ("object" != _typeof2(i2)) return i2;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function toPropertyKey2(t) {
  var i2 = toPrimitive2(t, "string");
  return "symbol" == _typeof2(i2) ? i2 : i2 + "";
}
function _defineProperty2(e, r, t) {
  return (r = toPropertyKey2(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
var BaseXmlComponent = class {
  /**
  * Creates a new BaseXmlComponent with the specified XML element name.
  *
  * @param rootKey - The XML element name (e.g., "w:p", "w:r", "w:t")
  */
  constructor(rootKey) {
    _defineProperty2(
      this,
      /** The XML element name for this component (e.g., "w:p" for paragraph). */
      "rootKey",
      void 0
    );
    this.rootKey = rootKey;
  }
  /**
  * The components written in this one's place, one after another, when it can't be written as a single element,
  * such as a run with another run in its children. Undefined when it is written as itself.
  *
  * @internal
  */
  get writtenAs() {
  }
};
var isXmlComponent = (value) => value instanceof BaseXmlComponent || typeof value === "object" && value !== null && typeof value.prepForXml === "function";
var elementOf = (value) => isXmlComponent(value) ? value.rootKey : void 0;
var EMPTY_OBJECT = Object.seal({});
var XmlComponent = class extends BaseXmlComponent {
  /**
  * Creates a new XmlComponent.
  *
  * @param rootKey - The XML element name (e.g., "w:p", "w:r", "w:t")
  */
  constructor(rootKey) {
    super(rootKey);
    _defineProperty2(
      this,
      /**
      * Array of child components, text nodes, and attributes.
      *
      * This array forms the content of the XML element. It can contain other
      * XmlComponents, string values (text nodes), or attribute components.
      */
      "root",
      void 0
    );
    this.root = new Array();
  }
  /**
  * Prepares this component and its children for XML serialization.
  *
  * This method is called by the Formatter to convert the component tree into
  * an object structure compatible with the xml library (https://www.npmjs.com/package/xml).
  * It recursively processes all children and handles special cases like
  * attribute-only elements and empty elements.
  *
  * The method can be overridden by subclasses to customize XML representation
  * or execute side effects during serialization (e.g., creating relationships).
  *
  * @param context - The serialization context containing document state
  * @returns The XML-serializable object, or undefined to exclude from output
  *
  * @example
  * ```typescript
  * // Override to add custom serialization logic
  * prepForXml(context: IContext): IXmlableObject | undefined {
  *   // Custom logic here
  *   return super.prepForXml(context);
  * }
  * ```
  */
  prepForXml(context) {
    var _children$;
    context.stack.push(this);
    const children = this.root.flatMap((comp) => {
      if (isXmlComponent(comp)) {
        const parts = comp.writtenAs;
        return parts ? parts.map((part) => part.prepForXml(context)) : comp.prepForXml(context);
      }
      return comp;
    }).filter((comp) => comp !== void 0);
    context.stack.pop();
    return { [this.rootKey]: children.length ? children.length === 1 && ((_children$ = children[0]) === null || _children$ === void 0 ? void 0 : _children$._attr) ? children[0] : children : EMPTY_OBJECT };
  }
  /**
  * Adds a child element to this component.
  *
  * @deprecated Do not use this method. It is only used internally by the library. It will be removed in a future version.
  * @param child - The child component or text string to add
  * @returns This component (for chaining)
  */
  addChildElement(child2) {
    this.root.push(child2);
    return this;
  }
};
var IgnoreIfEmptyXmlComponent = class extends XmlComponent {
  constructor(rootKey, includeIfEmpty) {
    super(rootKey);
    _defineProperty2(this, "includeIfEmpty", void 0);
    this.includeIfEmpty = includeIfEmpty;
  }
  /**
  * Prepares the component for XML serialization, excluding it if empty.
  *
  * @param context - The serialization context
  * @returns The XML-serializable object, or undefined if empty
  */
  prepForXml(context) {
    const result = super.prepForXml(context);
    if (this.includeIfEmpty) return result;
    return result && (typeof result[this.rootKey] !== "object" || Object.keys(result[this.rootKey]).length) ? result : void 0;
  }
};
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty2(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
var XmlAttributeComponent = class extends BaseXmlComponent {
  /**
  * Creates a new attribute component.
  *
  * @param root - The attribute data object
  */
  constructor(root) {
    super("_attr");
    _defineProperty2(this, "root", void 0);
    _defineProperty2(
      this,
      /** Optional mapping from property names to XML attribute names. */
      "xmlKeys",
      void 0
    );
    this.root = root;
  }
  /**
  * Converts the attribute data to an XML-serializable object.
  *
  * This method transforms the property names using xmlKeys (if defined)
  * and filters out undefined values.
  *
  * @param _ - Context (unused for attributes)
  * @returns Object with _attr key containing the mapped attributes
  */
  prepForXml(_) {
    const attrs = {};
    Object.entries(this.root).forEach(([key, value]) => {
      if (value !== void 0) {
        const newKey = this.xmlKeys && this.xmlKeys[key] || key;
        attrs[newKey] = value;
      }
    });
    return { _attr: attrs };
  }
};
var NextAttributeComponent = class extends BaseXmlComponent {
  /**
  * Creates a new NextAttributeComponent.
  *
  * @param root - Attribute payload with explicit key-value mappings
  */
  constructor(root) {
    super("_attr");
    _defineProperty2(this, "root", void 0);
    this.root = root;
  }
  /**
  * Converts the attribute payload to an XML-serializable object.
  *
  * Extracts the key and value from each property and filters out
  * undefined values.
  *
  * @param _ - Context (unused for attributes)
  * @returns Object with _attr key containing the attributes
  */
  prepForXml(_) {
    return { _attr: Object.values(this.root).filter(({ value }) => value !== void 0).reduce((acc, { key, value }) => _objectSpread2(_objectSpread2({}, acc), {}, { [key]: value }), {}) };
  }
};
var Attributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      val: "w:val",
      color: "w:color",
      fill: "w:fill",
      space: "w:space",
      sz: "w:sz",
      type: "w:type",
      rsidR: "w:rsidR",
      rsidRPr: "w:rsidRPr",
      rsidSect: "w:rsidSect",
      w: "w:w",
      h: "w:h",
      top: "w:top",
      right: "w:right",
      bottom: "w:bottom",
      left: "w:left",
      header: "w:header",
      footer: "w:footer",
      gutter: "w:gutter",
      linePitch: "w:linePitch",
      pos: "w:pos"
    });
  }
};
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (e.includes(n)) continue;
    t[n] = r[n];
  }
  return t;
}
function _objectWithoutProperties(e, t) {
  if (null == e) return {};
  var o, r, i2 = _objectWithoutPropertiesLoose(e, t);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    for (r = 0; r < s.length; r++) o = s[r], t.includes(o) || {}.propertyIsEnumerable.call(e, o) && (i2[o] = e[o]);
  }
  return i2;
}
var _excluded$4 = ["elements"];
var PREDEFINED_ENTITIES = /* @__PURE__ */ new Map([
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
  ["quot", '"'],
  ["apos", "'"]
]);
var ENTITY_REFERENCE = /&([^;]*);?/g;
var decodeEntities = (raw) => raw.indexOf("&") === -1 ? raw : raw.replace(ENTITY_REFERENCE, (reference2, name) => {
  if (!reference2.endsWith(";")) throw new Error(`Invalid XML: "&" that starts no entity, in "${raw}"`);
  const predefined = PREDEFINED_ENTITIES.get(name);
  if (predefined !== void 0) return predefined;
  const codePoint = /^#x[0-9a-f]+$/i.test(name) ? parseInt(name.slice(2), 16) : /^#[0-9]+$/.test(name) ? parseInt(name.slice(1), 10) : NaN;
  if (!(codePoint > 0 && codePoint <= 1114111)) throw new Error(`Invalid XML: unknown entity "${reference2}"`);
  return String.fromCodePoint(codePoint);
});
var isWhitespace = (char) => char === " " || char === "\n" || char === "	" || char === "\r";
var DECLARATION_ATTRIBUTE = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
var parseDeclarationAttributes = (body) => Object.fromEntries([...body.matchAll(DECLARATION_ATTRIBUTE)].map(([, name, doubleQuoted, singleQuoted]) => [name, doubleQuoted !== null && doubleQuoted !== void 0 ? doubleQuoted : singleQuoted]));
var parseXml = (text2, { keepWhitespaceText = false } = {}) => {
  const document2 = {};
  const open = [];
  let position = text2.charCodeAt(0) === 65279 ? 1 : 0;
  while (position < text2.length && isWhitespace(text2[position])) position++;
  const append = (node) => {
    var _parent$elements;
    const parent = open.length === 0 ? document2 : open[open.length - 1];
    ((_parent$elements = parent.elements) !== null && _parent$elements !== void 0 ? _parent$elements : parent.elements = []).push(node);
  };
  const appendText = (raw) => {
    if (raw.trim() === "") {
      if (raw !== "" && keepWhitespaceText) append({
        type: "text",
        text: raw
      });
      return;
    }
    if (open.length === 0) throw new Error(`Invalid XML: text outside of the root element, "${raw.trim()}"`);
    append({
      type: "text",
      text: decodeEntities(raw)
    });
  };
  const indexOfOrThrow = (search, from, what) => {
    const index = text2.indexOf(search, from);
    if (index === -1) throw new Error(`Invalid XML: ${what} that isn't closed`);
    return index;
  };
  while (position < text2.length) {
    const tagStart = text2.indexOf("<", position);
    appendText(text2.slice(position, tagStart === -1 ? text2.length : tagStart));
    if (tagStart === -1) break;
    if (text2.startsWith("<?", tagStart)) {
      const end = indexOfOrThrow("?>", tagStart + 2, "processing instruction");
      const content = text2.slice(tagStart + 2, end);
      const nameEnd = content.search(/\s/);
      const name = nameEnd === -1 ? content : content.slice(0, nameEnd);
      const body = nameEnd === -1 ? "" : content.slice(nameEnd).trimStart();
      if (name.toLowerCase() === "xml") {
        const attributes = parseDeclarationAttributes(body);
        document2.declaration = Object.keys(attributes).length > 0 ? { attributes } : {};
      } else append({
        type: "instruction",
        name,
        instruction: body
      });
      position = end + 2;
    } else if (text2.startsWith("<!--", tagStart)) {
      const end = indexOfOrThrow("-->", tagStart + 4, "comment");
      const comment = text2.slice(tagStart + 4, end);
      if (comment !== "") append({
        type: "comment",
        comment
      });
      position = end + 3;
    } else if (text2.startsWith("<![CDATA[", tagStart)) {
      const end = indexOfOrThrow("]]>", tagStart + 9, "CDATA section");
      const cdata = text2.slice(tagStart + 9, end);
      if (cdata !== "") append({
        type: "cdata",
        cdata
      });
      position = end + 3;
    } else if (text2.startsWith("<!DOCTYPE", tagStart)) {
      let end = tagStart + 9;
      let quote;
      let inSubset = false;
      for (; end < text2.length; end++) {
        const char = text2[end];
        if (quote !== void 0) quote = char === quote ? void 0 : quote;
        else if (char === '"' || char === "'") quote = char;
        else if (char === "[") inSubset = true;
        else if (char === "]") inSubset = false;
        else if (char === ">" && !inSubset) break;
      }
      if (end === text2.length) throw new Error("Invalid XML: DOCTYPE that isn't closed");
      append({
        type: "doctype",
        doctype: text2.slice(tagStart + 9, end).replace(/^ /, "")
      });
      position = end + 1;
    } else if (text2.startsWith("</", tagStart)) {
      const end = indexOfOrThrow(">", tagStart + 2, "closing tag");
      const name = text2.slice(tagStart + 2, end).trimEnd();
      const element = open.pop();
      if ((element === null || element === void 0 ? void 0 : element.name) !== name) {
        var _element$name;
        throw new Error(`Invalid XML: closing tag </${name}> doesn't match <${(_element$name = element === null || element === void 0 ? void 0 : element.name) !== null && _element$name !== void 0 ? _element$name : ""}>`);
      }
      position = end + 1;
    } else position = parseStartTag(text2, tagStart + 1, (element, selfClosing) => {
      append(element);
      if (!selfClosing) open.push(element);
    });
  }
  if (open.length > 0) throw new Error(`Invalid XML: <${open[open.length - 1].name}> isn't closed`);
  const { elements } = document2, rest = _objectWithoutProperties(document2, _excluded$4);
  return elements === void 0 ? rest : _objectSpread2(_objectSpread2({}, rest), {}, { elements });
};
var parseStartTag = (text2, from, onElement) => {
  let nameEnd = from;
  while (nameEnd < text2.length && !isWhitespace(text2[nameEnd]) && text2[nameEnd] !== "/" && text2[nameEnd] !== ">") nameEnd++;
  const name = text2.slice(from, nameEnd);
  if (name === "") throw new Error("Invalid XML: tag without a name");
  const attributes = [];
  let position = nameEnd;
  for (; ; ) {
    while (position < text2.length && isWhitespace(text2[position])) position++;
    if (position >= text2.length) throw new Error(`Invalid XML: <${name}> that isn't closed`);
    if (text2[position] === ">" || text2.startsWith("/>", position)) {
      const selfClosing = text2[position] === "/";
      onElement(_objectSpread2({
        type: "element",
        name
      }, attributes.length > 0 ? { attributes: Object.fromEntries(attributes) } : {}), selfClosing);
      return position + (selfClosing ? 2 : 1);
    }
    const equals = text2.indexOf("=", position);
    const attributeName = text2.slice(position, equals === -1 ? text2.length : equals).trimEnd();
    if (equals === -1 || attributeName === "" || /[\s/>]/.test(attributeName)) throw new Error(`Invalid XML: attribute of <${name}> without a value`);
    let valueStart = equals + 1;
    while (valueStart < text2.length && isWhitespace(text2[valueStart])) valueStart++;
    const quote = text2[valueStart];
    if (quote !== '"' && quote !== "'") throw new Error(`Invalid XML: value of ${attributeName} on <${name}> isn't quoted`);
    const valueEnd = text2.indexOf(quote, valueStart + 1);
    if (valueEnd === -1) throw new Error(`Invalid XML: value of ${attributeName} on <${name}> isn't closed`);
    if (!attributes.some(([existing]) => existing === attributeName)) attributes.push([attributeName, decodeEntities(text2.slice(valueStart + 1, valueEnd))]);
    position = valueEnd + 1;
  }
};
var ESCAPES = /* @__PURE__ */ new Map([
  ["&", "&amp;"],
  ['"', "&quot;"],
  ["'", "&apos;"],
  ["<", "&lt;"],
  [">", "&gt;"]
]);
var escapeAll = (value) => value.replace(/[&"'<>\x00-\x08\x0B\x0C\x0E-\x1F]/g, (char) => {
  var _ESCAPES$get;
  return (_ESCAPES$get = ESCAPES.get(char)) !== null && _ESCAPES$get !== void 0 ? _ESCAPES$get : "";
});
var escapeText = (value) => value.replace(/[&<>\x00-\x08\x0B\x0C\x0E-\x1F]/g, (char) => {
  var _ESCAPES$get2;
  return (_ESCAPES$get2 = ESCAPES.get(char)) !== null && _ESCAPES$get2 !== void 0 ? _ESCAPES$get2 : "";
});
var escapeValue = (value) => typeof value === "string" ? escapeAll(value) : value;
var resolve = (data, indent, depth) => {
  const name = Object.keys(data)[0];
  const values = name === void 0 ? void 0 : data[name];
  const attributes = [];
  const content = [];
  const addAttributes = (attr) => {
    for (const [key, value] of Object.entries(attr)) attributes.push(`${key}="${String(escapeValue(value))}"`);
  };
  if (typeof values === "object") {
    if (values !== null) {
      const { _attr: attr, _cdata: cdata } = values;
      if (attr) addAttributes(attr);
      if (cdata) content.push(`<![CDATA[${cdata.replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`);
      if (Array.isArray(values)) {
        let isStringContent = false;
        content.push("");
        for (const value of values) if (typeof value === "object") {
          if (Object.keys(value)[0] === "_attr") addAttributes(value._attr);
          else content.push(resolve(value, indent, depth + 1));
        } else {
          content.pop();
          isStringContent = true;
          content.push(escapeValue(value));
        }
        if (!isStringContent) content.push("");
      }
    }
  } else content.push(escapeValue(values));
  return {
    name,
    attributes,
    content,
    indents: depth > 1 ? indent.repeat(depth - 1) : ""
  };
};
var format2 = (element, indent, isLast) => {
  if (typeof element !== "object") return String(element);
  const { name, attributes, content, indents } = element;
  const { length } = content;
  const open = indents + (name ? `<${name}` : "") + (attributes.length > 0 ? ` ${attributes.join(" ")}` : "") + (length > 0 ? name ? ">" : "" : "/>") + (indent && length > 1 ? "\n" : "");
  if (length === 0) return open + (indent ? "\n" : "");
  return open + content.map((child2) => child2 === void 0 ? "" : format2(child2, indent, false)).join("") + (length > 1 ? indents : "") + (name ? `</${name}>` : "") + (indent && !isLast ? "\n" : "");
};
var stringifyXmlable = (input, { indent = "", declaration } = {}) => {
  const items = Array.isArray(input) ? input : [input];
  const startDepth = indent ? 1 : 0;
  const standalone = (declaration === null || declaration === void 0 ? void 0 : declaration.standalone) ? ` standalone="${escapeAll(declaration.standalone)}"` : "";
  return (declaration === void 0 ? "" : `<?xml version="1.0" encoding="${escapeAll(declaration.encoding || "UTF-8")}"${standalone}?>${indent ? "\n" : ""}`) + items.map((item, i2) => format2(resolve(item, indent, startDepth), indent, i2 === items.length - 1)).join("");
};
var stringifyAttributes = (attributes) => Object.entries(attributes !== null && attributes !== void 0 ? attributes : {}).flatMap(([key, value]) => value === void 0 || value === null ? [] : [` ${key}="${escapeAll(String(value))}"`]).join("");
var stringifyNode = (node) => {
  switch (node.type) {
    case "element": {
      var _node$elements, _node$attributes;
      const elements = (_node$elements = node.elements) !== null && _node$elements !== void 0 ? _node$elements : [];
      const open = `<${node.name}${stringifyAttributes(node.attributes)}`;
      return elements.length > 0 || ((_node$attributes = node.attributes) === null || _node$attributes === void 0 ? void 0 : _node$attributes["xml:space"]) === "preserve" ? `${open}>${elements.map(stringifyNode).join("")}</${node.name}>` : `${open}/>`;
    }
    case "text":
      return escapeText(String(node.text));
    case "cdata":
      return `<![CDATA[${String(node.cdata).replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`;
    case "comment":
      return `<!--${node.comment}-->`;
    case "doctype":
      return `<!DOCTYPE ${node.doctype}>`;
    case "instruction":
      return `<?${node.name}${node.instruction ? ` ${node.instruction}` : ""}?>`;
    default:
      return "";
  }
};
var stringifyElement = (document2) => {
  var _document$elements;
  return (document2.declaration ? `<?xml${stringifyAttributes(document2.declaration.attributes)}?>` : "") + ((_document$elements = document2.elements) !== null && _document$elements !== void 0 ? _document$elements : []).map(stringifyNode).join("");
};
var convertToXmlComponent = (element) => {
  switch (element.type) {
    case void 0:
    case "element":
      const xmlComponent = new ImportedXmlComponent(element.name, element.attributes);
      const childElements2 = element.elements || [];
      for (const childElm of childElements2) {
        const child2 = convertToXmlComponent(childElm);
        if (child2 !== void 0) xmlComponent.push(child2);
      }
      return xmlComponent;
    case "text":
      return element.text;
    default:
      return;
  }
};
var ImportedXmlComponentAttributes = class extends XmlAttributeComponent {
};
var ImportedXmlComponent = class extends XmlComponent {
  /**
  * Parses an XML string and converts it to an ImportedXmlComponent tree.
  *
  * This static method is the primary way to import external XML content.
  * It parses the XML string into an {@link XmlElement} tree,
  * then converts that into a tree of XmlComponent objects.
  *
  * The component is for the parsed document, with the XML's element in it, and is written as that element, with no
  * element of its own around it.
  *
  * @param importedContent - The XML content as a string
  * @returns An ImportedXmlComponent representing the parsed XML
  *
  * @example
  * ```typescript
  * const xml = '<w:p><w:r><w:t>Hello</w:t></w:r></w:p>';
  * const component = ImportedXmlComponent.fromXmlString(xml);
  * ```
  */
  static fromXmlString(importedContent) {
    return convertToXmlComponent(parseXml(importedContent));
  }
  /**
  * Creates an ImportedXmlComponent.
  *
  * @param rootKey - The XML element name
  * @param _attr - Optional attributes for the root element
  */
  constructor(rootKey, _attr) {
    super(rootKey);
    if (_attr) this.root.push(new ImportedXmlComponentAttributes(_attr));
  }
  /**
  * Adds a child component or text to this element.
  *
  * @param xmlComponent - The child component or text string to add
  */
  push(xmlComponent) {
    this.root.push(xmlComponent);
  }
  /**
  * A component of no element, such as the one {@link fromXmlString} gives for the parsed document, is written as the
  * elements in it. Written as itself, it would be an `<undefined>` element, which Word can't open.
  *
  * The component itself is still returned, rather than its element, because code written for earlier versions takes
  * the element from its children.
  *
  * @internal
  */
  get writtenAs() {
    return this.rootKey === void 0 ? this.root.filter((child2) => typeof child2 !== "string") : void 0;
  }
  /**
  * Prepares this element for XML serialization. A component of no element written by itself, rather than among a
  * parent's children, such as by the formatter or by an earlier copy of docx, is written as the one element in it.
  *
  * @param context - The serialization context
  * @returns The XML-serializable object
  */
  prepForXml(context) {
    const parts = this.writtenAs;
    return (parts === null || parts === void 0 ? void 0 : parts.length) === 1 ? parts[0].prepForXml(context) : super.prepForXml(context);
  }
};
var ImportedRootElementAttributes = class extends XmlComponent {
  /**
  * Creates an ImportedRootElementAttributes component.
  *
  * @param _attr - The attributes object to pass through
  */
  constructor(_attr) {
    super("");
    _defineProperty2(this, "_attr", void 0);
    this._attr = _attr;
  }
  /**
  * Prepares the attributes for XML serialization.
  *
  * @param _ - Context (unused)
  * @returns Object with _attr key containing the raw attributes
  */
  prepForXml(_) {
    return { _attr: this._attr };
  }
};
var InitializableXmlComponent = class extends XmlComponent {
  /**
  * Creates a new InitializableXmlComponent.
  *
  * @param rootKey - The XML element name
  * @param initComponent - Optional component to copy children from
  */
  constructor(rootKey, initComponent) {
    super(rootKey);
    if (initComponent) this.root = initComponent.root;
  }
};
var decimalNumber = (val) => {
  if (!Number.isFinite(val)) throw new Error(`Invalid value '${val}' specified. Must be an integer.`);
  return Math.floor(val);
};
var unsignedDecimalNumber = (val) => {
  const value = decimalNumber(val);
  if (value < 0) throw new Error(`Invalid value '${val}' specified. Must be a positive integer.`);
  return value;
};
var hexBinary = (val, length) => {
  const expectedLength = length * 2;
  if (val.length !== expectedLength || isNaN(Number(`0x${val}`))) throw new Error(`Invalid hex value '${val}'. Expected ${expectedLength} digit hex value`);
  return val;
};
var uCharHexNumber = (val) => hexBinary(val, 1);
var universalMeasureValue = (val) => {
  const unit = val.slice(-2);
  const amount = val.substring(0, val.length - 2);
  return `${Number(amount)}${unit}`;
};
var TWIPS_PER_UNIT = {
  in: 1440,
  cm: 1440 / 2.54,
  mm: 1440 / 25.4,
  pt: 20,
  pc: 240,
  pi: 240
};
var universalMeasureToTwips = (val) => {
  if (typeof val === "number") return val;
  const unit = val.slice(-2);
  const amount = Number(val.substring(0, val.length - 2));
  const twipsPerUnit = TWIPS_PER_UNIT[unit];
  if (twipsPerUnit === void 0 || Number.isNaN(amount)) throw new Error(`Invalid universal measure '${val}'. Expected a number followed by mm, cm, in, pt, pc or pi.`);
  return amount * twipsPerUnit;
};
var positiveUniversalMeasureValue = (val) => {
  const value = universalMeasureValue(val);
  if (parseFloat(value) < 0) throw new Error(`Invalid value '${value}' specified. Expected a positive number.`);
  return value;
};
var hexColorValue = (val) => {
  if (val === "auto") return val;
  return hexBinary(val.charAt(0) === "#" ? val.substring(1) : val, 3);
};
var signedTwipsMeasureValue = (val) => typeof val === "string" ? universalMeasureValue(val) : decimalNumber(val);
var hpsMeasureValue = (val) => typeof val === "string" ? positiveUniversalMeasureValue(val) : unsignedDecimalNumber(val);
var twipsMeasureValue = (val) => typeof val === "string" ? positiveUniversalMeasureValue(val) : unsignedDecimalNumber(val);
var percentageValue = (val) => {
  const percent = val.substring(0, val.length - 1);
  return `${Number(percent)}%`;
};
var measurementOrPercentValue = (val) => {
  if (typeof val === "number") return decimalNumber(val);
  return val.slice(-1) === "%" ? percentageValue(val) : universalMeasureValue(val);
};
var eighthPointMeasureValue = unsignedDecimalNumber;
var pointMeasureValue = unsignedDecimalNumber;
var dateTimeValue = (val) => val.toISOString();
var OnOffElement = class extends XmlComponent {
  /**
  * Creates an OnOffElement.
  *
  * @param name - The XML element name (e.g., "w:b", "w:i")
  * @param val - The boolean value (defaults to true)
  */
  constructor(name, val = true) {
    super(name);
    if (val !== true) this.root.push(new Attributes({ val }));
  }
};
var HpsMeasureElement = class extends XmlComponent {
  /**
  * Creates an HpsMeasureElement.
  *
  * @param name - The XML element name
  * @param val - The measurement value (number in half-points or string with units)
  */
  constructor(name, val) {
    super(name);
    this.root.push(new Attributes({ val: hpsMeasureValue(val) }));
  }
};
var EmptyElement = class extends XmlComponent {
};
var StringValueElement = class extends XmlComponent {
  /**
  * Creates a StringValueElement.
  *
  * @param name - The XML element name
  * @param val - The string value
  */
  constructor(name, val) {
    super(name);
    this.root.push(new Attributes({ val }));
  }
};
var createStringElement = (name, value) => new BuilderElement({
  name,
  attributes: { value: {
    key: "w:val",
    value
  } }
});
var NumberValueElement = class extends XmlComponent {
  /**
  * Creates a NumberValueElement.
  *
  * @param name - The XML element name
  * @param val - The numeric value
  */
  constructor(name, val) {
    super(name);
    this.root.push(new Attributes({ val }));
  }
};
var StringContainer = class extends XmlComponent {
  /**
  * Creates a StringContainer.
  *
  * @param name - The XML element name
  * @param val - The text content
  */
  constructor(name, val) {
    super(name);
    this.root.push(val);
  }
};
var BuilderElement = class extends XmlComponent {
  /**
  * Creates a BuilderElement with the specified configuration.
  *
  * @param config - Element configuration
  * @param config.name - The XML element name
  * @param config.attributes - Optional attributes with explicit key-value pairs
  * @param config.children - Optional child elements
  */
  constructor({ name, attributes, children }) {
    super(name);
    if (attributes) this.root.push(new NextAttributeComponent(attributes));
    if (children) this.root.push(...children);
  }
};
var AlignmentType = {
  /** Align Start: the left in a left-to-right paragraph, and the right in a `bidirectional` (right-to-left) paragraph */
  START: "start",
  /** Align Center */
  CENTER: "center",
  /** Align End: the right in a left-to-right paragraph, and the left in a `bidirectional` (right-to-left) paragraph */
  END: "end",
  /** Justified */
  BOTH: "both",
  /** Medium Kashida Length */
  MEDIUM_KASHIDA: "mediumKashida",
  /** Distribute All Characters Equally */
  DISTRIBUTE: "distribute",
  /** Align to List Tab */
  NUM_TAB: "numTab",
  /** Widest Kashida Length */
  HIGH_KASHIDA: "highKashida",
  /** Low Kashida Length */
  LOW_KASHIDA: "lowKashida",
  /** Thai Language Justification */
  THAI_DISTRIBUTE: "thaiDistribute",
  /** Align Left: a paragraph stays on the left of the page even when it is `bidirectional` (right-to-left) */
  LEFT: "left",
  /** Align Right: a paragraph stays on the right of the page even when it is `bidirectional` (right-to-left) */
  RIGHT: "right",
  /** Justified */
  JUSTIFIED: "both"
};
var createAlignment = (type) => new BuilderElement({
  name: "w:jc",
  attributes: { val: {
    key: "w:val",
    value: type
  } }
});
var COLOR_OOXML_NAMES = {
  dark1: "dk1",
  light1: "lt1",
  dark2: "dk2",
  light2: "lt2",
  accent1: "accent1",
  accent2: "accent2",
  accent3: "accent3",
  accent4: "accent4",
  accent5: "accent5",
  accent6: "accent6",
  hyperlink: "hlink",
  followedHyperlink: "folHlink"
};
var OFFICE_COLORS = {
  dark2: "44546A",
  light2: "E7E6E6",
  accent1: "4472C4",
  accent2: "ED7D31",
  accent3: "A5A5A5",
  accent4: "FFC000",
  accent5: "5B9BD5",
  accent6: "70AD47",
  hyperlink: "0563C1",
  followedHyperlink: "954F72"
};
var OFFICE_SYSTEM_COLORS = {
  dark1: {
    value: "windowText",
    lastColor: "000000"
  },
  light1: {
    value: "window",
    lastColor: "FFFFFF"
  }
};
var rgbColorValue = (name, color) => {
  if (color === "auto") throw new Error(`Invalid theme color ${name} 'auto'. Expected 6 digit hex value`);
  return hexColorValue(color);
};
var themeColorValues = (colors = {}) => Object.fromEntries(Object.keys(COLOR_OOXML_NAMES).map((name) => {
  const color = colors[name];
  const office = name === "dark1" || name === "light1" ? OFFICE_SYSTEM_COLORS[name].lastColor : OFFICE_COLORS[name];
  return [name, color === void 0 ? office : rgbColorValue(name, color)];
}));
var createRgbColor = (name, color) => new BuilderElement({
  name: "a:srgbClr",
  attributes: { value: {
    key: "val",
    value: rgbColorValue(name, color)
  } }
});
var createColor = (name, colors) => {
  const color = colors[name];
  const system = name === "dark1" || name === "light1" ? OFFICE_SYSTEM_COLORS[name] : void 0;
  return new BuilderElement({
    name: `a:${COLOR_OOXML_NAMES[name]}`,
    children: [color === void 0 && system ? new BuilderElement({
      name: "a:sysClr",
      attributes: {
        value: {
          key: "val",
          value: system.value
        },
        lastColor: {
          key: "lastClr",
          value: system.lastColor
        }
      }
    }) : createRgbColor(name, color !== null && color !== void 0 ? color : OFFICE_COLORS[name])]
  });
};
var createColorScheme = (name, colors = {}) => new BuilderElement({
  name: "a:clrScheme",
  attributes: { name: {
    key: "name",
    value: name
  } },
  children: Object.keys(COLOR_OOXML_NAMES).map((color) => createColor(color, colors))
});
var THEME_COLOR_NAMES = /* @__PURE__ */ new Set([
  "dark1",
  "light1",
  "dark2",
  "light2",
  "accent1",
  "accent2",
  "accent3",
  "accent4",
  "accent5",
  "accent6",
  "hyperlink",
  "followedHyperlink"
]);
var THEME_COLOR_SUGGESTIONS = /* @__PURE__ */ new Map([
  ["dk1", "dark1"],
  ["lt1", "light1"],
  ["dk2", "dark2"],
  ["lt2", "light2"],
  ["hlink", "hyperlink"],
  ["folHlink", "followedHyperlink"],
  ["text1", "dark1"],
  ["background1", "light1"],
  ["text2", "dark2"],
  ["background2", "light2"]
]);
var changeValue = (value, option) => {
  if (!(value >= 0 && value <= 100)) throw new Error(`Invalid ${option} ${value}. Expected a number from 0 to 100`);
  return Math.round(255 * (1 - value / 100));
};
var themeColorChange = ({ theme, lighter, darker }) => {
  if (!THEME_COLOR_NAMES.has(theme)) {
    const suggestion = THEME_COLOR_SUGGESTIONS.get(theme);
    throw new Error(`Invalid theme color "${theme}". ${suggestion ? `Did you mean "${suggestion}"?` : `Expected one of ${[...THEME_COLOR_NAMES].join(", ")}`}`);
  }
  if (lighter !== void 0 && darker !== void 0) throw new Error("Invalid theme color. Expected lighter or darker, not both");
  const tint = lighter === void 0 ? void 0 : changeValue(lighter, "lighter");
  const shade = darker === void 0 ? void 0 : changeValue(darker, "darker");
  return {
    tint: tint === 255 ? void 0 : tint,
    shade: shade === 255 ? void 0 : shade
  };
};
var toHsl = (hex) => {
  const [red, green, blue] = [
    0,
    2,
    4
  ].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const max2 = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max2 + min) / 2;
  const range = max2 - min;
  if (range === 0) return {
    hue: 0,
    saturation: 0,
    lightness
  };
  return {
    hue: (max2 === red ? ((green - blue) / range + 6) % 6 : max2 === green ? (blue - red) / range + 2 : (red - green) / range + 4) * 60,
    saturation: range / (1 - Math.abs(2 * lightness - 1)),
    lightness
  };
};
var toHex = ({ hue, saturation, lightness }) => {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const second = chroma * (1 - Math.abs(hue / 60 % 2 - 1));
  const [red, green, blue] = hue < 60 ? [
    chroma,
    second,
    0
  ] : hue < 120 ? [
    second,
    chroma,
    0
  ] : hue < 180 ? [
    0,
    chroma,
    second
  ] : hue < 240 ? [
    0,
    second,
    chroma
  ] : hue < 300 ? [
    second,
    0,
    chroma
  ] : [
    chroma,
    0,
    second
  ];
  const lowest = lightness - chroma / 2;
  return [
    red,
    green,
    blue
  ].map((value) => Math.floor((value + lowest) * 255 + 1e-9).toString(16).padStart(2, "0")).join("").toUpperCase();
};
var applyChange = (hex, { tint, shade }) => {
  if (tint === void 0 && shade === void 0) return hex;
  const hsl = toHsl(hex);
  const lightness = tint === void 0 ? hsl.lightness * shade / 255 : hsl.lightness * tint / 255 + (1 - tint / 255);
  return toHex(_objectSpread2(_objectSpread2({}, hsl), {}, { lightness }));
};
var hexByte = (value) => value === void 0 ? void 0 : value.toString(16).padStart(2, "0").toUpperCase();
var checkColor = (color) => typeof color === "string" ? {
  type: "hex",
  value: hexColorValue(color)
} : {
  type: "theme",
  color,
  change: themeColorChange(color)
};
var colorValues = (checked, colors) => checked.type === "hex" ? { color: checked.value } : {
  color: applyChange(colors[checked.color.theme], checked.change),
  theme: checked.color.theme,
  tint: hexByte(checked.change.tint),
  shade: hexByte(checked.change.shade)
};
var OFFICE_THEME_COLORS = themeColorValues();
var ColorAttributeComponent = class extends BaseXmlComponent {
  /**
  * @throws If a color isn't valid
  */
  constructor(attributes) {
    super("_attr");
    _defineProperty2(this, "attributes", void 0);
    this.attributes = attributes.map((attribute2) => "keys" in attribute2 ? {
      keys: attribute2.keys,
      color: attribute2.color === void 0 ? void 0 : checkColor(attribute2.color)
    } : attribute2);
  }
  prepForXml(context) {
    var _context$file$Theme$C, _context$file;
    const themeColors = (_context$file$Theme$C = (_context$file = context.file) === null || _context$file === void 0 || (_context$file = _context$file.Theme) === null || _context$file === void 0 ? void 0 : _context$file.Colors) !== null && _context$file$Theme$C !== void 0 ? _context$file$Theme$C : OFFICE_THEME_COLORS;
    const entries = this.attributes.flatMap((attribute2) => {
      if (!("keys" in attribute2)) return [[attribute2.key, attribute2.value]];
      if (attribute2.color === void 0) return [];
      const { keys } = attribute2;
      const values = colorValues(attribute2.color, themeColors);
      return [
        [keys.color, values.color],
        [keys.theme, values.theme],
        [keys.tint, values.tint],
        [keys.shade, values.shade]
      ];
    });
    return { _attr: Object.fromEntries(entries.filter(([, value]) => value !== void 0)) };
  }
};
var ColorElement = class extends XmlComponent {
  constructor(name, attributes) {
    super(name);
    this.root.push(new ColorAttributeComponent(attributes));
  }
};
var createColorElement = (name, attributes) => new ColorElement(name, attributes);
var COLOR_ATTRIBUTES = {
  color: "w:color",
  theme: "w:themeColor",
  tint: "w:themeTint",
  shade: "w:themeShade"
};
var createBorderElement = (elementName, { color, size, space, style }) => createColorElement(elementName, [
  {
    key: "w:val",
    value: style
  },
  {
    keys: COLOR_ATTRIBUTES,
    color
  },
  {
    key: "w:sz",
    value: size === void 0 ? void 0 : eighthPointMeasureValue(size)
  },
  {
    key: "w:space",
    value: space === void 0 ? void 0 : pointMeasureValue(space)
  }
]);
var BorderStyle = {
  /** a single line */
  SINGLE: "single",
  /** a line with a series of alternating thin and thick strokes */
  DASH_DOT_STROKED: "dashDotStroked",
  /** a dashed line */
  DASHED: "dashed",
  /** a dashed line with small gaps */
  DASH_SMALL_GAP: "dashSmallGap",
  /** a line with alternating dots and dashes */
  DOT_DASH: "dotDash",
  /** a line with a repeating dot - dot - dash sequence */
  DOT_DOT_DASH: "dotDotDash",
  /** a dotted line */
  DOTTED: "dotted",
  /** a double line */
  DOUBLE: "double",
  /** a double wavy line */
  DOUBLE_WAVE: "doubleWave",
  /** an inset set of lines */
  INSET: "inset",
  /** no border */
  NIL: "nil",
  /** no border */
  NONE: "none",
  /** an outset set of lines */
  OUTSET: "outset",
  /** a single line */
  THICK: "thick",
  /** a thick line contained within a thin line with a large-sized intermediate gap */
  THICK_THIN_LARGE_GAP: "thickThinLargeGap",
  /** a thick line contained within a thin line with a medium-sized intermediate gap */
  THICK_THIN_MEDIUM_GAP: "thickThinMediumGap",
  /** a thick line contained within a thin line with a small intermediate gap */
  THICK_THIN_SMALL_GAP: "thickThinSmallGap",
  /** a thin line contained within a thick line with a large-sized intermediate gap */
  THIN_THICK_LARGE_GAP: "thinThickLargeGap",
  /** a thick line contained within a thin line with a medium-sized intermediate gap */
  THIN_THICK_MEDIUM_GAP: "thinThickMediumGap",
  /** a thick line contained within a thin line with a small intermediate gap */
  THIN_THICK_SMALL_GAP: "thinThickSmallGap",
  /** a thin-thick-thin line with a large gap */
  THIN_THICK_THIN_LARGE_GAP: "thinThickThinLargeGap",
  /** a thin-thick-thin line with a medium gap */
  THIN_THICK_THIN_MEDIUM_GAP: "thinThickThinMediumGap",
  /** a thin-thick-thin line with a small gap */
  THIN_THICK_THIN_SMALL_GAP: "thinThickThinSmallGap",
  /** a three-staged gradient line, getting darker towards the paragraph */
  THREE_D_EMBOSS: "threeDEmboss",
  /** a three-staged gradient like, getting darker away from the paragraph */
  THREE_D_ENGRAVE: "threeDEngrave",
  /** a triple line */
  TRIPLE: "triple",
  /** a wavy line */
  WAVE: "wave"
};
var Border = class extends IgnoreIfEmptyXmlComponent {
  constructor(options) {
    super("w:pBdr");
    if (options.top) this.root.push(createBorderElement("w:top", options.top));
    if (options.left) this.root.push(createBorderElement("w:left", options.left));
    if (options.bottom) this.root.push(createBorderElement("w:bottom", options.bottom));
    if (options.right) this.root.push(createBorderElement("w:right", options.right));
    if (options.between) this.root.push(createBorderElement("w:between", options.between));
  }
};
var ThematicBreak = class extends XmlComponent {
  constructor() {
    super("w:pBdr");
    const bottom = createBorderElement("w:bottom", {
      color: "auto",
      space: 1,
      style: BorderStyle.SINGLE,
      size: 6
    });
    this.root.push(bottom);
  }
};
var createIndent = ({ start, end, left, right, hanging, firstLine, firstLineChars }) => new BuilderElement({
  name: "w:ind",
  attributes: {
    start: {
      key: "w:start",
      value: start === void 0 ? void 0 : signedTwipsMeasureValue(start)
    },
    end: {
      key: "w:end",
      value: end === void 0 ? void 0 : signedTwipsMeasureValue(end)
    },
    left: {
      key: "w:left",
      value: left === void 0 ? void 0 : signedTwipsMeasureValue(left)
    },
    right: {
      key: "w:right",
      value: right === void 0 ? void 0 : signedTwipsMeasureValue(right)
    },
    hanging: {
      key: "w:hanging",
      value: hanging === void 0 ? void 0 : twipsMeasureValue(hanging)
    },
    firstLine: {
      key: "w:firstLine",
      value: firstLine === void 0 ? void 0 : twipsMeasureValue(firstLine)
    },
    firstLineChars: {
      key: "w:firstLineChars",
      value: firstLineChars === void 0 ? void 0 : decimalNumber(firstLineChars)
    }
  }
});
var createBreak = () => new BuilderElement({ name: "w:br" });
var FieldCharacterType = {
  BEGIN: "begin",
  END: "end",
  SEPARATE: "separate"
};
var createFieldChar = (type, dirty, locked) => new BuilderElement({
  name: "w:fldChar",
  attributes: {
    type: {
      key: "w:fldCharType",
      value: type
    },
    dirty: {
      key: "w:dirty",
      value: dirty
    },
    locked: {
      key: "w:fldLock",
      value: locked
    }
  }
});
var createBegin = (dirty, locked) => createFieldChar(FieldCharacterType.BEGIN, dirty, locked);
var dirtyWithoutPageNumbers = /* @__PURE__ */ new WeakSet();
var BeginDirtyWithoutPageNumbers = class extends BuilderElement {
  constructor() {
    super({
      name: "w:fldChar",
      attributes: {
        type: {
          key: "w:fldCharType",
          value: FieldCharacterType.BEGIN
        },
        dirty: {
          key: "w:dirty",
          value: true
        }
      }
    });
  }
  prepForXml(context) {
    const xml = super.prepForXml(context);
    dirtyWithoutPageNumbers.add(xml);
    return xml;
  }
};
var createBeginDirtyWithoutPageNumbers = () => new BeginDirtyWithoutPageNumbers();
var isDirtyWithoutPageNumbers = (element) => typeof element === "object" && element !== null && dirtyWithoutPageNumbers.has(element);
var createSeparate = (dirty) => createFieldChar(FieldCharacterType.SEPARATE, dirty);
var createEnd = (dirty) => createFieldChar(FieldCharacterType.END, dirty);
var SpaceType = {
  DEFAULT: "default",
  PRESERVE: "preserve"
};
var TextAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", { space: "xml:space" });
  }
};
var Page = class extends XmlComponent {
  constructor() {
    super("w:instrText");
    this.root.push(new TextAttributes({ space: SpaceType.PRESERVE }));
    this.root.push("PAGE");
  }
};
var NumberOfPages = class extends XmlComponent {
  constructor() {
    super("w:instrText");
    this.root.push(new TextAttributes({ space: SpaceType.PRESERVE }));
    this.root.push("NUMPAGES");
  }
};
var NumberOfPagesSection = class extends XmlComponent {
  constructor() {
    super("w:instrText");
    this.root.push(new TextAttributes({ space: SpaceType.PRESERVE }));
    this.root.push("SECTIONPAGES");
  }
};
var CurrentSection = class extends XmlComponent {
  constructor() {
    super("w:instrText");
    this.root.push(new TextAttributes({ space: SpaceType.PRESERVE }));
    this.root.push("SECTION");
  }
};
var createShading = ({ fill, color, type }) => createColorElement("w:shd", [
  {
    keys: {
      color: "w:fill",
      theme: "w:themeFill",
      tint: "w:themeFillTint",
      shade: "w:themeFillShade"
    },
    color: fill
  },
  {
    keys: COLOR_ATTRIBUTES,
    color
  },
  {
    key: "w:val",
    value: type !== null && type !== void 0 ? type : ShadingType.CLEAR
  }
]);
var ShadingType = {
  /** Clear shading - no pattern, fill color only */
  CLEAR: "clear",
  DIAGONAL_CROSS: "diagCross",
  DIAGONAL_STRIPE: "diagStripe",
  HORIZONTAL_CROSS: "horzCross",
  HORIZONTAL_STRIPE: "horzStripe",
  NIL: "nil",
  PERCENT_5: "pct5",
  PERCENT_10: "pct10",
  PERCENT_12: "pct12",
  PERCENT_15: "pct15",
  PERCENT_20: "pct20",
  PERCENT_25: "pct25",
  PERCENT_30: "pct30",
  PERCENT_35: "pct35",
  PERCENT_37: "pct37",
  PERCENT_40: "pct40",
  PERCENT_45: "pct45",
  PERCENT_50: "pct50",
  PERCENT_55: "pct55",
  PERCENT_60: "pct60",
  PERCENT_62: "pct62",
  PERCENT_65: "pct65",
  PERCENT_70: "pct70",
  PERCENT_75: "pct75",
  PERCENT_80: "pct80",
  PERCENT_85: "pct85",
  PERCENT_87: "pct87",
  PERCENT_90: "pct90",
  PERCENT_95: "pct95",
  REVERSE_DIAGONAL_STRIPE: "reverseDiagStripe",
  SOLID: "solid",
  THIN_DIAGONAL_CROSS: "thinDiagCross",
  THIN_DIAGONAL_STRIPE: "thinDiagStripe",
  THIN_HORIZONTAL_CROSS: "thinHorzCross",
  THIN_REVERSE_DIAGONAL_STRIPE: "thinReverseDiagStripe",
  THIN_VERTICAL_STRIPE: "thinVertStripe",
  VERTICAL_STRIPE: "vertStripe"
};
var ChangeAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      id: "w:id",
      author: "w:author",
      date: "w:date"
    });
  }
};
var DeletionTrackChange = class extends XmlComponent {
  constructor(options) {
    super("w:del");
    this.root.push(new ChangeAttributes({
      id: options.id,
      author: options.author,
      date: options.date
    }));
  }
};
var InsertionTrackChange = class extends XmlComponent {
  constructor(options) {
    super("w:ins");
    this.root.push(new ChangeAttributes({
      id: options.id,
      author: options.author,
      date: options.date
    }));
  }
};
var createEastAsianLayout = ({ twoLinesInOne, brackets, horizontalInVertical, fitToLine, group }) => new BuilderElement({
  name: "w:eastAsianLayout",
  attributes: {
    id: {
      key: "w:id",
      value: group === void 0 ? void 0 : decimalNumber(group)
    },
    combine: {
      key: "w:combine",
      value: twoLinesInOne
    },
    combineBrackets: {
      key: "w:combineBrackets",
      value: brackets
    },
    vert: {
      key: "w:vert",
      value: horizontalInVertical
    },
    vertCompress: {
      key: "w:vertCompress",
      value: fitToLine
    }
  }
});
var EmphasisMarkType = {
  /** Dot emphasis mark */
  DOT: "dot"
};
var createEmphasisMark = (emphasisMarkType = EmphasisMarkType.DOT) => new BuilderElement({
  name: "w:em",
  attributes: { val: {
    key: "w:val",
    value: emphasisMarkType
  } }
});
var urlAlphabet = "57X6y3wQZNzYjJB2L_10pxbackgroundhimselfUTF-8DEMOGRAPHICSVqvt4KW9";
var customAlphabet = (alphabet, defaultSize = 21) => {
  return (size = defaultSize) => {
    let id = "";
    let i2 = size | 0;
    while (i2-- > 0) id += alphabet[Math.random() * alphabet.length | 0];
    return id;
  };
};
var nanoid = (size = 21) => {
  let id = "";
  let i2 = size | 0;
  while (i2-- > 0) id += urlAlphabet[Math.random() * 64 | 0];
  return id;
};
var paddedWords = (data) => {
  const words = new Int32Array(Math.ceil((data.length + 9) / 64) * 16);
  for (let index = 0; index < data.length; index++) words[index >> 2] |= data[index] << 24 - (index & 3) * 8;
  words[data.length >> 2] |= 128 << 24 - (data.length & 3) * 8;
  words[words.length - 2] = Math.floor(data.length / 536870912);
  words[words.length - 1] = data.length * 8;
  return words;
};
var bytesOfWords = (words) => {
  const bytes = new Uint8Array(words.length * 4);
  for (let index = 0; index < bytes.length; index++) bytes[index] = words[index >> 2] >>> 24 - (index & 3) * 8;
  return bytes;
};
var rotateLeft = (word, bits2) => word << bits2 | word >>> 32 - bits2;
var rotateRight = (word, bits2) => word >>> bits2 | word << 32 - bits2;
var SHA1_INITIAL_HASH = [
  1732584193,
  4023233417,
  2562383102,
  271733878,
  3285377520
];
var SHA1_ROUND_CONSTANTS = Int32Array.of(1518500249, 1859775393, 2400959708, 3395469782);
var sha1Schedule = /* @__PURE__ */ new Int32Array(80);
var sha1 = (data) => {
  const words = paddedWords(data);
  const schedule = sha1Schedule;
  let [h0, h1, h2, h3, h4] = SHA1_INITIAL_HASH;
  for (let block2 = 0; block2 < words.length; block2 += 16) {
    schedule.set(words.subarray(block2, block2 + 16));
    for (let t = 16; t < 80; t++) schedule[t] = rotateLeft(schedule[t - 3] ^ schedule[t - 8] ^ schedule[t - 14] ^ schedule[t - 16], 1);
    let [a, b, c, d, e] = [
      h0,
      h1,
      h2,
      h3,
      h4
    ];
    for (let t = 0; t < 80; t++) {
      const f = t < 20 ? b & c | ~b & d : t >= 40 && t < 60 ? b & c | b & d | c & d : b ^ c ^ d;
      const next = rotateLeft(a, 5) + f + e + SHA1_ROUND_CONSTANTS[Math.floor(t / 20)] + schedule[t] | 0;
      e = d;
      d = c;
      c = rotateLeft(b, 30);
      b = a;
      a = next;
    }
    [h0, h1, h2, h3, h4] = [
      h0 + a | 0,
      h1 + b | 0,
      h2 + c | 0,
      h3 + d | 0,
      h4 + e | 0
    ];
  }
  return bytesOfWords([
    h0,
    h1,
    h2,
    h3,
    h4
  ]);
};
var SHA256_ROUND_CONSTANTS = Int32Array.of(1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298);
var SHA256_INITIAL_HASH = [
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
];
var sha256Schedule = /* @__PURE__ */ new Int32Array(64);
var sha256 = (data) => {
  const words = paddedWords(data);
  const schedule = sha256Schedule;
  let [h0, h1, h2, h3, h4, h5, h6, h7] = SHA256_INITIAL_HASH;
  for (let block2 = 0; block2 < words.length; block2 += 16) {
    schedule.set(words.subarray(block2, block2 + 16));
    for (let t = 16; t < 64; t++) {
      const early = schedule[t - 15];
      const late = schedule[t - 2];
      schedule[t] = schedule[t - 16] + (rotateRight(early, 7) ^ rotateRight(early, 18) ^ early >>> 3) + schedule[t - 7] + (rotateRight(late, 17) ^ rotateRight(late, 19) ^ late >>> 10);
    }
    let [a, b, c, d, e, f, g, h] = [
      h0,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      h7
    ];
    for (let t = 0; t < 64; t++) {
      const first = h + (rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25)) + (e & f ^ ~e & g) + SHA256_ROUND_CONSTANTS[t] + schedule[t] | 0;
      const second = (rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22)) + (a & b ^ a & c ^ b & c) | 0;
      h = g;
      g = f;
      f = e;
      e = d + first | 0;
      d = c;
      c = b;
      b = a;
      a = first + second | 0;
    }
    [h0, h1, h2, h3, h4, h5, h6, h7] = [
      h0 + a | 0,
      h1 + b | 0,
      h2 + c | 0,
      h3 + d | 0,
      h4 + e | 0,
      h5 + f | 0,
      h6 + g | 0,
      h7 + h | 0
    ];
  }
  return bytesOfWords([
    h0,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    h7
  ]);
};
var convertInchesToTwip = (inches) => Math.floor(inches * 72 * 20);
var uniqueNumericIdCreator = (initial = 0) => {
  let currentCount = initial;
  return () => ++currentCount;
};
var abstractNumUniqueNumericIdGen = () => uniqueNumericIdCreator();
var concreteNumUniqueNumericIdGen = () => uniqueNumericIdCreator(1);
var docPropertiesUniqueNumericIdGen = () => uniqueNumericIdCreator();
var docPropertiesUniqueNumericId = docPropertiesUniqueNumericIdGen();
var bookmarkUniqueNumericIdGen = () => uniqueNumericIdCreator();
var bookmarkUniqueNumericId = bookmarkUniqueNumericIdGen();
var fitTextUniqueNumericIdGen = uniqueNumericIdCreator();
var fitTextUniqueNumericId = () => -fitTextUniqueNumericIdGen();
var uniqueId = () => nanoid().toLowerCase();
var hashedId = (data) => Array.from(sha1(typeof data === "string" ? encodeUtf8(data) : ArrayBuffer.isView(data) ? data : new Uint8Array(data)), (byte) => byte.toString(16).padStart(2, "0")).join("");
var generateUuidPart = (count) => customAlphabet("1234567890abcdef", count)();
var uniqueUuid = () => `${generateUuidPart(8)}-${generateUuidPart(4)}-${generateUuidPart(4)}-${generateUuidPart(4)}-${generateUuidPart(12)}`;
var encodeUtf8 = (str) => new Uint8Array(new TextEncoder().encode(str));
var createFitText = ({ width, group }) => new BuilderElement({
  name: "w:fitText",
  attributes: {
    val: {
      key: "w:val",
      value: Math.round(universalMeasureToTwips(twipsMeasureValue(width)))
    },
    id: {
      key: "w:id",
      value: group === void 0 ? fitTextUniqueNumericId() : decimalNumber(group)
    }
  }
});
var CharacterSpacing = class extends XmlComponent {
  constructor(value) {
    super("w:spacing");
    this.root.push(new Attributes({ val: signedTwipsMeasureValue(value) }));
  }
};
var Color = class extends XmlComponent {
  constructor(color) {
    super("w:color");
    this.root.push(new ColorAttributeComponent([{
      keys: _objectSpread2(_objectSpread2({}, COLOR_ATTRIBUTES), {}, { color: "w:val" }),
      color
    }]));
  }
};
var Highlight = class extends XmlComponent {
  constructor(color) {
    super("w:highlight");
    this.root.push(new Attributes({ val: color }));
  }
};
var createLanguageComponent = (options) => new BuilderElement({
  name: "w:lang",
  attributes: {
    value: {
      key: "w:val",
      value: options.value
    },
    eastAsia: {
      key: "w:eastAsia",
      value: options.eastAsia
    },
    bidirectional: {
      key: "w:bidi",
      value: options.bidirectional
    }
  }
});
var createRunFonts = (nameOrAttrs, hint) => {
  if (typeof nameOrAttrs === "string") {
    const name = nameOrAttrs;
    return new BuilderElement({
      name: "w:rFonts",
      attributes: {
        ascii: {
          key: "w:ascii",
          value: name
        },
        cs: {
          key: "w:cs",
          value: name
        },
        eastAsia: {
          key: "w:eastAsia",
          value: name
        },
        hAnsi: {
          key: "w:hAnsi",
          value: name
        },
        hint: {
          key: "w:hint",
          value: hint
        }
      }
    });
  }
  if ("theme" in nameOrAttrs) {
    const theme = nameOrAttrs.theme === "headings" ? "major" : "minor";
    return new BuilderElement({
      name: "w:rFonts",
      attributes: {
        ascii: {
          key: "w:asciiTheme",
          value: `${theme}HAnsi`
        },
        eastAsia: {
          key: "w:eastAsiaTheme",
          value: `${theme}EastAsia`
        },
        hAnsi: {
          key: "w:hAnsiTheme",
          value: `${theme}HAnsi`
        },
        cs: {
          key: "w:cstheme",
          value: `${theme}Bidi`
        }
      }
    });
  }
  const attrs = nameOrAttrs;
  return new BuilderElement({
    name: "w:rFonts",
    attributes: {
      ascii: {
        key: "w:ascii",
        value: attrs.ascii
      },
      cs: {
        key: "w:cs",
        value: attrs.cs
      },
      eastAsia: {
        key: "w:eastAsia",
        value: attrs.eastAsia
      },
      hAnsi: {
        key: "w:hAnsi",
        value: attrs.hAnsi
      },
      hint: {
        key: "w:hint",
        value: attrs.hint
      }
    }
  });
};
var createVerticalAlignRun = (type) => new BuilderElement({
  name: "w:vertAlign",
  attributes: { val: {
    key: "w:val",
    value: type
  } }
});
var createSuperScript = () => createVerticalAlignRun("superscript");
var createSubScript = () => createVerticalAlignRun("subscript");
var UnderlineType = {
  /** Single underline */
  SINGLE: "single",
  /** Underline words only (not spaces) */
  WORDS: "words",
  /** Double underline */
  DOUBLE: "double",
  /** Thick single underline */
  THICK: "thick",
  /** Dotted underline */
  DOTTED: "dotted",
  /** Heavy dotted underline */
  DOTTEDHEAVY: "dottedHeavy",
  /** Dashed underline */
  DASH: "dash",
  /** Heavy dashed underline */
  DASHEDHEAVY: "dashedHeavy",
  /** Long dashed underline */
  DASHLONG: "dashLong",
  /** Heavy long dashed underline */
  DASHLONGHEAVY: "dashLongHeavy",
  /** Dot-dash underline */
  DOTDASH: "dotDash",
  /** Heavy dot-dash underline */
  DASHDOTHEAVY: "dashDotHeavy",
  /** Dot-dot-dash underline */
  DOTDOTDASH: "dotDotDash",
  /** Heavy dot-dot-dash underline */
  DASHDOTDOTHEAVY: "dashDotDotHeavy",
  /** Wave underline */
  WAVE: "wave",
  /** Heavy wave underline */
  WAVYHEAVY: "wavyHeavy",
  /** Double wave underline */
  WAVYDOUBLE: "wavyDouble",
  /** No underline */
  NONE: "none"
};
var createUnderline = (underlineType = UnderlineType.SINGLE, color) => createColorElement("w:u", [{
  key: "w:val",
  value: underlineType
}, {
  keys: COLOR_ATTRIBUTES,
  color
}]);
var RunProperties = class extends IgnoreIfEmptyXmlComponent {
  constructor(options) {
    super("w:rPr");
    if (!options) return;
    if (options.style) this.push(new StringValueElement("w:rStyle", options.style));
    if (options.font) {
      if (typeof options.font === "string") this.push(createRunFonts(options.font));
      else if ("name" in options.font) this.push(createRunFonts(options.font.name, options.font.hint));
      else this.push(createRunFonts(options.font));
    }
    if (options.bold !== void 0) this.push(new OnOffElement("w:b", options.bold));
    if (options.boldComplexScript === void 0 && options.bold !== void 0 || options.boldComplexScript) {
      var _options$boldComplexS;
      this.push(new OnOffElement("w:bCs", (_options$boldComplexS = options.boldComplexScript) !== null && _options$boldComplexS !== void 0 ? _options$boldComplexS : options.bold));
    }
    if (options.italics !== void 0) this.push(new OnOffElement("w:i", options.italics));
    if (options.italicsComplexScript === void 0 && options.italics !== void 0 || options.italicsComplexScript) {
      var _options$italicsCompl;
      this.push(new OnOffElement("w:iCs", (_options$italicsCompl = options.italicsComplexScript) !== null && _options$italicsCompl !== void 0 ? _options$italicsCompl : options.italics));
    }
    if (options.smallCaps !== void 0) this.push(new OnOffElement("w:smallCaps", options.smallCaps));
    else if (options.allCaps !== void 0) this.push(new OnOffElement("w:caps", options.allCaps));
    if (options.strike !== void 0) this.push(new OnOffElement("w:strike", options.strike));
    if (options.doubleStrike !== void 0) this.push(new OnOffElement("w:dstrike", options.doubleStrike));
    if (options.emboss !== void 0) this.push(new OnOffElement("w:emboss", options.emboss));
    if (options.imprint !== void 0) this.push(new OnOffElement("w:imprint", options.imprint));
    if (options.noProof !== void 0) this.push(new OnOffElement("w:noProof", options.noProof));
    if (options.snapToGrid !== void 0) this.push(new OnOffElement("w:snapToGrid", options.snapToGrid));
    if (options.vanish !== void 0) this.push(new OnOffElement("w:vanish", options.vanish));
    if (options.color) this.push(new Color(options.color));
    if (options.characterSpacing) this.push(new CharacterSpacing(options.characterSpacing));
    if (options.scale !== void 0) this.push(new NumberValueElement("w:w", options.scale));
    if (options.kern) this.push(new HpsMeasureElement("w:kern", options.kern));
    if (options.position) this.push(new StringValueElement("w:position", options.position));
    if (options.size !== void 0) this.push(new HpsMeasureElement("w:sz", options.size));
    const szCs = options.sizeComplexScript === void 0 || options.sizeComplexScript === true ? options.size : options.sizeComplexScript;
    if (szCs) this.push(new HpsMeasureElement("w:szCs", szCs));
    if (options.highlight) this.push(new Highlight(options.highlight));
    if (options.underline) this.push(createUnderline(options.underline.type, options.underline.color));
    if (options.effect) this.push(new StringValueElement("w:effect", options.effect));
    if (options.border) this.push(createBorderElement("w:bdr", options.border));
    if (options.shading) this.push(createShading(options.shading));
    if (options.fitText) this.push(createFitText(options.fitText));
    if (options.subScript) this.push(createSubScript());
    if (options.superScript) this.push(createSuperScript());
    if (options.rightToLeft !== void 0) this.push(new OnOffElement("w:rtl", options.rightToLeft));
    if (options.emphasisMark) this.push(createEmphasisMark(options.emphasisMark.type));
    if (options.language) this.push(createLanguageComponent(options.language));
    if (options.eastAsianLayout) this.push(createEastAsianLayout(options.eastAsianLayout));
    if (options.specVanish !== void 0) this.push(new OnOffElement("w:specVanish", options.specVanish));
    if (options.math !== void 0) this.push(new OnOffElement("w:oMath", options.math));
    if (options.revision) this.push(new RunPropertiesChange(options.revision));
  }
  push(item) {
    this.root.push(item);
  }
};
var ParagraphRunProperties = class extends RunProperties {
  constructor(options) {
    super(options);
    if (options === null || options === void 0 ? void 0 : options.insertion) this.push(new InsertionTrackChange(options.insertion));
    if (options === null || options === void 0 ? void 0 : options.deletion) this.push(new DeletionTrackChange(options.deletion));
  }
};
var RunPropertiesChange = class extends XmlComponent {
  constructor(options) {
    super("w:rPrChange");
    this.root.push(new ChangeAttributes({
      id: options.id,
      author: options.author,
      date: options.date
    }));
    this.addChildElement(new RunProperties(options));
  }
};
var Text = class extends XmlComponent {
  constructor(options) {
    super("w:t");
    if (typeof options === "string") {
      this.root.push(new TextAttributes({ space: SpaceType.PRESERVE }));
      this.root.push(options);
    } else {
      var _options$space;
      this.root.push(new TextAttributes({ space: (_options$space = options.space) !== null && _options$space !== void 0 ? _options$space : SpaceType.DEFAULT }));
      this.root.push(options.text);
    }
  }
};
var PageNumber = {
  /** Inserts the current page number */
  CURRENT: "CURRENT",
  /** Inserts the total number of pages in the document */
  TOTAL_PAGES: "TOTAL_PAGES",
  /** Inserts the total number of pages in the current section */
  TOTAL_PAGES_IN_SECTION: "TOTAL_PAGES_IN_SECTION",
  /** Inserts the current section number */
  CURRENT_SECTION: "SECTION"
};
var pageNumberFieldOf = (child2) => {
  switch (child2) {
    case PageNumber.CURRENT:
      return [
        createBegin(),
        new Page(),
        createSeparate(),
        createEnd()
      ];
    case PageNumber.TOTAL_PAGES:
      return [
        createBegin(),
        new NumberOfPages(),
        createSeparate(),
        createEnd()
      ];
    case PageNumber.TOTAL_PAGES_IN_SECTION:
      return [
        createBegin(),
        new NumberOfPagesSection(),
        createSeparate(),
        createEnd()
      ];
    case PageNumber.CURRENT_SECTION:
      return [
        createBegin(),
        new CurrentSection(),
        createSeparate(),
        createEnd()
      ];
    default:
      return;
  }
};
var Run = class Run2 extends XmlComponent {
  constructor(options) {
    super("w:r");
    _defineProperty2(this, "properties", void 0);
    _defineProperty2(this, "following", []);
    this.properties = new RunProperties(options);
    this.root.push(this.properties);
    if (options.break) for (let i2 = 0; i2 < options.break; i2++) this.root.push(createBreak());
    if (options.children) for (const [index, child2] of options.children.entries()) {
      if (elementOf(child2) === "w:r") {
        const rest = options.children.slice(index + 1);
        this.following = [child2, ...rest.length > 0 ? [new Run2(_objectSpread2(_objectSpread2({}, options), {}, {
          break: void 0,
          children: rest
        }))] : []];
        break;
      }
      if (typeof child2 === "string") {
        const field = pageNumberFieldOf(child2);
        if (field) {
          const rest = options.children.slice(index + 1);
          const runOf = (children) => new Run2(_objectSpread2(_objectSpread2({}, options), {}, {
            break: void 0,
            children
          }));
          const beginsHere = this.root.length === 1;
          if (beginsHere) this.root.push(field[0]);
          const parts = beginsHere ? field.slice(1) : field;
          this.following = [...parts.map((part) => runOf([part])), ...rest.length > 0 ? [runOf(rest)] : []];
          break;
        }
        this.root.push(new Text(child2));
        continue;
      }
      this.root.push(child2);
    }
    else if (options.text !== void 0) this.root.push(new Text(options.text));
  }
  get writtenAs() {
    return this.following.length > 0 ? [this, ...this.following.flatMap((run) => {
      var _run$writtenAs;
      return (_run$writtenAs = run.writtenAs) !== null && _run$writtenAs !== void 0 ? _run$writtenAs : run;
    })] : void 0;
  }
};
var TextRun = class extends Run {
  constructor(options) {
    super(typeof options === "string" ? { text: options } : options);
  }
};
var HorizontalPositionRelativeFrom = {
  /**
  * ## Character
  *
  * Specifies that the horizontal positioning shall be relative to the position of the anchor within its run content.
  */
  CHARACTER: "character",
  /**
  * ## Column
  *
  * Specifies that the horizontal positioning shall be relative to the extents of the column which contains its anchor.
  */
  COLUMN: "column",
  /**
  * ## Inside Margin
  *
  * Specifies that the horizontal positioning shall be relative to the inside margin of the current page (the left margin on odd pages, right on even pages).
  */
  INSIDE_MARGIN: "insideMargin",
  /**
  * ## Left Margin
  *
  * Specifies that the horizontal positioning shall be relative to the left margin of the page.
  */
  LEFT_MARGIN: "leftMargin",
  /**
  * ## Page Margin
  *
  * Specifies that the horizontal positioning shall be relative to the page margins.
  */
  MARGIN: "margin",
  /**
  * ## Outside Margin
  *
  * Specifies that the horizontal positioning shall be relative to the outside margin of the current page (the right margin on odd pages, left on even pages).
  */
  OUTSIDE_MARGIN: "outsideMargin",
  /**
  * ## Page Edge
  *
  * Specifies that the horizontal positioning shall be relative to the edge of the page.
  */
  PAGE: "page",
  /**
  * ## Right Margin
  *
  * Specifies that the horizontal positioning shall be relative to the right margin of the page.
  */
  RIGHT_MARGIN: "rightMargin"
};
var VerticalPositionRelativeFrom = {
  /**
  * ## Bottom Margin
  *
  * Specifies that the vertical positioning shall be relative to the bottom margin of the current page.
  */
  BOTTOM_MARGIN: "bottomMargin",
  /**
  * ## Inside Margin
  *
  * Specifies that the vertical positioning shall be relative to the inside margin of the current page.
  */
  INSIDE_MARGIN: "insideMargin",
  /**
  * ## Line
  *
  * Specifies that the vertical positioning shall be relative to the line containing the anchor character.
  */
  LINE: "line",
  /**
  * ## Page Margin
  *
  * Specifies that the vertical positioning shall be relative to the page margins.
  */
  MARGIN: "margin",
  /**
  * ## Outside Margin
  *
  * Specifies that the vertical positioning shall be relative to the outside margin of the current page.
  */
  OUTSIDE_MARGIN: "outsideMargin",
  /**
  * ## Page Edge
  *
  * Specifies that the vertical positioning shall be relative to the edge of the page.
  */
  PAGE: "page",
  /**
  * ## Paragraph
  *
  * Specifies that the vertical positioning shall be relative to the paragraph which contains the drawing anchor.
  */
  PARAGRAPH: "paragraph",
  /**
  * ## Top Margin
  *
  * Specifies that the vertical positioning shall be relative to the top margin of the current page.
  */
  TOP_MARGIN: "topMargin"
};
var createSimplePos = () => new BuilderElement({
  name: "wp:simplePos",
  attributes: {
    x: {
      key: "x",
      value: 0
    },
    y: {
      key: "y",
      value: 0
    }
  }
});
var createAlign = (value) => new BuilderElement({
  name: "wp:align",
  children: [value]
});
var createPositionOffset = (offsetValue) => new BuilderElement({
  name: "wp:posOffset",
  children: [offsetValue.toString()]
});
var createHorizontalPosition = ({ relative, align, offset }) => new BuilderElement({
  name: "wp:positionH",
  attributes: { relativeFrom: {
    key: "relativeFrom",
    value: relative !== null && relative !== void 0 ? relative : HorizontalPositionRelativeFrom.PAGE
  } },
  children: [(() => {
    if (align) return createAlign(align);
    else if (offset !== void 0) return createPositionOffset(offset);
    else throw new Error("There is no configuration provided for floating position (Align or offset)");
  })()]
});
var createVerticalPosition = ({ relative, align, offset }) => new BuilderElement({
  name: "wp:positionV",
  attributes: { relativeFrom: {
    key: "relativeFrom",
    value: relative !== null && relative !== void 0 ? relative : VerticalPositionRelativeFrom.PAGE
  } },
  children: [(() => {
    if (align) return createAlign(align);
    else if (offset !== void 0) return createPositionOffset(offset);
    else throw new Error("There is no configuration provided for floating position (Align or offset)");
  })()]
});
var ExtentsAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      cx: "cx",
      cy: "cy"
    });
  }
};
var Extents = class extends XmlComponent {
  constructor(x2, y) {
    super("a:ext");
    _defineProperty2(this, "attributes", void 0);
    this.attributes = new ExtentsAttributes({
      cx: x2,
      cy: y
    });
    this.root.push(this.attributes);
  }
};
var OffsetAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      x: "x",
      y: "y"
    });
  }
};
var Offset = class extends XmlComponent {
  constructor(x2, y) {
    super("a:off");
    this.root.push(new OffsetAttributes({
      x: x2 !== null && x2 !== void 0 ? x2 : 0,
      y: y !== null && y !== void 0 ? y : 0
    }));
  }
};
var FormAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      flipVertical: "flipV",
      flipHorizontal: "flipH",
      rotation: "rot"
    });
  }
};
var Form = class extends XmlComponent {
  constructor(options) {
    var _options$flip, _options$flip2, _options$offset, _options$offset2;
    super("a:xfrm");
    _defineProperty2(this, "extents", void 0);
    _defineProperty2(this, "offset", void 0);
    this.root.push(new FormAttributes({
      flipVertical: (_options$flip = options.flip) === null || _options$flip === void 0 ? void 0 : _options$flip.vertical,
      flipHorizontal: (_options$flip2 = options.flip) === null || _options$flip2 === void 0 ? void 0 : _options$flip2.horizontal,
      rotation: options.rotation
    }));
    this.offset = new Offset((_options$offset = options.offset) === null || _options$offset === void 0 || (_options$offset = _options$offset.emus) === null || _options$offset === void 0 ? void 0 : _options$offset.x, (_options$offset2 = options.offset) === null || _options$offset2 === void 0 || (_options$offset2 = _options$offset2.emus) === null || _options$offset2 === void 0 ? void 0 : _options$offset2.y);
    this.extents = new Extents(options.emus.x, options.emus.y);
    this.root.push(this.offset);
    this.root.push(this.extents);
  }
};
var createNoFill = () => new BuilderElement({ name: "a:noFill" });
var createSolidRgbColor = (options) => new BuilderElement({
  name: "a:srgbClr",
  attributes: { value: {
    key: "val",
    value: options.value
  } }
});
var createSchemeColor = (options) => new BuilderElement({
  name: "a:schemeClr",
  attributes: { value: {
    key: "val",
    value: options.value
  } }
});
var createSolidFill$1 = (options) => new BuilderElement({
  name: "a:solidFill",
  children: [options.type === "rgb" ? createSolidRgbColor(options) : createSchemeColor(options)]
});
var LineCap = {
  /** Round cap style */
  ROUND: "rnd",
  /** Square cap style */
  SQUARE: "sq",
  /** Flat cap style */
  FLAT: "flat"
};
var CompoundLine = {
  /** Single line */
  SINGLE: "sng",
  /** Double line */
  DOUBLE: "dbl",
  /** Thick-thin double line */
  THICK_THIN: "thickThin",
  /** Thin-thick double line */
  THIN_THICK: "thinThick",
  /** Triple line */
  TRI: "tri"
};
var PenAlignment = {
  /** Center alignment */
  CENTER: "ctr",
  /** Inset alignment */
  INSET: "in"
};
var createOutline = (options) => new BuilderElement({
  name: "a:ln",
  attributes: {
    width: {
      key: "w",
      value: options.width
    },
    cap: {
      key: "cap",
      value: options.cap === void 0 ? void 0 : LineCap[options.cap]
    },
    compoundLine: {
      key: "cmpd",
      value: options.compoundLine === void 0 ? void 0 : CompoundLine[options.compoundLine]
    },
    align: {
      key: "algn",
      value: options.align === void 0 ? void 0 : PenAlignment[options.align]
    }
  },
  children: [options.type === "noFill" ? createNoFill() : options.solidFillType === "rgb" ? createSolidFill$1({
    type: "rgb",
    value: options.value
  }) : createSolidFill$1({
    type: "scheme",
    value: options.value
  })]
});
var AdjustmentValues = class extends XmlComponent {
  constructor() {
    super("a:avLst");
  }
};
var PresetGeometryAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", { prst: "prst" });
  }
};
var PresetGeometry = class extends XmlComponent {
  constructor() {
    super("a:prstGeom");
    this.root.push(new PresetGeometryAttributes({ prst: "rect" }));
    this.root.push(new AdjustmentValues());
  }
};
var ShapePropertiesAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", { bwMode: "bwMode" });
  }
};
var ShapeProperties = class extends XmlComponent {
  constructor({ element, outline, solidFill, transform }) {
    super(`${element}:spPr`);
    _defineProperty2(this, "form", void 0);
    this.root.push(new ShapePropertiesAttributes({ bwMode: "auto" }));
    this.form = new Form(transform);
    this.root.push(this.form);
    this.root.push(new PresetGeometry());
    if (solidFill) this.root.push(createSolidFill$1(solidFill));
    else if (outline) this.root.push(createNoFill());
    if (outline) this.root.push(createOutline(outline));
  }
};
var createBodyProperties = (options = {}) => {
  var _options$margins, _options$margins2, _options$margins3, _options$margins4;
  return new BuilderElement({
    name: "wps:bodyPr",
    attributes: {
      lIns: {
        key: "lIns",
        value: (_options$margins = options.margins) === null || _options$margins === void 0 ? void 0 : _options$margins.left
      },
      rIns: {
        key: "rIns",
        value: (_options$margins2 = options.margins) === null || _options$margins2 === void 0 ? void 0 : _options$margins2.right
      },
      tIns: {
        key: "tIns",
        value: (_options$margins3 = options.margins) === null || _options$margins3 === void 0 ? void 0 : _options$margins3.top
      },
      bIns: {
        key: "bIns",
        value: (_options$margins4 = options.margins) === null || _options$margins4 === void 0 ? void 0 : _options$margins4.bottom
      },
      anchor: {
        key: "anchor",
        value: options.verticalAnchor
      }
    },
    children: [...options.noAutoFit ? [new OnOffElement("a:noAutofit", options.noAutoFit)] : []]
  });
};
var createNonVisualShapeProperties = (options = { txBox: "1" }) => new BuilderElement({
  name: "wps:cNvSpPr",
  attributes: { txBox: {
    key: "txBox",
    value: options.txBox
  } }
});
var createTextBoxContent = (children) => new BuilderElement({
  name: "w:txbxContent",
  children: [...children]
});
var createWpsTextBox = (children) => new BuilderElement({
  name: "wps:txbx",
  children: [createTextBoxContent(children)]
});
var createWpsShape = (options) => new BuilderElement({
  name: "wps:wsp",
  children: [
    createNonVisualShapeProperties(options.nonVisualProperties),
    new ShapeProperties({
      element: "wps",
      transform: options.transformation,
      outline: options.outline,
      solidFill: options.solidFill
    }),
    createWpsTextBox(options.children),
    createBodyProperties(options.bodyProperties)
  ]
});
var GraphicDataAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", { uri: "uri" });
  }
};
var createSvgBlip = (mediaData) => new BuilderElement({
  name: "asvg:svgBlip",
  attributes: {
    asvg: {
      key: "xmlns:asvg",
      value: "http://schemas.microsoft.com/office/drawing/2016/SVG/main"
    },
    embed: {
      key: "r:embed",
      value: `rId{${mediaData.fileName}}`
    }
  }
});
var createExtention = (mediaData) => new BuilderElement({
  name: "a:ext",
  attributes: { uri: {
    key: "uri",
    value: "{96DAC541-7B7A-43D3-8B79-37D633B846F1}"
  } },
  children: [createSvgBlip(mediaData)]
});
var createExtentionList = (mediaData) => new BuilderElement({
  name: "a:extLst",
  children: [createExtention(mediaData)]
});
var createBlip = (mediaData) => new BuilderElement({
  name: "a:blip",
  attributes: {
    embed: {
      key: "r:embed",
      value: `rId{${mediaData.type === "svg" ? mediaData.fallback.fileName : mediaData.fileName}}`
    },
    cstate: {
      key: "cstate",
      value: "none"
    }
  },
  children: mediaData.type === "svg" ? [createExtentionList(mediaData)] : []
});
var SourceRectangleAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      left: "l",
      top: "t",
      right: "r",
      bottom: "b"
    });
  }
};
var cropValue = (value, edge) => {
  if (value === void 0) return;
  if (!(value >= 0 && value <= 100)) throw new Error(`Invalid crop ${edge} ${value}. Expected a number from 0 to 100`);
  return Math.round(value * 1e3);
};
var SourceRectangle = class extends XmlComponent {
  constructor(crop) {
    super("a:srcRect");
    if (crop) this.root.push(new SourceRectangleAttributes({
      left: cropValue(crop.left, "left"),
      top: cropValue(crop.top, "top"),
      right: cropValue(crop.right, "right"),
      bottom: cropValue(crop.bottom, "bottom")
    }));
  }
};
var FillRectangle = class extends XmlComponent {
  constructor() {
    super("a:fillRect");
  }
};
var Stretch = class extends XmlComponent {
  constructor() {
    super("a:stretch");
    this.root.push(new FillRectangle());
  }
};
var BlipFill = class extends XmlComponent {
  constructor(mediaData, crop) {
    super("pic:blipFill");
    this.root.push(createBlip(mediaData));
    this.root.push(new SourceRectangle(crop));
    this.root.push(new Stretch());
  }
};
var PicLocksAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      noChangeAspect: "noChangeAspect",
      noChangeArrowheads: "noChangeArrowheads"
    });
  }
};
var PicLocks = class extends XmlComponent {
  constructor() {
    super("a:picLocks");
    this.root.push(new PicLocksAttributes({
      noChangeAspect: 1,
      noChangeArrowheads: 1
    }));
  }
};
var ChildNonVisualProperties = class extends XmlComponent {
  constructor() {
    super("pic:cNvPicPr");
    this.root.push(new PicLocks());
  }
};
var NonVisualPropertiesAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      id: "id",
      name: "name",
      descr: "descr"
    });
  }
};
var NonVisualProperties = class extends XmlComponent {
  constructor() {
    super("pic:cNvPr");
    this.root.push(new NonVisualPropertiesAttributes({
      id: 0,
      name: "",
      descr: ""
    }));
  }
  prepForXml(context) {
    for (let i2 = context.stack.length - 1; i2 >= 0; i2--) {
      const element = context.stack[i2];
      if (!(element instanceof ConcreteHyperlink)) continue;
      this.root.push(element.createDrawingClick(context, false));
      break;
    }
    const result = super.prepForXml(context);
    this.root.splice(1);
    return result;
  }
};
var NonVisualPicProperties = class extends XmlComponent {
  constructor() {
    super("pic:nvPicPr");
    this.root.push(new NonVisualProperties());
    this.root.push(new ChildNonVisualProperties());
  }
};
var PicAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", { xmlns: "xmlns:pic" });
  }
};
var Pic = class extends XmlComponent {
  constructor({ mediaData, transform, outline, solidFill, crop }) {
    super("pic:pic");
    this.root.push(new PicAttributes({ xmlns: "http://schemas.openxmlformats.org/drawingml/2006/picture" }));
    this.root.push(new NonVisualPicProperties());
    this.root.push(new BlipFill(mediaData, crop));
    this.root.push(new ShapeProperties({
      element: "pic",
      transform,
      outline,
      solidFill
    }));
  }
};
var createGroupTransform = (transformation) => {
  var _transformation$flip, _transformation$flip2, _transformation$offse, _transformation$offse2;
  return new BuilderElement({
    name: "a:xfrm",
    attributes: {
      flipVertical: {
        key: "flipV",
        value: (_transformation$flip = transformation.flip) === null || _transformation$flip === void 0 ? void 0 : _transformation$flip.vertical
      },
      flipHorizontal: {
        key: "flipH",
        value: (_transformation$flip2 = transformation.flip) === null || _transformation$flip2 === void 0 ? void 0 : _transformation$flip2.horizontal
      },
      rotation: {
        key: "rot",
        value: transformation.rotation
      }
    },
    children: [
      new Offset((_transformation$offse = transformation.offset) === null || _transformation$offse === void 0 || (_transformation$offse = _transformation$offse.emus) === null || _transformation$offse === void 0 ? void 0 : _transformation$offse.x, (_transformation$offse2 = transformation.offset) === null || _transformation$offse2 === void 0 || (_transformation$offse2 = _transformation$offse2.emus) === null || _transformation$offse2 === void 0 ? void 0 : _transformation$offse2.y),
      new Extents(transformation.emus.x, transformation.emus.y),
      new BuilderElement({
        name: "a:chOff",
        attributes: {
          x: {
            key: "x",
            value: 0
          },
          y: {
            key: "y",
            value: 0
          }
        }
      }),
      new BuilderElement({
        name: "a:chExt",
        attributes: {
          x: {
            key: "cx",
            value: transformation.emus.x
          },
          y: {
            key: "cy",
            value: transformation.emus.y
          }
        }
      })
    ]
  });
};
var createNonVisualGroupProperties = () => new BuilderElement({ name: "wpg:cNvGrpSpPr" });
var createWpgGroup = (options) => new BuilderElement({
  name: "wpg:wgp",
  children: [
    createNonVisualGroupProperties(),
    new BuilderElement({
      name: "wpg:grpSpPr",
      children: [createGroupTransform(options.transformation)]
    }),
    ...options.children
  ]
});
var GraphicData = class extends XmlComponent {
  constructor({ mediaData, transform, outline, solidFill, crop }) {
    super("a:graphicData");
    if (mediaData.type === "graphic") {
      this.root.push(new GraphicDataAttributes({ uri: mediaData.uri }));
      this.root.push(mediaData.content);
    } else if (mediaData.type === "wps") {
      this.root.push(new GraphicDataAttributes({ uri: "http://schemas.microsoft.com/office/word/2010/wordprocessingShape" }));
      const wps = createWpsShape(_objectSpread2(_objectSpread2({}, mediaData.data), {}, {
        transformation: transform,
        outline,
        solidFill
      }));
      this.root.push(wps);
    } else if (mediaData.type === "wpg") {
      this.root.push(new GraphicDataAttributes({ uri: "http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" }));
      const wpg = createWpgGroup({
        children: mediaData.children.map((child2) => {
          if (child2.type === "wps") return createWpsShape(_objectSpread2(_objectSpread2({}, child2.data), {}, {
            transformation: child2.transformation,
            outline: child2.outline,
            solidFill: child2.solidFill
          }));
          else return new Pic({
            mediaData: child2,
            transform: child2.transformation,
            outline: child2.outline,
            solidFill: child2.solidFill
          });
        }),
        transformation: transform
      });
      this.root.push(wpg);
    } else {
      this.root.push(new GraphicDataAttributes({ uri: "http://schemas.openxmlformats.org/drawingml/2006/picture" }));
      const pic = new Pic({
        mediaData,
        transform,
        outline,
        solidFill,
        crop
      });
      this.root.push(pic);
    }
  }
};
var GraphicAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", { a: "xmlns:a" });
  }
};
var Graphic = class extends XmlComponent {
  constructor({ mediaData, transform, outline, solidFill, crop }) {
    super("a:graphic");
    _defineProperty2(this, "data", void 0);
    this.root.push(new GraphicAttributes({ a: "http://schemas.openxmlformats.org/drawingml/2006/main" }));
    this.data = new GraphicData({
      mediaData,
      transform,
      outline,
      solidFill,
      crop
    });
    this.root.push(this.data);
  }
};
var TextWrappingType = {
  /** Text doesn't wrap around the drawing. It is drawn in front of or behind the text */
  NONE: 0,
  /** Text wraps around the drawing's box */
  SQUARE: 1,
  /** Text wraps closely around the drawing's outline */
  TIGHT: 2,
  /** Text sits above and below the drawing, not beside it */
  TOP_AND_BOTTOM: 3,
  /** Text wraps closely around the drawing's outline, and fills any open space inside it */
  THROUGH: 4
};
var TextWrappingSide = {
  /** Text wraps on both sides of the drawing */
  BOTH_SIDES: "bothSides",
  /** Text wraps only on the left side */
  LEFT: "left",
  /** Text wraps only on the right side */
  RIGHT: "right",
  /** Text wraps on the side with more space */
  LARGEST: "largest"
};
var createWrapNone = () => new BuilderElement({ name: "wp:wrapNone" });
var createWrapSquare = (textWrapping, margins = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
}) => new BuilderElement({
  name: "wp:wrapSquare",
  attributes: {
    wrapText: {
      key: "wrapText",
      value: textWrapping.side || TextWrappingSide.BOTH_SIDES
    },
    distT: {
      key: "distT",
      value: margins.top
    },
    distB: {
      key: "distB",
      value: margins.bottom
    },
    distL: {
      key: "distL",
      value: margins.left
    },
    distR: {
      key: "distR",
      value: margins.right
    }
  }
});
var WRAP_POLYGON_SIZE = 21600;
var createPoint = (name, { x: x2, y }) => new BuilderElement({
  name,
  attributes: {
    x: {
      key: "x",
      value: x2
    },
    y: {
      key: "y",
      value: y
    }
  }
});
var createWrapPolygon = () => new BuilderElement({
  name: "wp:wrapPolygon",
  attributes: { edited: {
    key: "edited",
    value: false
  } },
  children: [
    createPoint("wp:start", {
      x: 0,
      y: 0
    }),
    createPoint("wp:lineTo", {
      x: 0,
      y: WRAP_POLYGON_SIZE
    }),
    createPoint("wp:lineTo", {
      x: WRAP_POLYGON_SIZE,
      y: WRAP_POLYGON_SIZE
    }),
    createPoint("wp:lineTo", {
      x: WRAP_POLYGON_SIZE,
      y: 0
    }),
    createPoint("wp:lineTo", {
      x: 0,
      y: 0
    })
  ]
});
var createPolygonWrap = (name, margins = {}, textWrapping) => {
  var _textWrapping$side;
  return new BuilderElement({
    name,
    attributes: {
      wrapText: {
        key: "wrapText",
        value: (_textWrapping$side = textWrapping === null || textWrapping === void 0 ? void 0 : textWrapping.side) !== null && _textWrapping$side !== void 0 ? _textWrapping$side : TextWrappingSide.BOTH_SIDES
      },
      distL: {
        key: "distL",
        value: margins.left
      },
      distR: {
        key: "distR",
        value: margins.right
      }
    },
    children: [createWrapPolygon()]
  });
};
var createWrapTight = (margins, textWrapping) => createPolygonWrap("wp:wrapTight", margins, textWrapping);
var createWrapThrough = (margins, textWrapping) => createPolygonWrap("wp:wrapThrough", margins, textWrapping);
var createWrapTopAndBottom = (margins = {
  top: 0,
  bottom: 0
}) => new BuilderElement({
  name: "wp:wrapTopAndBottom",
  attributes: {
    distT: {
      key: "distT",
      value: margins.top
    },
    distB: {
      key: "distB",
      value: margins.bottom
    }
  }
});
var TargetModeType = {
  /** Target is external to the package (e.g., hyperlink to a URL) */
  EXTERNAL: "External"
};
var createRelationship = (id, type, target, targetMode) => new BuilderElement({
  name: "Relationship",
  attributes: {
    id: {
      key: "Id",
      value: id
    },
    type: {
      key: "Type",
      value: type
    },
    target: {
      key: "Target",
      value: target
    },
    targetMode: {
      key: "TargetMode",
      value: targetMode
    }
  }
});
var createHyperlinkClick = (linkId, hasXmlNs) => new BuilderElement({
  name: "a:hlinkClick",
  attributes: _objectSpread2(_objectSpread2({}, hasXmlNs ? { xmlns: {
    key: "xmlns:a",
    value: "http://schemas.openxmlformats.org/drawingml/2006/main"
  } } : {}), {}, { id: {
    key: "r:id",
    value: `rId${linkId}`
  } })
});
var DECORATIVE_EXTENSION_URI = "{C183D7F6-B498-43B3-948B-1728B52AA6E4}";
var createDecorativeExtensionList = (declareNamespace) => new BuilderElement({
  name: "a:extLst",
  attributes: { namespace: {
    key: "xmlns:a",
    value: declareNamespace ? "http://schemas.openxmlformats.org/drawingml/2006/main" : void 0
  } },
  children: [new BuilderElement({
    name: "a:ext",
    attributes: { uri: {
      key: "uri",
      value: DECORATIVE_EXTENSION_URI
    } },
    children: [new BuilderElement({
      name: "adec:decorative",
      attributes: {
        namespace: {
          key: "xmlns:adec",
          value: "http://schemas.microsoft.com/office/drawing/2017/decorative"
        },
        value: {
          key: "val",
          value: 1
        }
      }
    })]
  })]
});
var DrawingLink = class {
  constructor(link2) {
    _defineProperty2(this, "link", void 0);
    _defineProperty2(this, "linkId", uniqueId());
    _defineProperty2(this, "addedTo", /* @__PURE__ */ new WeakSet());
    this.link = link2;
  }
  createClick(declareNamespace) {
    return createHyperlinkClick(this.linkId, declareNamespace);
  }
  addRelationship(context) {
    const relationships = context.viewWrapper.Relationships;
    if (this.addedTo.has(relationships)) return;
    this.addedTo.add(relationships);
    relationships.addRelationship(this.linkId, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", this.link, TargetModeType.EXTERNAL);
  }
};
var DocProperties = class extends XmlComponent {
  constructor({ name = "", description, title, id } = {}, { link: link2, decorative } = {}) {
    super("wp:docPr");
    _defineProperty2(this, "link", void 0);
    _defineProperty2(this, "decorative", void 0);
    const attributes = {
      id: {
        key: "id",
        value: id !== null && id !== void 0 ? id : docPropertiesUniqueNumericId()
      },
      name: {
        key: "name",
        value: name
      }
    };
    if (description) attributes.description = {
      key: "descr",
      value: description
    };
    if (title) attributes.title = {
      key: "title",
      value: title
    };
    this.root.push(new NextAttributeComponent(attributes));
    this.link = link2 === void 0 ? void 0 : new DrawingLink(link2);
    this.decorative = decorative;
  }
  prepForXml(context) {
    if (this.link) {
      this.link.addRelationship(context);
      this.root.push(this.link.createClick(true));
    } else for (let i2 = context.stack.length - 1; i2 >= 0; i2--) {
      const element = context.stack[i2];
      if (!(element instanceof ConcreteHyperlink)) continue;
      this.root.push(element.createDrawingClick(context, true));
      break;
    }
    if (this.decorative) this.root.push(createDecorativeExtensionList(true));
    const result = super.prepForXml(context);
    this.root.splice(1);
    return result;
  }
};
var createEffectExtent = ({ top, right, bottom, left }) => new BuilderElement({
  name: "wp:effectExtent",
  attributes: {
    top: {
      key: "t",
      value: top
    },
    right: {
      key: "r",
      value: right
    },
    bottom: {
      key: "b",
      value: bottom
    },
    left: {
      key: "l",
      value: left
    }
  }
});
var MAX_EXTENT = 2147483647;
var EMUS_PER_PIXEL$1 = 9525;
var checkExtent = (dimension, value) => {
  if (value !== void 0 && value > MAX_EXTENT) throw new Error(`Invalid drawing ${dimension} ${value} EMUs (${Math.round(value / EMUS_PER_PIXEL$1)} pixels). Word won't open a drawing with a ${dimension} over ${MAX_EXTENT} EMUs (${Math.floor(MAX_EXTENT / EMUS_PER_PIXEL$1)} pixels). Sizes such as an ImageRun's transformation are in pixels, not EMUs`);
  return value;
};
var createExtent = ({ x: x2, y }) => new BuilderElement({
  name: "wp:extent",
  attributes: {
    x: {
      key: "cx",
      value: checkExtent("width", x2)
    },
    y: {
      key: "cy",
      value: checkExtent("height", y)
    }
  }
});
var GraphicFrameLockAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      xmlns: "xmlns:a",
      noChangeAspect: "noChangeAspect"
    });
  }
};
var GraphicFrameLocks = class extends XmlComponent {
  constructor() {
    super("a:graphicFrameLocks");
    this.root.push(new GraphicFrameLockAttributes({
      xmlns: "http://schemas.openxmlformats.org/drawingml/2006/main",
      noChangeAspect: 1
    }));
  }
};
var createGraphicFrameProperties = (lockAspectRatio = true) => new BuilderElement({
  name: "wp:cNvGraphicFramePr",
  children: lockAspectRatio ? [new GraphicFrameLocks()] : []
});
var AnchorAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      distT: "distT",
      distB: "distB",
      distL: "distL",
      distR: "distR",
      allowOverlap: "allowOverlap",
      behindDoc: "behindDoc",
      layoutInCell: "layoutInCell",
      locked: "locked",
      relativeHeight: "relativeHeight",
      simplePos: "simplePos"
    });
  }
};
var Anchor = class extends XmlComponent {
  constructor({ mediaData, transform, drawingOptions }) {
    var _drawingOptions$effec;
    super("wp:anchor");
    const floating = _objectSpread2({
      allowOverlap: true,
      behindDocument: false,
      lockAnchor: false,
      layoutInCell: true,
      verticalPosition: {},
      horizontalPosition: {}
    }, drawingOptions.floating);
    this.root.push(new AnchorAttributes({
      distT: floating.margins ? floating.margins.top || 0 : 0,
      distB: floating.margins ? floating.margins.bottom || 0 : 0,
      distL: floating.margins ? floating.margins.left || 0 : 0,
      distR: floating.margins ? floating.margins.right || 0 : 0,
      simplePos: "0",
      allowOverlap: floating.allowOverlap === true ? "1" : "0",
      behindDoc: floating.behindDocument === true ? "1" : "0",
      locked: floating.lockAnchor === true ? "1" : "0",
      layoutInCell: floating.layoutInCell === true ? "1" : "0",
      relativeHeight: floating.zIndex ? floating.zIndex : transform.emus.y
    }));
    this.root.push(createSimplePos());
    this.root.push(createHorizontalPosition(floating.horizontalPosition));
    this.root.push(createVerticalPosition(floating.verticalPosition));
    this.root.push(createExtent({
      x: transform.emus.x,
      y: transform.emus.y
    }));
    this.root.push(createEffectExtent((_drawingOptions$effec = drawingOptions.effectExtent) !== null && _drawingOptions$effec !== void 0 ? _drawingOptions$effec : {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }));
    if (drawingOptions.floating !== void 0 && drawingOptions.floating.wrap !== void 0) switch (drawingOptions.floating.wrap.type) {
      case TextWrappingType.SQUARE:
        this.root.push(createWrapSquare(drawingOptions.floating.wrap, drawingOptions.floating.margins));
        break;
      case TextWrappingType.TIGHT:
        this.root.push(createWrapTight(drawingOptions.floating.margins, drawingOptions.floating.wrap));
        break;
      case TextWrappingType.THROUGH:
        this.root.push(createWrapThrough(drawingOptions.floating.margins, drawingOptions.floating.wrap));
        break;
      case TextWrappingType.TOP_AND_BOTTOM:
        this.root.push(createWrapTopAndBottom(drawingOptions.floating.margins));
        break;
      case TextWrappingType.NONE:
      default:
        this.root.push(createWrapNone());
    }
    else this.root.push(createWrapNone());
    this.root.push(new DocProperties(drawingOptions.docProperties, {
      link: drawingOptions.link,
      decorative: drawingOptions.decorative
    }));
    this.root.push(createGraphicFrameProperties(mediaData.type !== "graphic" || mediaData.lockAspectRatio !== false));
    this.root.push(new Graphic({
      mediaData,
      transform,
      outline: drawingOptions.outline,
      solidFill: drawingOptions.solidFill,
      crop: drawingOptions.crop
    }));
  }
};
var createInline = ({ mediaData, transform, docProperties, outline, solidFill, crop, effectExtent, link: link2, decorative }) => {
  var _outline$width, _outline$width2, _outline$width3, _outline$width4;
  return new BuilderElement({
    name: "wp:inline",
    attributes: {
      distanceTop: {
        key: "distT",
        value: 0
      },
      distanceBottom: {
        key: "distB",
        value: 0
      },
      distanceLeft: {
        key: "distL",
        value: 0
      },
      distanceRight: {
        key: "distR",
        value: 0
      }
    },
    children: [
      createExtent({
        x: transform.emus.x,
        y: transform.emus.y
      }),
      createEffectExtent(effectExtent !== null && effectExtent !== void 0 ? effectExtent : outline ? {
        top: ((_outline$width = outline.width) !== null && _outline$width !== void 0 ? _outline$width : 9525) * 2,
        right: ((_outline$width2 = outline.width) !== null && _outline$width2 !== void 0 ? _outline$width2 : 9525) * 2,
        bottom: ((_outline$width3 = outline.width) !== null && _outline$width3 !== void 0 ? _outline$width3 : 9525) * 2,
        left: ((_outline$width4 = outline.width) !== null && _outline$width4 !== void 0 ? _outline$width4 : 9525) * 2
      } : {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }),
      new DocProperties(docProperties, {
        link: link2,
        decorative
      }),
      createGraphicFrameProperties(mediaData.type !== "graphic" || mediaData.lockAspectRatio !== false),
      new Graphic({
        mediaData,
        transform,
        outline,
        solidFill,
        crop
      })
    ]
  });
};
var Drawing = class extends XmlComponent {
  constructor(imageData, drawingOptions = {}) {
    super("w:drawing");
    if (!drawingOptions.floating) this.root.push(createInline({
      mediaData: imageData,
      transform: imageData.transformation,
      docProperties: drawingOptions.docProperties,
      outline: drawingOptions.outline,
      solidFill: drawingOptions.solidFill,
      crop: drawingOptions.crop,
      effectExtent: drawingOptions.effectExtent,
      link: drawingOptions.link,
      decorative: drawingOptions.decorative
    }));
    else this.root.push(new Anchor({
      mediaData: imageData,
      transform: imageData.transformation,
      drawingOptions
    }));
  }
};
var convertDataURIToBinary = (dataURI) => {
  const base64Index = dataURI.indexOf(";base64,");
  const base64IndexWithOffset = base64Index === -1 ? 0 : base64Index + 8;
  return new Uint8Array(atob(dataURI.substring(base64IndexWithOffset)).split("").map((c) => c.charCodeAt(0)));
};
var standardizeData = (data) => typeof data === "string" ? convertDataURIToBinary(data) : data;
var SIGNATURES = [
  ["png", [
    137,
    80,
    78,
    71,
    13,
    10,
    26,
    10
  ]],
  ["jpg", [
    255,
    216,
    255
  ]],
  ["gif", [
    71,
    73,
    70,
    56,
    55,
    97
  ]],
  ["gif", [
    71,
    73,
    70,
    56,
    57,
    97
  ]],
  ["bmp", [66, 77]]
];
var imageTypeOf = ({ type, data }, name) => {
  if (type !== void 0) return type;
  const standardized = standardizeData(data);
  const bytes = ArrayBuffer.isView(standardized) ? new Uint8Array(standardized.buffer, standardized.byteOffset, standardized.byteLength) : new Uint8Array(standardized);
  const signature = SIGNATURES.find(([, start]) => start.every((byte, index) => bytes[index] === byte));
  if (signature === void 0) throw new Error(`${name}: type isn't given, and data isn't a PNG, JPEG, GIF or BMP file to read it from. Give its type`);
  return signature[0];
};
var createImageData = (options, key) => ({
  data: standardizeData(options.data),
  fileName: key,
  transformation: {
    pixels: {
      x: Math.round(options.transformation.width),
      y: Math.round(options.transformation.height)
    },
    emus: {
      x: Math.round(options.transformation.width * 9525),
      y: Math.round(options.transformation.height * 9525)
    },
    flip: options.transformation.flip,
    rotation: options.transformation.rotation ? options.transformation.rotation * 6e4 : void 0
  }
});
var createRegularImageData = (options, transformation, name) => {
  const type = imageTypeOf(options, name);
  return _objectSpread2({ type }, createImageData(_objectSpread2(_objectSpread2({}, options), {}, { transformation }), `${hashedId(options.data)}.${type}`));
};
var createDeletion = ({ id, author, date }, run) => new BuilderElement({
  name: "w:del",
  attributes: {
    id: {
      key: "w:id",
      value: id
    },
    author: {
      key: "w:author",
      value: author
    },
    date: {
      key: "w:date",
      value: date
    }
  },
  children: [run]
});
var ImageRun = class extends XmlComponent {
  constructor(options) {
    var _options$insertion;
    const imageData = options.type === "svg" ? _objectSpread2(_objectSpread2({ type: options.type }, createImageData(options, `${hashedId(options.data)}.svg`)), {}, { fallback: createRegularImageData(options.fallback, options.transformation, "ImageRun fallback") }) : createRegularImageData(options, options.transformation, "ImageRun");
    const drawing = new Drawing(imageData, {
      floating: options.floating,
      docProperties: options.altText,
      outline: options.outline,
      solidFill: options.solidFill,
      crop: options.crop,
      link: options.link,
      decorative: options.decorative
    });
    const properties = new RunProperties(options.run);
    const revision = (_options$insertion = options.insertion) !== null && _options$insertion !== void 0 ? _options$insertion : options.deletion;
    const rootName = options.insertion ? "w:ins" : options.deletion ? "w:del" : "w:r";
    super(rootName);
    _defineProperty2(this, "imageData", void 0);
    if (revision) {
      this.root.push(new ChangeAttributes({
        id: revision.id,
        author: revision.author,
        date: revision.date
      }));
      const run = new BuilderElement({
        name: "w:r",
        children: [properties, drawing]
      });
      this.addChildElement(options.insertion && options.deletion ? createDeletion(options.deletion, run) : run);
    } else {
      this.root.push(properties);
      this.root.push(drawing);
    }
    this.imageData = imageData;
  }
  prepForXml(context) {
    context.file.Media.addImage(this.imageData.fileName, this.imageData);
    if (this.imageData.type === "svg") context.file.Media.addImage(this.imageData.fallback.fileName, this.imageData.fallback);
    return super.prepForXml(context);
  }
};
var LARGEST_ROMAN = 32767;
var LARGEST_LETTERS = 780;
var ROMAN = [
  [1e3, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"]
];
var roman = (value) => value <= LARGEST_ROMAN ? ROMAN.reduce(({ rest, text: text2 }, [amount, numeral]) => ({
  rest: rest % amount,
  text: text2 + numeral.repeat(Math.floor(rest / amount))
}), {
  rest: value,
  text: ""
}).text : void 0;
var letters = (value) => value === 0 ? "" : value <= LARGEST_LETTERS ? String.fromCharCode(65 + (value - 1) % 26).repeat(Math.ceil(value / 26)) : void 0;
var ordinal = (value) => {
  var _ref;
  return `${value}${value % 100 >= 11 && value % 100 <= 13 ? "th" : (_ref = [
    "th",
    "st",
    "nd",
    "rd"
  ][value % 10]) !== null && _ref !== void 0 ? _ref : "th"}`;
};
var numberWriterOf = (format3) => {
  const small = format3.charAt(0) !== format3.charAt(0).toUpperCase();
  const inCase = (write) => (value) => {
    var _write;
    return small ? (_write = write(value)) === null || _write === void 0 ? void 0 : _write.toLowerCase() : write(value);
  };
  switch (format3.toLowerCase()) {
    case "arabic":
      return String;
    case "roman":
      return inCase(roman);
    case "alphabetic":
      return inCase(letters);
    case "ordinal":
      return (value) => value > 0 ? ordinal(value) : void 0;
    case "arabicdash":
      return (value) => `- ${value} -`;
    default:
      return;
  }
};
var PLAIN_FORMATS = /* @__PURE__ */ new Set([
  "mergeformat",
  "charformat",
  "mergeformatinet"
]);
var CASE_FORMATS = /* @__PURE__ */ new Set([
  "upper",
  "lower",
  "firstcap",
  "caps"
]);
var isNumberPicture = (picture) => /^[#0,]*[#0][#0,]*$/.test(picture);
var inNumberPicture = (value, picture) => {
  const zeros = [...picture].filter((character) => character === "0").length;
  const places = zeros + [...picture].filter((character) => character === "#").length;
  const digits = String(value).padStart(zeros, "0");
  if (digits.length < places || zeros === 0 && value === 0) return;
  return picture.includes(",") ? digits.replace(/\B(?=(\d{3})+$)/g, ",") : digits;
};
var inCapitals = (text2, capitals) => {
  switch (capitals) {
    case "upper":
      return text2.toUpperCase();
    case "lower":
      return text2.toLowerCase();
    case "firstcap":
      return text2.charAt(0).toUpperCase() + text2.slice(1);
    default:
      return text2;
  }
};
var numberFieldOf = (instruction) => {
  var _match;
  const field = new RegExp("^\\s*(PAGEREF|NUMPAGES|SECTIONPAGES)\\b(.*)$", "is").exec(instruction);
  const reference2 = (field === null || field === void 0 ? void 0 : field[1].toUpperCase()) === "PAGEREF" ? new RegExp('^\\s*("?)([^\\s"\\\\]+)\\1(.*)$', "s").exec(field[2]) : void 0;
  if (!field || field[1].toUpperCase() === "PAGEREF" && !reference2) return;
  const parts = (_match = (reference2 ? reference2[3] : field[2]).match(/"[^"]*"|\S+/g)) !== null && _match !== void 0 ? _match : [];
  let numberFormat;
  let picture;
  const capitals = [];
  let relative = false;
  let written = true;
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    const argument = () => {
      var _parts$index;
      return (part.length > 2 ? part.slice(2) : (_parts$index = parts[++index]) !== null && _parts$index !== void 0 ? _parts$index : "").replace(/^"(.*)"$/, "$1");
    };
    if (/^\\p$/i.test(part)) relative = true;
    else if (part.startsWith("\\#")) {
      var _picture;
      const value = argument();
      written && (written = picture === void 0 && isNumberPicture(value));
      (_picture = picture) !== null && _picture !== void 0 || (picture = value);
    } else if (part.startsWith("\\*")) {
      const name = argument();
      const lower = name.toLowerCase();
      if (CASE_FORMATS.has(lower)) capitals.push(lower);
      else if (name !== "" && !PLAIN_FORMATS.has(lower)) {
        var _numberFormat;
        written && (written = numberFormat === void 0 && numberWriterOf(name) !== void 0);
        (_numberFormat = numberFormat) !== null && _numberFormat !== void 0 || (numberFormat = name);
      }
    }
  }
  const own = _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({}, numberFormat === void 0 ? {} : { numberFormat }), picture === void 0 ? {} : { picture }), capitals.length === 0 ? {} : { capitals: capitals[0] }), {}, { written: written && capitals.length <= 1 && capitals[0] !== "caps" && (numberFormat === void 0 || picture === void 0) });
  return reference2 ? _objectSpread2({
    type: "pageReference",
    bookmark: reference2[2],
    relative
  }, own) : _objectSpread2({
    type: "pageCount",
    scope: field[1].toUpperCase() === "NUMPAGES" ? "document" : "section"
  }, own);
};
var prefixesPageNumbers = (instruction) => new RegExp("^\\s*TOC\\b.*\\\\s\\b", "is").test(instruction);
var resultFrom = (instruction, { enclosing, within, inTextBox }, { estimate, sectionPageCount, blank, relativeTo }) => {
  const field = numberFieldOf(instruction);
  if (field === void 0) return;
  const { bookmarks, pageCount, bookmarkPageNumbers } = estimate;
  const { numberFormat, picture, capitals, written } = field;
  const writesNumber = numberFormat !== void 0 || picture !== void 0;
  const inFormat = (value) => value === void 0 ? void 0 : picture === void 0 ? numberWriterOf(numberFormat !== null && numberFormat !== void 0 ? numberFormat : "arabic")(value) : inNumberPicture(value, picture);
  const position = field.type === "pageReference" && field.relative && within === "counted" && !inTextBox ? relativeTo === null || relativeTo === void 0 ? void 0 : relativeTo(field.bookmark) : void 0;
  let result;
  if (!written) result = void 0;
  else if (field.type === "pageCount") result = inFormat(field.scope === "document" ? pageCount : sectionPageCount);
  else if (enclosing.some(prefixesPageNumbers)) result = void 0;
  else if (writesNumber) result = inFormat(bookmarkPageNumbers === null || bookmarkPageNumbers === void 0 ? void 0 : bookmarkPageNumbers.get(field.bookmark));
  else result = field.relative ? position : bookmarks.get(field.bookmark);
  return result === void 0 ? blank ? "" : void 0 : inCapitals(result, capitals);
};
var placeIn = (name, within) => name === "mc:Fallback" || within === "fallback" ? "fallback" : name === "w:del" || name === "w:moveFrom" ? "deleted" : within;
var fillFields = (tree, elements, open, filling, within = "counted", inTextBox = false) => {
  for (let index = 0; index < elements.length; index++) {
    const element = elements[index];
    const name = tree.nameOf(element);
    if (name === void 0) continue;
    const current = open[open.length - 1];
    if (name === "w:fldChar") {
      const type = tree.attributeOf(element, "w:fldCharType");
      if (type === "begin") open.push({
        begin: element,
        instruction: "",
        inResult: false
      });
      else if (type === "separate" && current) {
        tree.writeClean(current.begin, current.instruction);
        current.inResult = true;
        current.result = filling.resultOf(current.instruction, {
          within,
          enclosing: open.slice(0, -1).map((field) => field.instruction),
          inTextBox
        });
        if (current.result !== void 0) {
          elements.splice(index + 1, 0, tree.textElement(current.result));
          index++;
        }
      } else if (type === "end") open.pop();
    } else if (name === "w:instrText" && current && !current.inResult) current.instruction += tree.textOf(element);
    else if ((name === "w:t" || name === "w:tab" || name === "w:br" || name === "w:cr") && (current === null || current === void 0 ? void 0 : current.result) !== void 0) {
      elements.splice(index, 1);
      index--;
    } else if (name === "w:fldSimple") {
      const result = filling.resultOf(String(tree.attributeOf(element, "w:instr")), {
        within,
        enclosing: open.map((field) => field.instruction),
        inTextBox
      });
      if (result === void 0) {
        var _tree$contentOf;
        fillFields(tree, (_tree$contentOf = tree.contentOf(element)) !== null && _tree$contentOf !== void 0 ? _tree$contentOf : [], [], filling, within, inTextBox);
      } else tree.setSimpleFieldResult(element, result);
    } else {
      var _tree$contentOf2;
      if (name === "w:p") {
        var _filling$beforeParagr;
        (_filling$beforeParagr = filling.beforeParagraph) === null || _filling$beforeParagr === void 0 || _filling$beforeParagr.call(filling, element);
      }
      fillFields(tree, (_tree$contentOf2 = tree.contentOf(element)) !== null && _tree$contentOf2 !== void 0 ? _tree$contentOf2 : [], open, filling, placeIn(name, within), inTextBox || name === "w:txbxContent");
      if (name === "w:p") filling.afterParagraph(element);
    }
  }
};
var sectionPropertiesIn = (tree, elements) => elements.flatMap((element) => {
  var _tree$contentOf3;
  const name = tree.nameOf(element);
  if (name === void 0) return [];
  return name === "w:sectPr" ? [element] : sectionPropertiesIn(tree, (_tree$contentOf3 = tree.contentOf(element)) !== null && _tree$contentOf3 !== void 0 ? _tree$contentOf3 : []);
});
var endsSection = (tree, paragraph2) => {
  var _tree$contentOf4;
  return ((_tree$contentOf4 = tree.contentOf(paragraph2)) !== null && _tree$contentOf4 !== void 0 ? _tree$contentOf4 : []).some((child2) => {
    var _tree$contentOf5;
    return tree.nameOf(child2) === "w:pPr" && ((_tree$contentOf5 = tree.contentOf(child2)) !== null && _tree$contentOf5 !== void 0 ? _tree$contentOf5 : []).some((part) => tree.nameOf(part) === "w:sectPr");
  });
};
var partPageCountsOf = (tree, body, sectionPageCounts) => {
  const countsOfParts = sectionPropertiesIn(tree, [body]).reduce((all, properties) => {
    var _tree$contentOf6, _all;
    const references = ((_tree$contentOf6 = tree.contentOf(properties)) !== null && _tree$contentOf6 !== void 0 ? _tree$contentOf6 : []).flatMap((child2) => {
      const name = tree.nameOf(child2);
      return name === "w:headerReference" || name === "w:footerReference" ? [[`${name} ${String(tree.attributeOf(child2, "w:type"))}`, String(tree.attributeOf(child2, "r:id"))]] : [];
    });
    return [...all, new Map([...(_all = all[all.length - 1]) !== null && _all !== void 0 ? _all : [], ...references])];
  }, []).reduce((counts, parts, section) => {
    for (const id of parts.values()) {
      var _counts$get;
      counts.set(id, [...(_counts$get = counts.get(id)) !== null && _counts$get !== void 0 ? _counts$get : [], sectionPageCounts[section]]);
    }
    return counts;
  }, /* @__PURE__ */ new Map());
  return new Map([...countsOfParts].flatMap(([id, [first, ...rest]]) => first !== void 0 && rest.every((count) => count === first) ? [[id, first]] : []));
};
var fillBodyFields = (tree, body, estimate, { blank }) => {
  const { sectionPageCounts = [], relativePositions } = estimate;
  let section = 0;
  const relativeCounts = /* @__PURE__ */ new Map();
  const relativeTo = (bookmark2) => {
    var _relativeCounts$get, _relativePositions$ge;
    const count = (_relativeCounts$get = relativeCounts.get(bookmark2)) !== null && _relativeCounts$get !== void 0 ? _relativeCounts$get : 0;
    relativeCounts.set(bookmark2, count + 1);
    return relativePositions === null || relativePositions === void 0 || (_relativePositions$ge = relativePositions.get(bookmark2)) === null || _relativePositions$ge === void 0 ? void 0 : _relativePositions$ge[count];
  };
  fillFields(tree, [body], [], {
    resultOf: (instruction, place) => resultFrom(instruction, place, {
      estimate,
      sectionPageCount: sectionPageCounts[section],
      blank,
      relativeTo
    }),
    afterParagraph: (paragraph2) => {
      section += endsSection(tree, paragraph2) ? 1 : 0;
    }
  });
  return partPageCountsOf(tree, body, sectionPageCounts);
};
var fillPartFields = (tree, part, estimate, { blank, sectionPageCount, notes = false }) => {
  const onPage = (bookmark2) => {
    const page = estimate.bookmarks.get(bookmark2);
    return page === void 0 ? void 0 : `on page ${page}`;
  };
  fillFields(tree, [part], [], {
    resultOf: (instruction, place) => resultFrom(instruction, place, _objectSpread2({
      estimate,
      sectionPageCount,
      blank
    }, notes ? { relativeTo: onPage } : {})),
    afterParagraph: () => void 0
  });
};
var fillSequenceFields = (tree, body, { beforeParagraph, resultOf }) => fillFields(tree, [body], [], {
  resultOf: (instruction, { within }) => resultOf(instruction, within),
  beforeParagraph,
  afterParagraph: () => void 0
});
var FieldInstruction = class extends XmlComponent {
  constructor(properties = {}) {
    super("w:instrText");
    _defineProperty2(this, "properties", void 0);
    this.properties = properties;
    this.root.push(new TextAttributes({ space: SpaceType.PRESERVE }));
    let instruction = "TOC";
    if (this.properties.captionLabel) instruction = `${instruction} \\a "${this.properties.captionLabel}"`;
    if (this.properties.entriesFromBookmark) instruction = `${instruction} \\b "${this.properties.entriesFromBookmark}"`;
    if (this.properties.captionLabelIncludingNumbers) instruction = `${instruction} \\c "${this.properties.captionLabelIncludingNumbers}"`;
    if (this.properties.sequenceAndPageNumbersSeparator) instruction = `${instruction} \\d "${this.properties.sequenceAndPageNumbersSeparator}"`;
    if (this.properties.tcFieldIdentifier) instruction = `${instruction} \\f "${this.properties.tcFieldIdentifier}"`;
    if (this.properties.hyperlink) instruction = `${instruction} \\h`;
    if (this.properties.tcFieldLevelRange) instruction = `${instruction} \\l "${this.properties.tcFieldLevelRange}"`;
    if (this.properties.pageNumbersEntryLevelsRange) instruction = `${instruction} \\n "${this.properties.pageNumbersEntryLevelsRange}"`;
    if (this.properties.headingStyleRange) instruction = `${instruction} \\o "${this.properties.headingStyleRange}"`;
    if (this.properties.entryAndPageNumberSeparator) instruction = `${instruction} \\p "${this.properties.entryAndPageNumberSeparator}"`;
    if (this.properties.seqFieldIdentifierForPrefix) instruction = `${instruction} \\s "${this.properties.seqFieldIdentifierForPrefix}"`;
    if (this.properties.stylesWithLevels && this.properties.stylesWithLevels.length) {
      const styles = this.properties.stylesWithLevels.map((sl) => `${sl.styleName},${sl.level}`).join(",");
      instruction = `${instruction} \\t "${styles}"`;
    }
    if (this.properties.useAppliedParagraphOutlineLevel) instruction = `${instruction} \\u`;
    if (this.properties.preserveTabInEntries) instruction = `${instruction} \\w`;
    if (this.properties.preserveNewLineInEntries) instruction = `${instruction} \\x`;
    if (this.properties.hideTabAndPageNumbersInWebView) instruction = `${instruction} \\z`;
    this.root.push(instruction);
  }
};
var StructuredDocumentTagContent = class extends XmlComponent {
  constructor() {
    super("w:sdtContent");
  }
};
var beginOf = (beginDirty) => beginDirty === void 0 ? createBeginDirtyWithoutPageNumbers() : createBegin(beginDirty);
var writtenTables = /* @__PURE__ */ new WeakMap();
var HeadingBookmarkIds = class {
  constructor() {
    _defineProperty2(this, "ids", []);
  }
  get(index) {
    var _this$ids, _this$ids$index;
    (_this$ids$index = (_this$ids = this.ids)[index]) !== null && _this$ids$index !== void 0 || (_this$ids[index] = bookmarkUniqueNumericId());
    return this.ids[index];
  }
};
var nameOf$4 = (element) => typeof element === "object" && element !== null ? Object.keys(element)[0] : void 0;
var childrenOf$1 = (element) => {
  const name = nameOf$4(element);
  const content = name === void 0 ? void 0 : element[name];
  return Array.isArray(content) ? content : content === void 0 ? [] : [content];
};
var childOf$2 = (element, name) => childrenOf$1(element).find((child2) => nameOf$4(child2) === name);
var attributeOf = (element, attribute2) => {
  var _childOf;
  return (_childOf = childOf$2(element, "_attr")) === null || _childOf === void 0 || (_childOf = _childOf._attr) === null || _childOf === void 0 ? void 0 : _childOf[attribute2];
};
var numberAttributeOf = (element, attribute2) => {
  const value = attributeOf(element, attribute2);
  return value === void 0 ? void 0 : Number(value);
};
var BLOCK_CONTAINERS = /* @__PURE__ */ new Set([
  "w:tbl",
  "w:tr",
  "w:tc",
  "w:sdt",
  "w:sdtContent",
  "w:customXml"
]);
var blocksOf = (elements) => elements.flatMap((element) => {
  const name = nameOf$4(element);
  if (name === "w:p" || writtenTables.has(element)) return [element];
  return name !== void 0 && BLOCK_CONTAINERS.has(name) ? blocksOf(childrenOf$1(element)) : [];
});
var TEXT_CONTAINERS = /* @__PURE__ */ new Set([
  "w:r",
  "w:hyperlink",
  "w:ins",
  "w:moveTo",
  "w:smartTag",
  "w:customXml",
  "w:sdt",
  "w:sdtContent",
  "w:fldSimple",
  "w:dir",
  "w:bdo"
]);
var textOfRunContent = (element) => {
  switch (nameOf$4(element)) {
    case "w:t":
      return childrenOf$1(element).filter((child2) => typeof child2 === "string").join("");
    case "w:tab":
      return "	";
    case "w:br":
      return [void 0, "textWrapping"].includes(attributeOf(element, "w:type")) ? "\n" : "";
    case "w:cr":
      return "\n";
    case "w:noBreakHyphen":
      return "-";
    default:
      return "";
  }
};
var textOf$1 = (paragraph2) => {
  const fields = [];
  const read = (element) => {
    const name = nameOf$4(element);
    if (name !== void 0 && TEXT_CONTAINERS.has(name)) return childrenOf$1(element).map(read).join("");
    if (name === "w:fldChar") {
      const type = attributeOf(element, "w:fldCharType");
      if (type === "begin") fields.push(false);
      else if (type === "separate") fields[fields.length - 1] = true;
      else fields.pop();
      return "";
    }
    return fields.every(Boolean) ? textOfRunContent(element) : "";
  };
  return childrenOf$1(paragraph2).map(read).join("");
};
var bookmarkMarksOf = (element) => {
  const name = nameOf$4(element);
  if (name === "w:bookmarkStart") return [{
    start: true,
    id: attributeOf(element, "w:id"),
    name: attributeOf(element, "w:name")
  }];
  if (name === "w:bookmarkEnd") return [{
    start: false,
    id: attributeOf(element, "w:id")
  }];
  return name === void 0 || name === "_attr" ? [] : childrenOf$1(element).flatMap(bookmarkMarksOf);
};
var bookmarksOf = (paragraphs) => {
  const open = /* @__PURE__ */ new Map();
  return paragraphs.map((paragraph2) => {
    const marks = bookmarkMarksOf(paragraph2);
    const names = /* @__PURE__ */ new Set([...open.values(), ...marks.flatMap((mark) => mark.start ? [mark.name] : [])]);
    for (const mark of marks) if (mark.start) open.set(mark.id, mark.name);
    else open.delete(mark.id);
    return names;
  });
};
var paragraphDetailsOf = (paragraphs, followBookmarks) => {
  const bookmarks = followBookmarks ? bookmarksOf(paragraphs) : [];
  return paragraphs.map((element, index) => {
    var _bookmarks$index;
    const properties = childOf$2(element, "w:pPr");
    return {
      element,
      styleId: attributeOf(childOf$2(properties, "w:pStyle"), "w:val"),
      outlineLevel: numberAttributeOf(childOf$2(properties, "w:outlineLvl"), "w:val"),
      text: textOf$1(element),
      bookmarks: (_bookmarks$index = bookmarks[index]) !== null && _bookmarks$index !== void 0 ? _bookmarks$index : /* @__PURE__ */ new Set()
    };
  });
};
var stylesOf = (context) => {
  var _context$file;
  const styles = (_context$file = context.file) === null || _context$file === void 0 || (_context$file = _context$file.Styles) === null || _context$file === void 0 ? void 0 : _context$file.prepForXml(context);
  return new Map(childrenOf$1(styles).filter((style) => nameOf$4(style) === "w:style" && ["paragraph", void 0].includes(attributeOf(style, "w:type"))).map((style) => [attributeOf(style, "w:styleId"), {
    name: attributeOf(childOf$2(style, "w:name"), "w:val"),
    basedOn: attributeOf(childOf$2(style, "w:basedOn"), "w:val"),
    outlineLevel: numberAttributeOf(childOf$2(childOf$2(style, "w:pPr"), "w:outlineLvl"), "w:val")
  }]));
};
var parseRange = (range) => {
  const match = /^\s*(\d+)\s*-\s*(\d+)\s*$/.exec(range);
  return match ? [Number(match[1]), Number(match[2])] : void 0;
};
var isWithin = (level, [from, to]) => level >= from && level <= to;
var headingLevelOf = (styleId, styles) => {
  var _styles$get$name, _styles$get;
  if (styleId === void 0) return;
  const match = /^heading ?([1-9])$/i.exec((_styles$get$name = (_styles$get = styles.get(styleId)) === null || _styles$get === void 0 ? void 0 : _styles$get.name) !== null && _styles$get$name !== void 0 ? _styles$get$name : styleId);
  return match ? Number(match[1]) : void 0;
};
var styleOutlineLevelOf = (styleId, styles, depth = 0) => {
  var _style$outlineLevel;
  if (styleId === void 0 || depth > styles.size) return;
  const style = styles.get(styleId);
  const heading3 = headingLevelOf(styleId, styles);
  return (_style$outlineLevel = style === null || style === void 0 ? void 0 : style.outlineLevel) !== null && _style$outlineLevel !== void 0 ? _style$outlineLevel : heading3 === void 0 ? styleOutlineLevelOf(style === null || style === void 0 ? void 0 : style.basedOn, styles, depth + 1) : heading3 - 1;
};
var headingLevels = (context) => {
  const styles = stylesOf(context);
  return (paragraph2) => {
    const properties = childOf$2(paragraph2, "w:pPr");
    const styleId = attributeOf(childOf$2(properties, "w:pStyle"), "w:val");
    const heading3 = headingLevelOf(styleId, styles);
    const outlineLevel = outlineLevelOf({
      styleId,
      outlineLevel: numberAttributeOf(childOf$2(properties, "w:outlineLvl"), "w:val")
    }, styles);
    const outline = outlineLevel === void 0 || outlineLevel >= 9 ? void 0 : outlineLevel + 1;
    if (heading3 !== void 0 && (outline === void 0 || outline === heading3)) return heading3;
    return outline === void 0 ? void 0 : "unclear";
  };
};
var outlineLevelOf = (paragraph2, styles) => {
  var _paragraph$outlineLev;
  return (_paragraph$outlineLev = paragraph2.outlineLevel) !== null && _paragraph$outlineLev !== void 0 ? _paragraph$outlineLev : styleOutlineLevelOf(paragraph2.styleId, styles);
};
var levelIn = (properties, paragraph2, styles) => {
  var _styles$get2;
  const { entriesFromBookmark, headingStyleRange, stylesWithLevels = [], useAppliedParagraphOutlineLevel } = properties;
  if (paragraph2.text.trim() === "" || entriesFromBookmark && !paragraph2.bookmarks.has(entriesFromBookmark)) return;
  const names = [paragraph2.styleId, paragraph2.styleId === void 0 ? void 0 : (_styles$get2 = styles.get(paragraph2.styleId)) === null || _styles$get2 === void 0 ? void 0 : _styles$get2.name].filter((name) => name !== void 0).map((name) => name.toLowerCase());
  const listed = stylesWithLevels.find((style) => names.includes(style.styleName.toLowerCase()));
  if (listed) return listed.level;
  const namesItsEntries = Boolean(headingStyleRange) || stylesWithLevels.length > 0 || Boolean(useAppliedParagraphOutlineLevel) || Boolean(properties.tcFieldIdentifier) || Boolean(properties.tcFieldLevelRange) || Boolean(properties.captionLabel) || Boolean(properties.captionLabelIncludingNumbers);
  const headingRange = headingStyleRange ? parseRange(headingStyleRange) : namesItsEntries ? void 0 : [1, 9];
  const heading3 = headingLevelOf(paragraph2.styleId, styles);
  if (headingRange && heading3 !== void 0 && isWithin(heading3, headingRange)) return heading3;
  const outlineLevel = useAppliedParagraphOutlineLevel ? outlineLevelOf(paragraph2, styles) : void 0;
  return outlineLevel !== void 0 && isWithin(outlineLevel + 1, headingRange !== null && headingRange !== void 0 ? headingRange : [1, 9]) ? outlineLevel + 1 : void 0;
};
var titleRunsOf = (title, properties) => {
  const text2 = properties.preserveTabInEntries ? title : title.replace(/\t/g, " ");
  return (properties.preserveNewLineInEntries ? text2.split("\n") : [text2.replace(/\n/g, " ")]).map((line, index) => new TextRun({
    break: index > 0 ? 1 : void 0,
    children: line.split("	").flatMap((part, partIndex) => [...partIndex > 0 ? [new Tab()] : [], ...part === "" ? [] : [part]])
  }));
};
var numberRunsOf = ({ text: text2, separator }) => separator === "tab" ? [new TextRun(text2), new TextRun({ children: [new Tab()] })] : [new TextRun(`${text2} `)];
var numberTabStopOf = (level, width) => {
  const end = 240 * (level - 1) + width + 240;
  return end <= 1920 ? Math.ceil(end / 240) * 240 : Math.round(end);
};
var entryStyleOf = (level, styles) => {
  var _find$, _find;
  return (_find$ = (_find = [...styles].find(([, style]) => {
    var _style$name;
    return ((_style$name = style.name) === null || _style$name === void 0 ? void 0 : _style$name.toLowerCase()) === `toc ${level}`;
  })) === null || _find === void 0 ? void 0 : _find[0]) !== null && _find$ !== void 0 ? _find$ : `TOC${level}`;
};
var contentOf = ({ properties, beginDirty, textWidth, tabLeader }, entries, styles, context) => {
  var _parseRange;
  const withoutPageNumbers = properties.pageNumbersEntryLevelsRange ? (_parseRange = parseRange(properties.pageNumbersEntryLevelsRange)) !== null && _parseRange !== void 0 ? _parseRange : [1, 9] : void 0;
  const content = new StructuredDocumentTagContent();
  entries.forEach((entry, index) => {
    var _entry$listNumber;
    const hasPageNumber = withoutPageNumbers === void 0 || !isWithin(entry.level, withoutPageNumbers);
    const children = [
      ...entry.listNumber ? numberRunsOf(entry.listNumber) : [],
      ...titleRunsOf(entry.title, properties),
      ...hasPageNumber ? [new TextRun({ children: [properties.entryAndPageNumberSeparator || new Tab()] }), new PageReference(entry.bookmark, { hyperlink: properties.hyperlink })] : []
    ];
    content.addChildElement(new Paragraph({
      style: entryStyleOf(entry.level, styles),
      tabStops: [...((_entry$listNumber = entry.listNumber) === null || _entry$listNumber === void 0 ? void 0 : _entry$listNumber.separator) === "tab" ? [{
        type: "left",
        position: numberTabStopOf(entry.level, entry.listNumber.width)
      }] : [], {
        type: "right",
        position: textWidth,
        leader: tabLeader
      }],
      children: [...index === 0 ? [new Run({ children: [
        beginOf(beginDirty),
        new FieldInstruction(properties),
        createSeparate()
      ] })] : [], ...properties.hyperlink ? [new InternalHyperlink({
        anchor: entry.bookmark,
        children
      })] : children]
    }));
  });
  content.addChildElement(new Paragraph({ children: [new Run({ children: [createEnd()] })] }));
  return content.prepForXml(context);
};
var bookmark = (paragraph2, name, id, context) => {
  const children = childrenOf$1(paragraph2);
  const start = children.findIndex((child2) => nameOf$4(child2) === "w:pPr") + 1;
  paragraph2["w:p"] = [
    ...children.slice(0, start),
    new BookmarkStart(name, id).prepForXml(context),
    ...children.slice(start),
    new BookmarkEnd(id).prepForXml(context)
  ];
};
var fillTablesOfContents = (body, context, bookmarkIds, listNumbersOf) => {
  const blocks = blocksOf(childrenOf$1(body));
  const tables = blocks.flatMap((block2) => {
    const options = writtenTables.get(block2);
    return options ? [[block2, options]] : [];
  });
  if (tables.length === 0) return;
  const styles = stylesOf(context);
  const followBookmarks = tables.some(([, { properties }]) => Boolean(properties.entriesFromBookmark));
  const headings = paragraphDetailsOf(blocks.filter((block2) => nameOf$4(block2) === "w:p"), followBookmarks).map((paragraph2) => ({
    paragraph: paragraph2,
    levels: tables.map(([, { properties }]) => levelIn(properties, paragraph2, styles))
  })).filter(({ levels }) => levels.some((level) => level !== void 0)).map((heading3, index) => _objectSpread2(_objectSpread2({}, heading3), {}, { id: bookmarkIds.get(index) }));
  for (const { paragraph: paragraph2, id } of headings) bookmark(paragraph2.element, `_Toc${id}`, id, context);
  const listNumbers = headings.length > 0 ? listNumbersOf === null || listNumbersOf === void 0 ? void 0 : listNumbersOf(body) : void 0;
  tables.forEach(([table2, options], index) => {
    const entries = headings.flatMap(({ paragraph: paragraph2, levels, id }) => {
      const level = levels[index];
      const listNumber = listNumbers === null || listNumbers === void 0 ? void 0 : listNumbers.get(`_Toc${id}`);
      return level === void 0 ? [] : [_objectSpread2({
        title: paragraph2.text,
        level,
        bookmark: `_Toc${id}`
      }, listNumber ? { listNumber } : {})];
    });
    if (entries.length === 0) return;
    table2["w:sdt"] = childrenOf$1(table2).map((child2) => nameOf$4(child2) === "w:sdtContent" ? contentOf(options, entries, styles, context) : child2);
  });
};
var IDENTIFIER = new RegExp("^\\p{L}[\\p{L}\\p{N}_]*$", "u");
var sequenceOf = (switches) => {
  var _step, _format;
  let step;
  let hidden = false;
  let format3;
  let caseFormat = false;
  let picture = false;
  for (let index = 0; index < switches.length; index++) {
    var _switches, _next;
    const name = switches[index];
    const argument = (_switches = switches[index + 1]) !== null && _switches !== void 0 ? _switches : "";
    let next;
    if (index === 0 && !name.startsWith("\\")) next = { type: "bookmark" };
    else if (name === "\\c" || name === "\\n") next = { type: name === "\\c" ? "repeat" : "next" };
    else if ((name === "\\r" || name === "\\s") && /^\d+$/.test(argument)) {
      index++;
      next = name === "\\r" ? {
        type: "reset",
        to: Number(argument)
      } : {
        type: "heading",
        level: Number(argument)
      };
    } else if (name === "\\h") hidden = true;
    else if (name === "\\#" && index + 1 < switches.length) {
      index++;
      picture = true;
    } else if (name === "\\*" && index + 1 < switches.length) {
      const value = switches[++index];
      if (CASE_FORMATS.has(value.toLowerCase())) caseFormat = true;
      else if (!PLAIN_FORMATS.has(value.toLowerCase())) {
        if (format3 !== void 0) return;
        format3 = value;
      }
    } else return;
    if (next && step) return;
    step = (_next = next) !== null && _next !== void 0 ? _next : step;
  }
  if ((step === null || step === void 0 ? void 0 : step.type) === "bookmark" && switches.length > 1) return;
  const written = !picture && !(caseFormat && format3 !== void 0 && format3.toLowerCase() !== "arabic");
  return {
    step: (_step = step) !== null && _step !== void 0 ? _step : { type: "next" },
    hidden: hidden && format3 === void 0,
    format: written ? (_format = format3) !== null && _format !== void 0 ? _format : "ARABIC" : ""
  };
};
var sequenceFieldOf = (instruction) => {
  var _match$1$match;
  const match = new RegExp("^\\s*SEQ\\b(.*)$", "is").exec(instruction);
  if (!match) return;
  const [written, ...switches] = (_match$1$match = match[1].match(/"[^"]*"|\S+/g)) !== null && _match$1$match !== void 0 ? _match$1$match : [];
  if (written === void 0) return {};
  const identifier = written.replace(/^"(.*)"$/, "$1");
  return IDENTIFIER.test(identifier) ? {
    identifier,
    sequence: sequenceOf(switches)
  } : { identifier };
};
var isSequenceField = (instruction) => sequenceFieldOf(instruction) !== void 0;
var identifiersIn = (element) => {
  if (typeof element !== "object" || element === null) return [];
  if (Array.isArray(element)) return element.flatMap(identifiersIn);
  return Object.entries(element).flatMap(([name, content]) => {
    return [...(name === "w:instrText" && Array.isArray(content) ? content : name === "_attr" ? [content["w:instr"]] : []).flatMap((instruction) => {
      const field = typeof instruction === "string" ? sequenceFieldOf(instruction) : void 0;
      return (field === null || field === void 0 ? void 0 : field.identifier) === void 0 ? [] : [field.identifier.toLowerCase()];
    }), ...identifiersIn(content)];
  });
};
var identifiersInCommentsOf = (context) => {
  var _context$file;
  const comments = (_context$file = context.file) === null || _context$file === void 0 ? void 0 : _context$file.Comments;
  if (!comments) return /* @__PURE__ */ new Set();
  const wrapper = {
    View: comments,
    Relationships: comments.Relationships
  };
  return new Set(identifiersIn(comments.prepForXml(_objectSpread2(_objectSpread2({}, context), {}, {
    viewWrapper: wrapper,
    stack: []
  }))));
};
var sequenceNumbering = (context) => {
  const levelOf = headingLevels(context);
  const numbers = /* @__PURE__ */ new Map();
  const counted = /* @__PURE__ */ new Map();
  const headingsAt = [];
  let unclearAt = -1;
  let paragraph2 = -1;
  let unknown;
  const afterHeading = (key, level) => {
    var _counted$get;
    const headingAt = Math.max(-1, ...headingsAt.slice(1, level + 1).filter((at) => at !== void 0));
    const since = ((_counted$get = counted.get(key)) !== null && _counted$get !== void 0 ? _counted$get : []).filter((field) => field.paragraph >= headingAt);
    const followed = since.every(({ step }) => (step === null || step === void 0 ? void 0 : step.type) === "next" || (step === null || step === void 0 ? void 0 : step.type) === "heading" && step.level === level);
    return unclearAt > headingAt || !followed ? void 0 : since.length + 1;
  };
  return {
    startParagraph: (element) => {
      paragraph2++;
      const level = levelOf(element);
      if (level === "unclear") unclearAt = paragraph2;
      else if (level !== void 0) headingsAt[level] = paragraph2;
    },
    numberOf: (instruction, place) => {
      var _unknown, _counted$get2, _numberWriterOf;
      const { identifier, sequence } = sequenceFieldOf(instruction);
      if (identifier === void 0 || place === "fallback") return;
      (_unknown = unknown) !== null && _unknown !== void 0 || (unknown = identifiersInCommentsOf(context));
      const key = identifier.toLowerCase();
      if ((sequence === null || sequence === void 0 ? void 0 : sequence.step.type) === "bookmark" && place === "counted" && !unknown.has(key)) return;
      const before = numbers.has(key) ? numbers.get(key) : 0;
      const step = unknown.has(key) || place === "deleted" ? void 0 : sequence === null || sequence === void 0 ? void 0 : sequence.step;
      const value = (step === null || step === void 0 ? void 0 : step.type) === "reset" ? step.to : (step === null || step === void 0 ? void 0 : step.type) === "repeat" ? before : (step === null || step === void 0 ? void 0 : step.type) === "heading" ? afterHeading(key, step.level) : (step === null || step === void 0 ? void 0 : step.type) === "next" && before !== void 0 ? before + 1 : void 0;
      numbers.set(key, value);
      counted.set(key, [...(_counted$get2 = counted.get(key)) !== null && _counted$get2 !== void 0 ? _counted$get2 : [], _objectSpread2({ paragraph: paragraph2 }, value === void 0 ? {} : { step })]);
      return value === void 0 || sequence === void 0 ? void 0 : sequence.hidden ? "" : (_numberWriterOf = numberWriterOf(sequence.format)) === null || _numberWriterOf === void 0 ? void 0 : _numberWriterOf(value);
    }
  };
};
var nameOf$3 = (element) => {
  const name = typeof element === "object" && element !== null && !Array.isArray(element) ? Object.keys(element)[0] : void 0;
  return name === "_attr" ? void 0 : name;
};
var textElement = (text2) => ({ "w:t": [{ _attr: { "xml:space": "preserve" } }, text2] });
var FORMATTED = {
  nameOf: nameOf$3,
  contentOf: (element) => {
    const content = element[nameOf$3(element)];
    return Array.isArray(content) ? content : void 0;
  },
  attributeOf: (element, attribute2) => {
    var _holder$_attr;
    const content = element[nameOf$3(element)];
    const holder = Array.isArray(content) ? content.find((child2) => typeof child2 === "object" && child2 !== null && "_attr" in child2) : content;
    return holder === null || holder === void 0 || (_holder$_attr = holder._attr) === null || _holder$_attr === void 0 ? void 0 : _holder$_attr[attribute2];
  },
  textOf: (element) => FORMATTED.contentOf(element).filter((part) => typeof part === "string").join(""),
  textElement,
  writeClean: (begin) => {
    if (isDirtyWithoutPageNumbers(begin)) {
      const attributes = begin["w:fldChar"]._attr;
      begin["w:fldChar"] = { _attr: Object.fromEntries(Object.entries(attributes).filter(([key]) => key !== "w:dirty")) };
    }
  },
  setSimpleFieldResult: (element, text2) => {
    const content = element["w:fldSimple"];
    element["w:fldSimple"] = [...(Array.isArray(content) ? content : [content]).filter((child2) => typeof child2 === "object" && child2 !== null && "_attr" in child2), { "w:r": [textElement(text2)] }];
  }
};
var estimates = /* @__PURE__ */ new WeakMap();
var fillSequenceNumbers = (body, context) => {
  const { startParagraph, numberOf } = sequenceNumbering(context);
  fillSequenceFields(FORMATTED, body, {
    beforeParagraph: (paragraph2) => startParagraph(paragraph2),
    resultOf: (instruction, within) => isSequenceField(instruction) ? numberOf(instruction, within) : void 0
  });
};
var fillPageNumbers = (body, context, estimator) => {
  const estimate = estimator(body, context);
  const partPageCounts = fillBodyFields(FORMATTED, body, estimate, { blank: false });
  if (context.file) estimates.set(context.file, {
    estimate,
    partPageCounts
  });
};
var fillPartPageNumbers = (part, context, referenceId) => {
  const written = context.file && estimates.get(context.file);
  if (!part || !written) return;
  const sectionPageCount = referenceId === void 0 ? void 0 : written.partPageCounts.get(`rId${referenceId}`);
  const notes = "w:footnotes" in part || "w:endnotes" in part;
  fillPartFields(FORMATTED, part, written.estimate, {
    blank: false,
    sectionPageCount,
    notes
  });
};
var RelationshipsAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", { xmlns: "xmlns" });
  }
};
var Relationships = class Relationships2 extends XmlComponent {
  constructor() {
    super("Relationships");
    this.root.push(new RelationshipsAttributes({ xmlns: "http://schemas.openxmlformats.org/package/2006/relationships" }));
  }
  /**
  * Creates a new relationship to another part in the package.
  *
  * @param id - Unique identifier for this relationship (will be prefixed with "rId")
  * @param type - Relationship type URI (e.g., image, header, hyperlink)
  * @param target - Path to the target part
  * @param targetMode - Optional mode indicating if target is external
  */
  addRelationship(id, type, target, targetMode) {
    this.root.push(createRelationship(`rId${id}`, type, target, targetMode));
  }
  /**
  * Creates a copy of the relationships given. Relationships added to the copy aren't added to them, so the compiler
  * adds the ones it writes for a part, such as to its images, to a copy, and packing a document again doesn't add
  * them a second time.
  *
  * Static, as `IContext` is public and has `Relationships`, so a new instance member would change the public API.
  *
  * @param relationships - The relationships to copy
  */
  static copy(relationships) {
    const copy = new Relationships2();
    copy.root.push(...relationships.root.slice(1));
    return copy;
  }
  /**
  * Gets the count of relationships in this collection.
  * Excludes the attributes element from the count.
  */
  get RelationshipCount() {
    return this.root.length - 1;
  }
};
var CommentAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      id: "w:id",
      initials: "w:initials",
      author: "w:author",
      date: "w:date"
    });
  }
};
var RootCommentsAttributes = class extends XmlAttributeComponent {
  constructor(..._args3) {
    super(..._args3);
    _defineProperty2(this, "xmlKeys", {
      "xmlns:wpc": "xmlns:wpc",
      "xmlns:cx": "xmlns:cx",
      "xmlns:cx1": "xmlns:cx1",
      "xmlns:cx2": "xmlns:cx2",
      "xmlns:cx3": "xmlns:cx3",
      "xmlns:cx4": "xmlns:cx4",
      "xmlns:cx5": "xmlns:cx5",
      "xmlns:cx6": "xmlns:cx6",
      "xmlns:cx7": "xmlns:cx7",
      "xmlns:cx8": "xmlns:cx8",
      "xmlns:mc": "xmlns:mc",
      "xmlns:aink": "xmlns:aink",
      "xmlns:am3d": "xmlns:am3d",
      "xmlns:o": "xmlns:o",
      "xmlns:r": "xmlns:r",
      "xmlns:m": "xmlns:m",
      "xmlns:v": "xmlns:v",
      "xmlns:wp14": "xmlns:wp14",
      "xmlns:wp": "xmlns:wp",
      "xmlns:w10": "xmlns:w10",
      "xmlns:w": "xmlns:w",
      "xmlns:w14": "xmlns:w14",
      "xmlns:w15": "xmlns:w15",
      "xmlns:w16cex": "xmlns:w16cex",
      "xmlns:w16cid": "xmlns:w16cid",
      "xmlns:w16": "xmlns:w16",
      "xmlns:w16sdtdh": "xmlns:w16sdtdh",
      "xmlns:w16se": "xmlns:w16se",
      "xmlns:wpg": "xmlns:wpg",
      "xmlns:wpi": "xmlns:wpi",
      "xmlns:wne": "xmlns:wne",
      "xmlns:wps": "xmlns:wps",
      "mc:Ignorable": "mc:Ignorable"
    });
  }
};
var Comment = class extends XmlComponent {
  constructor({ id, initials, author, date = /* @__PURE__ */ new Date(), children }, paraId) {
    super("w:comment");
    _defineProperty2(this, "paraId", void 0);
    this.paraId = paraId;
    this.root.push(new CommentAttributes({
      id,
      initials,
      author,
      date: date.toISOString()
    }));
    for (const child2 of children) this.root.push(child2);
  }
  /**
  * Serializes this comment to XML, injecting w14:paraId and w14:textId into the last
  * paragraph when threading is active. These attributes link the comment to its
  * corresponding w15:commentEx entry in commentsExtended.xml.
  */
  prepForXml(context) {
    const result = super.prepForXml(context);
    if (!result || !this.paraId) return result;
    const commentChildren = result["w:comment"];
    if (!Array.isArray(commentChildren)) return result;
    for (let i2 = commentChildren.length - 1; i2 >= 0; i2--) {
      const child2 = commentChildren[i2];
      if (child2 && typeof child2 === "object" && "w:p" in child2) {
        const pChildren = child2["w:p"];
        if (Array.isArray(pChildren)) pChildren.unshift({ _attr: {
          "w14:paraId": this.paraId,
          "w14:textId": this.paraId
        } });
        break;
      }
    }
    return result;
  }
};
var commentIdToParaId = (id) => (id + 1).toString(16).toUpperCase().padStart(8, "0");
var Comments = class extends XmlComponent {
  constructor({ children }) {
    super("w:comments");
    _defineProperty2(this, "relationships", void 0);
    _defineProperty2(this, "threadData", void 0);
    _defineProperty2(this, "commentIdsData", void 0);
    _defineProperty2(this, "isEmpty", void 0);
    this.isEmpty = children.length === 0;
    this.root.push(new RootCommentsAttributes({
      "xmlns:wpc": "http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas",
      "xmlns:cx": "http://schemas.microsoft.com/office/drawing/2014/chartex",
      "xmlns:cx1": "http://schemas.microsoft.com/office/drawing/2015/9/8/chartex",
      "xmlns:cx2": "http://schemas.microsoft.com/office/drawing/2015/10/21/chartex",
      "xmlns:cx3": "http://schemas.microsoft.com/office/drawing/2016/5/9/chartex",
      "xmlns:cx4": "http://schemas.microsoft.com/office/drawing/2016/5/10/chartex",
      "xmlns:cx5": "http://schemas.microsoft.com/office/drawing/2016/5/11/chartex",
      "xmlns:cx6": "http://schemas.microsoft.com/office/drawing/2016/5/12/chartex",
      "xmlns:cx7": "http://schemas.microsoft.com/office/drawing/2016/5/13/chartex",
      "xmlns:cx8": "http://schemas.microsoft.com/office/drawing/2016/5/14/chartex",
      "xmlns:mc": "http://schemas.openxmlformats.org/markup-compatibility/2006",
      "xmlns:aink": "http://schemas.microsoft.com/office/drawing/2016/ink",
      "xmlns:am3d": "http://schemas.microsoft.com/office/drawing/2017/model3d",
      "xmlns:o": "urn:schemas-microsoft-com:office:office",
      "xmlns:r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      "xmlns:m": "http://schemas.openxmlformats.org/officeDocument/2006/math",
      "xmlns:v": "urn:schemas-microsoft-com:vml",
      "xmlns:wp14": "http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing",
      "xmlns:wp": "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
      "xmlns:w10": "urn:schemas-microsoft-com:office:word",
      "xmlns:w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
      "xmlns:w14": "http://schemas.microsoft.com/office/word/2010/wordml",
      "xmlns:w15": "http://schemas.microsoft.com/office/word/2012/wordml",
      "xmlns:w16cex": "http://schemas.microsoft.com/office/word/2018/wordml/cex",
      "xmlns:w16cid": "http://schemas.microsoft.com/office/word/2016/wordml/cid",
      "xmlns:w16": "http://schemas.microsoft.com/office/word/2018/wordml",
      "xmlns:w16sdtdh": "http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash",
      "xmlns:w16se": "http://schemas.microsoft.com/office/word/2015/wordml/symex",
      "xmlns:wpg": "http://schemas.microsoft.com/office/word/2010/wordprocessingGroup",
      "xmlns:wpi": "http://schemas.microsoft.com/office/word/2010/wordprocessingInk",
      "xmlns:wne": "http://schemas.microsoft.com/office/word/2006/wordml",
      "xmlns:wps": "http://schemas.microsoft.com/office/word/2010/wordprocessingShape",
      "mc:Ignorable": "w14 w15 wp14"
    }));
    const hasThreading = children.some((child2) => child2.parentId !== void 0);
    const hasDurableIds = children.some((child2) => child2.durableId !== void 0);
    if (hasThreading || hasDurableIds) {
      const idToParaId = new Map(children.map((child2) => [child2.id, commentIdToParaId(child2.id)]));
      for (const child2 of children) this.root.push(new Comment(child2, idToParaId.get(child2.id)));
      if (hasThreading) this.threadData = children.map((child2) => ({
        paraId: idToParaId.get(child2.id),
        parentParaId: child2.parentId !== void 0 ? idToParaId.get(child2.parentId) : void 0,
        done: child2.resolved
      }));
      if (hasDurableIds) this.commentIdsData = children.map((child2) => {
        var _child$durableId;
        return {
          paraId: idToParaId.get(child2.id),
          durableId: (_child$durableId = child2.durableId) !== null && _child$durableId !== void 0 ? _child$durableId : idToParaId.get(child2.id)
        };
      });
    } else for (const child2 of children) this.root.push(new Comment(child2));
    this.relationships = new Relationships();
  }
  get Relationships() {
    return this.relationships;
  }
  /** Thread data for commentsExtended.xml, or undefined when no comments use parentId. */
  get ThreadData() {
    return this.threadData;
  }
  /** Comment id data for commentsIds.xml, or undefined when no comments carry a durableId. */
  get CommentIdsData() {
    return this.commentIdsData;
  }
  /** Whether there are no comments, in which case the document has no comments.xml part. */
  get IsEmpty() {
    return this.isEmpty;
  }
  /**
  * Formats the comments, with the page numbers worked out for their document written into their fields, when the
  * document's body is written with an estimate of its pages.
  */
  prepForXml(context) {
    const xml = super.prepForXml(context);
    fillPartPageNumbers(xml, context);
    return xml;
  }
};
var CommentsExtendedAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      "xmlns:wpc": "xmlns:wpc",
      "xmlns:mc": "xmlns:mc",
      "xmlns:w15": "xmlns:w15",
      "mc:Ignorable": "mc:Ignorable"
    });
  }
};
var CommentExAttributes = class extends XmlAttributeComponent {
  constructor(..._args2) {
    super(..._args2);
    _defineProperty2(this, "xmlKeys", {
      paraId: "w15:paraId",
      paraIdParent: "w15:paraIdParent",
      done: "w15:done"
    });
  }
};
var CommentEx = class extends XmlComponent {
  constructor(options) {
    super("w15:commentEx");
    this.root.push(new CommentExAttributes({
      paraId: options.paraId,
      paraIdParent: options.parentParaId,
      done: options.done !== void 0 ? options.done ? "1" : "0" : void 0
    }));
  }
};
var CommentsExtended = class extends XmlComponent {
  constructor(threadData) {
    super("w15:commentsEx");
    this.root.push(new CommentsExtendedAttributes({
      "xmlns:wpc": "http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas",
      "xmlns:mc": "http://schemas.openxmlformats.org/markup-compatibility/2006",
      "xmlns:w15": "http://schemas.microsoft.com/office/word/2012/wordml",
      "mc:Ignorable": "w15"
    }));
    for (const data of threadData) this.root.push(new CommentEx(data));
  }
};
var CommentIdAttributes = class extends XmlAttributeComponent {
  constructor(..._args3) {
    super(..._args3);
    _defineProperty2(this, "xmlKeys", {
      paraId: "w16cid:paraId",
      durableId: "w16cid:durableId"
    });
  }
};
var CommentId = class extends XmlComponent {
  constructor(options) {
    super("w16cid:commentId");
    this.root.push(new CommentIdAttributes({
      paraId: options.paraId,
      durableId: options.durableId
    }));
  }
};
var CommentsIdsAttributes = class extends XmlAttributeComponent {
  constructor(..._args4) {
    super(..._args4);
    _defineProperty2(this, "xmlKeys", {
      "xmlns:w16cid": "xmlns:w16cid",
      "xmlns:mc": "xmlns:mc",
      "mc:Ignorable": "mc:Ignorable"
    });
  }
};
var CommentsIds = class extends XmlComponent {
  constructor(commentIdsData) {
    super("w16cid:commentsIds");
    this.root.push(new CommentsIdsAttributes({
      "xmlns:w16cid": "http://schemas.microsoft.com/office/word/2016/wordml/cid",
      "xmlns:mc": "http://schemas.openxmlformats.org/markup-compatibility/2006",
      "mc:Ignorable": "w16cid"
    }));
    for (const data of commentIdsData) this.root.push(new CommentId(data));
  }
};
var EndnoteReference = class extends EmptyElement {
  constructor() {
    super("w:endnoteRef");
  }
};
var Tab = class extends EmptyElement {
  constructor() {
    super("w:tab");
  }
};
var PageBreakBefore = class extends XmlComponent {
  constructor() {
    super("w:pageBreakBefore");
  }
};
var LineRuleType = {
  /** Line spacing is at least the specified value */
  AT_LEAST: "atLeast",
  /** Writes `exactly`, which isn't a value the schema allows, so Word ignores it. Use {@link LineRuleType.EXACT} for an exact line height. */
  EXACTLY: "exactly",
  /** Line spacing is exactly the specified value */
  EXACT: "exact",
  /** Line spacing is automatically determined based on content */
  AUTO: "auto"
};
var createSpacing = ({ after, before, line, lineRule, beforeAutoSpacing, afterAutoSpacing }) => new BuilderElement({
  name: "w:spacing",
  attributes: {
    after: {
      key: "w:after",
      value: after
    },
    before: {
      key: "w:before",
      value: before
    },
    line: {
      key: "w:line",
      value: line
    },
    lineRule: {
      key: "w:lineRule",
      value: lineRule
    },
    beforeAutoSpacing: {
      key: "w:beforeAutospacing",
      value: beforeAutoSpacing
    },
    afterAutoSpacing: {
      key: "w:afterAutospacing",
      value: afterAutoSpacing
    }
  }
});
var HeadingLevel = {
  /** Heading 1 style */
  HEADING_1: "Heading1",
  /** Heading 2 style */
  HEADING_2: "Heading2",
  /** Heading 3 style */
  HEADING_3: "Heading3",
  /** Heading 4 style */
  HEADING_4: "Heading4",
  /** Heading 5 style */
  HEADING_5: "Heading5",
  /** Heading 6 style */
  HEADING_6: "Heading6",
  /** Title style */
  TITLE: "Title"
};
var createParagraphStyle = (styleId) => new BuilderElement({
  name: "w:pStyle",
  attributes: { val: {
    key: "w:val",
    value: styleId
  } }
});
var TabStopType = {
  /** Left-aligned tab stop */
  LEFT: "left",
  /** Right-aligned tab stop */
  RIGHT: "right",
  /** Center-aligned tab stop */
  CENTER: "center",
  /** Bar tab stop - inserts a vertical bar at the position */
  BAR: "bar",
  /** Clears a tab stop at the specified position */
  CLEAR: "clear",
  /** Decimal-aligned tab stop - aligns on decimal point */
  DECIMAL: "decimal",
  /** End-aligned tab stop (right-to-left equivalent) */
  END: "end",
  /** List tab stop for numbered lists */
  NUM: "num",
  /** Start-aligned tab stop (left-to-right equivalent) */
  START: "start"
};
var createTabStopItem = ({ type, position, leader }) => new BuilderElement({
  name: "w:tab",
  attributes: {
    val: {
      key: "w:val",
      value: type
    },
    pos: {
      key: "w:pos",
      value: signedTwipsMeasureValue(position)
    },
    leader: {
      key: "w:leader",
      value: leader
    }
  }
});
var createTabStop = (tabDefinitions) => new BuilderElement({
  name: "w:tabs",
  children: tabDefinitions.map((tabDefinition) => createTabStopItem(tabDefinition))
});
var NumberProperties = class extends XmlComponent {
  constructor(numberId, indentLevel) {
    super("w:numPr");
    this.root.push(new IndentLevel(indentLevel));
    this.root.push(new NumberId(numberId));
  }
};
var IndentLevel = class extends XmlComponent {
  constructor(level) {
    super("w:ilvl");
    if (level > 9) throw new Error("Level cannot be greater than 9. Read more here: https://answers.microsoft.com/en-us/msoffice/forum/all/does-word-support-more-than-9-list-levels/d130fdcd-1781-446d-8c84-c6c79124e4d7");
    this.root.push(new Attributes({ val: level }));
  }
};
var NumberId = class extends XmlComponent {
  constructor(id) {
    super("w:numId");
    this.root.push(new Attributes({ val: typeof id === "string" ? `{${id}}` : id }));
  }
};
var FileChild = class extends XmlComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(
      this,
      /** Marker property identifying this as a FileChild */
      "fileChild",
      /* @__PURE__ */ Symbol()
    );
  }
};
var HyperlinkAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      id: "r:id",
      history: "w:history",
      anchor: "w:anchor"
    });
  }
};
var ConcreteHyperlink = class extends XmlComponent {
  /**
  * @param children - Inline content of the hyperlink
  * @param relationshipId - Id of the external relationship, without the rId prefix
  * @param anchor - Bookmark name or external URL fragment
  * @param externalLink - The full address of an external hyperlink, so the relationship id is kept alongside its anchor
  */
  constructor(children, relationshipId, anchor, externalLink) {
    super("w:hyperlink");
    _defineProperty2(this, "linkId", void 0);
    _defineProperty2(this, "drawingLink", void 0);
    this.linkId = relationshipId;
    this.drawingLink = anchor && externalLink !== void 0 ? new DrawingLink(externalLink) : void 0;
    const attributes = new HyperlinkAttributes({
      history: 1,
      anchor: anchor ? anchor : void 0,
      id: !anchor || externalLink !== void 0 ? `rId${this.linkId}` : void 0
    });
    this.root.push(attributes);
    children.forEach((child2) => {
      this.root.push(child2);
    });
  }
  /**
  * Creates the `a:hlinkClick` of a picture in the hyperlink, which links to the same address.
  *
  * The hyperlink decides which relationship its pictures use, rather than the pictures reading `linkId`, because only it
  * knows whether that relationship has lost the fragment to `w:anchor`. The picture's relationship is added as the
  * picture is written, through the context's relationships, so it lands in the part the picture is in, both when
  * packing and when patching.
  *
  * @param context - The context the picture is written in, whose relationships get the picture's link if it has its own
  * @param declareNamespace - Declares the DrawingML namespace, for elements outside `a:graphic` such as `wp:docPr`
  */
  createDrawingClick(context, declareNamespace) {
    if (!this.drawingLink) return createHyperlinkClick(this.linkId, declareNamespace);
    this.drawingLink.addRelationship(context);
    return this.drawingLink.createClick(declareNamespace);
  }
};
var InternalHyperlink = class extends ConcreteHyperlink {
  constructor(options) {
    super(options.children, uniqueId(), options.anchor);
  }
};
var ExternalHyperlink = class extends XmlComponent {
  constructor(options) {
    super("w:externalHyperlink");
    _defineProperty2(this, "options", void 0);
    this.options = options;
  }
};
var BookmarkStartAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      id: "w:id",
      name: "w:name"
    });
  }
};
var BookmarkEndAttributes = class extends XmlAttributeComponent {
  constructor(..._args2) {
    super(..._args2);
    _defineProperty2(this, "xmlKeys", { id: "w:id" });
  }
};
var Bookmark = class Bookmark2 {
  constructor(options) {
    _defineProperty2(this, "start", void 0);
    _defineProperty2(this, "children", void 0);
    _defineProperty2(this, "end", void 0);
    const linkId = bookmarkUniqueNumericId();
    this.start = new BookmarkStart(options.id, linkId);
    this.children = options.children;
    this.end = new BookmarkEnd(linkId);
  }
  /**
  * The components written in this bookmark's place: its start, its children and its end. A bookmark in its
  * children is written the same way, so one bookmark can hold another.
  *
  * @internal
  */
  get writtenAs() {
    return [
      this.start,
      ...this.children.flatMap((child2) => child2 instanceof Bookmark2 ? child2.writtenAs : [child2]),
      this.end
    ];
  }
};
var BookmarkStart = class extends XmlComponent {
  constructor(id, linkId) {
    super("w:bookmarkStart");
    const attributes = new BookmarkStartAttributes({
      name: id,
      id: linkId
    });
    this.root.push(attributes);
  }
};
var BookmarkEnd = class extends XmlComponent {
  constructor(linkId) {
    super("w:bookmarkEnd");
    const attributes = new BookmarkEndAttributes({ id: linkId });
    this.root.push(attributes);
  }
};
var createOutlineLevel = (level) => new BuilderElement({
  name: "w:outlineLvl",
  attributes: { val: {
    key: "w:val",
    value: level
  } }
});
var PageReferenceFieldInstruction = class extends XmlComponent {
  constructor(bookmarkId, options = {}) {
    super("w:instrText");
    this.root.push(new TextAttributes({ space: SpaceType.PRESERVE }));
    let instruction = `PAGEREF ${bookmarkId}`;
    if (options.hyperlink) instruction = `${instruction} \\h`;
    if (options.useRelativePosition) instruction = `${instruction} \\p`;
    this.root.push(instruction);
  }
};
var PageReference = class extends Run {
  constructor(bookmarkId, options = {}) {
    super({ children: [
      createBeginDirtyWithoutPageNumbers(),
      new PageReferenceFieldInstruction(bookmarkId, options),
      createSeparate(),
      createEnd()
    ] });
  }
};
var MAX_ANCHOR_LENGTH = 255;
var externalHyperlinkTarget = (link2) => {
  const index = link2.indexOf("#");
  const fragmentLength = link2.length - index - 1;
  return index > 0 && fragmentLength > 0 && fragmentLength <= MAX_ANCHOR_LENGTH ? {
    target: link2.slice(0, index),
    anchor: link2.slice(index + 1)
  } : { target: link2 };
};
var listKey = (reference2, instance, restartedListId) => restartedListId === void 0 ? `${reference2}-${instance}` : `${reference2}-restart ${restartedListId}`;
var createFontRelationship = ({ id, fontKey, subsetted }, name) => new BuilderElement({
  name,
  attributes: _objectSpread2({ id: {
    key: "r:id",
    value: id
  } }, fontKey ? { fontKey: {
    key: "w:fontKey",
    value: `{${fontKey.toUpperCase()}}`
  } } : {}),
  children: [...subsetted ? [new OnOffElement("w:subsetted", subsetted)] : []]
});
var createFont = ({ name, altName, panose1, charset, family, notTrueType, pitch, sig, embedRegular, embedBold, embedItalic, embedBoldItalic }) => new BuilderElement({
  name: "w:font",
  attributes: { name: {
    key: "w:name",
    value: name
  } },
  children: [
    ...altName ? [createStringElement("w:altName", altName)] : [],
    ...panose1 ? [createStringElement("w:panose1", panose1)] : [],
    ...charset ? [createStringElement("w:charset", charset)] : [],
    ...family ? [createStringElement("w:family", family)] : [],
    ...notTrueType ? [new OnOffElement("w:notTrueType", notTrueType)] : [],
    ...pitch ? [createStringElement("w:pitch", pitch)] : [],
    ...sig ? [new BuilderElement({
      name: "w:sig",
      attributes: {
        usb0: {
          key: "w:usb0",
          value: sig.usb0
        },
        usb1: {
          key: "w:usb1",
          value: sig.usb1
        },
        usb2: {
          key: "w:usb2",
          value: sig.usb2
        },
        usb3: {
          key: "w:usb3",
          value: sig.usb3
        },
        csb0: {
          key: "w:csb0",
          value: sig.csb0
        },
        csb1: {
          key: "w:csb1",
          value: sig.csb1
        }
      }
    })] : [],
    ...embedRegular ? [createFontRelationship(embedRegular, "w:embedRegular")] : [],
    ...embedBold ? [createFontRelationship(embedBold, "w:embedBold")] : [],
    ...embedItalic ? [createFontRelationship(embedItalic, "w:embedItalic")] : [],
    ...embedBoldItalic ? [createFontRelationship(embedBoldItalic, "w:embedBoldItalic")] : []
  ]
});
var createEmbeddedFont = ({ name, characterSet, embedRegular, embedBold, embedItalic, embedBoldItalic }) => createFont({
  name,
  sig: {
    usb0: "E0002AFF",
    usb1: "C000247B",
    usb2: "00000009",
    usb3: "00000000",
    csb0: "000001FF",
    csb1: "00000000"
  },
  charset: characterSet,
  family: "auto",
  pitch: "variable",
  embedRegular,
  embedBold,
  embedItalic,
  embedBoldItalic
});
var createFontTable = (fonts) => new BuilderElement({
  name: "w:fonts",
  attributes: {
    mc: {
      key: "xmlns:mc",
      value: "http://schemas.openxmlformats.org/markup-compatibility/2006"
    },
    r: {
      key: "xmlns:r",
      value: "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    },
    w: {
      key: "xmlns:w",
      value: "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    },
    w14: {
      key: "xmlns:w14",
      value: "http://schemas.microsoft.com/office/word/2010/wordml"
    },
    w15: {
      key: "xmlns:w15",
      value: "http://schemas.microsoft.com/office/word/2012/wordml"
    },
    w16cex: {
      key: "xmlns:w16cex",
      value: "http://schemas.microsoft.com/office/word/2018/wordml/cex"
    },
    w16cid: {
      key: "xmlns:w16cid",
      value: "http://schemas.microsoft.com/office/word/2016/wordml/cid"
    },
    w16: {
      key: "xmlns:w16",
      value: "http://schemas.microsoft.com/office/word/2018/wordml"
    },
    w16sdtdh: {
      key: "xmlns:w16sdtdh",
      value: "http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash"
    },
    w16se: {
      key: "xmlns:w16se",
      value: "http://schemas.microsoft.com/office/word/2015/wordml/symex"
    },
    Ignorable: {
      key: "mc:Ignorable",
      value: "w14 w15 w16se w16cid w16 w16cex w16sdtdh"
    }
  },
  children: fonts.map(createEmbeddedFont)
});
var FACES = [
  {
    option: "data",
    element: "embedRegular",
    bold: false,
    italic: false
  },
  {
    option: "bold",
    element: "embedBold",
    bold: true,
    italic: false
  },
  {
    option: "italic",
    element: "embedItalic",
    bold: false,
    italic: true
  },
  {
    option: "boldItalic",
    element: "embedBoldItalic",
    bold: true,
    italic: true
  }
];
var FontWrapper = class {
  constructor(options) {
    _defineProperty2(this, "options", void 0);
    _defineProperty2(this, "fontTable", void 0);
    _defineProperty2(this, "relationships", void 0);
    _defineProperty2(
      this,
      /** @deprecated Use `files`, which has the file and key of each face a font embeds, not only the regular face's key */
      "fontOptionsWithKey",
      []
    );
    _defineProperty2(
      this,
      /** The files of the faces the fonts embed, in order: the Nth is `fonts/font<N>.odttf`, with the relationship `rId<N>` */
      "files",
      []
    );
    this.options = options;
    const faces = options.map((font) => FACES.flatMap(({ option, element, bold, italic }) => {
      const data = font[option];
      return data ? [{
        element,
        file: {
          name: font.name,
          data,
          bold,
          italic,
          fontKey: uniqueUuid()
        }
      }] : [];
    }));
    this.files = faces.flatMap((ofFont) => ofFont.map(({ file }) => file));
    this.fontOptionsWithKey = options.map((font, index) => _objectSpread2(_objectSpread2({}, font), {}, { fontKey: faces[index][0].file.fontKey }));
    this.fontTable = createFontTable(options.map((font, index) => _objectSpread2({
      name: font.name,
      characterSet: font.characterSet
    }, Object.fromEntries(faces[index].map(({ element, file }) => [element, {
      id: `rId${this.files.indexOf(file) + 1}`,
      fontKey: file.fontKey
    }])))));
    this.relationships = new Relationships();
    for (let i2 = 0; i2 < this.files.length; i2++) this.relationships.addRelationship(i2 + 1, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/font", `fonts/font${i2 + 1}.odttf`);
  }
  get View() {
    return this.fontTable;
  }
  get Relationships() {
    return this.relationships;
  }
};
var createWordWrap = () => new BuilderElement({
  name: "w:wordWrap",
  attributes: { val: {
    key: "w:val",
    value: 0
  } }
});
var createFrameProperties = (options) => {
  var _options$space, _options$space2;
  return new BuilderElement({
    name: "w:framePr",
    attributes: {
      anchorLock: {
        key: "w:anchorLock",
        value: options.anchorLock
      },
      dropCap: {
        key: "w:dropCap",
        value: options.dropCap
      },
      width: {
        key: "w:w",
        value: options.width
      },
      height: {
        key: "w:h",
        value: options.height
      },
      x: {
        key: "w:x",
        value: options.position ? options.position.x : void 0
      },
      y: {
        key: "w:y",
        value: options.position ? options.position.y : void 0
      },
      anchorHorizontal: {
        key: "w:hAnchor",
        value: options.anchor.horizontal
      },
      anchorVertical: {
        key: "w:vAnchor",
        value: options.anchor.vertical
      },
      spaceHorizontal: {
        key: "w:hSpace",
        value: (_options$space = options.space) === null || _options$space === void 0 ? void 0 : _options$space.horizontal
      },
      spaceVertical: {
        key: "w:vSpace",
        value: (_options$space2 = options.space) === null || _options$space2 === void 0 ? void 0 : _options$space2.vertical
      },
      rule: {
        key: "w:hRule",
        value: options.rule
      },
      alignmentX: {
        key: "w:xAlign",
        value: options.alignment ? options.alignment.x : void 0
      },
      alignmentY: {
        key: "w:yAlign",
        value: options.alignment ? options.alignment.y : void 0
      },
      lines: {
        key: "w:lines",
        value: options.lines
      },
      wrap: {
        key: "w:wrap",
        value: options.wrap
      }
    }
  });
};
var currentRestartedLists = /* @__PURE__ */ new WeakMap();
var restartedListIds = uniqueNumericIdCreator();
var RIGHT_TO_LEFT_ALIGNMENTS = {
  left: "right",
  right: "left"
};
var ParagraphProperties = class extends IgnoreIfEmptyXmlComponent {
  /**
  * Creates paragraph properties.
  *
  * @param options - The paragraph formatting to emit
  * @param config - Controls how the element is assembled; see {@link IParagraphPropertiesConfig}
  */
  constructor(options, { implicitListParagraphStyle = true, inListOrder = true } = {}) {
    super("w:pPr", options === null || options === void 0 ? void 0 : options.includeIfEmpty);
    _defineProperty2(this, "numbering", void 0);
    _defineProperty2(
      this,
      /** The paragraph's `w:numPr`, which is written again with its list's id each time the paragraph is written */
      "numberProperties",
      void 0
    );
    if (!options) return this;
    if (options.heading) this.push(createParagraphStyle(options.heading));
    if (implicitListParagraphStyle) {
      if (options.bullet) this.push(createParagraphStyle("ListParagraph"));
      if (options.numbering && !options.numbering.custom && !options.style && !options.heading) this.push(createParagraphStyle("ListParagraph"));
    }
    if (options.style) this.push(createParagraphStyle(options.style));
    if (options.keepNext !== void 0) this.push(new OnOffElement("w:keepNext", options.keepNext));
    if (options.keepLines !== void 0) this.push(new OnOffElement("w:keepLines", options.keepLines));
    if (options.pageBreakBefore) this.push(new PageBreakBefore());
    if (options.frame) this.push(createFrameProperties(options.frame));
    if (options.widowControl !== void 0) this.push(new OnOffElement("w:widowControl", options.widowControl));
    if (options.bullet) this.push(new NumberProperties(1, options.bullet.level));
    if (options.numbering) {
      const { reference: list2, instance, level, restart } = options.numbering;
      const reference2 = typeof list2 === "string" ? list2 : list2.reference;
      const numberProperties = new NumberProperties(listKey(reference2, instance !== null && instance !== void 0 ? instance : 0), level);
      this.numbering = {
        reference: reference2,
        level,
        instance,
        restartedListId: restart && inListOrder && instance === void 0 ? restartedListIds() : void 0,
        definition: typeof list2 === "string" ? void 0 : list2
      };
      this.numberProperties = numberProperties;
      this.push(numberProperties);
    } else if (options.numbering === false) this.push(new NumberProperties(0, 0));
    if (options.border) this.push(new Border(options.border));
    if (options.thematicBreak) this.push(new ThematicBreak());
    if (options.shading) this.push(createShading(options.shading));
    if (options.wordWrap) this.push(createWordWrap());
    if (options.overflowPunctuation) this.push(new OnOffElement("w:overflowPunct", options.overflowPunctuation));
    const tabDefinitions = [
      ...options.rightTabStop !== void 0 ? [{
        type: TabStopType.RIGHT,
        position: options.rightTabStop
      }] : [],
      ...options.tabStops ? options.tabStops : [],
      ...options.leftTabStop !== void 0 ? [{
        type: TabStopType.LEFT,
        position: options.leftTabStop
      }] : []
    ];
    if (tabDefinitions.length > 0) this.push(createTabStop(tabDefinitions));
    if (options.bidirectional !== void 0) this.push(new OnOffElement("w:bidi", options.bidirectional));
    if (options.spacing) this.push(createSpacing(options.spacing));
    if (options.indent) this.push(createIndent(options.indent));
    if (options.contextualSpacing !== void 0) this.push(new OnOffElement("w:contextualSpacing", options.contextualSpacing));
    if (options.alignment) this.push(createAlignment(options.bidirectional && RIGHT_TO_LEFT_ALIGNMENTS[options.alignment] || options.alignment));
    if (options.outlineLevel !== void 0) this.push(createOutlineLevel(options.outlineLevel));
    if (options.suppressLineNumbers !== void 0) this.push(new OnOffElement("w:suppressLineNumbers", options.suppressLineNumbers));
    if (options.autoSpaceEastAsianText !== void 0) this.push(new OnOffElement("w:autoSpaceDN", options.autoSpaceEastAsianText));
    if (options.run) this.push(new ParagraphRunProperties(options.run));
    if (options.revision) this.push(new ParagraphPropertiesChange(options.revision));
  }
  /**
  * Adds a property element to the paragraph properties.
  *
  * @param item - The XML component to add to the paragraph properties
  */
  push(item) {
    this.root.push(item);
  }
  /**
  * Adds the section properties (`w:sectPr`) of the section this paragraph ends.
  *
  * They go after the paragraph's run properties and before its revision (`w:pPrChange`),
  * the order CT_PPr gives them.
  *
  * @param sectionProperties - The properties of the section the paragraph ends
  */
  addSectionProperties(sectionProperties) {
    const revisionIndex = this.root.findIndex((item) => item instanceof ParagraphPropertiesChange);
    if (revisionIndex === -1) {
      this.root.push(sectionProperties);
      return;
    }
    this.root.splice(revisionIndex, 0, sectionProperties);
  }
  /**
  * Removes the section properties added with {@link addSectionProperties}.
  *
  * @param sectionProperties - The properties of the section to remove
  */
  removeSectionProperties(sectionProperties) {
    const index = this.root.indexOf(sectionProperties);
    if (index !== -1) this.root.splice(index, 1);
  }
  /**
  * Prepares the paragraph properties for XML serialization.
  *
  * This method works out which list instance a numbered paragraph is in, from where it is in its part when it
  * leaves out `instance`, and creates the concrete numbering instance for it before the properties are converted to XML.
  *
  * @param context - The XML context containing document and file information
  * @returns The prepared XML object, or undefined if the component should be ignored
  */
  prepForXml(context) {
    var _this$numbering;
    if (this.numbering) {
      var _this$numbering$resta, _currentRestartedList;
      const { reference: reference2, level, instance = 0, definition } = this.numbering;
      const restartedListId = this.numbering.instance === void 0 ? (_this$numbering$resta = this.numbering.restartedListId) !== null && _this$numbering$resta !== void 0 ? _this$numbering$resta : (_currentRestartedList = currentRestartedLists.get(context)) === null || _currentRestartedList === void 0 ? void 0 : _currentRestartedList.get(reference2) : void 0;
      if (!(context.viewWrapper instanceof FontWrapper)) context.file.Numbering.createConcreteNumberingInstance(reference2, instance, definition, restartedListId);
      const numberProperties = new NumberProperties(listKey(reference2, instance, restartedListId), level);
      this.root.splice(this.root.indexOf(this.numberProperties), 1, numberProperties);
      this.numberProperties = numberProperties;
    }
    const result = super.prepForXml(context);
    if (((_this$numbering = this.numbering) === null || _this$numbering === void 0 ? void 0 : _this$numbering.restartedListId) !== void 0) {
      var _currentRestartedList2;
      currentRestartedLists.set(context, new Map([...(_currentRestartedList2 = currentRestartedLists.get(context)) !== null && _currentRestartedList2 !== void 0 ? _currentRestartedList2 : [], [this.numbering.reference, this.numbering.restartedListId]]));
    }
    return result;
  }
};
var ParagraphPropertiesChange = class extends XmlComponent {
  constructor(options) {
    super("w:pPrChange");
    this.root.push(new ChangeAttributes({
      id: options.id,
      author: options.author,
      date: options.date
    }));
    this.root.push(new ParagraphProperties(_objectSpread2(_objectSpread2({}, options), {}, { includeIfEmpty: true }), { inListOrder: false }));
  }
};
var Paragraph = class Paragraph2 extends FileChild {
  constructor(options) {
    super("w:p");
    _defineProperty2(
      this,
      /** The options the paragraph was made with. A paragraph made from a string has it as its `text` */
      "options",
      void 0
    );
    _defineProperty2(this, "properties", void 0);
    _defineProperty2(this, "alignment", void 0);
    this.options = typeof options === "string" ? { text: options } : options;
    if (typeof options === "string") {
      this.alignment = {};
      this.properties = new ParagraphProperties({});
      this.root.push(this.properties);
      this.root.push(new TextRun(options));
      return this;
    }
    this.alignment = {
      alignment: options.alignment,
      bidirectional: options.bidirectional
    };
    this.properties = new ParagraphProperties(options);
    this.root.push(this.properties);
    if (options.text) this.root.push(new TextRun(options.text));
    if (options.children) for (const child2 of options.children) {
      if (child2 instanceof Bookmark) {
        this.root.push(...child2.writtenAs);
        continue;
      }
      this.root.push(child2);
    }
  }
  prepForXml(context) {
    for (const element of this.root) if (elementOf(element) === "w:externalHyperlink") {
      const index = this.root.indexOf(element);
      const { options } = element;
      const { target, anchor } = externalHyperlinkTarget(options.link);
      const concreteHyperlink = new ConcreteHyperlink(options.children, uniqueId(), anchor, options.link);
      context.viewWrapper.Relationships.addRelationship(concreteHyperlink.linkId, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", target, TargetModeType.EXTERNAL);
      this.root[index] = concreteHyperlink;
    }
    return super.prepForXml(context);
  }
  /**
  * Ends a section at this paragraph by adding the section's properties to the paragraph's properties,
  * as Word does with the last paragraph of each section but the last.
  *
  * The body adds them only while it is written and removes them afterwards with
  * {@link removeSectionProperties}, so the same paragraph can be used in other documents.
  *
  * @internal
  * @param sectionProperties - The properties of the section the paragraph ends
  */
  addSectionProperties(sectionProperties) {
    this.properties.addSectionProperties(sectionProperties);
  }
  /**
  * Removes the section properties added with {@link addSectionProperties}.
  *
  * @internal
  * @param sectionProperties - The properties of the section to remove
  */
  removeSectionProperties(sectionProperties) {
    this.properties.removeSectionProperties(sectionProperties);
  }
  /**
  * The paragraph's alignment and direction, which a table gives the empty paragraphs of the cells it adds below a
  * cell merged down rows (`rowSpan`), so that the merged cell is aligned as one.
  *
  * @internal
  */
  get Alignment() {
    return this.alignment;
  }
  /**
  * Makes a new paragraph with the paragraph's options and these, which take the place of its own, such as to indent
  * the paragraphs a parser made. The paragraph itself is left as it is, and the new one has the same children.
  *
  * Each option given replaces the paragraph's whole option: to keep the rest of its spacing, give
  * `spacing: { ...paragraph.options.spacing, before: 240 }`. An option given as `undefined` is removed.
  *
  * @example
  * ```typescript
  * const indented = paragraphs.map((paragraph) => paragraph.with({ indent: { left: 720, right: 720 } }));
  * ```
  */
  with(options) {
    return new Paragraph2(_objectSpread2(_objectSpread2({}, this.options), options));
  }
  addRunToFront(run) {
    this.root.splice(1, 0, run);
    return this;
  }
};
var VerticalAlignTable = {
  TOP: "top",
  CENTER: "center",
  BOTTOM: "bottom"
};
var VerticalAlignSection = _objectSpread2(_objectSpread2({}, VerticalAlignTable), {}, { BOTH: "both" });
var createVerticalAlign = (value) => new BuilderElement({
  name: "w:vAlign",
  attributes: { verticalAlign: {
    key: "w:val",
    value
  } }
});
var createColumns = ({ space, count, separate, equalWidth, children }) => new BuilderElement({
  name: "w:cols",
  attributes: {
    space: {
      key: "w:space",
      value: space === void 0 ? void 0 : twipsMeasureValue(space)
    },
    count: {
      key: "w:num",
      value: count === void 0 ? void 0 : decimalNumber(count)
    },
    separate: {
      key: "w:sep",
      value: separate
    },
    equalWidth: {
      key: "w:equalWidth",
      value: equalWidth
    }
  },
  children: !equalWidth && children ? children : void 0
});
var createDocumentGrid = ({ type, linePitch, charSpace }) => new BuilderElement({
  name: "w:docGrid",
  attributes: {
    type: {
      key: "w:type",
      value: type
    },
    linePitch: {
      key: "w:linePitch",
      value: decimalNumber(linePitch)
    },
    charSpace: {
      key: "w:charSpace",
      value: charSpace ? decimalNumber(charSpace) : void 0
    }
  }
});
var HeaderFooterReferenceType = {
  /** Specifies that this header or footer shall appear on every page in this section which is not overridden with a specific `even` or `first` page header/footer. In a section with all three types specified, this type shall be used on all odd numbered pages (counting from the `first` page in the section, not the section numbering). */
  DEFAULT: "default",
  /** Specifies that this header or footer shall appear on the first page in this section. The appearance of this header or footer is contingent on the setting of the `titlePg` element (§2.10.6). */
  FIRST: "first",
  /** Specifies that this header or footer shall appear on all even numbered pages in this section (counting from the first page in the section, not the section numbering). The appearance of this header or footer is contingent on the setting of the `evenAndOddHeaders` element (§2.10.1). */
  EVEN: "even"
};
var HeaderFooterType = {
  HEADER: "w:headerReference",
  FOOTER: "w:footerReference"
};
var createHeaderFooterReference = (type, options) => new BuilderElement({
  name: type,
  attributes: {
    type: {
      key: "w:type",
      value: options.type || HeaderFooterReferenceType.DEFAULT
    },
    id: {
      key: "r:id",
      value: `rId${options.id}`
    }
  }
});
var createLineNumberType = ({ countBy, start, restart, distance }) => new BuilderElement({
  name: "w:lnNumType",
  attributes: {
    countBy: {
      key: "w:countBy",
      value: countBy === void 0 ? void 0 : decimalNumber(countBy)
    },
    start: {
      key: "w:start",
      value: start === void 0 ? void 0 : decimalNumber(start)
    },
    restart: {
      key: "w:restart",
      value: restart
    },
    distance: {
      key: "w:distance",
      value: distance === void 0 ? void 0 : twipsMeasureValue(distance)
    }
  }
});
var createNoteProperties = ({ name, position, numberFormat, start, restart }) => new BuilderElement({
  name,
  children: [
    ...position === void 0 ? [] : [new BuilderElement({
      name: "w:pos",
      attributes: { val: {
        key: "w:val",
        value: position
      } }
    })],
    ...numberFormat ? [new BuilderElement({
      name: "w:numFmt",
      attributes: {
        val: {
          key: "w:val",
          value: numberFormat.type
        },
        format: {
          key: "w:format",
          value: numberFormat.format
        }
      }
    })] : [],
    ...start === void 0 ? [] : [new BuilderElement({
      name: "w:numStart",
      attributes: { val: {
        key: "w:val",
        value: decimalNumber(start)
      } }
    })],
    ...restart === void 0 ? [] : [new BuilderElement({
      name: "w:numRestart",
      attributes: { val: {
        key: "w:val",
        value: restart
      } }
    })]
  ]
});
var createFootnoteProperties = (options) => createNoteProperties(_objectSpread2({ name: "w:footnotePr" }, options));
var createEndnoteProperties = (options) => createNoteProperties(_objectSpread2({ name: "w:endnotePr" }, options));
var PageBordersAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      display: "w:display",
      offsetFrom: "w:offsetFrom",
      zOrder: "w:zOrder"
    });
  }
};
var PageBorders = class extends IgnoreIfEmptyXmlComponent {
  constructor(options) {
    super("w:pgBorders");
    if (!options) return this;
    if (options.pageBorders) this.root.push(new PageBordersAttributes({
      display: options.pageBorders.display,
      offsetFrom: options.pageBorders.offsetFrom,
      zOrder: options.pageBorders.zOrder
    }));
    else this.root.push(new PageBordersAttributes({}));
    if (options.pageBorderTop) this.root.push(createBorderElement("w:top", options.pageBorderTop));
    if (options.pageBorderLeft) this.root.push(createBorderElement("w:left", options.pageBorderLeft));
    if (options.pageBorderBottom) this.root.push(createBorderElement("w:bottom", options.pageBorderBottom));
    if (options.pageBorderRight) this.root.push(createBorderElement("w:right", options.pageBorderRight));
  }
};
var createPageMargin = (top, right, bottom, left, header, footer, gutter) => new BuilderElement({
  name: "w:pgMar",
  attributes: {
    top: {
      key: "w:top",
      value: signedTwipsMeasureValue(top)
    },
    right: {
      key: "w:right",
      value: twipsMeasureValue(right)
    },
    bottom: {
      key: "w:bottom",
      value: signedTwipsMeasureValue(bottom)
    },
    left: {
      key: "w:left",
      value: twipsMeasureValue(left)
    },
    header: {
      key: "w:header",
      value: twipsMeasureValue(header)
    },
    footer: {
      key: "w:footer",
      value: twipsMeasureValue(footer)
    },
    gutter: {
      key: "w:gutter",
      value: twipsMeasureValue(gutter)
    }
  }
});
var PageNumberSeparator = {
  /** Hyphen separator (-) */
  HYPHEN: "hyphen",
  /** Period separator (.) */
  PERIOD: "period",
  /** Colon separator (:) */
  COLON: "colon",
  /** Em dash separator (—) */
  EM_DASH: "emDash",
  /** En dash separator (–), written as `enDash` */
  EN_DASH: "endash"
};
var createPageNumberType = ({ start, formatType, separator, chapterHeadingLevel }) => new BuilderElement({
  name: "w:pgNumType",
  attributes: {
    start: {
      key: "w:start",
      value: start === void 0 ? void 0 : decimalNumber(start)
    },
    formatType: {
      key: "w:fmt",
      value: formatType
    },
    separator: {
      key: "w:chapSep",
      value: separator === PageNumberSeparator.EN_DASH ? "enDash" : separator
    },
    chapterHeadingLevel: {
      key: "w:chapStyle",
      value: chapterHeadingLevel === void 0 ? void 0 : decimalNumber(chapterHeadingLevel)
    }
  }
});
var PageOrientation = {
  /**
  * ## Portrait Mode
  *
  * Specifies that pages in this section shall be printed in portrait mode.
  */
  PORTRAIT: "portrait",
  /**
  * ## Landscape Mode
  *
  * Specifies that pages in this section shall be printed in landscape mode, which prints the page contents with a 90 degree rotation with respect to the normal page orientation.
  */
  LANDSCAPE: "landscape"
};
var createPageSize = ({ width, height, orientation, code: code2 }) => {
  const widthTwips = twipsMeasureValue(width);
  const heightTwips = twipsMeasureValue(height);
  return new BuilderElement({
    name: "w:pgSz",
    attributes: {
      width: {
        key: "w:w",
        value: orientation === PageOrientation.LANDSCAPE ? heightTwips : widthTwips
      },
      height: {
        key: "w:h",
        value: orientation === PageOrientation.LANDSCAPE ? widthTwips : heightTwips
      },
      orientation: {
        key: "w:orient",
        value: orientation
      },
      code: {
        key: "w:code",
        value: code2
      }
    }
  });
};
var PageTextDirectionAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", { val: "w:val" });
  }
};
var PageTextDirection = class extends XmlComponent {
  constructor(value) {
    super("w:textDirection");
    this.root.push(new PageTextDirectionAttributes({ val: value }));
  }
};
var createSectionType = (value) => new BuilderElement({
  name: "w:type",
  attributes: { val: {
    key: "w:val",
    value
  } }
});
var sectionMarginDefaults = {
  /** Top margin: 1440 twips (1 inch) */
  TOP: 1440,
  /** Right margin: 1440 twips (1 inch) */
  RIGHT: 1440,
  /** Bottom margin: 1440 twips (1 inch) */
  BOTTOM: 1440,
  /** Left margin: 1440 twips (1 inch) */
  LEFT: 1440,
  /** Header margin from top: 708 twips (0.5 inches) */
  HEADER: 708,
  /** Footer margin from bottom: 708 twips (0.5 inches) */
  FOOTER: 708,
  /** Gutter margin for binding: 0 twips */
  GUTTER: 0
};
var sectionPageSizeDefaults = {
  /** Page width: 11906 twips (8.27 inches, 210mm) */
  WIDTH: 11906,
  /** Page height: 16838 twips (11.69 inches, 297mm) */
  HEIGHT: 16838,
  /** Page orientation: portrait */
  ORIENTATION: PageOrientation.PORTRAIT
};
var SectionProperties = class SectionProperties2 extends XmlComponent {
  constructor({ page: { size: { width = sectionPageSizeDefaults.WIDTH, height = sectionPageSizeDefaults.HEIGHT, orientation = sectionPageSizeDefaults.ORIENTATION, code: code2 } = {}, margin: { top = sectionMarginDefaults.TOP, right = sectionMarginDefaults.RIGHT, bottom = sectionMarginDefaults.BOTTOM, left = sectionMarginDefaults.LEFT, header = sectionMarginDefaults.HEADER, footer = sectionMarginDefaults.FOOTER, gutter = sectionMarginDefaults.GUTTER } = {}, pageNumbers = {}, borders, textDirection } = {}, grid: { linePitch = 360, charSpace, type: gridType } = {}, headerWrapperGroup = {}, footerWrapperGroup = {}, lineNumbers, titlePage, verticalAlign, column, type, footnoteProperties, endnoteProperties, revision } = {}) {
    super("w:sectPr");
    _defineProperty2(
      this,
      /**
      * Width, in twips, available to block-level content in this section.
      *
      * This is the page width (accounting for orientation) minus the left and right
      * margins and the gutter. When the section is laid out in several columns, it is
      * the width of a single column. Percentage table widths are resolved against it.
      */
      "availableTextWidth",
      void 0
    );
    this.availableTextWidth = SectionProperties2.calculateAvailableTextWidth({
      pageWidth: orientation === PageOrientation.LANDSCAPE ? height : width,
      left,
      right,
      gutter,
      column
    });
    this.addHeaderFooterGroup(HeaderFooterType.HEADER, headerWrapperGroup);
    this.addHeaderFooterGroup(HeaderFooterType.FOOTER, footerWrapperGroup);
    if (footnoteProperties) this.root.push(createFootnoteProperties(footnoteProperties));
    if (endnoteProperties) this.root.push(createEndnoteProperties(endnoteProperties));
    if (type) this.root.push(createSectionType(type));
    this.root.push(createPageSize({
      width,
      height,
      orientation,
      code: code2
    }));
    this.root.push(createPageMargin(top, right, bottom, left, header, footer, gutter));
    if (borders) this.root.push(new PageBorders(borders));
    if (lineNumbers) this.root.push(createLineNumberType(lineNumbers));
    this.root.push(createPageNumberType(pageNumbers));
    if (column) this.root.push(createColumns(column));
    if (verticalAlign) this.root.push(createVerticalAlign(verticalAlign));
    if (titlePage !== void 0) this.root.push(new OnOffElement("w:titlePg", titlePage));
    if (textDirection) this.root.push(new PageTextDirection(textDirection));
    this.root.push(createDocumentGrid({
      linePitch,
      charSpace,
      type: gridType
    }));
    if (revision) this.root.push(new SectionPropertiesChange(revision));
  }
  /**
  * Width, in twips, available to block-level content (paragraphs and tables) in this section.
  *
  * Page width minus the left and right margins and the gutter, divided among the
  * section's columns when there is more than one. Tables use this to resolve
  * percentage widths into the absolute twip grid that Google Docs, Apple Pages and
  * other consumers lay tables out from.
  *
  * @example
  * ```typescript
  * // A4 portrait with 1 inch margins
  * new SectionProperties().AvailableTextWidth; // 11906 - 1440 - 1440 = 9026
  * ```
  */
  get AvailableTextWidth() {
    return this.availableTextWidth;
  }
  static calculateAvailableTextWidth({ pageWidth: pageWidth2, left, right, gutter, column }) {
    var _column$count, _column$space;
    const textWidth = universalMeasureToTwips(pageWidth2) - universalMeasureToTwips(left) - universalMeasureToTwips(right) - universalMeasureToTwips(gutter);
    const columnCount = (_column$count = column === null || column === void 0 ? void 0 : column.count) !== null && _column$count !== void 0 ? _column$count : 1;
    if (columnCount <= 1) return textWidth;
    return (textWidth - universalMeasureToTwips((_column$space = column === null || column === void 0 ? void 0 : column.space) !== null && _column$space !== void 0 ? _column$space : 720) * (columnCount - 1)) / columnCount;
  }
  addHeaderFooterGroup(type, group) {
    if (group.default) this.root.push(createHeaderFooterReference(type, {
      type: HeaderFooterReferenceType.DEFAULT,
      id: group.default.View.ReferenceId
    }));
    if (group.first) this.root.push(createHeaderFooterReference(type, {
      type: HeaderFooterReferenceType.FIRST,
      id: group.first.View.ReferenceId
    }));
    if (group.even) this.root.push(createHeaderFooterReference(type, {
      type: HeaderFooterReferenceType.EVEN,
      id: group.even.View.ReferenceId
    }));
  }
};
var SectionPropertiesChange = class extends XmlComponent {
  constructor(options) {
    super("w:sectPrChange");
    this.root.push(new ChangeAttributes({
      id: options.id,
      author: options.author,
      date: options.date
    }));
    this.root.push(new SectionProperties(options));
  }
};
var Body = class extends XmlComponent {
  constructor({ pageNumbers } = {}) {
    super("w:body");
    _defineProperty2(this, "sections", []);
    _defineProperty2(
      this,
      /**
      * Section properties that were moved into a paragraph at the end of their section
      * by {@link addSection}, keyed by that paragraph. Used to find the section that
      * governs a given child of the body, and to write each section's properties into
      * its paragraph while the body is written.
      */
      "sectionParagraphs",
      /* @__PURE__ */ new Map()
    );
    _defineProperty2(this, "headingBookmarkIds", new HeadingBookmarkIds());
    _defineProperty2(this, "pageNumbers", void 0);
    this.pageNumbers = pageNumbers;
  }
  /**
  * Finds the section properties that govern a top-level child of the body.
  *
  * A section's properties are stored after its content (either in the closing
  * paragraph of the section or, for the last section, at the end of the body), so
  * the governing section is the first one found at or after the child. When no
  * child is given (or it is not a direct child of the body), the first section is
  * returned.
  *
  * @param child - A direct child of the body (paragraph, table, etc.)
  * @returns The governing section properties, or undefined if the body has no sections
  */
  getSectionPropertiesFor(child2) {
    const start = child2 ? Math.max(this.root.indexOf(child2), 0) : 0;
    for (let i2 = start; i2 < this.root.length; i2++) {
      const component = this.root[i2];
      if (component instanceof SectionProperties) return component;
      const section = this.sectionParagraphs.get(component);
      if (section) return section;
    }
    return this.sections[this.sections.length - 1];
  }
  /**
  * Adds new section properties to the document body.
  *
  * Creates a new section by moving the previous section's properties into the last
  * paragraph of that section, and then adding the new section as the current section.
  * When that section doesn't end with a paragraph of its own (it ends with a table, or
  * it is empty), an empty paragraph is added to hold its properties.
  *
  * According to the OOXML specification:
  * - Section properties for all sections except the last must be stored in a paragraph's
  *   properties (pPr/sectPr) at the end of each section
  * - The last section's properties are stored as a direct child of the body element (w:body/w:sectPr)
  *
  * @param options - Section properties configuration (page size, margins, headers, footers, etc.)
  */
  addSection(options) {
    const currentSection = this.sections.pop();
    const lastParagraph = this.lastParagraphOfSection();
    if (currentSection && lastParagraph) this.sectionParagraphs.set(lastParagraph, currentSection);
    else {
      const sectionParagraph = this.createSectionParagraph();
      this.root.push(sectionParagraph);
      if (currentSection) this.sectionParagraphs.set(sectionParagraph, currentSection);
    }
    this.sections.push(new SectionProperties(options));
  }
  /**
  * Prepares the body element for XML serialization.
  *
  * Ensures that the last section's properties are placed as a direct child of the body
  * element, as required by the OOXML specification. Once the body is written, its tables
  * of contents are filled in from its headings, and, when the body has a page number
  * estimator, its page references are given their page numbers. Its SEQ fields are given
  * their numbers after the tables of contents are filled in, as Word leaves a heading's SEQ
  * number out of its entry.
  *
  * @param context - The XML serialization context
  * @returns The prepared XML object or undefined
  */
  prepForXml(context) {
    var _this$pageNumbers;
    if (this.sections.length === 1) {
      this.root.splice(0, 1);
      this.root.push(this.sections.pop());
    }
    for (const [paragraph2, section] of this.sectionParagraphs) paragraph2.addSectionProperties(section);
    let xml;
    try {
      xml = super.prepForXml(context);
    } finally {
      for (const [paragraph2, section] of this.sectionParagraphs) paragraph2.removeSectionProperties(section);
    }
    const listNumbers = (_this$pageNumbers = this.pageNumbers) === null || _this$pageNumbers === void 0 ? void 0 : _this$pageNumbers.listNumbers;
    fillTablesOfContents(xml, context, this.headingBookmarkIds, listNumbers && ((body) => listNumbers(body, context)));
    if (this.pageNumbers) {
      fillSequenceNumbers(xml, context);
      fillPageNumbers(xml, context, this.pageNumbers);
    }
    return xml;
  }
  /**
  * Adds a block-level component to the body.
  *
  * This method is used internally by the Document class to add paragraphs,
  * tables, and other block-level elements to the document body.
  *
  * @param component - The XML component to add (paragraph, table, etc.)
  */
  push(component) {
    const section = component instanceof Paragraph ? this.sectionParagraphs.get(component) : void 0;
    if (section) {
      const sectionParagraph = this.createSectionParagraph();
      this.root.splice(this.root.indexOf(component) + 1, 0, sectionParagraph);
      this.sectionParagraphs.delete(component);
      this.sectionParagraphs.set(sectionParagraph, section);
    }
    this.root.push(component);
  }
  /**
  * The paragraph the current section ends with, which can hold its properties.
  *
  * There is none when the section ends with something other than a paragraph, or is empty:
  * its last child is then the placeholder at the start of the body (removed when the body is
  * written) or the paragraph that ends the section before, which has properties of its own.
  */
  lastParagraphOfSection() {
    const last = this.root[this.root.length - 1];
    return last instanceof Paragraph && last !== this.root[0] && !this.sectionParagraphs.has(last) && this.root.indexOf(last) === this.root.length - 1 ? last : void 0;
  }
  /**
  * An empty paragraph to end a section that has no paragraph of its own to end it. The section's
  * properties are written into it with the others, when the body is written.
  */
  createSectionParagraph() {
    return new Paragraph({});
  }
};
var WidthType = {
  /** Auto. */
  AUTO: "auto",
  /** Value is in twentieths of a point */
  DXA: "dxa",
  /** No (empty) value. */
  NIL: "nil",
  /** Value is in percentage. */
  PERCENTAGE: "pct"
};
var createTableWidthElement = (name, { type = WidthType.AUTO, size }) => {
  let tableWidthValue = size;
  if (type === WidthType.PERCENTAGE && typeof size === "number") tableWidthValue = Math.round(size * 50);
  return new BuilderElement({
    name,
    attributes: {
      type: {
        key: "w:type",
        value: type
      },
      size: {
        key: "w:w",
        value: measurementOrPercentValue(tableWidthValue)
      }
    }
  });
};
var DEFAULT_AVAILABLE_WIDTH = sectionPageSizeDefaults.WIDTH - sectionMarginDefaults.LEFT - sectionMarginDefaults.RIGHT - sectionMarginDefaults.GUTTER;
var columnSpanOf = (cell) => cell.options.columnSpan || 1;
var resolvePreferredWidth = (width, referenceWidth) => {
  if (!width) return;
  const { type = WidthType.AUTO, size } = width;
  if (type !== WidthType.PERCENTAGE && type !== WidthType.DXA) return;
  const twips = typeof size === "number" ? type === WidthType.PERCENTAGE ? size / 100 * referenceWidth : size : size.endsWith("%") ? Number(size.slice(0, -1)) / 100 * referenceWidth : universalMeasureToTwips(size);
  return twips > 0 ? twips : void 0;
};
var resolveTableWidth = (width, availableWidth) => {
  var _resolvePreferredWidt;
  return (_resolvePreferredWidt = resolvePreferredWidth(width, availableWidth)) !== null && _resolvePreferredWidt !== void 0 ? _resolvePreferredWidt : availableWidth;
};
var countGridColumns = (rows) => Math.max(0, ...rows.map((row) => row.cells.reduce((count, cell) => count + columnSpanOf(cell), 0)));
var resolveColumnWidths = ({ rows, width, availableWidth }) => {
  const columnCount = countGridColumns(rows);
  if (columnCount === 0) return [];
  const tableWidth = resolveTableWidth(width, availableWidth);
  const widths = Array.from({ length: columnCount }, () => void 0);
  const spanningCells = [];
  for (const row of rows) {
    let column = 0;
    for (const cell of row.cells) {
      const span = columnSpanOf(cell);
      const cellWidth = resolvePreferredWidth(cell.options.width, tableWidth);
      if (cellWidth !== void 0) {
        if (span === 1) {
          var _column, _widths$_column;
          (_widths$_column = widths[_column = column]) !== null && _widths$_column !== void 0 || (widths[_column] = cellWidth);
        } else spanningCells.push({
          start: column,
          span,
          width: cellWidth
        });
      }
      column += span;
    }
  }
  for (const { start, span, width: cellWidth } of spanningCells) {
    const columns = Array.from({ length: span }, (_, i2) => start + i2).filter((column) => column < columnCount);
    const unresolvedSpanColumns = columns.filter((column) => widths[column] === void 0);
    const remaining = cellWidth - columns.reduce((sum, column) => {
      var _widths$column;
      return sum + ((_widths$column = widths[column]) !== null && _widths$column !== void 0 ? _widths$column : 0);
    }, 0);
    if (unresolvedSpanColumns.length > 0 && remaining > 0) for (const column of unresolvedSpanColumns) widths[column] = remaining / unresolvedSpanColumns.length;
  }
  const unresolvedColumns = widths.flatMap((columnWidth, column) => columnWidth === void 0 ? [column] : []);
  if (unresolvedColumns.length > 0) {
    const remaining = tableWidth - widths.reduce((sum, columnWidth) => sum + (columnWidth !== null && columnWidth !== void 0 ? columnWidth : 0), 0);
    const share = remaining > 0 ? remaining / unresolvedColumns.length : tableWidth / columnCount;
    for (const column of unresolvedColumns) widths[column] = share;
  }
  return widths.map((columnWidth) => Math.round(columnWidth));
};
var createGridCol = (width) => new BuilderElement({
  name: "w:gridCol",
  attributes: width !== void 0 ? { width: {
    key: "w:w",
    value: twipsMeasureValue(width)
  } } : void 0
});
var TableGrid = class extends XmlComponent {
  constructor(widths, revision) {
    super("w:tblGrid");
    for (const width of widths) this.root.push(createGridCol(width));
    if (revision) this.root.push(new TableGridChange(revision));
  }
};
var TableGridChangeAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", { id: "w:id" });
  }
};
var TableGridChange = class extends XmlComponent {
  constructor(options) {
    super("w:tblGridChange");
    this.root.push(new TableGridChangeAttributes({ id: options.id }));
    this.root.push(new TableGrid(options.columnWidths));
  }
};
var InsertedTableRow = class extends XmlComponent {
  constructor(options) {
    super("w:ins");
    this.root.push(new ChangeAttributes({
      id: options.id,
      author: options.author,
      date: options.date
    }));
  }
};
var DeletedTableRow = class extends XmlComponent {
  constructor(options) {
    super("w:del");
    this.root.push(new ChangeAttributes({
      id: options.id,
      author: options.author,
      date: options.date
    }));
  }
};
var InsertedTableCell = class extends XmlComponent {
  constructor(options) {
    super("w:cellIns");
    this.root.push(new ChangeAttributes({
      id: options.id,
      author: options.author,
      date: options.date
    }));
  }
};
var DeletedTableCell = class extends XmlComponent {
  constructor(options) {
    super("w:cellDel");
    this.root.push(new ChangeAttributes({
      id: options.id,
      author: options.author,
      date: options.date
    }));
  }
};
var CellMergeAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      id: "w:id",
      author: "w:author",
      date: "w:date",
      verticalMerge: "w:vMerge",
      verticalMergeOriginal: "w:vMergeOrig"
    });
  }
};
var CellMerge = class extends XmlComponent {
  constructor(options) {
    super("w:cellMerge");
    this.root.push(new CellMergeAttributes(options));
  }
};
var buildMarginChildren = ({ marginUnitType = WidthType.DXA, top, left, bottom, right }) => [
  {
    name: "w:top",
    size: top
  },
  {
    name: "w:left",
    size: left
  },
  {
    name: "w:bottom",
    size: bottom
  },
  {
    name: "w:right",
    size: right
  }
].filter((entry) => entry.size !== void 0).map(({ name, size }) => createTableWidthElement(name, {
  type: marginUnitType,
  size
}));
var createTableCellMargin = (options) => {
  const children = buildMarginChildren(options);
  if (children.length === 0) return;
  return new BuilderElement({
    name: "w:tblCellMar",
    children
  });
};
var createCellMargin = (options) => {
  const children = buildMarginChildren(options);
  if (children.length === 0) return;
  return new BuilderElement({
    name: "w:tcMar",
    children
  });
};
var TableCellBorders = class extends IgnoreIfEmptyXmlComponent {
  constructor(options) {
    super("w:tcBorders");
    if (options.top) this.root.push(createBorderElement("w:top", options.top));
    if (options.start) this.root.push(createBorderElement("w:start", options.start));
    if (options.left) this.root.push(createBorderElement("w:left", options.left));
    if (options.bottom) this.root.push(createBorderElement("w:bottom", options.bottom));
    if (options.end) this.root.push(createBorderElement("w:end", options.end));
    if (options.right) this.root.push(createBorderElement("w:right", options.right));
    if (options.diagonalDown) this.root.push(createBorderElement("w:tl2br", options.diagonalDown));
    if (options.diagonalUp) this.root.push(createBorderElement("w:tr2bl", options.diagonalUp));
  }
};
var GridSpanAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", { val: "w:val" });
  }
};
var GridSpan = class extends XmlComponent {
  constructor(value) {
    super("w:gridSpan");
    this.root.push(new GridSpanAttributes({ val: decimalNumber(value) }));
  }
};
var VerticalMergeType = {
  /**
  * Cell that is merged with upper one.
  * This cell continues a vertical merge started by a cell above it.
  */
  CONTINUE: "continue",
  /**
  * Cell that is starting the vertical merge.
  * This cell begins a new vertical merge region.
  */
  RESTART: "restart"
};
var VerticalMergeAttributes = class extends XmlAttributeComponent {
  constructor(..._args2) {
    super(..._args2);
    _defineProperty2(this, "xmlKeys", { val: "w:val" });
  }
};
var VerticalMerge = class extends XmlComponent {
  constructor(value) {
    super("w:vMerge");
    this.root.push(new VerticalMergeAttributes({ val: value }));
  }
};
var TDirectionAttributes = class extends XmlAttributeComponent {
  constructor(..._args3) {
    super(..._args3);
    _defineProperty2(this, "xmlKeys", { val: "w:val" });
  }
};
var TDirection = class extends XmlComponent {
  constructor(value) {
    super("w:textDirection");
    this.root.push(new TDirectionAttributes({ val: value }));
  }
};
var TableCellProperties = class extends IgnoreIfEmptyXmlComponent {
  constructor(options) {
    super("w:tcPr", options.includeIfEmpty);
    _defineProperty2(this, "hasWidth", void 0);
    _defineProperty2(this, "hasColumnWidth", false);
    this.hasWidth = options.width !== void 0;
    if (options.width) this.root.push(createTableWidthElement("w:tcW", options.width));
    if (options.columnSpan) this.root.push(new GridSpan(options.columnSpan));
    if (options.verticalMerge) this.root.push(new VerticalMerge(options.verticalMerge));
    else if (options.rowSpan && options.rowSpan > 1) this.root.push(new VerticalMerge(VerticalMergeType.RESTART));
    if (options.borders) this.root.push(new TableCellBorders(options.borders));
    if (options.shading) this.root.push(createShading(options.shading));
    if (options.margins) {
      const cellMargin = createCellMargin(options.margins);
      if (cellMargin) this.root.push(cellMargin);
    }
    if (options.textDirection) this.root.push(new TDirection(options.textDirection));
    if (options.verticalAlign) this.root.push(createVerticalAlign(options.verticalAlign));
    if (options.insertion) this.root.push(new InsertedTableCell(options.insertion));
    if (options.deletion) this.root.push(new DeletedTableCell(options.deletion));
    if (options.cellMerge) this.root.push(new CellMerge(options.cellMerge));
    if (options.revision) this.root.push(new TableCellPropertiesChange(options.revision));
  }
  /**
  * Gives a cell without a width of its own the width of the table's columns it spans, in twips.
  *
  * @internal
  */
  setColumnWidth(twips) {
    if (this.hasWidth) return;
    this.root.splice(0, this.hasColumnWidth ? 1 : 0, createTableWidthElement("w:tcW", {
      size: twips,
      type: WidthType.DXA
    }));
    this.hasColumnWidth = true;
  }
};
var TableCellPropertiesChange = class extends XmlComponent {
  constructor(options) {
    super("w:tcPrChange");
    this.root.push(new ChangeAttributes({
      id: options.id,
      author: options.author,
      date: options.date
    }));
    this.root.push(new TableCellProperties(_objectSpread2(_objectSpread2({}, options), {}, { includeIfEmpty: true })));
  }
};
var TableCell = class extends XmlComponent {
  constructor(options) {
    super("w:tc");
    _defineProperty2(
      this,
      /**
      * The options the cell was created with.
      *
      * Its borders and shading are declared with hex colors, as they were before they took colors of the document's
      * theme, so that code reading them still compiles. A cell given a theme color has it here as it was given.
      */
      "options",
      void 0
    );
    _defineProperty2(this, "properties", void 0);
    this.options = options;
    this.properties = new TableCellProperties(options);
    this.root.push(this.properties);
    for (const child2 of options.children) this.root.push(child2);
  }
  /**
  * Gives the cell, unless it has a width of its own, the width of the table's columns it spans, in twips.
  *
  * @internal
  */
  setColumnWidth(twips) {
    this.properties.setColumnWidth(twips);
  }
  prepForXml(context) {
    if (elementOf(this.root[this.root.length - 1]) !== "w:p") this.root.push(new Paragraph({}));
    return super.prepForXml(context);
  }
};
var createOnOffOnlyElement = (name, value) => value ? new OnOffElement(name) : new StringValueElement(name, "off");
var CellSpacingType = {
  /** Value is in twentieths of a point */
  DXA: "dxa",
  /** No (empty) value. */
  NIL: "nil"
};
var createTableCellSpacing = ({ type = CellSpacingType.DXA, value }) => new BuilderElement({
  name: "w:tblCellSpacing",
  attributes: {
    type: {
      key: "w:type",
      value: type
    },
    value: {
      key: "w:w",
      value: measurementOrPercentValue(value)
    }
  }
});
var NONE_BORDER = {
  style: BorderStyle.NONE,
  size: 0,
  color: "auto"
};
var DEFAULT_BORDER = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: "auto"
};
var TableBorders = class extends IgnoreIfEmptyXmlComponent {
  constructor(options, { fillMissingSides = true } = {}) {
    super("w:tblBorders");
    const sides = [
      ["w:top", options.top],
      ["w:left", options.left],
      ["w:bottom", options.bottom],
      ["w:right", options.right],
      ["w:insideH", options.insideHorizontal],
      ["w:insideV", options.insideVertical]
    ];
    for (const [elementName, border] of sides) {
      const resolved = border !== null && border !== void 0 ? border : fillMissingSides ? DEFAULT_BORDER : void 0;
      if (resolved) this.root.push(createBorderElement(elementName, resolved));
    }
  }
};
_defineProperty2(TableBorders, "NONE", {
  top: NONE_BORDER,
  bottom: NONE_BORDER,
  left: NONE_BORDER,
  right: NONE_BORDER,
  insideHorizontal: NONE_BORDER,
  insideVertical: NONE_BORDER
});
var RelativeHorizontalPosition = {
  CENTER: "center",
  INSIDE: "inside",
  LEFT: "left",
  OUTSIDE: "outside",
  RIGHT: "right"
};
var RelativeVerticalPosition = {
  CENTER: "center",
  INSIDE: "inside",
  BOTTOM: "bottom",
  OUTSIDE: "outside",
  /**
  * In line with the text, with no text beside it. Word places a floating table lined up inline at the top of the
  * paragraph after it, with text beside it, so the table is written in line with the text instead.
  */
  INLINE: "inline",
  TOP: "top"
};
var createTableFloatProperties = ({ horizontalAnchor, verticalAnchor, absoluteHorizontalPosition, relativeHorizontalPosition, absoluteVerticalPosition, relativeVerticalPosition, bottomFromText, topFromText, leftFromText, rightFromText }) => new BuilderElement({
  name: "w:tblpPr",
  attributes: {
    leftFromText: {
      key: "w:leftFromText",
      value: leftFromText === void 0 ? void 0 : twipsMeasureValue(leftFromText)
    },
    rightFromText: {
      key: "w:rightFromText",
      value: rightFromText === void 0 ? void 0 : twipsMeasureValue(rightFromText)
    },
    topFromText: {
      key: "w:topFromText",
      value: topFromText === void 0 ? void 0 : twipsMeasureValue(topFromText)
    },
    bottomFromText: {
      key: "w:bottomFromText",
      value: bottomFromText === void 0 ? void 0 : twipsMeasureValue(bottomFromText)
    },
    absoluteHorizontalPosition: {
      key: "w:tblpX",
      value: absoluteHorizontalPosition === void 0 ? void 0 : signedTwipsMeasureValue(absoluteHorizontalPosition)
    },
    absoluteVerticalPosition: {
      key: "w:tblpY",
      value: absoluteVerticalPosition === void 0 ? void 0 : signedTwipsMeasureValue(absoluteVerticalPosition)
    },
    horizontalAnchor: {
      key: "w:horzAnchor",
      value: horizontalAnchor
    },
    relativeHorizontalPosition: {
      key: "w:tblpXSpec",
      value: relativeHorizontalPosition
    },
    relativeVerticalPosition: {
      key: "w:tblpYSpec",
      value: relativeVerticalPosition
    },
    verticalAnchor: {
      key: "w:vertAnchor",
      value: verticalAnchor
    }
  }
});
var createTableLayout = (type) => new BuilderElement({
  name: "w:tblLayout",
  attributes: { type: {
    key: "w:type",
    value: type
  } }
});
var createTableLook = ({ firstRow, lastRow, firstColumn, lastColumn, noHBand, noVBand }) => new BuilderElement({
  name: "w:tblLook",
  attributes: {
    firstRow: {
      key: "w:firstRow",
      value: firstRow
    },
    lastRow: {
      key: "w:lastRow",
      value: lastRow
    },
    firstColumn: {
      key: "w:firstColumn",
      value: firstColumn
    },
    lastColumn: {
      key: "w:lastColumn",
      value: lastColumn
    },
    noHBand: {
      key: "w:noHBand",
      value: noHBand
    },
    noVBand: {
      key: "w:noVBand",
      value: noVBand
    }
  }
});
var createTableOverlap = (overlap) => new BuilderElement({
  name: "w:tblOverlap",
  attributes: { val: {
    key: "w:val",
    value: overlap
  } }
});
var INLINE_ALIGNMENTS = {
  [RelativeHorizontalPosition.LEFT]: AlignmentType.LEFT,
  [RelativeHorizontalPosition.CENTER]: AlignmentType.CENTER,
  [RelativeHorizontalPosition.RIGHT]: AlignmentType.RIGHT
};
var TableProperties = class extends IgnoreIfEmptyXmlComponent {
  constructor(options) {
    var _options$float, _options$alignment, _options$float2;
    super("w:tblPr", options.includeIfEmpty);
    if (options.style) this.root.push(new StringValueElement("w:tblStyle", options.style));
    const inline2 = ((_options$float = options.float) === null || _options$float === void 0 ? void 0 : _options$float.relativeVerticalPosition) === RelativeVerticalPosition.INLINE;
    const float = inline2 ? void 0 : options.float;
    if (float) this.root.push(createTableFloatProperties(float));
    if (float === null || float === void 0 ? void 0 : float.overlap) this.root.push(createTableOverlap(float.overlap));
    if (options.visuallyRightToLeft !== void 0) this.root.push(createOnOffOnlyElement("w:bidiVisual", options.visuallyRightToLeft));
    if (options.width) this.root.push(createTableWidthElement("w:tblW", options.width));
    const alignment = (_options$alignment = options.alignment) !== null && _options$alignment !== void 0 ? _options$alignment : inline2 && ((_options$float2 = options.float) === null || _options$float2 === void 0 ? void 0 : _options$float2.relativeHorizontalPosition) ? INLINE_ALIGNMENTS[options.float.relativeHorizontalPosition] : void 0;
    if (alignment) this.root.push(createAlignment(alignment));
    if (options.cellSpacing) this.root.push(createTableCellSpacing(options.cellSpacing));
    if (options.indent) this.root.push(createTableWidthElement("w:tblInd", options.indent));
    if (options.borders) this.root.push(new TableBorders(options.borders, { fillMissingSides: !options.style }));
    if (options.shading) this.root.push(createShading(options.shading));
    if (options.layout) this.root.push(createTableLayout(options.layout));
    if (options.cellMargin) {
      const cellMargin = createTableCellMargin(options.cellMargin);
      if (cellMargin) this.root.push(cellMargin);
    }
    if (options.tableLook) this.root.push(createTableLook(options.tableLook));
    if (options.revision) this.root.push(new TablePropertiesChange(options.revision));
  }
};
var TablePropertiesChange = class extends XmlComponent {
  constructor(options) {
    super("w:tblPrChange");
    this.root.push(new ChangeAttributes({
      id: options.id,
      author: options.author,
      date: options.date
    }));
    this.root.push(new TableProperties(_objectSpread2(_objectSpread2({}, options), {}, { includeIfEmpty: true })));
  }
};
var createTableRowHeight = (value, rule) => new BuilderElement({
  name: "w:trHeight",
  attributes: {
    value: {
      key: "w:val",
      value: twipsMeasureValue(value)
    },
    rule: {
      key: "w:hRule",
      value: rule
    }
  }
});
var TableRowProperties = class extends IgnoreIfEmptyXmlComponent {
  constructor(options) {
    super("w:trPr", options.includeIfEmpty);
    if (options.cantSplit !== void 0) this.root.push(createOnOffOnlyElement("w:cantSplit", options.cantSplit));
    if (options.tableHeader !== void 0) this.root.push(createOnOffOnlyElement("w:tblHeader", options.tableHeader));
    if (options.height) this.root.push(createTableRowHeight(options.height.value, options.height.rule));
    if (options.cellSpacing) this.root.push(createTableCellSpacing(options.cellSpacing));
    if (options.insertion) this.root.push(new InsertedTableRow(options.insertion));
    if (options.deletion) this.root.push(new DeletedTableRow(options.deletion));
    if (options.revision) this.root.push(new TableRowPropertiesChange(options.revision));
  }
};
var TableRowPropertiesChange = class extends XmlComponent {
  constructor(options) {
    super("w:trPrChange");
    this.root.push(new ChangeAttributes({
      id: options.id,
      author: options.author,
      date: options.date
    }));
    this.root.push(new TableRowProperties(_objectSpread2(_objectSpread2({}, options), {}, { includeIfEmpty: true })));
  }
};
var childrenOf = (element, name) => {
  const content = element[name];
  return Array.isArray(content) ? content : [];
};
var nameOf$2 = (element) => Object.keys(element)[0];
var withKeepNext = (paragraph2, keepNext) => {
  const children = childrenOf(paragraph2, "w:p");
  const properties = children.find((child2) => nameOf$2(child2) === "w:pPr");
  if (!properties) return { "w:p": [{ "w:pPr": [keepNext] }, ...children] };
  const settings = childrenOf(properties, "w:pPr");
  if (settings.some((setting) => nameOf$2(setting) === "w:keepNext")) return paragraph2;
  const before = settings.filter((setting) => nameOf$2(setting) === "w:pStyle").length;
  const newProperties = { "w:pPr": [
    ...settings.slice(0, before),
    keepNext,
    ...settings.slice(before)
  ] };
  return { "w:p": children.map((child2) => child2 === properties ? newProperties : child2) };
};
var TableRow = class extends XmlComponent {
  constructor(options) {
    super("w:tr");
    _defineProperty2(this, "options", void 0);
    this.options = options;
    this.root.push(new TableRowProperties(options));
    for (const child2 of options.children) this.root.push(child2);
  }
  prepForXml(context) {
    if (this.cells.length === 0) return;
    const xml = super.prepForXml(context);
    if (!xml || this.options.keepNext === void 0) return xml;
    const keepNext = new OnOffElement("w:keepNext", this.options.keepNext).prepForXml(context);
    return { "w:tr": childrenOf(xml, "w:tr").map((child2) => nameOf$2(child2) === "w:tc" ? { "w:tc": childrenOf(child2, "w:tc").map((content) => nameOf$2(content) === "w:p" ? withKeepNext(content, keepNext) : content) } : child2) };
  }
  get CellCount() {
    return this.options.children.length;
  }
  get cells() {
    return this.root.filter((xmlComponent) => elementOf(xmlComponent) === "w:tc");
  }
  addCellToIndex(cell, index) {
    this.root.splice(index + 1, 0, cell);
  }
  addCellToColumnIndex(cell, columnIndex) {
    const rootIndex = this.columnIndexToRootIndex(columnIndex, true);
    this.addCellToIndex(cell, rootIndex - 1);
  }
  rootIndexToColumnIndex(rootIndex) {
    if (rootIndex < 1 || rootIndex >= this.root.length) throw new Error(`cell 'rootIndex' should between 1 to ${this.root.length - 1}`);
    let colIdx = 0;
    for (let rootIdx = 1; rootIdx < rootIndex; rootIdx++) {
      const cell = this.root[rootIdx];
      colIdx += cell.options.columnSpan || 1;
    }
    return colIdx;
  }
  columnIndexToRootIndex(columnIndex, allowEndNewCell = false) {
    if (columnIndex < 0) throw new Error(`cell 'columnIndex' should not less than zero`);
    let colIdx = 0;
    let rootIdx = 1;
    while (colIdx <= columnIndex) {
      if (rootIdx >= this.root.length) {
        if (allowEndNewCell) return this.root.length;
        else throw new Error(`cell 'columnIndex' should not great than ${colIdx - 1}`);
      }
      const cell = this.root[rootIdx];
      rootIdx += 1;
      colIdx += cell && cell.options.columnSpan || 1;
    }
    return rootIdx - 1;
  }
};
var Table = class Table2 extends FileChild {
  constructor({ rows, width, columnWidths, columnWidthsRevision, margins, indent, float, layout, style, borders, alignment, visuallyRightToLeft, tableLook, cellSpacing, revision }) {
    super("w:tbl");
    _defineProperty2(this, "rows", void 0);
    _defineProperty2(this, "width", void 0);
    _defineProperty2(this, "columnWidths", void 0);
    _defineProperty2(this, "columnWidthsRevision", void 0);
    _defineProperty2(
      this,
      /**
      * Grid column widths in twips: the explicit `columnWidths`, or the widths derived
      * from the table and cell widths (re-resolved against the actual page or parent
      * cell every time the table is serialized).
      */
      "resolvedColumnWidths",
      void 0
    );
    this.rows = rows;
    this.width = width !== null && width !== void 0 ? width : { size: 100 };
    this.columnWidths = columnWidths;
    this.columnWidthsRevision = columnWidthsRevision;
    rows.forEach((row, rowIndex) => {
      if (rowIndex === rows.length - 1) return;
      let columnIndex = 0;
      row.cells.forEach((cell) => {
        if (cell.options.rowSpan && cell.options.rowSpan > 1) {
          const lastChild = cell.options.children[cell.options.children.length - 1];
          const continueCell = new TableCell({
            rowSpan: cell.options.rowSpan - 1,
            columnSpan: cell.options.columnSpan,
            width: cell.options.width,
            borders: cell.options.borders,
            shading: cell.options.shading,
            margins: cell.options.margins,
            textDirection: cell.options.textDirection,
            verticalAlign: cell.options.verticalAlign,
            children: lastChild instanceof Paragraph ? [new Paragraph(lastChild.Alignment)] : [],
            verticalMerge: VerticalMergeType.CONTINUE
          });
          rows[rowIndex + 1].addCellToColumnIndex(continueCell, columnIndex);
        }
        columnIndex += cell.options.columnSpan || 1;
      });
    });
    this.setCellWidths(DEFAULT_AVAILABLE_WIDTH);
    this.resolvedColumnWidths = columnWidths !== null && columnWidths !== void 0 ? columnWidths : resolveColumnWidths({
      rows,
      width: this.width,
      availableWidth: DEFAULT_AVAILABLE_WIDTH
    });
    this.root.push(new TableProperties({
      borders: style ? borders : borders !== null && borders !== void 0 ? borders : {},
      width: this.width,
      indent,
      float,
      layout,
      style,
      alignment,
      cellMargin: margins,
      visuallyRightToLeft,
      tableLook,
      cellSpacing,
      revision
    }));
    this.root.push(new TableGrid(this.resolvedColumnWidths, columnWidthsRevision));
    for (const row of rows) this.root.push(row);
  }
  /**
  * Widths of the grid columns in twips, as they will be written to `w:tblGrid`.
  *
  * These are the explicit `columnWidths` when given, otherwise the widths derived
  * from the table and cell widths. Derived widths are resolved against the page (or
  * the parent cell for nested tables) during serialization, so before that they
  * reflect the default page size.
  */
  get ColumnWidths() {
    return this.resolvedColumnWidths;
  }
  /**
  * Width in twips, according to the grid, of a cell in one of this table's rows.
  *
  * Used by nested tables to resolve their own widths against the cell they sit in.
  *
  * @param row - A row of this table
  * @param cell - A cell of that row
  * @returns The summed width of the grid columns the cell spans, or undefined if the cell cannot be located on the grid
  */
  getCellWidth(row, cell) {
    const { cells } = row;
    const cellIndex = cells.indexOf(cell);
    if (cellIndex === -1) return;
    const start = cells.slice(0, cellIndex).reduce((column, previous) => column + (previous.options.columnSpan || 1), 0);
    const columns = this.resolvedColumnWidths.slice(start, start + (cell.options.columnSpan || 1));
    return columns.length === 0 ? void 0 : columns.reduce((sum, columnWidth) => sum + columnWidth, 0);
  }
  /**
  * Resolves derived grid column widths against the width actually available to the
  * table (the section's text width, or the parent cell for nested tables) before
  * serializing.
  */
  prepForXml(context) {
    this.setCellWidths(this.resolveAvailableWidth(context));
    if (this.columnWidths === void 0) {
      this.resolvedColumnWidths = resolveColumnWidths({
        rows: this.rows,
        width: this.width,
        availableWidth: this.resolveAvailableWidth(context)
      });
      const gridIndex = this.root.findIndex((component) => component instanceof TableGrid);
      this.root[gridIndex] = new TableGrid(this.resolvedColumnWidths, this.columnWidthsRevision);
    }
    return super.prepForXml(context);
  }
  /**
  * Gives each cell without a width of its own the width of the `columnWidths` it spans, as Word sizes the columns of
  * cells without a width to their content, whatever the grid says. When the table's width is wider than the columns
  * add up to, they are scaled up to fill it, as Word and LibreOffice lay them out, so columns given as proportions
  * keep them.
  */
  setCellWidths(availableWidth) {
    var _resolvePreferredWidt;
    if (this.columnWidths === void 0) return;
    const total = this.columnWidths.reduce((sum, columnWidth) => sum + columnWidth, 0);
    const tableWidth = (_resolvePreferredWidt = resolvePreferredWidth(this.width, availableWidth)) !== null && _resolvePreferredWidt !== void 0 ? _resolvePreferredWidt : 0;
    const scale = total > 0 && tableWidth > total ? tableWidth / total : 1;
    for (const row of this.rows) {
      let column = 0;
      for (const cell of row.cells) {
        const span = cell.options.columnSpan || 1;
        const spanned = this.columnWidths.slice(column, column + span);
        const cellWidth = Math.round(spanned.reduce((sum, columnWidth) => sum + columnWidth, 0) * scale);
        if (spanned.length === span && cellWidth > 0) cell.setColumnWidth(cellWidth);
        column += span;
      }
    }
  }
  /**
  * Finds the width in twips available to this table from the serialization context:
  * the parent cell for a nested table, otherwise the text width of the section the
  * table belongs to (the first section for headers, footers and other parts). Falls
  * back to the default page when the context carries no document.
  */
  resolveAvailableWidth(context) {
    var _context$file, _stack, _section$AvailableTex;
    const { stack } = context;
    const cell = stack[stack.length - 1];
    const row = stack[stack.length - 2];
    const parentTable = stack[stack.length - 3];
    if (cell instanceof TableCell && row instanceof TableRow && parentTable instanceof Table2) {
      const cellWidth = parentTable.getCellWidth(row, cell);
      if (cellWidth !== void 0) return cellWidth;
    }
    const bodyIndex = stack.findIndex((component) => component instanceof Body);
    const documentBody = (_context$file = context.file) === null || _context$file === void 0 || (_context$file = _context$file.Document) === null || _context$file === void 0 ? void 0 : _context$file.View.Body;
    const section = bodyIndex >= 0 ? stack[bodyIndex].getSectionPropertiesFor((_stack = stack[bodyIndex + 1]) !== null && _stack !== void 0 ? _stack : this) : documentBody === null || documentBody === void 0 ? void 0 : documentBody.getSectionPropertiesFor();
    return (_section$AvailableTex = section === null || section === void 0 ? void 0 : section.AvailableTextWidth) !== null && _section$AvailableTex !== void 0 ? _section$AvailableTex : DEFAULT_AVAILABLE_WIDTH;
  }
};
var AppPropertiesAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      xmlns: "xmlns",
      vt: "xmlns:vt"
    });
  }
};
var AppProperties = class extends XmlComponent {
  constructor() {
    super("Properties");
    this.root.push(new AppPropertiesAttributes({
      xmlns: "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties",
      vt: "http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"
    }));
  }
};
var ContentTypeAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", { xmlns: "xmlns" });
  }
};
var createDefault = (contentType, extension) => new BuilderElement({
  name: "Default",
  attributes: {
    contentType: {
      key: "ContentType",
      value: contentType
    },
    extension: {
      key: "Extension",
      value: extension
    }
  }
});
var createOverride = (contentType, partName) => new BuilderElement({
  name: "Override",
  attributes: {
    contentType: {
      key: "ContentType",
      value: contentType
    },
    partName: {
      key: "PartName",
      value: partName
    }
  }
});
var ContentTypes = class extends XmlComponent {
  /**
  * @param options.macros - Whether the document has VBA macros, which makes its main part a macro-enabled document
  * and adds the VBA project (word/vbaProject.bin)
  */
  constructor({ macros = false } = {}) {
    super("Types");
    this.root.push(new ContentTypeAttributes({ xmlns: "http://schemas.openxmlformats.org/package/2006/content-types" }));
    this.root.push(createDefault("image/png", "png"));
    this.root.push(createDefault("image/jpeg", "jpeg"));
    this.root.push(createDefault("image/jpeg", "jpg"));
    this.root.push(createDefault("image/bmp", "bmp"));
    this.root.push(createDefault("image/gif", "gif"));
    this.root.push(createDefault("image/svg+xml", "svg"));
    this.root.push(createDefault("application/vnd.openxmlformats-package.relationships+xml", "rels"));
    this.root.push(createDefault("application/xml", "xml"));
    this.root.push(createDefault("application/vnd.openxmlformats-officedocument.obfuscatedFont", "odttf"));
    this.root.push(createOverride(macros ? "application/vnd.ms-word.document.macroEnabled.main+xml" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml", "/word/document.xml"));
    this.root.push(createOverride("application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml", "/word/styles.xml"));
    this.root.push(createOverride("application/vnd.openxmlformats-package.core-properties+xml", "/docProps/core.xml"));
    this.root.push(createOverride("application/vnd.openxmlformats-officedocument.custom-properties+xml", "/docProps/custom.xml"));
    this.root.push(createOverride("application/vnd.openxmlformats-officedocument.extended-properties+xml", "/docProps/app.xml"));
    this.root.push(createOverride("application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml", "/word/numbering.xml"));
    this.root.push(createOverride("application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml", "/word/footnotes.xml"));
    this.root.push(createOverride("application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml", "/word/endnotes.xml"));
    this.root.push(createOverride("application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml", "/word/settings.xml"));
    this.root.push(createOverride("application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml", "/word/fontTable.xml"));
    this.root.push(createOverride("application/vnd.openxmlformats-officedocument.theme+xml", "/word/theme/theme1.xml"));
    if (macros) this.root.push(createOverride("application/vnd.ms-office.vbaProject", "/word/vbaProject.bin"));
  }
  /**
  * Registers the comments part in the content types.
  */
  addComments() {
    this.root.push(createOverride("application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml", "/word/comments.xml"));
  }
  /**
  * Registers the commentsExtended part in the content types.
  */
  addCommentsExtended() {
    this.root.push(createOverride("application/vnd.openxmlformats-officedocument.wordprocessingml.commentsExtended+xml", "/word/commentsExtended.xml"));
  }
  /**
  * Registers the commentsIds part in the content types.
  */
  addCommentsIds() {
    this.root.push(createOverride("application/vnd.openxmlformats-officedocument.wordprocessingml.commentsIds+xml", "/word/commentsIds.xml"));
  }
  /**
  * Registers a footer part in the content types.
  *
  * @param index - Footer index number (e.g., 1 for footer1.xml)
  */
  addFooter(index) {
    this.root.push(createOverride("application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml", `/word/footer${index}.xml`));
  }
  /**
  * Registers a part by its name, such as a chart or an embedded workbook that a drawing adds to the package.
  *
  * @param contentType - The part's content type
  * @param partName - The part's name, from the root of the package, such as "/word/charts/chart1.xml"
  */
  addOverride(contentType, partName) {
    this.root.push(createOverride(contentType, partName));
  }
  /**
  * Registers a header part in the content types.
  *
  * @param index - Header index number (e.g., 1 for header1.xml)
  */
  addHeader(index) {
    this.root.push(createOverride("application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml", `/word/header${index}.xml`));
  }
};
var DocumentAttributeNamespaces = {
  wpc: "http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas",
  mc: "http://schemas.openxmlformats.org/markup-compatibility/2006",
  o: "urn:schemas-microsoft-com:office:office",
  r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
  m: "http://schemas.openxmlformats.org/officeDocument/2006/math",
  v: "urn:schemas-microsoft-com:vml",
  wp14: "http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing",
  wp: "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
  w10: "urn:schemas-microsoft-com:office:word",
  w: "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
  w14: "http://schemas.microsoft.com/office/word/2010/wordml",
  w15: "http://schemas.microsoft.com/office/word/2012/wordml",
  wpg: "http://schemas.microsoft.com/office/word/2010/wordprocessingGroup",
  wpi: "http://schemas.microsoft.com/office/word/2010/wordprocessingInk",
  wne: "http://schemas.microsoft.com/office/word/2006/wordml",
  wps: "http://schemas.microsoft.com/office/word/2010/wordprocessingShape",
  cp: "http://schemas.openxmlformats.org/package/2006/metadata/core-properties",
  dc: "http://purl.org/dc/elements/1.1/",
  dcterms: "http://purl.org/dc/terms/",
  dcmitype: "http://purl.org/dc/dcmitype/",
  xsi: "http://www.w3.org/2001/XMLSchema-instance",
  cx: "http://schemas.microsoft.com/office/drawing/2014/chartex",
  cx1: "http://schemas.microsoft.com/office/drawing/2015/9/8/chartex",
  cx2: "http://schemas.microsoft.com/office/drawing/2015/10/21/chartex",
  cx3: "http://schemas.microsoft.com/office/drawing/2016/5/9/chartex",
  cx4: "http://schemas.microsoft.com/office/drawing/2016/5/10/chartex",
  cx5: "http://schemas.microsoft.com/office/drawing/2016/5/11/chartex",
  cx6: "http://schemas.microsoft.com/office/drawing/2016/5/12/chartex",
  cx7: "http://schemas.microsoft.com/office/drawing/2016/5/13/chartex",
  cx8: "http://schemas.microsoft.com/office/drawing/2016/5/14/chartex",
  aink: "http://schemas.microsoft.com/office/drawing/2016/ink",
  am3d: "http://schemas.microsoft.com/office/drawing/2017/model3d",
  w16cex: "http://schemas.microsoft.com/office/word/2018/wordml/cex",
  w16cid: "http://schemas.microsoft.com/office/word/2016/wordml/cid",
  w16: "http://schemas.microsoft.com/office/word/2018/wordml",
  w16sdtdh: "http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash",
  w16se: "http://schemas.microsoft.com/office/word/2015/wordml/symex"
};
var DocumentAttributes = class extends XmlAttributeComponent {
  constructor(ns, Ignorable) {
    super(_objectSpread2({ Ignorable }, Object.fromEntries(ns.map((n) => [n, DocumentAttributeNamespaces[n]]))));
    _defineProperty2(this, "xmlKeys", _objectSpread2({ Ignorable: "mc:Ignorable" }, Object.fromEntries(Object.keys(DocumentAttributeNamespaces).map((key) => [key, `xmlns:${key}`]))));
  }
};
var CoreProperties = class extends XmlComponent {
  constructor(options) {
    super("cp:coreProperties");
    this.root.push(new DocumentAttributes([
      "cp",
      "dc",
      "dcterms",
      "dcmitype",
      "xsi"
    ]));
    if (options.title) this.root.push(new StringContainer("dc:title", options.title));
    if (options.subject) this.root.push(new StringContainer("dc:subject", options.subject));
    if (options.creator) this.root.push(new StringContainer("dc:creator", options.creator));
    if (options.keywords) this.root.push(new StringContainer("cp:keywords", options.keywords));
    if (options.description) this.root.push(new StringContainer("dc:description", options.description));
    if (options.lastModifiedBy) this.root.push(new StringContainer("cp:lastModifiedBy", options.lastModifiedBy));
    if (options.revision) this.root.push(new StringContainer("cp:revision", String(options.revision)));
    this.root.push(new TimestampElement("dcterms:created"));
    this.root.push(new TimestampElement("dcterms:modified"));
  }
};
var TimestampElementProperties = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", { type: "xsi:type" });
  }
};
var TimestampElement = class extends XmlComponent {
  constructor(name) {
    super(name);
    this.root.push(new TimestampElementProperties({ type: "dcterms:W3CDTF" }));
    this.root.push(dateTimeValue(/* @__PURE__ */ new Date()));
  }
};
var CustomPropertiesAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      xmlns: "xmlns",
      vt: "xmlns:vt"
    });
  }
};
var CustomPropertyAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      formatId: "fmtid",
      pid: "pid",
      name: "name"
    });
  }
};
var CustomProperty = class extends XmlComponent {
  constructor(id, properties) {
    super("property");
    this.root.push(new CustomPropertyAttributes({
      formatId: "{D5CDD505-2E9C-101B-9397-08002B2CF9AE}",
      pid: id.toString(),
      name: properties.name
    }));
    this.root.push(new CustomPropertyValue(properties.value));
  }
};
var CustomPropertyValue = class extends XmlComponent {
  constructor(value) {
    super("vt:lpwstr");
    this.root.push(value);
  }
};
var CustomProperties = class extends XmlComponent {
  constructor(properties) {
    super("Properties");
    _defineProperty2(this, "nextId", void 0);
    _defineProperty2(this, "properties", []);
    this.root.push(new CustomPropertiesAttributes({
      xmlns: "http://schemas.openxmlformats.org/officeDocument/2006/custom-properties",
      vt: "http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"
    }));
    this.nextId = 2;
    for (const property of properties) this.addCustomProperty(property);
  }
  prepForXml(context) {
    this.root.splice(1, this.root.length - 1, ...this.properties);
    return super.prepForXml(context);
  }
  addCustomProperty(property) {
    this.properties.push(new CustomProperty(this.nextId++, property));
  }
};
var createSourcesProperties = (itemId) => new BuilderElement({
  name: "ds:datastoreItem",
  attributes: {
    itemId: {
      key: "ds:itemID",
      value: itemId
    },
    namespace: {
      key: "xmlns:ds",
      value: "http://schemas.openxmlformats.org/officeDocument/2006/customXml"
    }
  },
  children: [new BuilderElement({
    name: "ds:schemaRefs",
    children: [new BuilderElement({
      name: "ds:schemaRef",
      attributes: { uri: {
        key: "ds:uri",
        value: "http://schemas.openxmlformats.org/officeDocument/2006/bibliography"
      } }
    })]
  })]
});
var EVENT_ELEMENTS = {
  new: "wne:eventDocNew",
  open: "wne:eventDocOpen",
  close: "wne:eventDocClose",
  sync: "wne:eventDocSync",
  xmlAfterInsert: "wne:eventDocXmlAfterInsert",
  xmlBeforeDelete: "wne:eventDocXmlBeforeDelete",
  contentControlAfterAdd: "wne:eventDocContentControlAfterInsert",
  contentControlBeforeDelete: "wne:eventDocContentControlBeforeDelete",
  contentControlOnExit: "wne:eventDocContentControlOnExit",
  contentControlOnEnter: "wne:eventDocContentControlOnEnter",
  contentControlBeforeStoreUpdate: "wne:eventDocStoreUpdate",
  contentControlBeforeContentUpdate: "wne:eventDocContentControlContentUpdate",
  buildingBlockInsert: "wne:eventDocBuildingBlockAfterInsert"
};
var createMacroEvents = (events) => new BuilderElement({
  name: "wne:vbaSuppData",
  attributes: { namespace: {
    key: "xmlns:wne",
    value: "http://schemas.microsoft.com/office/word/2006/wordml"
  } },
  children: [new BuilderElement({
    name: "wne:docEvents",
    children: Object.entries(EVENT_ELEMENTS).filter(([event]) => events.includes(event)).map(([, name]) => new BuilderElement({ name }))
  })]
});
var DocumentBackground = class extends XmlComponent {
  /**
  * @throws If a color isn't valid, or `color` is a theme color and `themeColor`, `themeShade` or `themeTint` is given
  */
  constructor({ color, themeColor, themeShade, themeTint }) {
    super("w:background");
    if (typeof color === "object" && (themeColor !== void 0 || themeShade !== void 0 || themeTint !== void 0)) throw new Error("Invalid background. Expected a theme color in color, or themeColor, themeShade and themeTint, not both");
    this.root.push(new ColorAttributeComponent([
      {
        keys: COLOR_ATTRIBUTES,
        color
      },
      {
        key: "w:themeColor",
        value: themeColor
      },
      {
        key: "w:themeShade",
        value: themeShade === void 0 ? void 0 : uCharHexNumber(themeShade)
      },
      {
        key: "w:themeTint",
        value: themeTint === void 0 ? void 0 : uCharHexNumber(themeTint)
      }
    ]));
  }
};
var Document = class extends XmlComponent {
  constructor(options) {
    super("w:document");
    _defineProperty2(this, "body", void 0);
    this.root.push(new DocumentAttributes([
      "wpc",
      "mc",
      "o",
      "r",
      "m",
      "v",
      "wp14",
      "wp",
      "w10",
      "w",
      "w14",
      "w15",
      "wpg",
      "wpi",
      "wne",
      "wps",
      "cx",
      "cx1",
      "cx2",
      "cx3",
      "cx4",
      "cx5",
      "cx6",
      "cx7",
      "cx8",
      "aink",
      "am3d",
      "w16cex",
      "w16cid",
      "w16",
      "w16sdtdh",
      "w16se"
    ], "w14 w15 wp14"));
    this.body = new Body({ pageNumbers: options.pageNumbers });
    if (options.background) this.root.push(new DocumentBackground(options.background));
    this.root.push(this.body);
  }
  /**
  * Adds a block-level element to the document body.
  *
  * @param item - The element to add (paragraph, table, table of contents, hyperlink, or any other file child)
  * @returns The Document instance for method chaining
  */
  add(item) {
    this.body.push(item);
    return this;
  }
  /**
  * Gets the document body element.
  *
  * @returns The Body instance containing all document content
  */
  get Body() {
    return this.body;
  }
};
var DocumentWrapper = class {
  constructor(options) {
    _defineProperty2(this, "document", void 0);
    _defineProperty2(this, "relationships", void 0);
    this.document = new Document(options);
    this.relationships = new Relationships();
  }
  get View() {
    return this.document;
  }
  get Relationships() {
    return this.relationships;
  }
};
var ContinuationSeperator = class extends XmlComponent {
  constructor() {
    super("w:continuationSeparator");
  }
};
var ContinuationSeperatorRun = class extends Run {
  constructor() {
    super({});
    this.root.push(new ContinuationSeperator());
  }
};
var Seperator = class extends XmlComponent {
  constructor() {
    super("w:separator");
  }
};
var SeperatorRun = class extends Run {
  constructor() {
    super({});
    this.root.push(new Seperator());
  }
};
var FirstNoteParagraph = class extends XmlComponent {
  constructor(paragraph2, mark) {
    super("w:p");
    _defineProperty2(this, "paragraph", void 0);
    _defineProperty2(this, "mark", void 0);
    this.paragraph = paragraph2;
    this.mark = mark;
  }
  prepForXml(context) {
    const content = this.paragraph.prepForXml(context)["w:p"];
    const children = Array.isArray(content) ? content : [];
    const index = children.length > 0 && "w:pPr" in children[0] ? 1 : 0;
    return { "w:p": [
      ...children.slice(0, index),
      this.mark.prepForXml(context),
      ...children.slice(index)
    ] };
  }
};
var EndnoteAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      type: "w:type",
      id: "w:id"
    });
  }
};
var EndnoteRefRun = class extends Run {
  constructor() {
    super({ style: "EndnoteReference" });
    this.root.push(new EndnoteReference());
  }
};
var EndnoteType = {
  SEPARATOR: "separator",
  CONTINUATION_SEPARATOR: "continuationSeparator"
};
var Endnote = class extends XmlComponent {
  constructor(options) {
    super("w:endnote");
    this.root.push(new EndnoteAttributes({
      type: options.type,
      id: options.id
    }));
    for (const [index, child2] of options.children.entries()) this.root.push(index === 0 ? new FirstNoteParagraph(child2, new EndnoteRefRun()) : child2);
  }
};
var EndnotesAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      wpc: "xmlns:wpc",
      mc: "xmlns:mc",
      o: "xmlns:o",
      r: "xmlns:r",
      m: "xmlns:m",
      v: "xmlns:v",
      wp14: "xmlns:wp14",
      wp: "xmlns:wp",
      w10: "xmlns:w10",
      w: "xmlns:w",
      w14: "xmlns:w14",
      w15: "xmlns:w15",
      wpg: "xmlns:wpg",
      wpi: "xmlns:wpi",
      wne: "xmlns:wne",
      wps: "xmlns:wps",
      Ignorable: "mc:Ignorable"
    });
  }
};
var Endnotes = class extends XmlComponent {
  constructor() {
    super("w:endnotes");
    _defineProperty2(this, "ownNotes", /* @__PURE__ */ new Map());
    _defineProperty2(this, "highestId", 0);
    this.root.push(new EndnotesAttributes({
      wpc: "http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas",
      mc: "http://schemas.openxmlformats.org/markup-compatibility/2006",
      o: "urn:schemas-microsoft-com:office:office",
      r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      m: "http://schemas.openxmlformats.org/officeDocument/2006/math",
      v: "urn:schemas-microsoft-com:vml",
      wp14: "http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing",
      wp: "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
      w10: "urn:schemas-microsoft-com:office:word",
      w: "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
      w14: "http://schemas.microsoft.com/office/word/2010/wordml",
      w15: "http://schemas.microsoft.com/office/word/2012/wordml",
      wpg: "http://schemas.microsoft.com/office/word/2010/wordprocessingGroup",
      wpi: "http://schemas.microsoft.com/office/word/2010/wordprocessingInk",
      wne: "http://schemas.microsoft.com/office/word/2006/wordml",
      wps: "http://schemas.microsoft.com/office/word/2010/wordprocessingShape",
      Ignorable: "w14 w15 wp14"
    }));
    const begin = new Endnote({
      id: -1,
      type: EndnoteType.SEPARATOR,
      children: [new Paragraph({
        spacing: {
          after: 0,
          line: 240,
          lineRule: LineRuleType.AUTO
        },
        children: [new SeperatorRun()]
      })]
    });
    this.root.push(begin);
    const spacing = new Endnote({
      id: 0,
      type: EndnoteType.CONTINUATION_SEPARATOR,
      children: [new Paragraph({
        spacing: {
          after: 0,
          line: 240,
          lineRule: LineRuleType.AUTO
        },
        children: [new ContinuationSeperatorRun()]
      })]
    });
    this.root.push(spacing);
  }
  createEndnote(id, paragraph2) {
    const endnote = new Endnote({
      id,
      children: paragraph2
    });
    this.root.push(endnote);
    if (Number.isFinite(id)) this.highestId = Math.max(this.highestId, Math.floor(id));
  }
  /**
  * The id of the endnote that a reference run brings with it, which is added to the endnotes the first time the run
  * is written, with an id no other endnote has. Word has endnotes only in a document's body, so a run written
  * anywhere else, such as in a header, has none, and its endnote isn't added.
  *
  * @internal
  * @param reference - The run, which has the same endnote each time it is written
  * @param endnote - The endnote's content
  * @param context - The context the run is written in
  * @returns The endnote's id, or undefined outside the document's body
  */
  idOf(reference2, endnote, context) {
    if (context.viewWrapper !== context.file.Document) return;
    const existing = this.ownNotes.get(reference2);
    if (existing !== void 0) return existing;
    const id = this.highestId + 1;
    this.createEndnote(id, endnote.children);
    this.ownNotes.set(reference2, id);
    return id;
  }
  /**
  * Formats the endnotes, with the page numbers worked out for their document written into their fields, when the
  * document's body is written with an estimate of its pages.
  */
  prepForXml(context) {
    const xml = super.prepForXml(context);
    fillPartPageNumbers(xml, context);
    return xml;
  }
};
var EndnotesWrapper = class {
  constructor() {
    _defineProperty2(this, "endnotes", void 0);
    _defineProperty2(this, "relationships", void 0);
    this.endnotes = new Endnotes();
    this.relationships = new Relationships();
  }
  get View() {
    return this.endnotes;
  }
  get Relationships() {
    return this.relationships;
  }
};
var FooterAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      wpc: "xmlns:wpc",
      mc: "xmlns:mc",
      o: "xmlns:o",
      r: "xmlns:r",
      m: "xmlns:m",
      v: "xmlns:v",
      wp14: "xmlns:wp14",
      wp: "xmlns:wp",
      w10: "xmlns:w10",
      w: "xmlns:w",
      w14: "xmlns:w14",
      w15: "xmlns:w15",
      wpg: "xmlns:wpg",
      wpi: "xmlns:wpi",
      wne: "xmlns:wne",
      wps: "xmlns:wps",
      cp: "xmlns:cp",
      dc: "xmlns:dc",
      dcterms: "xmlns:dcterms",
      dcmitype: "xmlns:dcmitype",
      xsi: "xmlns:xsi",
      type: "xsi:type"
    });
  }
};
var Footer$1 = class extends InitializableXmlComponent {
  constructor(referenceNumber, initContent) {
    super("w:ftr", initContent);
    _defineProperty2(this, "refId", void 0);
    this.refId = referenceNumber;
    if (!initContent) this.root.push(new FooterAttributes({
      wpc: "http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas",
      mc: "http://schemas.openxmlformats.org/markup-compatibility/2006",
      o: "urn:schemas-microsoft-com:office:office",
      r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      m: "http://schemas.openxmlformats.org/officeDocument/2006/math",
      v: "urn:schemas-microsoft-com:vml",
      wp14: "http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing",
      wp: "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
      w10: "urn:schemas-microsoft-com:office:word",
      w: "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
      w14: "http://schemas.microsoft.com/office/word/2010/wordml",
      w15: "http://schemas.microsoft.com/office/word/2012/wordml",
      wpg: "http://schemas.microsoft.com/office/word/2010/wordprocessingGroup",
      wpi: "http://schemas.microsoft.com/office/word/2010/wordprocessingInk",
      wne: "http://schemas.microsoft.com/office/word/2006/wordml",
      wps: "http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
    }));
  }
  get ReferenceId() {
    return this.refId;
  }
  add(item) {
    this.root.push(item);
  }
  /**
  * Formats the footer, with the page numbers worked out for its document written into its fields, when the document's
  * body is written with an estimate of its pages.
  */
  prepForXml(context) {
    const xml = super.prepForXml(context);
    fillPartPageNumbers(xml, context, this.refId);
    return xml;
  }
};
var FooterWrapper = class {
  constructor(media, referenceId, initContent) {
    _defineProperty2(this, "media", void 0);
    _defineProperty2(this, "footer", void 0);
    _defineProperty2(this, "relationships", void 0);
    this.media = media;
    this.footer = new Footer$1(referenceId, initContent);
    this.relationships = new Relationships();
  }
  add(item) {
    this.footer.add(item);
  }
  addChildElement(childElement) {
    this.footer.addChildElement(childElement);
  }
  get View() {
    return this.footer;
  }
  get Relationships() {
    return this.relationships;
  }
  get Media() {
    return this.media;
  }
};
var FootnoteAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      type: "w:type",
      id: "w:id"
    });
  }
};
var FootnoteRef = class extends XmlComponent {
  constructor() {
    super("w:footnoteRef");
  }
};
var FootnoteRefRun = class extends Run {
  constructor() {
    super({ style: "FootnoteReference" });
    this.root.push(new FootnoteRef());
  }
};
var FootnoteType = {
  /** Separator line between body text and footnotes */
  SEPERATOR: "separator",
  /** Continuation separator for footnotes spanning pages */
  CONTINUATION_SEPERATOR: "continuationSeparator"
};
var Footnote = class extends XmlComponent {
  constructor(options) {
    super("w:footnote");
    this.root.push(new FootnoteAttributes({
      type: options.type,
      id: options.id
    }));
    for (const [index, child2] of options.children.entries()) this.root.push(index === 0 ? new FirstNoteParagraph(child2, new FootnoteRefRun()) : child2);
  }
};
var FootnotesAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      wpc: "xmlns:wpc",
      mc: "xmlns:mc",
      o: "xmlns:o",
      r: "xmlns:r",
      m: "xmlns:m",
      v: "xmlns:v",
      wp14: "xmlns:wp14",
      wp: "xmlns:wp",
      w10: "xmlns:w10",
      w: "xmlns:w",
      w14: "xmlns:w14",
      w15: "xmlns:w15",
      wpg: "xmlns:wpg",
      wpi: "xmlns:wpi",
      wne: "xmlns:wne",
      wps: "xmlns:wps",
      Ignorable: "mc:Ignorable"
    });
  }
};
var FootNotes = class extends XmlComponent {
  constructor() {
    super("w:footnotes");
    _defineProperty2(this, "ownNotes", /* @__PURE__ */ new Map());
    _defineProperty2(this, "highestId", 0);
    this.root.push(new FootnotesAttributes({
      wpc: "http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas",
      mc: "http://schemas.openxmlformats.org/markup-compatibility/2006",
      o: "urn:schemas-microsoft-com:office:office",
      r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      m: "http://schemas.openxmlformats.org/officeDocument/2006/math",
      v: "urn:schemas-microsoft-com:vml",
      wp14: "http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing",
      wp: "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
      w10: "urn:schemas-microsoft-com:office:word",
      w: "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
      w14: "http://schemas.microsoft.com/office/word/2010/wordml",
      w15: "http://schemas.microsoft.com/office/word/2012/wordml",
      wpg: "http://schemas.microsoft.com/office/word/2010/wordprocessingGroup",
      wpi: "http://schemas.microsoft.com/office/word/2010/wordprocessingInk",
      wne: "http://schemas.microsoft.com/office/word/2006/wordml",
      wps: "http://schemas.microsoft.com/office/word/2010/wordprocessingShape",
      Ignorable: "w14 w15 wp14"
    }));
    const begin = new Footnote({
      id: -1,
      type: FootnoteType.SEPERATOR,
      children: [new Paragraph({
        spacing: {
          after: 0,
          line: 240,
          lineRule: LineRuleType.AUTO
        },
        children: [new SeperatorRun()]
      })]
    });
    this.root.push(begin);
    const spacing = new Footnote({
      id: 0,
      type: FootnoteType.CONTINUATION_SEPERATOR,
      children: [new Paragraph({
        spacing: {
          after: 0,
          line: 240,
          lineRule: LineRuleType.AUTO
        },
        children: [new ContinuationSeperatorRun()]
      })]
    });
    this.root.push(spacing);
  }
  /**
  * Creates and adds a new footnote to the collection.
  *
  * @param id - Unique numeric identifier for the footnote
  * @param paragraph - Array of paragraphs that make up the footnote content
  */
  createFootNote(id, paragraph2) {
    const footnote = new Footnote({
      id,
      children: paragraph2
    });
    this.root.push(footnote);
    if (Number.isFinite(id)) this.highestId = Math.max(this.highestId, Math.floor(id));
  }
  /**
  * The id of the footnote that a reference run brings with it, which is added to the footnotes the first time the
  * run is written, with an id no other footnote has. Word has footnotes only in a document's body, so a run written
  * anywhere else, such as in a header, has none, and its footnote isn't added.
  *
  * @internal
  * @param reference - The run, which has the same footnote each time it is written
  * @param footnote - The footnote's content
  * @param context - The context the run is written in
  * @returns The footnote's id, or undefined outside the document's body
  */
  idOf(reference2, footnote, context) {
    if (context.viewWrapper !== context.file.Document) return;
    const existing = this.ownNotes.get(reference2);
    if (existing !== void 0) return existing;
    const id = this.highestId + 1;
    this.createFootNote(id, footnote.children);
    this.ownNotes.set(reference2, id);
    return id;
  }
  /**
  * Formats the footnotes, with the page numbers worked out for their document written into their fields, when the
  * document's body is written with an estimate of its pages.
  */
  prepForXml(context) {
    const xml = super.prepForXml(context);
    fillPartPageNumbers(xml, context);
    return xml;
  }
};
var FootnotesWrapper = class {
  constructor() {
    _defineProperty2(this, "footnotess", void 0);
    _defineProperty2(this, "relationships", void 0);
    this.footnotess = new FootNotes();
    this.relationships = new Relationships();
  }
  get View() {
    return this.footnotess;
  }
  get Relationships() {
    return this.relationships;
  }
};
var HeaderAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      wpc: "xmlns:wpc",
      mc: "xmlns:mc",
      o: "xmlns:o",
      r: "xmlns:r",
      m: "xmlns:m",
      v: "xmlns:v",
      wp14: "xmlns:wp14",
      wp: "xmlns:wp",
      w10: "xmlns:w10",
      w: "xmlns:w",
      w14: "xmlns:w14",
      w15: "xmlns:w15",
      wpg: "xmlns:wpg",
      wpi: "xmlns:wpi",
      wne: "xmlns:wne",
      wps: "xmlns:wps",
      cp: "xmlns:cp",
      dc: "xmlns:dc",
      dcterms: "xmlns:dcterms",
      dcmitype: "xmlns:dcmitype",
      xsi: "xmlns:xsi",
      type: "xsi:type",
      cx: "xmlns:cx",
      cx1: "xmlns:cx1",
      cx2: "xmlns:cx2",
      cx3: "xmlns:cx3",
      cx4: "xmlns:cx4",
      cx5: "xmlns:cx5",
      cx6: "xmlns:cx6",
      cx7: "xmlns:cx7",
      cx8: "xmlns:cx8",
      w16cid: "xmlns:w16cid",
      w16se: "xmlns:w16se"
    });
  }
};
var Header$1 = class extends InitializableXmlComponent {
  constructor(referenceNumber, initContent) {
    super("w:hdr", initContent);
    _defineProperty2(this, "refId", void 0);
    this.refId = referenceNumber;
    if (!initContent) this.root.push(new HeaderAttributes({
      wpc: "http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas",
      mc: "http://schemas.openxmlformats.org/markup-compatibility/2006",
      o: "urn:schemas-microsoft-com:office:office",
      r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      m: "http://schemas.openxmlformats.org/officeDocument/2006/math",
      v: "urn:schemas-microsoft-com:vml",
      wp14: "http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing",
      wp: "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
      w10: "urn:schemas-microsoft-com:office:word",
      w: "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
      w14: "http://schemas.microsoft.com/office/word/2010/wordml",
      w15: "http://schemas.microsoft.com/office/word/2012/wordml",
      wpg: "http://schemas.microsoft.com/office/word/2010/wordprocessingGroup",
      wpi: "http://schemas.microsoft.com/office/word/2010/wordprocessingInk",
      wne: "http://schemas.microsoft.com/office/word/2006/wordml",
      wps: "http://schemas.microsoft.com/office/word/2010/wordprocessingShape",
      cx: "http://schemas.microsoft.com/office/drawing/2014/chartex",
      cx1: "http://schemas.microsoft.com/office/drawing/2015/9/8/chartex",
      cx2: "http://schemas.microsoft.com/office/drawing/2015/10/21/chartex",
      cx3: "http://schemas.microsoft.com/office/drawing/2016/5/9/chartex",
      cx4: "http://schemas.microsoft.com/office/drawing/2016/5/10/chartex",
      cx5: "http://schemas.microsoft.com/office/drawing/2016/5/11/chartex",
      cx6: "http://schemas.microsoft.com/office/drawing/2016/5/12/chartex",
      cx7: "http://schemas.microsoft.com/office/drawing/2016/5/13/chartex",
      cx8: "http://schemas.microsoft.com/office/drawing/2016/5/14/chartex",
      w16cid: "http://schemas.microsoft.com/office/word/2016/wordml/cid",
      w16se: "http://schemas.microsoft.com/office/word/2015/wordml/symex"
    }));
  }
  get ReferenceId() {
    return this.refId;
  }
  add(item) {
    this.root.push(item);
  }
  /**
  * Formats the header, with the page numbers worked out for its document written into its fields, when the document's
  * body is written with an estimate of its pages.
  */
  prepForXml(context) {
    const xml = super.prepForXml(context);
    fillPartPageNumbers(xml, context, this.refId);
    return xml;
  }
};
var HeaderWrapper = class {
  constructor(media, referenceId, initContent) {
    _defineProperty2(this, "media", void 0);
    _defineProperty2(this, "header", void 0);
    _defineProperty2(this, "relationships", void 0);
    this.media = media;
    this.header = new Header$1(referenceId, initContent);
    this.relationships = new Relationships();
  }
  add(item) {
    this.header.add(item);
    return this;
  }
  addChildElement(childElement) {
    this.header.addChildElement(childElement);
  }
  get View() {
    return this.header;
  }
  get Relationships() {
    return this.relationships;
  }
  get Media() {
    return this.media;
  }
};
var sequentialMediaPaths = () => {
  const counts = /* @__PURE__ */ new Map();
  return (extension) => {
    var _counts$get;
    const count = ((_counts$get = counts.get(extension)) !== null && _counts$get !== void 0 ? _counts$get : 0) + 1;
    counts.set(extension, count);
    return `media/image${count}.${extension}`;
  };
};
var Media = class {
  /**
  * @param takePath - Gives each image its path under word/, by its extension, so that it doesn't take the path of
  * another part of the package, such as a template's image. Default numbers them by type, media/image1.png,
  * media/image2.png and so on
  */
  constructor(takePath = sequentialMediaPaths()) {
    _defineProperty2(this, "map", /* @__PURE__ */ new Map());
    _defineProperty2(this, "takePath", void 0);
    this.takePath = takePath;
  }
  /**
  * Adds an image to the media collection, once: an image added again under the same key, such as one used in the
  * body and in a header, keeps the file name it was given the first time.
  *
  * @param key - Unique identifier for this image, which the XML refers to it by until it is packed
  * @param mediaData - Complete image data including type, transformation, and raw data
  */
  addImage(key, mediaData) {
    if (this.map.has(key)) return;
    const path = this.takePath(mediaData.type);
    this.map.set(key, _objectSpread2(_objectSpread2({}, mediaData), {}, { fileName: path.slice(path.lastIndexOf("/") + 1) }));
  }
  /**
  * Gets all images as an array, in the order they were added, each with the file name it is written with.
  *
  * @returns Read-only array of all media data in the collection
  */
  get Array() {
    return Array.from(this.map.values());
  }
  /**
  * Gets all images with the keys they were added under, in the order they were added.
  *
  * @returns Read-only array of each image's key and media data, whose file name is the one it is written with
  */
  get Entries() {
    return Array.from(this.map.entries());
  }
};
var LevelFormat = {
  /** Decimal numbering (1, 2, 3...). */
  DECIMAL: "decimal",
  /** Uppercase roman numerals (I, II, III...). */
  UPPER_ROMAN: "upperRoman",
  /** Lowercase roman numerals (i, ii, iii...). */
  LOWER_ROMAN: "lowerRoman",
  /** Uppercase letters (A, B, C...). */
  UPPER_LETTER: "upperLetter",
  /** Lowercase letters (a, b, c...). */
  LOWER_LETTER: "lowerLetter",
  /** Ordinal numbers (1st, 2nd, 3rd...). */
  ORDINAL: "ordinal",
  /** Cardinal text (one, two, three...). */
  CARDINAL_TEXT: "cardinalText",
  /** Ordinal text (first, second, third...). */
  ORDINAL_TEXT: "ordinalText",
  /** Hexadecimal numbering. */
  HEX: "hex",
  /** Chicago Manual of Style numbering. */
  CHICAGO: "chicago",
  /** Ideograph digital numbering. */
  IDEOGRAPH__DIGITAL: "ideographDigital",
  /** Japanese counting system. */
  JAPANESE_COUNTING: "japaneseCounting",
  /** Japanese aiueo ordering. */
  AIUEO: "aiueo",
  /** Japanese iroha ordering. */
  IROHA: "iroha",
  /** Full-width decimal numbering. */
  DECIMAL_FULL_WIDTH: "decimalFullWidth",
  /** Half-width decimal numbering. */
  DECIMAL_HALF_WIDTH: "decimalHalfWidth",
  /** Japanese legal numbering. */
  JAPANESE_LEGAL: "japaneseLegal",
  /** Japanese digital ten thousand numbering. */
  JAPANESE_DIGITAL_TEN_THOUSAND: "japaneseDigitalTenThousand",
  /** Decimal numbers enclosed in circles. */
  DECIMAL_ENCLOSED_CIRCLE: "decimalEnclosedCircle",
  /** Full-width decimal numbering variant 2. */
  DECIMAL_FULL_WIDTH2: "decimalFullWidth2",
  /** Full-width aiueo ordering. */
  AIUEO_FULL_WIDTH: "aiueoFullWidth",
  /** Full-width iroha ordering. */
  IROHA_FULL_WIDTH: "irohaFullWidth",
  /** Decimal with leading zeros. */
  DECIMAL_ZERO: "decimalZero",
  /** Bullet points. */
  BULLET: "bullet",
  /** Korean ganada ordering. */
  GANADA: "ganada",
  /** Korean chosung ordering. */
  CHOSUNG: "chosung",
  /** Decimal enclosed with fullstop. */
  DECIMAL_ENCLOSED_FULLSTOP: "decimalEnclosedFullstop",
  /** Decimal enclosed in parentheses. */
  DECIMAL_ENCLOSED_PARENTHESES: "decimalEnclosedParen",
  /** Decimal enclosed in circles (Chinese). */
  DECIMAL_ENCLOSED_CIRCLE_CHINESE: "decimalEnclosedCircleChinese",
  /** Ideograph enclosed in circles. */
  IDEOGRAPH_ENCLOSED_CIRCLE: "ideographEnclosedCircle",
  /** Traditional ideograph numbering. */
  IDEOGRAPH_TRADITIONAL: "ideographTraditional",
  /** Ideograph zodiac numbering. */
  IDEOGRAPH_ZODIAC: "ideographZodiac",
  /** Traditional ideograph zodiac numbering. */
  IDEOGRAPH_ZODIAC_TRADITIONAL: "ideographZodiacTraditional",
  /** Taiwanese counting system. */
  TAIWANESE_COUNTING: "taiwaneseCounting",
  /** Traditional ideograph legal numbering. */
  IDEOGRAPH_LEGAL_TRADITIONAL: "ideographLegalTraditional",
  /** Taiwanese counting thousand system. */
  TAIWANESE_COUNTING_THOUSAND: "taiwaneseCountingThousand",
  /** Taiwanese digital numbering. */
  TAIWANESE_DIGITAL: "taiwaneseDigital",
  /** Chinese counting system. */
  CHINESE_COUNTING: "chineseCounting",
  /** Simplified Chinese legal numbering. */
  CHINESE_LEGAL_SIMPLIFIED: "chineseLegalSimplified",
  /** Chinese counting thousand system. */
  CHINESE_COUNTING_THOUSAND: "chineseCountingThousand",
  /** Korean digital numbering. */
  KOREAN_DIGITAL: "koreanDigital",
  /** Korean counting system. */
  KOREAN_COUNTING: "koreanCounting",
  /** Korean legal numbering. */
  KOREAN_LEGAL: "koreanLegal",
  /** Korean digital numbering variant 2. */
  KOREAN_DIGITAL2: "koreanDigital2",
  /** Vietnamese counting system. */
  VIETNAMESE_COUNTING: "vietnameseCounting",
  /** Russian lowercase numbering. */
  RUSSIAN_LOWER: "russianLower",
  /** Russian uppercase numbering. */
  RUSSIAN_UPPER: "russianUpper",
  /** No numbering. */
  NONE: "none",
  /** Number enclosed in dashes. */
  NUMBER_IN_DASH: "numberInDash",
  /** Hebrew numbering variant 1. */
  HEBREW1: "hebrew1",
  /** Hebrew numbering variant 2. */
  HEBREW2: "hebrew2",
  /** Arabic alpha numbering. */
  ARABIC_ALPHA: "arabicAlpha",
  /** Arabic abjad numbering. */
  ARABIC_ABJAD: "arabicAbjad",
  /** Hindi vowels. */
  HINDI_VOWELS: "hindiVowels",
  /** Hindi consonants. */
  HINDI_CONSONANTS: "hindiConsonants",
  /** Hindi numbers. */
  HINDI_NUMBERS: "hindiNumbers",
  /** Hindi counting system. */
  HINDI_COUNTING: "hindiCounting",
  /** Thai letters. */
  THAI_LETTERS: "thaiLetters",
  /** Thai numbers. */
  THAI_NUMBERS: "thaiNumbers",
  /** Thai counting system. */
  THAI_COUNTING: "thaiCounting",
  /** Thai Baht text. */
  BAHT_TEXT: "bahtText",
  /** Dollar text. */
  DOLLAR_TEXT: "dollarText",
  /** Custom numbering format. */
  CUSTOM: "custom"
};
var LevelAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      ilvl: "w:ilvl",
      tentative: "w:tentative"
    });
  }
};
var NumberFormat$1 = class extends XmlComponent {
  constructor(value) {
    super("w:numFmt");
    this.root.push(new Attributes({ val: value }));
  }
};
var LevelText = class extends XmlComponent {
  constructor(value) {
    super("w:lvlText");
    this.root.push(new Attributes({ val: value }));
  }
};
var levelAlignment = (value) => {
  switch (value) {
    case AlignmentType.CENTER:
      return "center";
    case AlignmentType.END:
    case AlignmentType.RIGHT:
      return "right";
    default:
      return "left";
  }
};
var LevelJc = class extends XmlComponent {
  constructor(value) {
    super("w:lvlJc");
    this.root.push(new Attributes({ val: levelAlignment(value) }));
  }
};
var Suffix = class extends XmlComponent {
  constructor(value) {
    super("w:suff");
    this.root.push(new Attributes({ val: value }));
  }
};
var IsLegalNumberingStyle = class extends XmlComponent {
  constructor() {
    super("w:isLgl");
  }
};
var LevelBase = class extends XmlComponent {
  /**
  * Creates a new numbering level.
  *
  * @param options - Level configuration options
  * @throws Error if level is greater than 9 (Word limitation)
  */
  constructor({ level, format: format3, text: text2, alignment = AlignmentType.START, start = 1, style, suffix, isLegalNumberingStyle }) {
    super("w:lvl");
    _defineProperty2(this, "paragraphProperties", void 0);
    _defineProperty2(this, "runProperties", void 0);
    this.root.push(new NumberValueElement("w:start", decimalNumber(start)));
    if (format3) this.root.push(new NumberFormat$1(format3));
    if (style === null || style === void 0 ? void 0 : style.style) this.root.push(createParagraphStyle(style.style));
    if (isLegalNumberingStyle) this.root.push(new IsLegalNumberingStyle());
    if (suffix) this.root.push(new Suffix(suffix));
    if (text2) this.root.push(new LevelText(text2));
    this.root.push(new LevelJc(alignment));
    this.paragraphProperties = new ParagraphProperties(style && style.paragraph, {
      implicitListParagraphStyle: false,
      inListOrder: false
    });
    this.runProperties = new RunProperties((style === null || style === void 0 ? void 0 : style.run) && _objectSpread2(_objectSpread2({}, style.run), {}, {
      highlight: void 0,
      math: void 0,
      revision: void 0
    }));
    this.root.push(this.paragraphProperties);
    this.root.push(this.runProperties);
    if (level > 9) throw new Error("Level cannot be greater than 9. Read more here: https://answers.microsoft.com/en-us/msoffice/forum/all/does-word-support-more-than-9-list-levels/d130fdcd-1781-446d-8c84-c6c79124e4d7");
    this.root.push(new LevelAttributes({
      ilvl: decimalNumber(level),
      tentative: 1
    }));
  }
};
var Level = class extends LevelBase {
};
var MultiLevelType = class extends XmlComponent {
  /**
  * Creates a new multi-level type specification.
  *
  * @param value - The multi-level type: "singleLevel", "multilevel", or "hybridMultilevel"
  */
  constructor(value) {
    super("w:multiLevelType");
    this.root.push(new Attributes({ val: value }));
  }
};
var AbstractNumberingAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      abstractNumId: "w:abstractNumId",
      restartNumberingAfterBreak: "w15:restartNumberingAfterBreak"
    });
  }
};
var AbstractNumbering = class extends XmlComponent {
  /**
  * Creates a new abstract numbering definition.
  *
  * @param id - Unique identifier for this abstract numbering definition
  * @param levelOptions - Array of level definitions (up to 9 levels)
  */
  constructor(id, levelOptions) {
    super("w:abstractNum");
    _defineProperty2(
      this,
      /** The unique identifier for this abstract numbering definition. */
      "id",
      void 0
    );
    this.root.push(new AbstractNumberingAttributes({
      abstractNumId: decimalNumber(id),
      restartNumberingAfterBreak: 0
    }));
    this.root.push(new MultiLevelType("hybridMultilevel"));
    this.id = id;
    for (const option of levelOptions) this.root.push(new Level(option));
  }
};
var AbstractNumId = class extends XmlComponent {
  constructor(value) {
    super("w:abstractNumId");
    this.root.push(new Attributes({ val: value }));
  }
};
var NumAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", { numId: "w:numId" });
  }
};
var ConcreteNumbering = class extends XmlComponent {
  /**
  * Creates a new concrete numbering instance.
  *
  * @param options - Configuration options for the numbering instance
  */
  constructor(options) {
    super("w:num");
    _defineProperty2(
      this,
      /** The unique identifier for this numbering instance. */
      "numId",
      void 0
    );
    _defineProperty2(
      this,
      /** The reference name for this numbering instance. */
      "reference",
      void 0
    );
    _defineProperty2(
      this,
      /** The instance number for tracking multiple uses. */
      "instance",
      void 0
    );
    _defineProperty2(
      this,
      /** For a list a paragraph restarts, the id of that restart, as {@link IConcreteNumberingOptions.restartedListId} describes. */
      "restartedListId",
      void 0
    );
    this.numId = options.numId;
    this.reference = options.reference;
    this.instance = options.instance;
    this.restartedListId = options.restartedListId;
    this.root.push(new NumAttributes({ numId: decimalNumber(options.numId) }));
    this.root.push(new AbstractNumId(decimalNumber(options.abstractNumId)));
    if (options.overrideLevels && options.overrideLevels.length) for (const level of options.overrideLevels) this.root.push(new LevelOverride(level.num, level.start));
  }
};
var LevelOverrideAttributes = class extends XmlAttributeComponent {
  constructor(..._args2) {
    super(..._args2);
    _defineProperty2(this, "xmlKeys", { ilvl: "w:ilvl" });
  }
};
var LevelOverride = class extends XmlComponent {
  /**
  * Creates a new level override.
  *
  * @param levelNum - The level number to override (0-8)
  * @param start - Optional starting number for the level
  */
  constructor(levelNum, start) {
    super("w:lvlOverride");
    this.root.push(new LevelOverrideAttributes({ ilvl: levelNum }));
    if (start !== void 0) this.root.push(new StartOverride(start));
  }
};
var StartOverrideAttributes = class extends XmlAttributeComponent {
  constructor(..._args3) {
    super(..._args3);
    _defineProperty2(this, "xmlKeys", { val: "w:val" });
  }
};
var StartOverride = class extends XmlComponent {
  /**
  * Creates a new start override.
  *
  * @param start - The starting number
  */
  constructor(start) {
    super("w:startOverride");
    this.root.push(new StartOverrideAttributes({ val: start }));
  }
};
var Numbering = class extends XmlComponent {
  /**
  * Creates a new numbering definition collection.
  *
  * Initializes the numbering with a default bullet list configuration and
  * any custom numbering configurations provided in the options.
  *
  * @param options - Configuration options for numbering definitions
  */
  constructor(options) {
    super("w:numbering");
    _defineProperty2(this, "abstractNumberingMap", /* @__PURE__ */ new Map());
    _defineProperty2(this, "concreteNumberingMap", /* @__PURE__ */ new Map());
    _defineProperty2(this, "referenceConfigMap", /* @__PURE__ */ new Map());
    _defineProperty2(this, "abstractNumUniqueNumericId", abstractNumUniqueNumericIdGen());
    _defineProperty2(this, "concreteNumUniqueNumericId", concreteNumUniqueNumericIdGen());
    this.root.push(new DocumentAttributes([
      "wpc",
      "mc",
      "o",
      "r",
      "m",
      "v",
      "wp14",
      "wp",
      "w10",
      "w",
      "w14",
      "w15",
      "wpg",
      "wpi",
      "wne",
      "wps"
    ], "w14 w15 wp14"));
    const abstractNumbering = new AbstractNumbering(this.abstractNumUniqueNumericId(), [
      {
        level: 0,
        format: LevelFormat.BULLET,
        text: "\u25CF",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: {
          left: convertInchesToTwip(0.5),
          hanging: convertInchesToTwip(0.25)
        } } }
      },
      {
        level: 1,
        format: LevelFormat.BULLET,
        text: "\u25CB",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: {
          left: convertInchesToTwip(1),
          hanging: convertInchesToTwip(0.25)
        } } }
      },
      {
        level: 2,
        format: LevelFormat.BULLET,
        text: "\u25A0",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: {
          left: 2160,
          hanging: convertInchesToTwip(0.25)
        } } }
      },
      {
        level: 3,
        format: LevelFormat.BULLET,
        text: "\u25CF",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: {
          left: 2880,
          hanging: convertInchesToTwip(0.25)
        } } }
      },
      {
        level: 4,
        format: LevelFormat.BULLET,
        text: "\u25CB",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: {
          left: 3600,
          hanging: convertInchesToTwip(0.25)
        } } }
      },
      {
        level: 5,
        format: LevelFormat.BULLET,
        text: "\u25A0",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: {
          left: 4320,
          hanging: convertInchesToTwip(0.25)
        } } }
      },
      {
        level: 6,
        format: LevelFormat.BULLET,
        text: "\u25CF",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: {
          left: 5040,
          hanging: convertInchesToTwip(0.25)
        } } }
      },
      {
        level: 7,
        format: LevelFormat.BULLET,
        text: "\u25CF",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: {
          left: 5760,
          hanging: convertInchesToTwip(0.25)
        } } }
      },
      {
        level: 8,
        format: LevelFormat.BULLET,
        text: "\u25CF",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: {
          left: 6480,
          hanging: convertInchesToTwip(0.25)
        } } }
      }
    ]);
    this.concreteNumberingMap.set("default-bullet-numbering", new ConcreteNumbering({
      numId: 1,
      abstractNumId: abstractNumbering.id,
      reference: "default-bullet-numbering",
      instance: 0,
      overrideLevels: [{
        num: 0,
        start: 1
      }]
    }));
    this.abstractNumberingMap.set("default-bullet-numbering", abstractNumbering);
    for (const con of options.config) {
      this.abstractNumberingMap.set(con.reference, new AbstractNumbering(this.abstractNumUniqueNumericId(), con.levels));
      this.referenceConfigMap.set(con.reference, con.levels);
    }
  }
  /**
  * Prepares the numbering definitions for XML serialization.
  *
  * Adds all abstract and concrete numbering definitions to the XML tree.
  *
  * @param context - The XML context
  * @returns The prepared XML object
  */
  prepForXml(context) {
    this.root.splice(1, this.root.length - 1, ...this.abstractNumberingMap.values(), ...this.concreteNumberingMap.values());
    return super.prepForXml(context);
  }
  /**
  * Creates a concrete numbering instance from an abstract numbering definition.
  *
  * This method creates a new concrete numbering instance that references an
  * abstract numbering definition. It's used internally when paragraphs reference
  * numbering configurations.
  *
  * @param reference - The reference name of the abstract numbering definition
  * @param instance - The instance number for this concrete numbering
  * @param definition - The list's definition, for a list a paragraph gives its own definition of. It is added with
  * its reference, unless the numbering already has a list with that reference, such as one of the document's
  * `numbering` option, which is kept
  * @param restartedListId - For a list a paragraph starts again with `restart`, the id of that restart. The list is
  * then that restart's own, not the `instance`'s
  */
  createConcreteNumberingInstance(reference2, instance, definition, restartedListId) {
    var _this$referenceConfig;
    if (definition && !this.abstractNumberingMap.has(definition.reference)) {
      this.abstractNumberingMap.set(definition.reference, new AbstractNumbering(this.abstractNumUniqueNumericId(), definition.levels));
      this.referenceConfigMap.set(definition.reference, definition.levels);
    }
    const abstractNumbering = this.abstractNumberingMap.get(reference2);
    if (!abstractNumbering) return;
    const fullReference = listKey(reference2, instance, restartedListId);
    if (this.concreteNumberingMap.has(fullReference)) return;
    const referenceConfigLevels = (_this$referenceConfig = this.referenceConfigMap.get(reference2)) !== null && _this$referenceConfig !== void 0 ? _this$referenceConfig : [{ level: 0 }];
    const concreteNumberingSettings = {
      numId: this.concreteNumUniqueNumericId(),
      abstractNumId: abstractNumbering.id,
      reference: reference2,
      instance,
      restartedListId,
      overrideLevels: referenceConfigLevels.map(({ level, start = 1 }) => ({
        num: level,
        start: decimalNumber(start)
      }))
    };
    this.concreteNumberingMap.set(fullReference, new ConcreteNumbering(concreteNumberingSettings));
  }
  /**
  * Gets all concrete numbering instances.
  *
  * @returns An array of all concrete numbering instances
  */
  get ConcreteNumbering() {
    return Array.from(this.concreteNumberingMap.values());
  }
  /**
  * Gets all reference configurations.
  *
  * @returns An array of all numbering reference configurations
  */
  get ReferenceConfig() {
    return Array.from(this.referenceConfigMap.values());
  }
};
var PackageParts = class {
  /**
  * @param contentTypes - Where each part's content type is added
  * @param existingPaths - The paths under word/ of the parts the package already has, such as a template's charts
  * and images, which new parts don't take
  */
  constructor(contentTypes, existingPaths = /* @__PURE__ */ new Set()) {
    _defineProperty2(this, "contentTypes", void 0);
    _defineProperty2(this, "paths", /* @__PURE__ */ new Map());
    _defineProperty2(this, "taken", void 0);
    _defineProperty2(this, "folders", /* @__PURE__ */ new WeakMap());
    this.contentTypes = contentTypes;
    this.taken = new Set(existingPaths);
  }
  /**
  * Adds a part, and its content type, once.
  *
  * @returns The part's path under word/, such as "charts/chart1.xml"
  */
  add(part) {
    const added = this.paths.get(part);
    if (added !== void 0) return added;
    const { folder, name, extension, contentType } = part.options;
    const path = this.takePath(folder, name, extension);
    this.paths.set(part, path);
    this.contentTypes.addOverride(contentType, `/word/${path}`);
    return path;
  }
  /**
  * Takes the lowest-numbered path in a folder that nothing has yet, so that nothing else is written there: the
  * package's own parts, the parts added, and the document's images, which `Media` names with this, as Word names
  * them: media/image1.png, media/image2.png and so on.
  *
  * @param folder - The folder under word/, such as "media"
  * @param name - The start of the file name, such as "image"
  * @param extension - The file name's extension, such as "png"
  * @returns The path under word/, such as "media/image1.png"
  */
  takePath(folder, name, extension) {
    let index = 1;
    while (this.taken.has(`${folder}/${name}${index}.${extension}`)) index++;
    const path = `${folder}/${name}${index}.${extension}`;
    this.taken.add(path);
    return path;
  }
  /**
  * Each part added, with its path under word/, in the order they were added.
  *
  * A part related as an OLE object is listed too, though the parts are typed as they were before a part could be:
  * `File`, whose type is public, has these parts, and the compiler only writes their content.
  */
  get Array() {
    return [...this.paths].map(([part, path]) => ({
      part,
      path
    }));
  }
  /**
  * Creates the relationships of a part whose XML is being written, so the parts its XML refers to are found from its
  * folder.
  *
  * @param path - The part's path under word/
  */
  createRelationships(path) {
    const relationships = new Relationships();
    this.folders.set(relationships, path.slice(0, path.indexOf("/")));
    return relationships;
  }
  /**
  * The target of a relationship to a part, relative to the part the relationships are from. The document, headers,
  * footers, footnotes, endnotes and comments are all in word/.
  *
  * @param path - The part's path under word/
  */
  getTarget(relationships, path) {
    const from = this.folders.get(relationships);
    if (from === void 0) return path;
    return path.startsWith(`${from}/`) ? path.slice(from.length + 1) : `../${path}`;
  }
};
var createCompatibilitySetting = (version) => new BuilderElement({
  name: "w:compatSetting",
  attributes: {
    version: {
      key: "w:val",
      value: version
    },
    name: {
      key: "w:name",
      value: "compatibilityMode"
    },
    uri: {
      key: "w:uri",
      value: "http://schemas.microsoft.com/office/word"
    }
  }
});
var Compatibility = class extends XmlComponent {
  constructor(options) {
    super("w:compat");
    if (options.useSingleBorderforContiguousCells) this.root.push(new OnOffElement("w:useSingleBorderforContiguousCells", options.useSingleBorderforContiguousCells));
    if (options.wordPerfectJustification) this.root.push(new OnOffElement("w:wpJustification", options.wordPerfectJustification));
    if (options.noTabStopForHangingIndent) this.root.push(new OnOffElement("w:noTabHangInd", options.noTabStopForHangingIndent));
    if (options.noLeading) this.root.push(new OnOffElement("w:noLeading", options.noLeading));
    if (options.spaceForUnderline) this.root.push(new OnOffElement("w:spaceForUL", options.spaceForUnderline));
    if (options.noColumnBalance) this.root.push(new OnOffElement("w:noColumnBalance", options.noColumnBalance));
    if (options.balanceSingleByteDoubleByteWidth) this.root.push(new OnOffElement("w:balanceSingleByteDoubleByteWidth", options.balanceSingleByteDoubleByteWidth));
    if (options.noExtraLineSpacing) this.root.push(new OnOffElement("w:noExtraLineSpacing", options.noExtraLineSpacing));
    if (options.doNotLeaveBackslashAlone) this.root.push(new OnOffElement("w:doNotLeaveBackslashAlone", options.doNotLeaveBackslashAlone));
    if (options.underlineTrailingSpaces) this.root.push(new OnOffElement("w:ulTrailSpace", options.underlineTrailingSpaces));
    if (options.doNotExpandShiftReturn) this.root.push(new OnOffElement("w:doNotExpandShiftReturn", options.doNotExpandShiftReturn));
    if (options.spacingInWholePoints) this.root.push(new OnOffElement("w:spacingInWholePoints", options.spacingInWholePoints));
    if (options.lineWrapLikeWord6) this.root.push(new OnOffElement("w:lineWrapLikeWord6", options.lineWrapLikeWord6));
    if (options.printBodyTextBeforeHeader) this.root.push(new OnOffElement("w:printBodyTextBeforeHeader", options.printBodyTextBeforeHeader));
    if (options.printColorsBlack) this.root.push(new OnOffElement("w:printColBlack", options.printColorsBlack));
    if (options.spaceWidth) this.root.push(new OnOffElement("w:wpSpaceWidth", options.spaceWidth));
    if (options.showBreaksInFrames) this.root.push(new OnOffElement("w:showBreaksInFrames", options.showBreaksInFrames));
    if (options.subFontBySize) this.root.push(new OnOffElement("w:subFontBySize", options.subFontBySize));
    if (options.suppressBottomSpacing) this.root.push(new OnOffElement("w:suppressBottomSpacing", options.suppressBottomSpacing));
    if (options.suppressTopSpacing) this.root.push(new OnOffElement("w:suppressTopSpacing", options.suppressTopSpacing));
    if (options.suppressSpacingAtTopOfPage) this.root.push(new OnOffElement("w:suppressSpacingAtTopOfPage", options.suppressSpacingAtTopOfPage));
    if (options.suppressTopSpacingWP) this.root.push(new OnOffElement("w:suppressTopSpacingWP", options.suppressTopSpacingWP));
    if (options.suppressSpBfAfterPgBrk) this.root.push(new OnOffElement("w:suppressSpBfAfterPgBrk", options.suppressSpBfAfterPgBrk));
    if (options.swapBordersFacingPages) this.root.push(new OnOffElement("w:swapBordersFacingPages", options.swapBordersFacingPages));
    if (options.convertMailMergeEsc) this.root.push(new OnOffElement("w:convMailMergeEsc", options.convertMailMergeEsc));
    if (options.truncateFontHeightsLikeWP6) this.root.push(new OnOffElement("w:truncateFontHeightsLikeWP6", options.truncateFontHeightsLikeWP6));
    if (options.macWordSmallCaps) this.root.push(new OnOffElement("w:mwSmallCaps", options.macWordSmallCaps));
    if (options.usePrinterMetrics) this.root.push(new OnOffElement("w:usePrinterMetrics", options.usePrinterMetrics));
    if (options.doNotSuppressParagraphBorders) this.root.push(new OnOffElement("w:doNotSuppressParagraphBorders", options.doNotSuppressParagraphBorders));
    if (options.wrapTrailSpaces) this.root.push(new OnOffElement("w:wrapTrailSpaces", options.wrapTrailSpaces));
    if (options.footnoteLayoutLikeWW8) this.root.push(new OnOffElement("w:footnoteLayoutLikeWW8", options.footnoteLayoutLikeWW8));
    if (options.shapeLayoutLikeWW8) this.root.push(new OnOffElement("w:shapeLayoutLikeWW8", options.shapeLayoutLikeWW8));
    if (options.alignTablesRowByRow) this.root.push(new OnOffElement("w:alignTablesRowByRow", options.alignTablesRowByRow));
    if (options.forgetLastTabAlignment) this.root.push(new OnOffElement("w:forgetLastTabAlignment", options.forgetLastTabAlignment));
    if (options.adjustLineHeightInTable) this.root.push(new OnOffElement("w:adjustLineHeightInTable", options.adjustLineHeightInTable));
    if (options.autoSpaceLikeWord95) this.root.push(new OnOffElement("w:autoSpaceLikeWord95", options.autoSpaceLikeWord95));
    if (options.noSpaceRaiseLower) this.root.push(new OnOffElement("w:noSpaceRaiseLower", options.noSpaceRaiseLower));
    if (options.doNotUseHTMLParagraphAutoSpacing) this.root.push(new OnOffElement("w:doNotUseHTMLParagraphAutoSpacing", options.doNotUseHTMLParagraphAutoSpacing));
    if (options.layoutRawTableWidth) this.root.push(new OnOffElement("w:layoutRawTableWidth", options.layoutRawTableWidth));
    if (options.layoutTableRowsApart) this.root.push(new OnOffElement("w:layoutTableRowsApart", options.layoutTableRowsApart));
    if (options.useWord97LineBreakRules) this.root.push(new OnOffElement("w:useWord97LineBreakRules", options.useWord97LineBreakRules));
    if (options.doNotBreakWrappedTables) this.root.push(new OnOffElement("w:doNotBreakWrappedTables", options.doNotBreakWrappedTables));
    if (options.doNotSnapToGridInCell) this.root.push(new OnOffElement("w:doNotSnapToGridInCell", options.doNotSnapToGridInCell));
    if (options.selectFieldWithFirstOrLastCharacter) this.root.push(new OnOffElement("w:selectFldWithFirstOrLastChar", options.selectFieldWithFirstOrLastCharacter));
    if (options.applyBreakingRules) this.root.push(new OnOffElement("w:applyBreakingRules", options.applyBreakingRules));
    if (options.doNotWrapTextWithPunctuation) this.root.push(new OnOffElement("w:doNotWrapTextWithPunct", options.doNotWrapTextWithPunctuation));
    if (options.doNotUseEastAsianBreakRules) this.root.push(new OnOffElement("w:doNotUseEastAsianBreakRules", options.doNotUseEastAsianBreakRules));
    if (options.useWord2002TableStyleRules) this.root.push(new OnOffElement("w:useWord2002TableStyleRules", options.useWord2002TableStyleRules));
    if (options.growAutofit) this.root.push(new OnOffElement("w:growAutofit", options.growAutofit));
    if (options.useFELayout) this.root.push(new OnOffElement("w:useFELayout", options.useFELayout));
    if (options.useNormalStyleForList) this.root.push(new OnOffElement("w:useNormalStyleForList", options.useNormalStyleForList));
    if (options.doNotUseIndentAsNumberingTabStop) this.root.push(new OnOffElement("w:doNotUseIndentAsNumberingTabStop", options.doNotUseIndentAsNumberingTabStop));
    if (options.useAlternateEastAsianLineBreakRules) this.root.push(new OnOffElement("w:useAltKinsokuLineBreakRules", options.useAlternateEastAsianLineBreakRules));
    if (options.allowSpaceOfSameStyleInTable) this.root.push(new OnOffElement("w:allowSpaceOfSameStyleInTable", options.allowSpaceOfSameStyleInTable));
    if (options.doNotSuppressIndentation) this.root.push(new OnOffElement("w:doNotSuppressIndentation", options.doNotSuppressIndentation));
    if (options.doNotAutofitConstrainedTables) this.root.push(new OnOffElement("w:doNotAutofitConstrainedTables", options.doNotAutofitConstrainedTables));
    if (options.autofitToFirstFixedWidthCell) this.root.push(new OnOffElement("w:autofitToFirstFixedWidthCell", options.autofitToFirstFixedWidthCell));
    if (options.underlineTabInNumberingList) this.root.push(new OnOffElement("w:underlineTabInNumList", options.underlineTabInNumberingList));
    if (options.displayHangulFixedWidth) this.root.push(new OnOffElement("w:displayHangulFixedWidth", options.displayHangulFixedWidth));
    if (options.splitPgBreakAndParaMark) this.root.push(new OnOffElement("w:splitPgBreakAndParaMark", options.splitPgBreakAndParaMark));
    if (options.doNotVerticallyAlignCellWithSp) this.root.push(new OnOffElement("w:doNotVertAlignCellWithSp", options.doNotVerticallyAlignCellWithSp));
    if (options.doNotBreakConstrainedForcedTable) this.root.push(new OnOffElement("w:doNotBreakConstrainedForcedTable", options.doNotBreakConstrainedForcedTable));
    if (options.ignoreVerticalAlignmentInTextboxes) this.root.push(new OnOffElement("w:doNotVertAlignInTxbx", options.ignoreVerticalAlignmentInTextboxes));
    if (options.useAnsiKerningPairs) this.root.push(new OnOffElement("w:useAnsiKerningPairs", options.useAnsiKerningPairs));
    if (options.cachedColumnBalance) this.root.push(new OnOffElement("w:cachedColBalance", options.cachedColumnBalance));
    if (options.version) this.root.push(createCompatibilitySetting(options.version));
  }
};
var PROTECTION_PASSWORD_SPIN_COUNT = 1e5;
var MAX_PASSWORD_LENGTH = 15;
var INITIAL_CODES = [
  57840,
  7439,
  52380,
  33984,
  4364,
  3600,
  61902,
  12606,
  6258,
  57657,
  54287,
  34041,
  10252,
  43370,
  20163
];
var ENCRYPTION_MATRIX = [
  [
    44796,
    19929,
    39858,
    10053,
    20106,
    40212,
    10761
  ],
  [
    31585,
    63170,
    64933,
    60267,
    50935,
    40399,
    11199
  ],
  [
    17763,
    35526,
    1453,
    2906,
    5812,
    11624,
    23248
  ],
  [
    885,
    1770,
    3540,
    7080,
    14160,
    28320,
    56640
  ],
  [
    55369,
    41139,
    20807,
    41614,
    21821,
    43642,
    17621
  ],
  [
    28485,
    56970,
    44341,
    19019,
    38038,
    14605,
    29210
  ],
  [
    60195,
    50791,
    40175,
    10751,
    21502,
    43004,
    24537
  ],
  [
    18387,
    36774,
    3949,
    7898,
    15796,
    31592,
    63184
  ],
  [
    47201,
    24803,
    49606,
    37805,
    14203,
    28406,
    56812
  ],
  [
    17824,
    35648,
    1697,
    3394,
    6788,
    13576,
    27152
  ],
  [
    43601,
    17539,
    35078,
    557,
    1114,
    2228,
    4456
  ],
  [
    30388,
    60776,
    51953,
    34243,
    7079,
    14158,
    28316
  ],
  [
    14128,
    28256,
    56512,
    43425,
    17251,
    34502,
    7597
  ],
  [
    13105,
    26210,
    52420,
    35241,
    883,
    1766,
    3532
  ],
  [
    4129,
    8258,
    16516,
    33032,
    4657,
    9314,
    18628
  ]
];
var rotateLeft15 = (value) => value >> 14 & 1 | value << 1 & 32767;
var legacyPasswordKey = (password) => {
  const bytes = password.slice(0, MAX_PASSWORD_LENGTH).split("").map((character) => {
    const code2 = character.charCodeAt(0);
    return (code2 & 255) !== 0 ? code2 & 255 : code2 >> 8 & 255;
  });
  const highOrderWord = bytes.reduce((word, byte, index) => ENCRYPTION_MATRIX[MAX_PASSWORD_LENGTH - bytes.length + index].reduce((current, code2, bit) => byte >> bit & 1 ? current ^ code2 : current, word), INITIAL_CODES[bytes.length - 1]);
  const lowOrderWord = (rotateLeft15(bytes.reduceRight((word, byte) => rotateLeft15(word) ^ byte, 0)) ^ bytes.length ^ 52811) & 65535;
  return [
    lowOrderWord & 255,
    lowOrderWord >> 8,
    highOrderWord & 255,
    highOrderWord >> 8
  ].map((byte) => byte.toString(16).toUpperCase().padStart(2, "0")).join("");
};
var hashProtectionPassword = (password, salt, spinCount) => {
  const key = [...legacyPasswordKey(password)].flatMap((character) => [character.charCodeAt(0), 0]);
  let digest = sha256(Uint8Array.from([...salt, ...key]));
  const block2 = new Uint8Array(digest.length + 4);
  const view = new DataView(block2.buffer);
  for (let iteration = 0; iteration < spinCount; iteration++) {
    block2.set(digest);
    view.setUint32(digest.length, iteration, true);
    digest = sha256(block2);
  }
  return Array.from(digest);
};
var randomSalt = (length) => {
  var _globalThis$crypto;
  const bytes = new Uint8Array(length);
  if (typeof ((_globalThis$crypto = globalThis.crypto) === null || _globalThis$crypto === void 0 ? void 0 : _globalThis$crypto.getRandomValues) === "function") {
    globalThis.crypto.getRandomValues(bytes);
    return [...bytes];
  }
  return [...bytes].map(() => Math.floor(Math.random() * 256));
};
var DocumentProtectionAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      edit: "w:edit",
      enforcement: "w:enforcement",
      cryptProviderType: "w:cryptProviderType",
      cryptAlgorithmClass: "w:cryptAlgorithmClass",
      cryptAlgorithmType: "w:cryptAlgorithmType",
      cryptAlgorithmSid: "w:cryptAlgorithmSid",
      cryptSpinCount: "w:cryptSpinCount",
      hash: "w:hash",
      salt: "w:salt"
    });
  }
};
var toBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
var DocumentProtection = class extends XmlComponent {
  constructor({ type, password }) {
    super("w:documentProtection");
    if (password === void 0 || password === "") {
      this.root.push(new DocumentProtectionAttributes({
        edit: type,
        enforcement: true
      }));
      return;
    }
    const salt = randomSalt(16);
    this.root.push(new DocumentProtectionAttributes({
      edit: type,
      enforcement: true,
      cryptProviderType: "rsaAES",
      cryptAlgorithmClass: "hash",
      cryptAlgorithmType: "typeAny",
      cryptAlgorithmSid: 12,
      cryptSpinCount: PROTECTION_PASSWORD_SPIN_COUNT,
      hash: toBase64(hashProtectionPassword(password, salt, PROTECTION_PASSWORD_SPIN_COUNT)),
      salt: toBase64(salt)
    }));
  }
};
var SettingsAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      wpc: "xmlns:wpc",
      mc: "xmlns:mc",
      o: "xmlns:o",
      r: "xmlns:r",
      m: "xmlns:m",
      v: "xmlns:v",
      wp14: "xmlns:wp14",
      wp: "xmlns:wp",
      w10: "xmlns:w10",
      w: "xmlns:w",
      w14: "xmlns:w14",
      w15: "xmlns:w15",
      wpg: "xmlns:wpg",
      wpi: "xmlns:wpi",
      wne: "xmlns:wne",
      wps: "xmlns:wps",
      Ignorable: "mc:Ignorable"
    });
  }
};
var Settings = class extends XmlComponent {
  constructor(options) {
    var _options$defaultTabSt, _options$hyphenation, _options$hyphenation2, _options$hyphenation3, _options$hyphenation4, _options$compatibilit, _ref, _options$compatibilit2, _options$compatibilit3;
    super("w:settings");
    this.root.push(new SettingsAttributes({
      wpc: "http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas",
      mc: "http://schemas.openxmlformats.org/markup-compatibility/2006",
      o: "urn:schemas-microsoft-com:office:office",
      r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      m: "http://schemas.openxmlformats.org/officeDocument/2006/math",
      v: "urn:schemas-microsoft-com:vml",
      wp14: "http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing",
      wp: "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
      w10: "urn:schemas-microsoft-com:office:word",
      w: "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
      w14: "http://schemas.microsoft.com/office/word/2010/wordml",
      w15: "http://schemas.microsoft.com/office/word/2012/wordml",
      wpg: "http://schemas.microsoft.com/office/word/2010/wordprocessingGroup",
      wpi: "http://schemas.microsoft.com/office/word/2010/wordprocessingInk",
      wne: "http://schemas.microsoft.com/office/word/2006/wordml",
      wps: "http://schemas.microsoft.com/office/word/2010/wordprocessingShape",
      Ignorable: "w14 w15 wp14"
    }));
    this.root.push(new OnOffElement("w:displayBackgroundShape", true));
    if (options.embedFonts !== void 0) this.root.push(new OnOffElement("w:embedTrueTypeFonts", options.embedFonts));
    if (options.trackRevisions !== void 0) this.root.push(new OnOffElement("w:trackRevisions", options.trackRevisions));
    if (options.protection !== void 0) this.root.push(new DocumentProtection(options.protection));
    this.root.push(new NumberValueElement("w:defaultTabStop", (_options$defaultTabSt = options.defaultTabStop) !== null && _options$defaultTabSt !== void 0 ? _options$defaultTabSt : 720));
    if (((_options$hyphenation = options.hyphenation) === null || _options$hyphenation === void 0 ? void 0 : _options$hyphenation.autoHyphenation) !== void 0) this.root.push(new OnOffElement("w:autoHyphenation", options.hyphenation.autoHyphenation));
    if (((_options$hyphenation2 = options.hyphenation) === null || _options$hyphenation2 === void 0 ? void 0 : _options$hyphenation2.consecutiveHyphenLimit) !== void 0) this.root.push(new NumberValueElement("w:consecutiveHyphenLimit", options.hyphenation.consecutiveHyphenLimit));
    if (((_options$hyphenation3 = options.hyphenation) === null || _options$hyphenation3 === void 0 ? void 0 : _options$hyphenation3.hyphenationZone) !== void 0) this.root.push(new NumberValueElement("w:hyphenationZone", options.hyphenation.hyphenationZone));
    if (((_options$hyphenation4 = options.hyphenation) === null || _options$hyphenation4 === void 0 ? void 0 : _options$hyphenation4.doNotHyphenateCaps) !== void 0) this.root.push(new OnOffElement("w:doNotHyphenateCaps", options.hyphenation.doNotHyphenateCaps));
    if (options.evenAndOddHeaders !== void 0) this.root.push(new OnOffElement("w:evenAndOddHeaders", options.evenAndOddHeaders));
    if (options.updateFields !== void 0) this.root.push(new OnOffElement("w:updateFields", options.updateFields));
    this.root.push(new Compatibility(_objectSpread2(_objectSpread2({}, (_options$compatibilit = options.compatibility) !== null && _options$compatibilit !== void 0 ? _options$compatibilit : {}), {}, { version: (_ref = (_options$compatibilit2 = (_options$compatibilit3 = options.compatibility) === null || _options$compatibilit3 === void 0 ? void 0 : _options$compatibilit3.version) !== null && _options$compatibilit2 !== void 0 ? _options$compatibilit2 : options.compatibilityModeVersion) !== null && _ref !== void 0 ? _ref : 15 })));
  }
};
var ComponentAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", { val: "w:val" });
  }
};
var Name = class extends XmlComponent {
  constructor(value) {
    super("w:name");
    this.root.push(new ComponentAttributes({ val: value }));
  }
};
var UiPriority = class extends XmlComponent {
  constructor(value) {
    super("w:uiPriority");
    this.root.push(new ComponentAttributes({ val: decimalNumber(value) }));
  }
};
var StyleAttributes = class extends XmlAttributeComponent {
  constructor(..._args) {
    super(..._args);
    _defineProperty2(this, "xmlKeys", {
      type: "w:type",
      styleId: "w:styleId",
      default: "w:default",
      customStyle: "w:customStyle"
    });
  }
};
var Style = class extends XmlComponent {
  constructor(attributes, options) {
    super("w:style");
    this.root.push(new StyleAttributes(attributes));
    if (options.name) this.root.push(new Name(options.name));
    if (options.basedOn && options.basedOn !== attributes.styleId) this.root.push(new StringValueElement("w:basedOn", options.basedOn));
    if (options.next) this.root.push(new StringValueElement("w:next", options.next));
    if (options.link) this.root.push(new StringValueElement("w:link", options.link));
    if (options.uiPriority !== void 0) this.root.push(new UiPriority(options.uiPriority));
    if (options.semiHidden !== void 0) this.root.push(new OnOffElement("w:semiHidden", options.semiHidden));
    if (options.unhideWhenUsed !== void 0) this.root.push(new OnOffElement("w:unhideWhenUsed", options.unhideWhenUsed));
    if (options.quickFormat !== void 0) this.root.push(new OnOffElement("w:qFormat", options.quickFormat));
  }
};
var StyleForParagraph = class extends Style {
  constructor(options) {
    super({
      type: "paragraph",
      styleId: options.id
    }, options);
    _defineProperty2(this, "paragraphProperties", void 0);
    _defineProperty2(this, "runProperties", void 0);
    this.paragraphProperties = new ParagraphProperties(options.paragraph, {
      implicitListParagraphStyle: false,
      inListOrder: false
    });
    this.runProperties = new RunProperties(options.run);
    this.root.push(this.paragraphProperties);
    this.root.push(this.runProperties);
  }
};
var StyleForCharacter = class extends Style {
  constructor(options) {
    super({
      type: "character",
      styleId: options.id
    }, _objectSpread2({
      uiPriority: 99,
      unhideWhenUsed: true
    }, options));
    _defineProperty2(this, "runProperties", void 0);
    this.runProperties = new RunProperties(options.run);
    this.root.push(this.runProperties);
  }
};
var HeadingStyle = class extends StyleForParagraph {
  constructor(options) {
    super(_objectSpread2({
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true
    }, options));
  }
};
var TitleStyle = class extends HeadingStyle {
  constructor(options) {
    super(_objectSpread2({
      id: "Title",
      name: "Title"
    }, options));
  }
};
var Heading1Style = class extends HeadingStyle {
  constructor(options) {
    super(_objectSpread2({
      id: "Heading1",
      name: "Heading 1"
    }, options));
  }
};
var Heading2Style = class extends HeadingStyle {
  constructor(options) {
    super(_objectSpread2({
      id: "Heading2",
      name: "Heading 2"
    }, options));
  }
};
var Heading3Style = class extends HeadingStyle {
  constructor(options) {
    super(_objectSpread2({
      id: "Heading3",
      name: "Heading 3"
    }, options));
  }
};
var Heading4Style = class extends HeadingStyle {
  constructor(options) {
    super(_objectSpread2({
      id: "Heading4",
      name: "Heading 4"
    }, options));
  }
};
var Heading5Style = class extends HeadingStyle {
  constructor(options) {
    super(_objectSpread2({
      id: "Heading5",
      name: "Heading 5"
    }, options));
  }
};
var Heading6Style = class extends HeadingStyle {
  constructor(options) {
    super(_objectSpread2({
      id: "Heading6",
      name: "Heading 6"
    }, options));
  }
};
var StrongStyle = class extends HeadingStyle {
  constructor(options) {
    super(_objectSpread2({
      id: "Strong",
      name: "Strong"
    }, options));
  }
};
var ListParagraph = class extends StyleForParagraph {
  constructor(options) {
    super(_objectSpread2({
      id: "ListParagraph",
      name: "List Paragraph",
      basedOn: "Normal",
      quickFormat: true
    }, options));
  }
};
var CaptionStyle = class extends StyleForParagraph {
  constructor(options) {
    super(_objectSpread2({
      id: "Caption",
      name: "caption",
      basedOn: "Normal",
      next: "Normal",
      uiPriority: 35,
      semiHidden: true,
      unhideWhenUsed: true,
      quickFormat: true,
      paragraph: { spacing: { after: 200 } },
      run: {
        italics: true,
        color: { theme: "dark2" },
        size: 18
      }
    }, options));
  }
};
var BibliographyStyle = class extends StyleForParagraph {
  constructor(options) {
    super(_objectSpread2({
      id: "Bibliography",
      name: "Bibliography",
      basedOn: "Normal",
      next: "Normal",
      uiPriority: 37,
      unhideWhenUsed: true
    }, options));
  }
};
var tableOfContentsStyles = /* @__PURE__ */ new WeakSet();
var isDefaultTableOfContentsStyle = (style) => tableOfContentsStyles.has(style);
var TableOfContentsStyle = class extends StyleForParagraph {
  /**
  * @param level - The level of the entries, 1 to 9
  * @param levelIndent - How much more each level is indented than the level above, in twips
  */
  constructor(level, levelIndent) {
    super({
      id: `TOC${level}`,
      name: `toc ${level}`,
      basedOn: "Normal",
      next: "Normal",
      uiPriority: 39,
      semiHidden: true,
      unhideWhenUsed: true,
      paragraph: _objectSpread2({ spacing: { after: 100 } }, level > 1 ? { indent: { left: (level - 1) * levelIndent } } : {})
    });
  }
  prepForXml(context) {
    const xml = super.prepForXml(context);
    tableOfContentsStyles.add(xml);
    return xml;
  }
};
var FootnoteText = class extends StyleForParagraph {
  constructor(options) {
    super(_objectSpread2({
      id: "FootnoteText",
      name: "footnote text",
      link: "FootnoteTextChar",
      basedOn: "Normal",
      uiPriority: 99,
      semiHidden: true,
      unhideWhenUsed: true,
      paragraph: { spacing: {
        after: 0,
        line: 240,
        lineRule: LineRuleType.AUTO
      } },
      run: { size: 20 }
    }, options));
  }
};
var FootnoteReferenceStyle = class extends StyleForCharacter {
  constructor(options) {
    super(_objectSpread2({
      id: "FootnoteReference",
      name: "footnote reference",
      basedOn: "DefaultParagraphFont",
      semiHidden: true,
      run: { superScript: true }
    }, options));
  }
};
var FootnoteTextChar = class extends StyleForCharacter {
  constructor(options) {
    super(_objectSpread2({
      id: "FootnoteTextChar",
      name: "Footnote Text Char",
      basedOn: "DefaultParagraphFont",
      link: "FootnoteText",
      semiHidden: true,
      run: { size: 20 }
    }, options));
  }
};
var EndnoteText = class extends StyleForParagraph {
  constructor(options) {
    super(_objectSpread2({
      id: "EndnoteText",
      name: "endnote text",
      link: "EndnoteTextChar",
      basedOn: "Normal",
      uiPriority: 99,
      semiHidden: true,
      unhideWhenUsed: true,
      paragraph: { spacing: {
        after: 0,
        line: 240,
        lineRule: LineRuleType.AUTO
      } },
      run: { size: 20 }
    }, options));
  }
};
var EndnoteReferenceStyle = class extends StyleForCharacter {
  constructor(options) {
    super(_objectSpread2({
      id: "EndnoteReference",
      name: "endnote reference",
      basedOn: "DefaultParagraphFont",
      semiHidden: true,
      run: { superScript: true }
    }, options));
  }
};
var EndnoteTextChar = class extends StyleForCharacter {
  constructor(options) {
    super(_objectSpread2({
      id: "EndnoteTextChar",
      name: "Endnote Text Char",
      basedOn: "DefaultParagraphFont",
      link: "EndnoteText",
      semiHidden: true,
      run: { size: 20 }
    }, options));
  }
};
var HyperlinkStyle = class extends StyleForCharacter {
  constructor(options) {
    super(_objectSpread2({
      id: "Hyperlink",
      name: "Hyperlink",
      basedOn: "DefaultParagraphFont",
      run: {
        color: "0563C1",
        underline: { type: UnderlineType.SINGLE }
      }
    }, options));
  }
};
var LineNumberStyle = class extends StyleForCharacter {
  constructor(options) {
    super(_objectSpread2({
      id: "LineNumber",
      name: "line number",
      basedOn: "DefaultParagraphFont",
      semiHidden: true
    }, options));
  }
};
var NormalTableStyle = class extends Style {
  constructor() {
    super({
      type: "table",
      styleId: "TableNormal",
      default: true
    }, {
      name: "Normal Table",
      uiPriority: 99,
      semiHidden: true,
      unhideWhenUsed: true
    });
    this.root.push(new TableProperties({
      indent: {
        size: 0,
        type: WidthType.DXA
      },
      cellMargin: {
        top: 0,
        left: 108,
        bottom: 0,
        right: 108
      }
    }));
  }
};
var nameOf$1 = (child2) => typeof child2 === "object" ? Object.keys(child2)[0] : void 0;
var attributesOf = (style) => {
  var _flat$find;
  return (_flat$find = [style["w:style"]].flat().find((part) => part._attr)) === null || _flat$find === void 0 ? void 0 : _flat$find._attr;
};
var styleIdOf = (style) => {
  var _attributesOf;
  return (_attributesOf = attributesOf(style)) === null || _attributesOf === void 0 ? void 0 : _attributesOf["w:styleId"];
};
var styleNameOf = (style) => {
  var _flat$find2;
  const name = (_flat$find2 = [style["w:style"]].flat().find((part) => nameOf$1(part) === "w:name")) === null || _flat$find2 === void 0 || (_flat$find2 = _flat$find2["w:name"]) === null || _flat$find2 === void 0 || (_flat$find2 = _flat$find2._attr) === null || _flat$find2 === void 0 ? void 0 : _flat$find2["w:val"];
  return name === void 0 ? void 0 : String(name).toLowerCase();
};
var isParagraphStyle = (child2) => {
  var _attributesOf$wType, _attributesOf2;
  return nameOf$1(child2) === "w:style" && ((_attributesOf$wType = (_attributesOf2 = attributesOf(child2)) === null || _attributesOf2 === void 0 ? void 0 : _attributesOf2["w:type"]) !== null && _attributesOf$wType !== void 0 ? _attributesOf$wType : "paragraph") === "paragraph";
};
var isDefaultParagraphStyle = (child2) => {
  const attributes = isParagraphStyle(child2) ? attributesOf(child2) : void 0;
  return (attributes === null || attributes === void 0 ? void 0 : attributes["w:default"]) !== void 0 && ![
    "0",
    "false",
    "off"
  ].includes(String(attributes["w:default"]));
};
var markedAsDefault = (style) => ({ "w:style": [style["w:style"]].flat().map((part) => part._attr ? { _attr: _objectSpread2(_objectSpread2({}, part._attr), {}, { "w:default": "1" }) } : part) });
var Styles = class extends XmlComponent {
  constructor(options) {
    super("w:styles");
    if (options.initialStyles) this.root.push(options.initialStyles);
    if (options.importedStyles) for (const style of options.importedStyles) this.root.push(style);
    if (options.paragraphStyles) for (const style of options.paragraphStyles) this.root.push(new StyleForParagraph(style));
    if (options.characterStyles) for (const style of options.characterStyles) this.root.push(new StyleForCharacter(style));
  }
  /**
  * Writes the styles in the schema's order: the document defaults, the latent styles, then the styles. A style id
  * can only be used once, so a style replaces an earlier one with its id. That way external styles replace docx's
  * default styles, and paragraph and character styles replace the default and imported ones. docx's TOC 1 to TOC 9
  * styles are also replaced by a paragraph style with their name, such as a template's in another language, with an id
  * of its own. Of several document defaults, or several latent styles, the last is kept. Normal is marked as the
  * default paragraph style when no style is.
  */
  prepForXml(context) {
    const xml = super.prepForXml(context);
    const children = xml["w:styles"];
    if (!Array.isArray(children)) return xml;
    const named = (name) => children.filter((child2) => nameOf$1(child2) === name);
    const ids = children.map((child2) => nameOf$1(child2) === "w:style" ? styleIdOf(child2) : void 0);
    const unique = children.filter((child2, index) => ![
      "_attr",
      "w:docDefaults",
      "w:latentStyles"
    ].includes(nameOf$1(child2)) && (ids[index] === void 0 || ids.lastIndexOf(ids[index]) === index));
    const otherNames = new Set(unique.filter((child2) => isParagraphStyle(child2) && !isDefaultTableOfContentsStyle(child2)).map(styleNameOf));
    const kept = unique.filter((child2) => !isDefaultTableOfContentsStyle(child2) || !otherNames.has(styleNameOf(child2)));
    const styles = kept.some(isDefaultParagraphStyle) ? kept : kept.map((child2) => isParagraphStyle(child2) && styleIdOf(child2) === "Normal" ? markedAsDefault(child2) : child2);
    return { "w:styles": [
      ...named("_attr"),
      ...named("w:docDefaults").slice(-1),
      ...named("w:latentStyles").slice(-1),
      ...styles
    ] };
  }
};
var ParagraphPropertiesDefaults = class extends XmlComponent {
  constructor(options) {
    super("w:pPrDefault");
    this.root.push(new ParagraphProperties(options, {
      implicitListParagraphStyle: false,
      inListOrder: false
    }));
  }
};
var RunPropertiesDefaults = class extends XmlComponent {
  constructor(options) {
    super("w:rPrDefault");
    this.root.push(new RunProperties(options));
  }
};
var DocumentDefaults = class extends XmlComponent {
  constructor(options) {
    super("w:docDefaults");
    _defineProperty2(this, "runPropertiesDefaults", void 0);
    _defineProperty2(this, "paragraphPropertiesDefaults", void 0);
    this.runPropertiesDefaults = new RunPropertiesDefaults(options.run);
    this.paragraphPropertiesDefaults = new ParagraphPropertiesDefaults(options.paragraph);
    this.root.push(this.runPropertiesDefaults);
    this.root.push(this.paragraphPropertiesDefaults);
  }
};
var ExternalStylesFactory = class {
  /**
  * Creates new Styles based on the given XML data.
  *
  * Parses the styles XML and converts them to XmlComponent instances.
  *
  * Example content from styles.xml:
  * ```xml
  * <?xml version="1.0"?>
  * <w:styles xmlns:mc="some schema" ...>
  *   <w:style w:type="paragraph" w:styleId="Heading1">
  *     <w:name w:val="heading 1"/>
  *     ...
  *   </w:style>
  *   <w:style w:type="paragraph" w:styleId="Heading2">
  *     <w:name w:val="heading 2"/>
  *     ...
  *   </w:style>
  *   <w:docDefaults>...</w:docDefaults>
  * </w:styles>
  * ```
  *
  * @param xmlData - XML string containing styles data from styles.xml
  * @returns Styles object containing all parsed styles
  * @throws Error if styles element cannot be found in the XML
  */
  newInstance(xmlData) {
    const xmlObj = parseXml(xmlData);
    let stylesXmlElement;
    for (const xmlElm of xmlObj.elements || []) if (xmlElm.name === "w:styles") stylesXmlElement = xmlElm;
    if (stylesXmlElement === void 0) throw new Error("can not find styles element");
    const stylesElements = stylesXmlElement.elements || [];
    return {
      initialStyles: new ImportedRootElementAttributes(stylesXmlElement.attributes),
      importedStyles: stylesElements.map((childElm) => convertToXmlComponent(childElm))
    };
  }
};
var tableOfContentsLevelIndentOf = (options) => {
  var _options$document;
  const size = (_options$document = options.document) === null || _options$document === void 0 || (_options$document = _options$document.run) === null || _options$document === void 0 ? void 0 : _options$document.size;
  if (size === void 0) return 200;
  return Math.round(typeof size === "number" ? size * 10 : universalMeasureToTwips(size));
};
var createTableOfContentsStyles = (levelIndent) => ({
  tableOfContents1: new TableOfContentsStyle(1, levelIndent),
  tableOfContents2: new TableOfContentsStyle(2, levelIndent),
  tableOfContents3: new TableOfContentsStyle(3, levelIndent),
  tableOfContents4: new TableOfContentsStyle(4, levelIndent),
  tableOfContents5: new TableOfContentsStyle(5, levelIndent),
  tableOfContents6: new TableOfContentsStyle(6, levelIndent),
  tableOfContents7: new TableOfContentsStyle(7, levelIndent),
  tableOfContents8: new TableOfContentsStyle(8, levelIndent),
  tableOfContents9: new TableOfContentsStyle(9, levelIndent)
});
var createDefaultStyles = (options = {}) => {
  var _options$document2;
  return _objectSpread2(_objectSpread2({
    normal: new StyleForParagraph({
      id: "Normal",
      name: "Normal",
      quickFormat: true
    }),
    normalTable: new NormalTableStyle(),
    document: new DocumentDefaults((_options$document2 = options.document) !== null && _options$document2 !== void 0 ? _options$document2 : {}),
    title: new TitleStyle(_objectSpread2({ run: { size: 56 } }, options.title)),
    heading1: new Heading1Style(_objectSpread2({ run: {
      color: "2E74B5",
      size: 32
    } }, options.heading1)),
    heading2: new Heading2Style(_objectSpread2({ run: {
      color: "2E74B5",
      size: 26
    } }, options.heading2)),
    heading3: new Heading3Style(_objectSpread2({ run: {
      color: "1F4D78",
      size: 24
    } }, options.heading3)),
    heading4: new Heading4Style(_objectSpread2({ run: {
      color: "2E74B5",
      italics: true
    } }, options.heading4)),
    heading5: new Heading5Style(_objectSpread2({ run: { color: "2E74B5" } }, options.heading5)),
    heading6: new Heading6Style(_objectSpread2({ run: { color: "1F4D78" } }, options.heading6)),
    strong: new StrongStyle(_objectSpread2({ run: { bold: true } }, options.strong)),
    listParagraph: new ListParagraph(options.listParagraph || {}),
    caption: new CaptionStyle(options.caption || {}),
    bibliography: new BibliographyStyle(options.bibliography || {})
  }, createTableOfContentsStyles(tableOfContentsLevelIndentOf(options))), {}, {
    hyperlink: new HyperlinkStyle(options.hyperlink || {}),
    footnoteReference: new FootnoteReferenceStyle(options.footnoteReference || {}),
    footnoteText: new FootnoteText(options.footnoteText || {}),
    footnoteTextChar: new FootnoteTextChar(options.footnoteTextChar || {}),
    endnoteReference: new EndnoteReferenceStyle(options.endnoteReference || {}),
    endnoteText: new EndnoteText(options.endnoteText || {}),
    endnoteTextChar: new EndnoteTextChar(options.endnoteTextChar || {}),
    lineNumber: new LineNumberStyle(options.lineNumber || {})
  });
};
var DefaultStylesFactory = class {
  newInstance(options = {}) {
    return {
      initialStyles: new DocumentAttributes([
        "mc",
        "r",
        "w",
        "w14",
        "w15"
      ], "w14 w15"),
      importedStyles: Object.values(createDefaultStyles(options))
    };
  }
};
var OFFICE_FONTS = {
  headings: {
    latin: "Calibri Light",
    panose: "020F0302020204030204"
  },
  body: {
    latin: "Calibri",
    panose: "020F0502020204030204"
  }
};
var OFFICE_SCRIPT_FONTS = [
  [
    "Jpan",
    "\u6E38\u30B4\u30B7\u30C3\u30AF Light",
    "\u6E38\u660E\u671D"
  ],
  ["Hang", "\uB9D1\uC740 \uACE0\uB515"],
  [
    "Hans",
    "\u7B49\u7EBF Light",
    "\u7B49\u7EBF"
  ],
  ["Hant", "\u65B0\u7D30\u660E\u9AD4"],
  [
    "Arab",
    "Times New Roman",
    "Arial"
  ],
  [
    "Hebr",
    "Times New Roman",
    "Arial"
  ],
  [
    "Thai",
    "Angsana New",
    "Cordia New"
  ],
  ["Ethi", "Nyala"],
  ["Beng", "Vrinda"],
  ["Gujr", "Shruti"],
  [
    "Khmr",
    "MoolBoran",
    "DaunPenh"
  ],
  ["Knda", "Tunga"],
  ["Guru", "Raavi"],
  ["Cans", "Euphemia"],
  ["Cher", "Plantagenet Cherokee"],
  ["Yiii", "Microsoft Yi Baiti"],
  ["Tibt", "Microsoft Himalaya"],
  ["Thaa", "MV Boli"],
  ["Deva", "Mangal"],
  ["Telu", "Gautami"],
  ["Taml", "Latha"],
  ["Syrc", "Estrangelo Edessa"],
  ["Orya", "Kalinga"],
  ["Mlym", "Kartika"],
  ["Laoo", "DokChampa"],
  ["Sinh", "Iskoola Pota"],
  ["Mong", "Mongolian Baiti"],
  [
    "Viet",
    "Times New Roman",
    "Arial"
  ],
  ["Uigh", "Microsoft Uighur"],
  ["Geor", "Sylfaen"],
  ["Armn", "Arial"],
  ["Bugi", "Leelawadee UI"],
  ["Bopo", "Microsoft JhengHei"],
  ["Java", "Javanese Text"],
  ["Lisu", "Segoe UI"],
  ["Mymr", "Myanmar Text"],
  ["Nkoo", "Ebrima"],
  ["Olck", "Nirmala UI"],
  ["Osma", "Ebrima"],
  ["Phag", "Phagspa"],
  ["Syrn", "Estrangelo Edessa"],
  ["Syrj", "Estrangelo Edessa"],
  ["Syre", "Estrangelo Edessa"],
  ["Sora", "Nirmala UI"],
  ["Tale", "Microsoft Tai Le"],
  ["Talu", "Microsoft New Tai Lue"],
  ["Tfng", "Ebrima"]
];
var createTextFont = (name, typeface, panose) => new BuilderElement({
  name,
  attributes: {
    typeface: {
      key: "typeface",
      value: typeface
    },
    panose: {
      key: "panose",
      value: panose
    }
  }
});
var themeLatinFont = (use, fonts) => {
  const font = fonts[use];
  const latin = typeof font === "string" ? font : font === null || font === void 0 ? void 0 : font.latin;
  return latin !== null && latin !== void 0 ? latin : OFFICE_FONTS[use].latin;
};
var themeScriptFonts = (use, scripts = {}) => {
  const office = OFFICE_SCRIPT_FONTS.map(([script, headings, body = headings]) => {
    var _scripts$script;
    return [script, (_scripts$script = scripts[script]) !== null && _scripts$script !== void 0 ? _scripts$script : use === "headings" ? headings : body];
  });
  const officeScripts = new Set(office.map(([script]) => script));
  return [...office, ...Object.entries(scripts).filter(([script]) => !officeScripts.has(script))];
};
var createFontCollection = (use, fonts) => {
  const font = fonts[use];
  const { eastAsia = "", complexScript = "", scripts } = typeof font === "object" ? font : {};
  const latin = themeLatinFont(use, fonts);
  const office = OFFICE_FONTS[use];
  return new BuilderElement({
    name: use === "headings" ? "a:majorFont" : "a:minorFont",
    children: [
      createTextFont("a:latin", latin, latin === office.latin ? office.panose : void 0),
      createTextFont("a:ea", eastAsia),
      createTextFont("a:cs", complexScript),
      ...themeScriptFonts(use, scripts).map(([script, typeface]) => new BuilderElement({
        name: "a:font",
        attributes: {
          script: {
            key: "script",
            value: script
          },
          typeface: {
            key: "typeface",
            value: typeface
          }
        }
      }))
    ]
  });
};
var createFontScheme = (name, fonts = {}) => new BuilderElement({
  name: "a:fontScheme",
  attributes: { name: {
    key: "name",
    value: name
  } },
  children: [createFontCollection("headings", fonts), createFontCollection("body", fonts)]
});
var createStyleColor = (changes = []) => new BuilderElement({
  name: "a:schemeClr",
  attributes: { value: {
    key: "val",
    value: "phClr"
  } },
  children: changes.map(([name, value]) => new BuilderElement({
    name: `a:${name}`,
    attributes: { value: {
      key: "val",
      value
    } }
  }))
});
var createSolidFill = (changes) => new BuilderElement({
  name: "a:solidFill",
  children: [createStyleColor(changes)]
});
var createGradientFill = (stops) => new BuilderElement({
  name: "a:gradFill",
  attributes: { rotateWithShape: {
    key: "rotWithShape",
    value: true
  } },
  children: [new BuilderElement({
    name: "a:gsLst",
    children: stops.map((changes, index) => new BuilderElement({
      name: "a:gs",
      attributes: { position: {
        key: "pos",
        value: index * 5e4
      } },
      children: [createStyleColor(changes)]
    }))
  }), new BuilderElement({
    name: "a:lin",
    attributes: {
      angle: {
        key: "ang",
        value: 54e5
      },
      scaled: {
        key: "scaled",
        value: false
      }
    }
  })]
});
var createLine = (width) => new BuilderElement({
  name: "a:ln",
  attributes: {
    width: {
      key: "w",
      value: width
    },
    cap: {
      key: "cap",
      value: "flat"
    },
    compound: {
      key: "cmpd",
      value: "sng"
    },
    alignment: {
      key: "algn",
      value: "ctr"
    }
  },
  children: [
    createSolidFill(),
    new BuilderElement({
      name: "a:prstDash",
      attributes: { value: {
        key: "val",
        value: "solid"
      } }
    }),
    new BuilderElement({
      name: "a:miter",
      attributes: { limit: {
        key: "lim",
        value: 8e5
      } }
    })
  ]
});
var createEffectStyle = (effects) => new BuilderElement({
  name: "a:effectStyle",
  children: [new BuilderElement({
    name: "a:effectLst",
    children: effects
  })]
});
var createShadow = () => new BuilderElement({
  name: "a:outerShdw",
  attributes: {
    blurRadius: {
      key: "blurRad",
      value: 57150
    },
    distance: {
      key: "dist",
      value: 19050
    },
    direction: {
      key: "dir",
      value: 54e5
    },
    alignment: {
      key: "algn",
      value: "ctr"
    },
    rotateWithShape: {
      key: "rotWithShape",
      value: false
    }
  },
  children: [new BuilderElement({
    name: "a:srgbClr",
    attributes: { value: {
      key: "val",
      value: "000000"
    } },
    children: [new BuilderElement({
      name: "a:alpha",
      attributes: { value: {
        key: "val",
        value: 63e3
      } }
    })]
  })]
});
var createFormatScheme = () => new BuilderElement({
  name: "a:fmtScheme",
  attributes: { name: {
    key: "name",
    value: "Office"
  } },
  children: [
    new BuilderElement({
      name: "a:fillStyleLst",
      children: [
        createSolidFill(),
        createGradientFill([
          [
            ["lumMod", 11e4],
            ["satMod", 105e3],
            ["tint", 67e3]
          ],
          [
            ["lumMod", 105e3],
            ["satMod", 103e3],
            ["tint", 73e3]
          ],
          [
            ["lumMod", 105e3],
            ["satMod", 109e3],
            ["tint", 81e3]
          ]
        ]),
        createGradientFill([
          [
            ["satMod", 103e3],
            ["lumMod", 102e3],
            ["tint", 94e3]
          ],
          [
            ["satMod", 11e4],
            ["lumMod", 1e5],
            ["shade", 1e5]
          ],
          [
            ["lumMod", 99e3],
            ["satMod", 12e4],
            ["shade", 78e3]
          ]
        ])
      ]
    }),
    new BuilderElement({
      name: "a:lnStyleLst",
      children: [
        createLine(6350),
        createLine(12700),
        createLine(19050)
      ]
    }),
    new BuilderElement({
      name: "a:effectStyleLst",
      children: [
        createEffectStyle([]),
        createEffectStyle([]),
        createEffectStyle([createShadow()])
      ]
    }),
    new BuilderElement({
      name: "a:bgFillStyleLst",
      children: [
        createSolidFill(),
        createSolidFill([["tint", 95e3], ["satMod", 17e4]]),
        createGradientFill([
          [
            ["tint", 93e3],
            ["satMod", 15e4],
            ["shade", 98e3],
            ["lumMod", 102e3]
          ],
          [
            ["tint", 98e3],
            ["satMod", 13e4],
            ["shade", 9e4],
            ["lumMod", 103e3]
          ],
          [["shade", 63e3], ["satMod", 12e4]]
        ])
      ]
    })
  ]
});
var Theme = class extends XmlComponent {
  constructor({ name = "Office Theme", colors, fonts } = {}) {
    super("a:theme");
    _defineProperty2(this, "colors", void 0);
    this.colors = themeColorValues(colors);
    this.root.push(new NextAttributeComponent({
      namespace: {
        key: "xmlns:a",
        value: "http://schemas.openxmlformats.org/drawingml/2006/main"
      },
      name: {
        key: "name",
        value: name
      }
    }));
    this.root.push(new BuilderElement({
      name: "a:themeElements",
      children: [
        createColorScheme(colors ? name : "Office", colors),
        createFontScheme(fonts ? name : "Office", fonts),
        createFormatScheme()
      ]
    }));
    this.root.push(new BuilderElement({ name: "a:objectDefaults" }));
    this.root.push(new BuilderElement({ name: "a:extraClrSchemeLst" }));
  }
  /**
  * The hex color of each of the theme's colors. The system's window text and window colors are black and white.
  */
  get Colors() {
    return this.colors;
  }
};
var relationshipsPathOf = (path) => {
  const slash = path.lastIndexOf("/");
  return `${path.slice(0, slash + 1)}_rels/${path.slice(slash + 1)}.rels`;
};
var sourceOfRelationships = (path) => path.replace(/(^|\/)_rels\/([^/]*)\.rels$/, "$1$2");
var folderOf = (path) => path.slice(0, path.lastIndexOf("/") + 1);
var resolveTarget = (from, target) => {
  const normalized = target.replace(/\\/g, "/");
  return (normalized.startsWith("/") ? normalized : `${folderOf(from)}${normalized}`).split("/").reduce((segments, segment) => {
    if (segment === "" || segment === ".") return segments;
    return segment === ".." ? segments.slice(0, -1) : [...segments, segment];
  }, []).join("/");
};
var relativeTarget = (from, to) => {
  const folders = folderOf(from).split("/").filter(Boolean);
  const segments = to.split("/");
  const common = folders.findIndex((folder, index) => index >= segments.length - 1 || segments[index] !== folder);
  const shared = common === -1 ? folders.length : common;
  return [...folders.slice(shared).map(() => ".."), ...segments.slice(shared)].join("/");
};
var isSamePart = (path, other) => path.toLowerCase() === other.toLowerCase();
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  0,
  0,
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  0,
  0
]);
var clim = new u8([
  16,
  17,
  18,
  0,
  8,
  7,
  9,
  6,
  10,
  5,
  11,
  4,
  12,
  3,
  13,
  2,
  14,
  1,
  15
]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i2 = 0; i2 < 31; ++i2) b[i2] = start += 1 << eb[i2 - 1];
  var r = new i32(b[30]);
  for (var i2 = 1; i2 < 30; ++i2) for (var j = b[i2]; j < b[i2 + 1]; ++j) r[j] = j - b[i2] << 5 | i2;
  return {
    b,
    r
  };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = (function(cd, mb, r) {
  var s = cd.length;
  var i2 = 0;
  var l = new u16(mb);
  for (; i2 < s; ++i2) if (cd[i2]) ++l[cd[i2] - 1];
  var le = new u16(mb);
  for (i2 = 1; i2 < mb; ++i2) le[i2] = le[i2 - 1] + l[i2 - 1] << 1;
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i2 = 0; i2 < s; ++i2) if (cd[i2]) {
      var sv = i2 << 4 | cd[i2];
      var r_1 = mb - cd[i2];
      var v = le[cd[i2] - 1]++ << r_1;
      for (var m = v | (1 << r_1) - 1; v <= m; ++v) co[rev[v] >> rvb] = sv;
    }
  } else {
    co = new u16(s);
    for (i2 = 0; i2 < s; ++i2) if (cd[i2]) co[i2] = rev[le[cd[i2] - 1]++] >> 15 - cd[i2];
  }
  return co;
});
var flt = new u8(288);
for (i = 0; i < 144; ++i) flt[i] = 8;
var i;
for (i = 144; i < 256; ++i) flt[i] = 9;
var i;
for (i = 256; i < 280; ++i) flt[i] = 7;
var i;
for (i = 280; i < 288; ++i) flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i) fdt[i] = 5;
var i;
var flm = /* @__PURE__ */ hMap(flt, 9, 0);
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i2 = 1; i2 < a.length; ++i2) if (a[i2] > m) m = a[i2];
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0) s = 0;
  if (e == null || e > v.length) e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace) Error.captureStackTrace(e, err);
  if (!nt) throw e;
  return e;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l) return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf) buf = new u8(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt) err(0);
          break;
        }
        if (resize) cbuf(bt + l);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1) lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i2 = 0; i2 < hcLen; ++i2) clt[clim[i2]] = bits(dat, pos + i2 * 3, 7);
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i2 = 0; i2 < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) ldt[i2++] = s;
          else {
            var c = 0, n = 0;
            if (s == 16) n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i2 - 1];
            else if (s == 17) n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18) n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--) ldt[i2++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else err(1);
      if (pos > tbts) {
        if (noSt) err(0);
        break;
      }
    }
    if (resize) cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt) err(0);
        break;
      }
      if (!c) err(2);
      if (sym < 256) buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i2 = sym - 257, b = fleb[i2];
          add = bits(dat, pos, (1 << b) - 1) + fl[i2];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d) err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt) err(0);
          break;
        }
        if (resize) cbuf(bt + 131072);
        var end = bt + add;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0) err(3);
          for (; bt < dend; ++bt) buf[bt] = dict[shift + bt];
        }
        for (; bt < end; ++bt) buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm) final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var wbits = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
};
var wbits16 = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
  d[o + 2] |= v >> 16;
};
var hTree = function(d, mb) {
  var t = [];
  for (var i2 = 0; i2 < d.length; ++i2) if (d[i2]) t.push({
    s: i2,
    f: d[i2]
  });
  var s = t.length;
  var t2 = t.slice();
  if (!s) return {
    t: et,
    l: 0
  };
  if (s == 1) {
    var v = new u8(t[0].s + 1);
    v[t[0].s] = 1;
    return {
      t: v,
      l: 1
    };
  }
  t.sort(function(a, b) {
    return a.f - b.f;
  });
  t.push({
    s: -1,
    f: 25001
  });
  var l = t[0], r = t[1], i0 = 0, i1 = 1, i22 = 2;
  t[0] = {
    s: -1,
    f: l.f + r.f,
    l,
    r
  };
  while (i1 != s - 1) {
    l = t[t[i0].f < t[i22].f ? i0++ : i22++];
    r = t[i0 != i1 && t[i0].f < t[i22].f ? i0++ : i22++];
    t[i1++] = {
      s: -1,
      f: l.f + r.f,
      l,
      r
    };
  }
  var maxSym = t2[0].s;
  for (var i2 = 1; i2 < s; ++i2) if (t2[i2].s > maxSym) maxSym = t2[i2].s;
  var tr = new u16(maxSym + 1);
  var mbt = ln(t[i1 - 1], tr, 0);
  if (mbt > mb) {
    var i2 = 0, dt = 0;
    var lft = mbt - mb, cst = 1 << lft;
    t2.sort(function(a, b) {
      return tr[b.s] - tr[a.s] || a.f - b.f;
    });
    for (; i2 < s; ++i2) {
      var i2_1 = t2[i2].s;
      if (tr[i2_1] > mb) {
        dt += cst - (1 << mbt - tr[i2_1]);
        tr[i2_1] = mb;
      } else break;
    }
    dt >>= lft;
    while (dt > 0) {
      var i2_2 = t2[i2].s;
      if (tr[i2_2] < mb) dt -= 1 << mb - tr[i2_2]++ - 1;
      else ++i2;
    }
    for (; i2 >= 0 && dt; --i2) {
      var i2_3 = t2[i2].s;
      if (tr[i2_3] == mb) {
        --tr[i2_3];
        ++dt;
      }
    }
    mbt = mb;
  }
  return {
    t: new u8(tr),
    l: mbt
  };
};
var ln = function(n, l, d) {
  return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
};
var lc = function(c) {
  var s = c.length;
  while (s && !c[--s]) ;
  var cl = new u16(++s);
  var cli = 0, cln = c[0], cls = 1;
  var w = function(v) {
    cl[cli++] = v;
  };
  for (var i2 = 1; i2 <= s; ++i2) if (c[i2] == cln && i2 != s) ++cls;
  else {
    if (!cln && cls > 2) {
      for (; cls > 138; cls -= 138) w(32754);
      if (cls > 2) {
        w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
        cls = 0;
      }
    } else if (cls > 3) {
      w(cln), --cls;
      for (; cls > 6; cls -= 6) w(8304);
      if (cls > 2) w(cls - 3 << 5 | 8208), cls = 0;
    }
    while (cls--) w(cln);
    cls = 1;
    cln = c[i2];
  }
  return {
    c: cl.subarray(0, cli),
    n: s
  };
};
var clen = function(cf, cl) {
  var l = 0;
  for (var i2 = 0; i2 < cl.length; ++i2) l += cf[i2] * cl[i2];
  return l;
};
var wfblk = function(out, pos, dat) {
  var s = dat.length;
  var o = shft(pos + 2);
  out[o] = s & 255;
  out[o + 1] = s >> 8;
  out[o + 2] = out[o] ^ 255;
  out[o + 3] = out[o + 1] ^ 255;
  for (var i2 = 0; i2 < s; ++i2) out[o + i2 + 4] = dat[i2];
  return (o + 4 + s) * 8;
};
var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
  wbits(out, p++, final);
  ++lf[256];
  var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
  var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
  var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
  var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
  var lcfreq = new u16(19);
  for (var i2 = 0; i2 < lclt.length; ++i2) ++lcfreq[lclt[i2] & 31];
  for (var i2 = 0; i2 < lcdt.length; ++i2) ++lcfreq[lcdt[i2] & 31];
  var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
  var nlcc = 19;
  for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc) ;
  var flen = bl + 5 << 3;
  var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
  var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
  if (bs >= 0 && flen <= ftlen && flen <= dtlen) return wfblk(out, p, dat.subarray(bs, bs + bl));
  var lm, ll, dm, dl;
  wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
  if (dtlen < ftlen) {
    lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
    var llm = hMap(lct, mlcb, 0);
    wbits(out, p, nlc - 257);
    wbits(out, p + 5, ndc - 1);
    wbits(out, p + 10, nlcc - 4);
    p += 14;
    for (var i2 = 0; i2 < nlcc; ++i2) wbits(out, p + 3 * i2, lct[clim[i2]]);
    p += 3 * nlcc;
    var lcts = [lclt, lcdt];
    for (var it = 0; it < 2; ++it) {
      var clct = lcts[it];
      for (var i2 = 0; i2 < clct.length; ++i2) {
        var len = clct[i2] & 31;
        wbits(out, p, llm[len]), p += lct[len];
        if (len > 15) wbits(out, p, clct[i2] >> 5 & 127), p += clct[i2] >> 12;
      }
    }
  } else lm = flm, ll = flt, dm = fdm, dl = fdt;
  for (var i2 = 0; i2 < li; ++i2) {
    var sym = syms[i2];
    if (sym > 255) {
      var len = sym >> 18 & 31;
      wbits16(out, p, lm[len + 257]), p += ll[len + 257];
      if (len > 7) wbits(out, p, sym >> 23 & 31), p += fleb[len];
      var dst = sym & 31;
      wbits16(out, p, dm[dst]), p += dl[dst];
      if (dst > 3) wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
    } else wbits16(out, p, lm[sym]), p += ll[sym];
  }
  wbits16(out, p, lm[256]);
  return p + ll[256];
};
var deo = /* @__PURE__ */ new i32([
  65540,
  131080,
  131088,
  131104,
  262176,
  1048704,
  1048832,
  2114560,
  2117632
]);
var et = /* @__PURE__ */ new u8(0);
var dflt = function(dat, lvl, plvl, pre, post, st) {
  var s = st.z || dat.length;
  var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
  var w = o.subarray(pre, o.length - post);
  var lst = st.l;
  var pos = (st.r || 0) & 7;
  if (lvl) {
    if (pos) w[0] = st.r >> 3;
    var opt = deo[lvl - 1];
    var n = opt >> 13, c = opt & 8191;
    var msk_1 = (1 << plvl) - 1;
    var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
    var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
    var hsh = function(i3) {
      return (dat[i3] ^ dat[i3 + 1] << bs1_1 ^ dat[i3 + 2] << bs2_1) & msk_1;
    };
    var syms = new i32(25e3);
    var lf = new u16(288), df = new u16(32);
    var lc_1 = 0, eb = 0, i2 = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
    for (; i2 + 2 < s; ++i2) {
      var hv = hsh(i2);
      var imod = i2 & 32767, pimod = head[hv];
      prev[imod] = pimod;
      head[hv] = imod;
      if (wi <= i2) {
        var rem = s - i2;
        if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
          pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i2 - bs, pos);
          li = lc_1 = eb = 0, bs = i2;
          for (var j = 0; j < 286; ++j) lf[j] = 0;
          for (var j = 0; j < 30; ++j) df[j] = 0;
        }
        var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
        if (rem > 2 && hv == hsh(i2 - dif)) {
          var maxn = Math.min(n, rem) - 1;
          var maxd = Math.min(32767, i2);
          var ml = Math.min(258, rem);
          while (dif <= maxd && --ch_1 && imod != pimod) {
            if (dat[i2 + l] == dat[i2 + l - dif]) {
              var nl = 0;
              for (; nl < ml && dat[i2 + nl] == dat[i2 + nl - dif]; ++nl) ;
              if (nl > l) {
                l = nl, d = dif;
                if (nl > maxn) break;
                var mmd = Math.min(dif, nl - 2);
                var md2 = 0;
                for (var j = 0; j < mmd; ++j) {
                  var ti = i2 - dif + j & 32767;
                  var cd = ti - prev[ti] & 32767;
                  if (cd > md2) md2 = cd, pimod = ti;
                }
              }
            }
            imod = pimod, pimod = prev[imod];
            dif += imod - pimod & 32767;
          }
        }
        if (d) {
          syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
          var lin = revfl[l] & 31, din = revfd[d] & 31;
          eb += fleb[lin] + fdeb[din];
          ++lf[257 + lin];
          ++df[din];
          wi = i2 + l;
          ++lc_1;
        } else {
          syms[li++] = dat[i2];
          ++lf[dat[i2]];
        }
      }
    }
    for (i2 = Math.max(i2, wi); i2 < s; ++i2) {
      syms[li++] = dat[i2];
      ++lf[dat[i2]];
    }
    pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i2 - bs, pos);
    if (!lst) {
      st.r = pos & 7 | w[pos / 8 | 0] << 3;
      pos -= 7;
      st.h = head, st.p = prev, st.i = i2, st.w = wi;
    }
  } else {
    for (var i2 = st.w || 0; i2 < s + lst; i2 += 65535) {
      var e = i2 + 65535;
      if (e >= s) {
        w[pos / 8 | 0] = lst;
        e = s;
      }
      pos = wfblk(w, pos + 1, dat.subarray(i2, e));
    }
    st.i = s;
  }
  return slc(o, 0, pre + shft(pos) + post);
};
var crct = /* @__PURE__ */ (function() {
  var t = /* @__PURE__ */ new Int32Array(256);
  for (var i2 = 0; i2 < 256; ++i2) {
    var c = i2, k = 9;
    while (--k) c = (c & 1 && -306674912) ^ c >>> 1;
    t[i2] = c;
  }
  return t;
})();
var crc = function() {
  var c = -1;
  return {
    p: function(d) {
      var cr = c;
      for (var i2 = 0; i2 < d.length; ++i2) cr = crct[cr & 255 ^ d[i2]] ^ cr >>> 8;
      c = cr;
    },
    d: function() {
      return ~c;
    }
  };
};
var dopt = function(dat, opt, pre, post, st) {
  if (!st) {
    st = { l: 1 };
    if (opt.dictionary) {
      var dict = opt.dictionary.subarray(-32768);
      var newDat = new u8(dict.length + dat.length);
      newDat.set(dict);
      newDat.set(dat, dict.length);
      dat = newDat;
      st.w = dict.length;
    }
  }
  return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
};
var mrg = function(a, b) {
  var o = {};
  for (var k in a) o[k] = a[k];
  for (var k in b) o[k] = b[k];
  return o;
};
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
var wbytes = function(d, b, v) {
  for (; v; ++b) d[b] = v, v >>>= 8;
};
function deflateSync(data, opts) {
  return dopt(data, opts || {}, 0, 0);
}
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var fltn = function(d, p, t, o) {
  for (var k in d) {
    var val = d[k], n = p + k, op = o;
    if (Array.isArray(val)) op = mrg(o, val[1]), val = val[0];
    if (ArrayBuffer.isView(val)) t[n] = [val, op];
    else {
      t[n += "/"] = [new u8(0), op];
      fltn(val, n, t, o);
    }
  }
};
var te = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
try {
  td.decode(et, { stream: true });
} catch (e) {
}
var dutf8 = function(d) {
  for (var r = "", i2 = 0; ; ) {
    var c = d[i2++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i2 + eb > d.length) return {
      s: r,
      r: slc(d, i2 - 1)
    };
    if (!eb) r += String.fromCharCode(c);
    else if (eb == 3) c = ((c & 15) << 18 | (d[i2++] & 63) << 12 | (d[i2++] & 63) << 6 | d[i2++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    else if (eb & 1) r += String.fromCharCode((c & 31) << 6 | d[i2++] & 63);
    else r += String.fromCharCode((c & 15) << 12 | (d[i2++] & 63) << 6 | d[i2++] & 63);
  }
};
function strToU8(str, latin1) {
  if (latin1) {
    var ar_1 = new u8(str.length);
    for (var i2 = 0; i2 < str.length; ++i2) ar_1[i2] = str.charCodeAt(i2);
    return ar_1;
  }
  if (te) return te.encode(str);
  var l = str.length;
  var ar = new u8(str.length + (str.length >> 1));
  var ai = 0;
  var w = function(v) {
    ar[ai++] = v;
  };
  for (var i2 = 0; i2 < l; ++i2) {
    if (ai + 5 > ar.length) {
      var n = new u8(ai + 8 + (l - i2 << 1));
      n.set(ar);
      ar = n;
    }
    var c = str.charCodeAt(i2);
    if (c < 128 || latin1) w(c);
    else if (c < 2048) w(192 | c >> 6), w(128 | c & 63);
    else if (c > 55295 && c < 57344) c = 65536 + (c & 1047552) | str.charCodeAt(++i2) & 1023, w(240 | c >> 18), w(128 | c >> 12 & 63), w(128 | c >> 6 & 63), w(128 | c & 63);
    else w(224 | c >> 12), w(128 | c >> 6 & 63), w(128 | c & 63);
  }
  return slc(ar, 0, ai);
}
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i2 = 0; i2 < dat.length; i2 += 16384) r += String.fromCharCode.apply(null, dat.subarray(i2, i2 + 16384));
    return r;
  } else if (td) return td.decode(dat);
  else {
    var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
    if (r.length) err(8);
    return s;
  }
}
var slzh = function(d, b) {
  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z) {
  var fnl = b2(d, b + 28), efl = b2(d, b + 30), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl;
  var _a2 = z64hs(d, es, efl, z, b4(d, b + 20), b4(d, b + 24), b4(d, b + 42)), sc = _a2[0], su = _a2[1], off = _a2[2];
  return [
    b2(d, b + 10),
    sc,
    su,
    fn,
    es + efl + b2(d, b + 32),
    off
  ];
};
var z64hs = function(d, b, l, z, sc, su, off) {
  var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e = b + l;
  var nf = nsc + nsu + noff;
  if (z && nf) {
    for (; b + 4 < e; b += 4 + b2(d, b + 2)) if (b2(d, b) == 1) return [
      nsc ? b8(d, b + 4 + 8 * nsu) : sc,
      nsu ? b8(d, b + 4) : su,
      noff ? b8(d, b + 4 + 8 * (nsu + nsc)) : off,
      1
    ];
    if (z < 2) err(13);
  }
  return [
    sc,
    su,
    off,
    0
  ];
};
var exfl = function(ex) {
  var le = 0;
  if (ex) for (var k in ex) {
    var l = ex[k].length;
    if (l > 65535) err(9);
    le += l + 4;
  }
  return le;
};
var wzh = function(d, b, f, fn, u, c, ce, co) {
  var fl2 = fn.length, ex = f.extra, col = co && co.length;
  var exl = exfl(ex);
  wbytes(d, b, ce != null ? 33639248 : 67324752), b += 4;
  if (ce != null) d[b++] = 20, d[b++] = f.os;
  d[b] = 20, b += 2;
  d[b++] = f.flag << 1 | (c < 0 && 8), d[b++] = u && 8;
  d[b++] = f.compression & 255, d[b++] = f.compression >> 8;
  var dt = new Date(f.mtime == null ? Date.now() : f.mtime), y = dt.getFullYear() - 1980;
  if (y < 0 || y > 119) err(10);
  wbytes(d, b, y << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >> 1), b += 4;
  if (c != -1) {
    wbytes(d, b, f.crc);
    wbytes(d, b + 4, c < 0 ? -c - 2 : c);
    wbytes(d, b + 8, f.size);
  }
  wbytes(d, b + 12, fl2);
  wbytes(d, b + 14, exl), b += 16;
  if (ce != null) {
    wbytes(d, b, col);
    wbytes(d, b + 6, f.attrs);
    wbytes(d, b + 10, ce), b += 14;
  }
  d.set(fn, b);
  b += fl2;
  if (exl) for (var k in ex) {
    var exf = ex[k], l = exf.length;
    wbytes(d, b, +k);
    wbytes(d, b + 2, l);
    d.set(exf, b + 4), b += 4 + l;
  }
  if (col) d.set(co, b), b += col;
  return b;
};
var wzf = function(o, b, c, d, e) {
  wbytes(o, b, 101010256);
  wbytes(o, b + 8, c);
  wbytes(o, b + 10, c);
  wbytes(o, b + 12, d);
  wbytes(o, b + 16, e);
};
function zipSync(data, opts) {
  if (!opts) opts = {};
  var r = {};
  var files = [];
  fltn(data, "", r, opts);
  var o = 0;
  var tot = 0;
  for (var fn in r) {
    var _a2 = r[fn], file = _a2[0], p = _a2[1];
    var compression = p.level == 0 ? 0 : 8;
    var f = strToU8(fn), s = f.length;
    var com = p.comment, m = com && strToU8(com), ms = m && m.length;
    var exl = exfl(p.extra);
    if (s > 65535) err(11);
    var d = compression ? deflateSync(file, p) : file, l = d.length;
    var c = crc();
    c.p(file);
    files.push(mrg(p, {
      size: file.length,
      crc: c.d(),
      c: d,
      f,
      m,
      u: s != fn.length || m && com.length != ms,
      o,
      compression
    }));
    o += 30 + s + exl + l;
    tot += 76 + 2 * (s + exl) + (ms || 0) + l;
  }
  var out = new u8(tot + 22), oe = o, cdl = tot - o;
  for (var i2 = 0; i2 < files.length; ++i2) {
    var f = files[i2];
    wzh(out, f.o, f, f.f, f.u, f.c.length);
    var badd = 30 + f.f.length + exfl(f.extra);
    out.set(f.c, f.o + badd);
    wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
  }
  wzf(out, o, files.length, cdl, oe);
  return out;
}
function unzipSync(data, opts) {
  var files = {};
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) if (!e || data.length - e > 65558) err(13);
  var c = b2(data, e + 8);
  if (!c) return {};
  var o = b4(data, e + 16);
  var z = b4(data, e - 20) == 117853008;
  if (z) {
    var ze = b4(data, e - 12);
    z = b4(data, ze) == 101075792;
    if (z) {
      c = b4(data, ze + 32);
      o = b4(data, ze + 48);
    }
  }
  var fltr = opts && opts.filter;
  for (var i2 = 0; i2 < c; ++i2) {
    var _a2 = zh(data, o, z), c_2 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
    o = no;
    if (!fltr || fltr({
      name: fn,
      size: sc,
      originalSize: su,
      compression: c_2
    })) {
      if (!c_2) files[fn] = slc(data, b, b + sc);
      else if (c_2 == 8) files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u8(su) });
      else err(14, "unknown compression type " + c_2);
    }
  }
  return files;
}
var bytesOf$2 = (data) => typeof data === "string" ? encodeUtf8(data) : ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : new Uint8Array(data);
var zipFiles = (files) => zipSync(Object.fromEntries([...files].map(([path, data]) => [path, bytesOf$2(data)])));
var MAX_DEFLATE_RATIO = 1032;
var wrongSize = (path) => /* @__PURE__ */ new Error(`Corrupted zip: ${path} isn't the size the zip file gives it`);
var unzipFiles = (data, include = () => true) => {
  const sizes = /* @__PURE__ */ new Map();
  let compressed = 0;
  const files = unzipSync(data, { filter: ({ name, size, originalSize }) => {
    if (name.endsWith("/") || !include(name)) return false;
    compressed += size;
    if (compressed > data.length || originalSize > size * MAX_DEFLATE_RATIO) throw wrongSize(name);
    sizes.set(name, originalSize);
    return true;
  } });
  const wrong = Object.entries(files).find(([path, file]) => file.length !== sizes.get(path));
  if (wrong !== void 0) throw wrongSize(wrong[0]);
  return new Map(Object.entries(files));
};
var binaryStringOf = (data) => {
  let text2 = "";
  for (let start = 0; start < data.length; start += 32768) text2 += String.fromCharCode(...data.subarray(start, start + 32768));
  return text2;
};
var unsupported = (type) => /* @__PURE__ */ new Error(`${type} is not supported by this platform`);
var OUTPUTS = {
  uint8array: (data) => data,
  arraybuffer: (data) => data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
  array: (data) => Array.from(data),
  string: binaryStringOf,
  binarystring: binaryStringOf,
  base64: (data) => btoa(binaryStringOf(data)),
  blob: (data, mimeType) => {
    if (typeof Blob === "undefined") throw unsupported("blob");
    return new Blob([data], { type: mimeType });
  },
  nodebuffer: (data) => {
    if (typeof Buffer === "undefined") throw unsupported("nodebuffer");
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  },
  text: () => {
    throw unsupported("text");
  }
};
var zipOutput = (data, type, mimeType) => {
  const output = Object.prototype.hasOwnProperty.call(OUTPUTS, type.toLowerCase()) ? OUTPUTS[type.toLowerCase()] : void 0;
  if (output === void 0) throw unsupported(type);
  return output(data, mimeType);
};
var COLOR_NAMES = /* @__PURE__ */ new Map([
  ["dk1", "dark1"],
  ["lt1", "light1"],
  ["dk2", "dark2"],
  ["lt2", "light2"],
  ["accent1", "accent1"],
  ["accent2", "accent2"],
  ["accent3", "accent3"],
  ["accent4", "accent4"],
  ["accent5", "accent5"],
  ["accent6", "accent6"],
  ["hlink", "hyperlink"],
  ["folHlink", "followedHyperlink"]
]);
var DEFAULT_SYSTEM_COLORS = /* @__PURE__ */ new Map([["dark1", "windowText"], ["light1", "window"]]);
var THEME_TYPES = /* @__PURE__ */ new Set(["http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme", "http://purl.oclc.org/ooxml/officeDocument/relationships/theme"]);
var localName$1 = (element) => {
  var _element$name$slice, _element$name;
  return (_element$name$slice = element === null || element === void 0 || (_element$name = element.name) === null || _element$name === void 0 ? void 0 : _element$name.slice(element.name.indexOf(":") + 1)) !== null && _element$name$slice !== void 0 ? _element$name$slice : "";
};
var childElements = (element) => {
  var _element$elements$fil, _element$elements;
  return (_element$elements$fil = element === null || element === void 0 || (_element$elements = element.elements) === null || _element$elements === void 0 ? void 0 : _element$elements.filter((item) => item.type === "element")) !== null && _element$elements$fil !== void 0 ? _element$elements$fil : [];
};
var child = (element, name) => childElements(element).find((item) => localName$1(item) === name);
var attribute = (element, name) => {
  var _element$attributes;
  const value = element === null || element === void 0 || (_element$attributes = element.attributes) === null || _element$attributes === void 0 ? void 0 : _element$attributes[name];
  return value === void 0 ? void 0 : String(value);
};
var decode$1 = (bytes) => new TextDecoder(bytes[0] === 255 && bytes[1] === 254 ? "utf-16le" : bytes[0] === 254 && bytes[1] === 255 ? "utf-16be" : "utf-8").decode(bytes);
var relatedPart = (files, from, types) => {
  const relationships = files.get(relationshipsPathOf(from));
  const target = attribute(relationships && childElements(child(parseXml(decode$1(relationships)), "Relationships")).find((item) => {
    var _attribute;
    return types.has((_attribute = attribute(item, "Type")) !== null && _attribute !== void 0 ? _attribute : "");
  }), "Target");
  return target === void 0 ? void 0 : resolveTarget(from, target);
};
var themePathOf = (files, part) => relatedPart(files, part, THEME_TYPES);
var colorValue = (name, color, withSystemColors) => {
  const [value] = childElements(color);
  const hex = localName$1(value) === "srgbClr" ? attribute(value, "val") : localName$1(value) === "sysClr" && (withSystemColors || attribute(value, "val") !== DEFAULT_SYSTEM_COLORS.get(name)) ? attribute(value, "lastClr") : void 0;
  return hex !== void 0 && /^[0-9A-Fa-f]{6}$/.test(hex) ? hex.toUpperCase() : void 0;
};
var readColors = (scheme, withSystemColors = false) => Object.fromEntries(childElements(scheme).flatMap((color) => {
  const name = COLOR_NAMES.get(localName$1(color));
  const value = name && colorValue(name, color, withSystemColors);
  return name && value ? [[name, value]] : [];
}));
var readThemeColorValues = (xml) => {
  const [root] = childElements(parseXml(xml));
  const scheme = localName$1(root) === "theme" ? child(child(root, "themeElements"), "clrScheme") : void 0;
  return scheme ? readColors(scheme, true) : {};
};
var COMPOUND_FILE_SIGNATURE = [
  208,
  207,
  17,
  224,
  161,
  177,
  26,
  225
];
var File = class {
  constructor(options) {
    var _options$creator, _options$revision, _options$lastModified, _options$comments, _options$customProper, _this$macros, _options$features, _options$features2, _options$fonts, _options$hyphenation, _options$hyphenation2, _options$hyphenation3, _options$hyphenation4, _options$fonts2;
    _defineProperty2(this, "currentRelationshipId", 1);
    _defineProperty2(this, "documentWrapper", void 0);
    _defineProperty2(this, "headers", []);
    _defineProperty2(this, "footers", []);
    _defineProperty2(this, "coreProperties", void 0);
    _defineProperty2(this, "numbering", void 0);
    _defineProperty2(this, "media", void 0);
    _defineProperty2(this, "fileRelationships", void 0);
    _defineProperty2(this, "footnotesWrapper", void 0);
    _defineProperty2(this, "endnotesWrapper", void 0);
    _defineProperty2(this, "settings", void 0);
    _defineProperty2(this, "contentTypes", void 0);
    _defineProperty2(this, "customProperties", void 0);
    _defineProperty2(this, "appProperties", void 0);
    _defineProperty2(this, "styles", void 0);
    _defineProperty2(this, "comments", void 0);
    _defineProperty2(
      this,
      /** Extended comment data for reply threading and resolved state (word/commentsExtended.xml). */
      "commentsExtended",
      void 0
    );
    _defineProperty2(
      this,
      /** Durable comment id mapping (word/commentsIds.xml). */
      "commentsIds",
      void 0
    );
    _defineProperty2(this, "fontWrapper", void 0);
    _defineProperty2(this, "theme", void 0);
    _defineProperty2(this, "packageParts", void 0);
    _defineProperty2(this, "macros", void 0);
    _defineProperty2(this, "bibliography", void 0);
    if (options.macros !== void 0) {
      const { project, events = [] } = options.macros;
      const bytes = project instanceof Uint8Array ? project : new Uint8Array(project);
      if (!COMPOUND_FILE_SIGNATURE.every((byte, index) => bytes[index] === byte)) throw new Error("macros.project isn't a VBA project. Use createMacros from docx/macros, or the word/vbaProject.bin in a .docm rather than the .docm itself");
      const relationships = new Relationships();
      if (events.length > 0) relationships.addRelationship(1, "http://schemas.microsoft.com/office/2006/relationships/wordVbaData", "vbaData.xml");
      this.macros = {
        project: bytes,
        events: events.length > 0 ? createMacroEvents(events) : void 0,
        relationships
      };
    }
    this.coreProperties = new CoreProperties(_objectSpread2(_objectSpread2({}, options), {}, {
      creator: (_options$creator = options.creator) !== null && _options$creator !== void 0 ? _options$creator : "Un-named",
      revision: (_options$revision = options.revision) !== null && _options$revision !== void 0 ? _options$revision : 1,
      lastModifiedBy: (_options$lastModified = options.lastModifiedBy) !== null && _options$lastModified !== void 0 ? _options$lastModified : "Un-named"
    }));
    this.numbering = new Numbering(options.numbering ? options.numbering : { config: [] });
    this.comments = new Comments((_options$comments = options.comments) !== null && _options$comments !== void 0 ? _options$comments : { children: [] });
    if (this.comments.ThreadData) this.commentsExtended = new CommentsExtended(this.comments.ThreadData);
    if (this.comments.CommentIdsData) this.commentsIds = new CommentsIds(this.comments.CommentIdsData);
    this.fileRelationships = new Relationships();
    this.customProperties = new CustomProperties((_options$customProper = options.customProperties) !== null && _options$customProper !== void 0 ? _options$customProper : []);
    this.appProperties = new AppProperties();
    this.footnotesWrapper = new FootnotesWrapper();
    this.endnotesWrapper = new EndnotesWrapper();
    this.contentTypes = new ContentTypes({ macros: this.macros !== void 0 });
    if (((_this$macros = this.macros) === null || _this$macros === void 0 ? void 0 : _this$macros.events) !== void 0) this.contentTypes.addOverride("application/vnd.ms-word.vbaData+xml", "/word/vbaData.xml");
    if (options.bibliography !== void 0) {
      const relationships = new Relationships();
      relationships.addRelationship(1, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXmlProps", "itemProps1.xml");
      this.bibliography = {
        sources: options.bibliography.sources,
        properties: createSourcesProperties(`{${uniqueUuid().toUpperCase()}}`),
        relationships
      };
      this.contentTypes.addOverride("application/vnd.openxmlformats-officedocument.customXmlProperties+xml", "/customXml/itemProps1.xml");
    }
    this.packageParts = new PackageParts(this.contentTypes);
    this.documentWrapper = new DocumentWrapper({
      background: options.background,
      pageNumbers: options.pageNumbers
    });
    this.settings = new Settings({
      compatibilityModeVersion: options.compatabilityModeVersion,
      compatibility: options.compatibility,
      evenAndOddHeaders: options.evenAndOddHeaderAndFooters ? true : false,
      trackRevisions: (_options$features = options.features) === null || _options$features === void 0 ? void 0 : _options$features.trackRevisions,
      updateFields: (_options$features2 = options.features) === null || _options$features2 === void 0 ? void 0 : _options$features2.updateFields,
      embedFonts: ((_options$fonts = options.fonts) === null || _options$fonts === void 0 ? void 0 : _options$fonts.length) ? true : void 0,
      defaultTabStop: options.defaultTabStop,
      protection: options.protection,
      hyphenation: {
        autoHyphenation: (_options$hyphenation = options.hyphenation) === null || _options$hyphenation === void 0 ? void 0 : _options$hyphenation.autoHyphenation,
        hyphenationZone: (_options$hyphenation2 = options.hyphenation) === null || _options$hyphenation2 === void 0 ? void 0 : _options$hyphenation2.hyphenationZone,
        consecutiveHyphenLimit: (_options$hyphenation3 = options.hyphenation) === null || _options$hyphenation3 === void 0 ? void 0 : _options$hyphenation3.consecutiveHyphenLimit,
        doNotHyphenateCaps: (_options$hyphenation4 = options.hyphenation) === null || _options$hyphenation4 === void 0 ? void 0 : _options$hyphenation4.doNotHyphenateCaps
      }
    });
    this.media = new Media((extension) => this.packageParts.takePath("media", "image", extension));
    if (options.externalStyles !== void 0) {
      var _options$styles$defau, _options$styles, _options$styles2, _options$styles3;
      const given = (_options$styles$defau = (_options$styles = options.styles) === null || _options$styles === void 0 ? void 0 : _options$styles.default) !== null && _options$styles$defau !== void 0 ? _options$styles$defau : {};
      const defaultStyles = Object.entries(createDefaultStyles(given));
      const isGiven = ([key]) => given[key] !== void 0;
      const externalStyles = new ExternalStylesFactory().newInstance(options.externalStyles);
      this.styles = new Styles(_objectSpread2(_objectSpread2({}, externalStyles), {}, {
        paragraphStyles: (_options$styles2 = options.styles) === null || _options$styles2 === void 0 ? void 0 : _options$styles2.paragraphStyles,
        characterStyles: (_options$styles3 = options.styles) === null || _options$styles3 === void 0 ? void 0 : _options$styles3.characterStyles,
        importedStyles: [
          ...defaultStyles.filter((entry) => !isGiven(entry)).map(([, style]) => style),
          ...externalStyles.importedStyles,
          ...defaultStyles.filter(isGiven).map(([, style]) => style)
        ]
      }));
    } else if (options.styles) {
      const defaultStyles = new DefaultStylesFactory().newInstance(options.styles.default);
      this.styles = new Styles(_objectSpread2(_objectSpread2({}, defaultStyles), options.styles));
    } else {
      const stylesFactory = new DefaultStylesFactory();
      this.styles = new Styles(stylesFactory.newInstance());
    }
    this.addDefaultRelationships();
    for (const section of options.sections) this.addSection(section);
    if (options.footnotes) for (const key in options.footnotes) this.footnotesWrapper.View.createFootNote(parseFloat(key), options.footnotes[key].children);
    if (options.endnotes) for (const key in options.endnotes) this.endnotesWrapper.View.createEndnote(parseFloat(key), options.endnotes[key].children);
    this.fontWrapper = new FontWrapper((_options$fonts2 = options.fonts) !== null && _options$fonts2 !== void 0 ? _options$fonts2 : []);
    this.theme = new Theme(options.theme);
    this.documentWrapper.Relationships.addRelationship(this.currentRelationshipId++, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme", "theme/theme1.xml");
    if (this.macros !== void 0) this.documentWrapper.Relationships.addRelationship(this.currentRelationshipId++, "http://schemas.microsoft.com/office/2006/relationships/vbaProject", "vbaProject.bin");
    if (this.bibliography !== void 0) this.documentWrapper.Relationships.addRelationship(this.currentRelationshipId++, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml", "../customXml/item1.xml");
  }
  addSection({ headers = {}, footers = {}, children, properties }) {
    this.documentWrapper.View.Body.addSection(_objectSpread2(_objectSpread2({}, properties), {}, {
      headerWrapperGroup: {
        default: headers.default ? this.createHeader(headers.default) : void 0,
        first: headers.first ? this.createHeader(headers.first) : void 0,
        even: headers.even ? this.createHeader(headers.even) : void 0
      },
      footerWrapperGroup: {
        default: footers.default ? this.createFooter(footers.default) : void 0,
        first: footers.first ? this.createFooter(footers.first) : void 0,
        even: footers.even ? this.createFooter(footers.even) : void 0
      }
    }));
    for (const child2 of children) this.documentWrapper.View.add(child2);
  }
  createHeader(header) {
    const wrapper = new HeaderWrapper(this.media, this.currentRelationshipId++);
    for (const child2 of header.options.children) wrapper.add(child2);
    this.addHeaderToDocument(wrapper);
    return wrapper;
  }
  createFooter(footer) {
    const wrapper = new FooterWrapper(this.media, this.currentRelationshipId++);
    for (const child2 of footer.options.children) wrapper.add(child2);
    this.addFooterToDocument(wrapper);
    return wrapper;
  }
  addHeaderToDocument(header, type = HeaderFooterReferenceType.DEFAULT) {
    this.headers.push({
      header,
      type
    });
    this.documentWrapper.Relationships.addRelationship(header.View.ReferenceId, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/header", `header${this.headers.length}.xml`);
    this.contentTypes.addHeader(this.headers.length);
  }
  addFooterToDocument(footer, type = HeaderFooterReferenceType.DEFAULT) {
    this.footers.push({
      footer,
      type
    });
    this.documentWrapper.Relationships.addRelationship(footer.View.ReferenceId, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer", `footer${this.footers.length}.xml`);
    this.contentTypes.addFooter(this.footers.length);
  }
  addDefaultRelationships() {
    this.fileRelationships.addRelationship(1, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument", "word/document.xml");
    this.fileRelationships.addRelationship(2, "http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties", "docProps/core.xml");
    this.fileRelationships.addRelationship(3, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties", "docProps/app.xml");
    this.fileRelationships.addRelationship(4, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties", "docProps/custom.xml");
    this.documentWrapper.Relationships.addRelationship(this.currentRelationshipId++, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles", "styles.xml");
    this.documentWrapper.Relationships.addRelationship(this.currentRelationshipId++, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering", "numbering.xml");
    this.documentWrapper.Relationships.addRelationship(this.currentRelationshipId++, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes", "footnotes.xml");
    this.documentWrapper.Relationships.addRelationship(this.currentRelationshipId++, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/endnotes", "endnotes.xml");
    this.documentWrapper.Relationships.addRelationship(this.currentRelationshipId++, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings", "settings.xml");
    if (!this.comments.IsEmpty) {
      this.documentWrapper.Relationships.addRelationship(this.currentRelationshipId++, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments", "comments.xml");
      this.contentTypes.addComments();
    }
    if (this.commentsExtended) {
      this.documentWrapper.Relationships.addRelationship(this.currentRelationshipId++, "http://schemas.microsoft.com/office/2011/relationships/commentsExtended", "commentsExtended.xml");
      this.contentTypes.addCommentsExtended();
    }
    if (this.commentsIds) {
      this.documentWrapper.Relationships.addRelationship(this.currentRelationshipId++, "http://schemas.microsoft.com/office/2016/09/relationships/commentsIds", "commentsIds.xml");
      this.contentTypes.addCommentsIds();
    }
  }
  get Document() {
    return this.documentWrapper;
  }
  get Styles() {
    return this.styles;
  }
  get CoreProperties() {
    return this.coreProperties;
  }
  get Numbering() {
    return this.numbering;
  }
  get Media() {
    return this.media;
  }
  get FileRelationships() {
    return this.fileRelationships;
  }
  get Headers() {
    return this.headers.map((item) => item.header);
  }
  get Footers() {
    return this.footers.map((item) => item.footer);
  }
  get ContentTypes() {
    return this.contentTypes;
  }
  get CustomProperties() {
    return this.customProperties;
  }
  get AppProperties() {
    return this.appProperties;
  }
  get FootNotes() {
    return this.footnotesWrapper;
  }
  get Endnotes() {
    return this.endnotesWrapper;
  }
  get Settings() {
    return this.settings;
  }
  get Comments() {
    return this.comments;
  }
  /** Extended comments part for reply threading. Undefined when no comment threads exist. */
  get CommentsExtended() {
    return this.commentsExtended;
  }
  /** Durable comment id part. Undefined when no comment carries a durableId. */
  get CommentsIds() {
    return this.commentsIds;
  }
  get FontTable() {
    return this.fontWrapper;
  }
  /** The document's theme (word/theme/theme1.xml). */
  get Theme() {
    return this.theme;
  }
  /** The parts that drawings, such as charts, add to the package when it is written. */
  get PackageParts() {
    return this.packageParts;
  }
  /**
  * The document's macros, when it has any: its VBA project (word/vbaProject.bin), the events of the document it
  * handles (word/vbaData.xml), and the project's relationships, to the events.
  */
  get Macros() {
    return this.macros;
  }
  /**
  * The document's sources, when it has a bibliography: the part they're in (customXml/item1.xml), its properties
  * (customXml/itemProps1.xml), and its relationships, to its properties.
  */
  get Bibliography() {
    return this.bibliography;
  }
};
var obfuscatedStartOffset = 0;
var obfuscatedEndOffset = 32;
var guidSize = 32;
var obfuscate = (buf, fontKey) => {
  const guid = fontKey.replace(/-/g, "");
  if (guid.length !== guidSize) throw new Error(`Error: Cannot extract GUID from font filename: ${fontKey}`);
  const hexNumbers = guid.replace(/(..)/g, "$1 ").trim().split(" ").map((hexString) => parseInt(hexString, 16));
  hexNumbers.reverse();
  const obfuscatedBytes = buf.slice(obfuscatedStartOffset, obfuscatedEndOffset).map((byte, i2) => byte ^ hexNumbers[i2 % hexNumbers.length]);
  const out = new Uint8Array(obfuscatedStartOffset + obfuscatedBytes.length + Math.max(0, buf.length - obfuscatedEndOffset));
  out.set(buf.slice(0, obfuscatedStartOffset));
  out.set(obfuscatedBytes, obfuscatedStartOffset);
  out.set(buf.slice(obfuscatedEndOffset), obfuscatedStartOffset + obfuscatedBytes.length);
  return out;
};
var Formatter = class {
  /**
  * Formats an XML component into a serializable object.
  *
  * @param input - The XML component to format
  * @param context - The context containing file state and relationships
  * @returns A serializable XML object structure
  * @throws Error if the component cannot be formatted correctly
  */
  format(input, context = { stack: [] }) {
    const output = input.prepForXml(context);
    if (output) return output;
    else throw Error("XMLComponent did not format correctly");
  }
};
var PLACEHOLDER = /\{([^{}]+)\}/g;
var replacePlaceholders = (xmlData, values) => values.size === 0 ? xmlData : xmlData.replace(PLACEHOLDER, (placeholder, key) => {
  var _values$get;
  return (_values$get = values.get(key)) !== null && _values$get !== void 0 ? _values$get : placeholder;
});
var findPlaceholders = (xmlData) => new Set(Array.from(xmlData.matchAll(PLACEHOLDER), ([, key]) => key));
var ImageReplacer = class {
  /**
  * Replaces image placeholder tokens with relationship IDs.
  *
  * @param xmlData - The XML string containing image placeholders
  * @param images - The images the XML refers to, in the order their relationships are numbered
  * @param offset - Starting offset for relationship IDs
  * @returns XML string with placeholders replaced by relationship IDs
  */
  replace(xmlData, images, offset) {
    return replacePlaceholders(xmlData, new Map(images.map((image2, i2) => [image2.key, (offset + i2).toString()])));
  }
  /**
  * Finds the images referenced in the XML content.
  *
  * @param xmlData - The XML string to search for image references
  * @param media - The media collection to search within
  * @returns The images found in the XML, in the order they were added to the media
  */
  getMediaData(xmlData, media) {
    const placeholders = findPlaceholders(xmlData);
    return media.Entries.filter(([key]) => placeholders.has(key)).map(([key, { fileName }]) => ({
      key,
      fileName
    }));
  }
};
var NumberingReplacer = class {
  /**
  * Replaces numbering placeholder tokens with actual numbering IDs.
  *
  * Placeholder format: {reference-instance} where reference identifies the
  * numbering definition and instance is the specific usage.
  *
  * @param xmlData - The XML string containing numbering placeholders
  * @param concreteNumberings - Array of concrete numbering instances to replace
  * @returns XML string with placeholders replaced by numbering IDs
  */
  replace(xmlData, concreteNumberings) {
    return replacePlaceholders(xmlData, new Map(concreteNumberings.map(({ reference: reference2, instance, restartedListId, numId }) => [listKey(reference2, instance, restartedListId), numId.toString()])));
  }
};
var formatter$4 = new Formatter();
var xmlifyPart = (file, content, prettify, relationships, standalone = true) => stringifyXmlable(formatter$4.format(content, {
  viewWrapper: {
    View: content,
    Relationships: relationships
  },
  file,
  stack: []
}), {
  indent: prettify,
  declaration: standalone ? {
    standalone: "yes",
    encoding: "UTF-8"
  } : { encoding: "UTF-8" }
});
var xmlifyPackagePart = (file, part, path, prettify) => {
  const { content } = part.options;
  if (content instanceof Uint8Array) return [{
    data: content,
    path: `word/${path}`
  }];
  if ("files" in content) return [{
    data: zipFiles(content.files.map(({ path: filePath, content: fileContent }) => [filePath, fileContent instanceof Uint8Array ? fileContent : xmlifyPart(file, fileContent, prettify, new Relationships())])),
    path: `word/${path}`
  }];
  const relationships = file.PackageParts.createRelationships(path);
  const data = xmlifyPart(file, content, prettify, relationships);
  const folder = path.slice(0, path.lastIndexOf("/"));
  const name = path.slice(path.lastIndexOf("/") + 1);
  return [{
    data,
    path: `word/${path}`
  }, ...relationships.RelationshipCount > 0 ? [{
    data: xmlifyPart(file, relationships, prettify, relationships, false),
    path: `word/${folder}/_rels/${name}.rels`
  }] : []];
};
var xmlifyPackageParts = (file, prettify, from = 0) => {
  const parts = file.PackageParts.Array.slice(from);
  if (parts.length === 0) return [];
  return [...parts.flatMap(({ part, path }) => xmlifyPackagePart(file, part, path, prettify)), ...xmlifyPackageParts(file, prettify, from + parts.length)];
};
var _excluded = ["PackageParts"];
var Compiler = class {
  /**
  * Creates a new Compiler instance.
  *
  * Initializes the formatter and replacer utilities used during compilation.
  */
  constructor() {
    _defineProperty2(this, "formatter", void 0);
    _defineProperty2(this, "imageReplacer", void 0);
    _defineProperty2(this, "numberingReplacer", void 0);
    this.formatter = new Formatter();
    this.imageReplacer = new ImageReplacer();
    this.numberingReplacer = new NumberingReplacer();
  }
  /**
  * Compiles a File object into the files of the complete OOXML package, which the Packer zips.
  *
  * This method orchestrates the entire compilation process:
  * - Converts all document components to XML
  * - Manages image and numbering placeholder replacements
  * - Creates relationship files
  * - Packages fonts and media files
  *
  * @param file - The document to compile
  * @param prettifyXml - Optional XML formatting style
  * @param overrides - Optional custom XML file overrides
  * @returns The package's files by their paths, in the order they are zipped
  */
  compile(file, prettifyXml, overrides = []) {
    const _this$xmlifyFile = this.xmlifyFile(file, prettifyXml), { PackageParts: packageParts } = _this$xmlifyFile, xmlifiedFileMapping = _objectWithoutProperties(_this$xmlifyFile, _excluded);
    const xmlifiedFiles = Object.values(xmlifiedFileMapping).flatMap((obj) => Array.isArray(obj) ? obj : [obj]);
    return new Map([
      ...xmlifiedFiles.map(({ path, data }) => [path, data]),
      ...packageParts.map(({ path, data }) => [path, data]),
      ...overrides.map(({ path, data }) => [path, data]),
      ...file.Macros === void 0 ? [] : [["word/vbaProject.bin", file.Macros.project]],
      ...file.Media.Array.map((data) => [`word/media/${data.fileName}`, data.data]),
      ...file.FontTable.files.map(({ data: buffer, fontKey }, i2) => [`word/fonts/font${i2 + 1}.odttf`, obfuscate(buffer, fontKey)])
    ]);
  }
  xmlifyFile(file, prettify) {
    var _file$Macros;
    const documentXmlData = stringifyXmlable(this.formatter.format(file.Document.View, {
      viewWrapper: file.Document,
      file,
      stack: []
    }), {
      indent: prettify,
      declaration: {
        standalone: "yes",
        encoding: "UTF-8"
      }
    });
    const commentXmlData = stringifyXmlable(this.formatter.format(file.Comments, {
      viewWrapper: {
        View: file.Comments,
        Relationships: file.Comments.Relationships
      },
      file,
      stack: []
    }), {
      indent: prettify,
      declaration: {
        standalone: "yes",
        encoding: "UTF-8"
      }
    });
    const footnoteXmlData = stringifyXmlable(this.formatter.format(file.FootNotes.View, {
      viewWrapper: file.FootNotes,
      file,
      stack: []
    }), {
      indent: prettify,
      declaration: {
        standalone: "yes",
        encoding: "UTF-8"
      }
    });
    const endnoteXmlData = stringifyXmlable(this.formatter.format(file.Endnotes.View, {
      viewWrapper: file.Endnotes,
      file,
      stack: []
    }), {
      indent: prettify,
      declaration: { encoding: "UTF-8" }
    });
    const documentRelationshipCount = file.Document.Relationships.RelationshipCount + 1;
    const commentRelationshipCount = file.Comments.Relationships.RelationshipCount + 1;
    const footnoteRelationshipCount = file.FootNotes.Relationships.RelationshipCount + 1;
    const endnoteRelationshipCount = file.Endnotes.Relationships.RelationshipCount + 1;
    const documentMediaDatas = this.imageReplacer.getMediaData(documentXmlData, file.Media);
    const commentMediaDatas = this.imageReplacer.getMediaData(commentXmlData, file.Media);
    const footnoteMediaDatas = this.imageReplacer.getMediaData(footnoteXmlData, file.Media);
    const endnoteMediaDatas = this.imageReplacer.getMediaData(endnoteXmlData, file.Media);
    return _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({
      Relationships: {
        data: (() => {
          const relationships = Relationships.copy(file.Document.Relationships);
          documentMediaDatas.forEach((mediaData, i2) => {
            relationships.addRelationship(documentRelationshipCount + i2, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", `media/${mediaData.fileName}`);
          });
          relationships.addRelationship(relationships.RelationshipCount + 1, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable", "fontTable.xml");
          return stringifyXmlable(this.formatter.format(relationships, {
            viewWrapper: file.Document,
            file,
            stack: []
          }), {
            indent: prettify,
            declaration: { encoding: "UTF-8" }
          });
        })(),
        path: "word/_rels/document.xml.rels"
      },
      Document: {
        data: (() => {
          const xmlData = this.imageReplacer.replace(documentXmlData, documentMediaDatas, documentRelationshipCount);
          return this.numberingReplacer.replace(xmlData, file.Numbering.ConcreteNumbering);
        })(),
        path: "word/document.xml"
      },
      Styles: {
        data: (() => {
          const xmlStyles = stringifyXmlable(this.formatter.format(file.Styles, {
            viewWrapper: file.Document,
            file,
            stack: []
          }), {
            indent: prettify,
            declaration: {
              standalone: "yes",
              encoding: "UTF-8"
            }
          });
          return this.numberingReplacer.replace(xmlStyles, file.Numbering.ConcreteNumbering);
        })(),
        path: "word/styles.xml"
      },
      Properties: {
        data: stringifyXmlable(this.formatter.format(file.CoreProperties, {
          viewWrapper: file.Document,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: {
            standalone: "yes",
            encoding: "UTF-8"
          }
        }),
        path: "docProps/core.xml"
      },
      FileRelationships: {
        data: stringifyXmlable(this.formatter.format(file.FileRelationships, {
          viewWrapper: file.Document,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: { encoding: "UTF-8" }
        }),
        path: "_rels/.rels"
      },
      HeaderRelationships: file.Headers.map((headerWrapper, index) => {
        const xmlData = stringifyXmlable(this.formatter.format(headerWrapper.View, {
          viewWrapper: headerWrapper,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: { encoding: "UTF-8" }
        });
        const mediaDatas = this.imageReplacer.getMediaData(xmlData, file.Media);
        const relationships = Relationships.copy(headerWrapper.Relationships);
        mediaDatas.forEach((mediaData, i2) => {
          relationships.addRelationship(i2, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", `media/${mediaData.fileName}`);
        });
        return {
          data: stringifyXmlable(this.formatter.format(relationships, {
            viewWrapper: headerWrapper,
            file,
            stack: []
          }), {
            indent: prettify,
            declaration: { encoding: "UTF-8" }
          }),
          path: `word/_rels/header${index + 1}.xml.rels`
        };
      }),
      FooterRelationships: file.Footers.map((footerWrapper, index) => {
        const xmlData = stringifyXmlable(this.formatter.format(footerWrapper.View, {
          viewWrapper: footerWrapper,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: { encoding: "UTF-8" }
        });
        const mediaDatas = this.imageReplacer.getMediaData(xmlData, file.Media);
        const relationships = Relationships.copy(footerWrapper.Relationships);
        mediaDatas.forEach((mediaData, i2) => {
          relationships.addRelationship(i2, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", `media/${mediaData.fileName}`);
        });
        return {
          data: stringifyXmlable(this.formatter.format(relationships, {
            viewWrapper: footerWrapper,
            file,
            stack: []
          }), {
            indent: prettify,
            declaration: { encoding: "UTF-8" }
          }),
          path: `word/_rels/footer${index + 1}.xml.rels`
        };
      }),
      Headers: file.Headers.map((headerWrapper, index) => {
        const tempXmlData = stringifyXmlable(this.formatter.format(headerWrapper.View, {
          viewWrapper: headerWrapper,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: { encoding: "UTF-8" }
        });
        const mediaDatas = this.imageReplacer.getMediaData(tempXmlData, file.Media);
        const xmlData = this.imageReplacer.replace(tempXmlData, mediaDatas, 0);
        return {
          data: this.numberingReplacer.replace(xmlData, file.Numbering.ConcreteNumbering),
          path: `word/header${index + 1}.xml`
        };
      }),
      Footers: file.Footers.map((footerWrapper, index) => {
        const tempXmlData = stringifyXmlable(this.formatter.format(footerWrapper.View, {
          viewWrapper: footerWrapper,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: { encoding: "UTF-8" }
        });
        const mediaDatas = this.imageReplacer.getMediaData(tempXmlData, file.Media);
        const xmlData = this.imageReplacer.replace(tempXmlData, mediaDatas, 0);
        return {
          data: this.numberingReplacer.replace(xmlData, file.Numbering.ConcreteNumbering),
          path: `word/footer${index + 1}.xml`
        };
      }),
      CustomProperties: {
        data: stringifyXmlable(this.formatter.format(file.CustomProperties, {
          viewWrapper: file.Document,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: {
            standalone: "yes",
            encoding: "UTF-8"
          }
        }),
        path: "docProps/custom.xml"
      },
      AppProperties: {
        data: stringifyXmlable(this.formatter.format(file.AppProperties, {
          viewWrapper: file.Document,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: {
            standalone: "yes",
            encoding: "UTF-8"
          }
        }),
        path: "docProps/app.xml"
      },
      FootNotes: {
        data: (() => {
          const xmlData = this.imageReplacer.replace(footnoteXmlData, footnoteMediaDatas, footnoteRelationshipCount);
          return this.numberingReplacer.replace(xmlData, file.Numbering.ConcreteNumbering);
        })(),
        path: "word/footnotes.xml"
      },
      FootNotesRelationships: {
        data: (() => {
          const relationships = Relationships.copy(file.FootNotes.Relationships);
          footnoteMediaDatas.forEach((mediaData, i2) => {
            relationships.addRelationship(footnoteRelationshipCount + i2, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", `media/${mediaData.fileName}`);
          });
          return stringifyXmlable(this.formatter.format(relationships, {
            viewWrapper: file.FootNotes,
            file,
            stack: []
          }), {
            indent: prettify,
            declaration: { encoding: "UTF-8" }
          });
        })(),
        path: "word/_rels/footnotes.xml.rels"
      },
      Endnotes: {
        data: (() => {
          const xmlData = this.imageReplacer.replace(endnoteXmlData, endnoteMediaDatas, endnoteRelationshipCount);
          return this.numberingReplacer.replace(xmlData, file.Numbering.ConcreteNumbering);
        })(),
        path: "word/endnotes.xml"
      },
      EndnotesRelationships: {
        data: (() => {
          const relationships = Relationships.copy(file.Endnotes.Relationships);
          endnoteMediaDatas.forEach((mediaData, i2) => {
            relationships.addRelationship(endnoteRelationshipCount + i2, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", `media/${mediaData.fileName}`);
          });
          return stringifyXmlable(this.formatter.format(relationships, {
            viewWrapper: file.Endnotes,
            file,
            stack: []
          }), {
            indent: prettify,
            declaration: { encoding: "UTF-8" }
          });
        })(),
        path: "word/_rels/endnotes.xml.rels"
      },
      Settings: {
        data: stringifyXmlable(this.formatter.format(file.Settings, {
          viewWrapper: file.Document,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: {
            standalone: "yes",
            encoding: "UTF-8"
          }
        }),
        path: "word/settings.xml"
      }
    }, file.Comments.IsEmpty ? {} : {
      Comments: {
        data: (() => {
          const xmlData = this.imageReplacer.replace(commentXmlData, commentMediaDatas, commentRelationshipCount);
          return this.numberingReplacer.replace(xmlData, file.Numbering.ConcreteNumbering);
        })(),
        path: "word/comments.xml"
      },
      CommentsRelationships: {
        data: (() => {
          const relationships = Relationships.copy(file.Comments.Relationships);
          commentMediaDatas.forEach((mediaData, i2) => {
            relationships.addRelationship(commentRelationshipCount + i2, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", `media/${mediaData.fileName}`);
          });
          return stringifyXmlable(this.formatter.format(relationships, {
            viewWrapper: {
              View: file.Comments,
              Relationships: file.Comments.Relationships
            },
            file,
            stack: []
          }), {
            indent: prettify,
            declaration: { encoding: "UTF-8" }
          });
        })(),
        path: "word/_rels/comments.xml.rels"
      }
    }), file.CommentsExtended ? { CommentsExtended: {
      data: stringifyXmlable(this.formatter.format(file.CommentsExtended, {
        viewWrapper: {
          View: file.CommentsExtended,
          Relationships: file.Comments.Relationships
        },
        file,
        stack: []
      }), {
        indent: prettify,
        declaration: {
          standalone: "yes",
          encoding: "UTF-8"
        }
      }),
      path: "word/commentsExtended.xml"
    } } : {}), file.CommentsIds ? { CommentsIds: {
      data: stringifyXmlable(this.formatter.format(file.CommentsIds, {
        viewWrapper: {
          View: file.CommentsIds,
          Relationships: file.Comments.Relationships
        },
        file,
        stack: []
      }), {
        indent: prettify,
        declaration: {
          standalone: "yes",
          encoding: "UTF-8"
        }
      }),
      path: "word/commentsIds.xml"
    } } : {}), {}, {
      FontTable: {
        data: stringifyXmlable(this.formatter.format(file.FontTable.View, {
          viewWrapper: file.Document,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: {
            standalone: "yes",
            encoding: "UTF-8"
          }
        }),
        path: "word/fontTable.xml"
      },
      FontTableRelationships: {
        data: (() => stringifyXmlable(this.formatter.format(file.FontTable.Relationships, {
          viewWrapper: file.Document,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: { encoding: "UTF-8" }
        }))(),
        path: "word/_rels/fontTable.xml.rels"
      },
      Theme: {
        data: stringifyXmlable(this.formatter.format(file.Theme, {
          viewWrapper: file.Document,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: {
            standalone: "yes",
            encoding: "UTF-8"
          }
        }),
        path: "word/theme/theme1.xml"
      }
    }, ((_file$Macros = file.Macros) === null || _file$Macros === void 0 ? void 0 : _file$Macros.events) ? {
      MacroEvents: {
        data: stringifyXmlable(this.formatter.format(file.Macros.events, {
          viewWrapper: file.Document,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: {
            standalone: "yes",
            encoding: "UTF-8"
          }
        }),
        path: "word/vbaData.xml"
      },
      MacroRelationships: {
        data: stringifyXmlable(this.formatter.format(file.Macros.relationships, {
          viewWrapper: file.Document,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: { encoding: "UTF-8" }
        }),
        path: "word/_rels/vbaProject.bin.rels"
      }
    } : {}), file.Bibliography ? {
      BibliographySources: {
        data: stringifyXmlable(this.formatter.format(file.Bibliography.sources, {
          viewWrapper: file.Document,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: {
            standalone: "yes",
            encoding: "UTF-8"
          }
        }),
        path: "customXml/item1.xml"
      },
      BibliographySourcesProperties: {
        data: stringifyXmlable(this.formatter.format(file.Bibliography.properties, {
          viewWrapper: file.Document,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: {
            standalone: "no",
            encoding: "UTF-8"
          }
        }),
        path: "customXml/itemProps1.xml"
      },
      BibliographySourcesRelationships: {
        data: stringifyXmlable(this.formatter.format(file.Bibliography.relationships, {
          viewWrapper: file.Document,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: {
            standalone: "yes",
            encoding: "UTF-8"
          }
        }),
        path: "customXml/_rels/item1.xml.rels"
      }
    } : {}), {}, {
      PackageParts: xmlifyPackageParts(file, prettify),
      Numbering: {
        data: stringifyXmlable(this.formatter.format(file.Numbering, {
          viewWrapper: file.Document,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: {
            standalone: "yes",
            encoding: "UTF-8"
          }
        }),
        path: "word/numbering.xml"
      },
      ContentTypes: {
        data: stringifyXmlable(this.formatter.format(file.ContentTypes, {
          viewWrapper: file.Document,
          file,
          stack: []
        }), {
          indent: prettify,
          declaration: { encoding: "UTF-8" }
        }),
        path: "[Content_Types].xml"
      }
    });
  }
};
var import_events = (/* @__PURE__ */ __commonJSMin(((exports2, module2) => {
  var R = typeof Reflect === "object" ? Reflect : null;
  var ReflectApply = R && typeof R.apply === "function" ? R.apply : function ReflectApply2(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  };
  var ReflectOwnKeys;
  if (R && typeof R.ownKeys === "function") ReflectOwnKeys = R.ownKeys;
  else if (Object.getOwnPropertySymbols) ReflectOwnKeys = function ReflectOwnKeys2(target) {
    return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
  };
  else ReflectOwnKeys = function ReflectOwnKeys2(target) {
    return Object.getOwnPropertyNames(target);
  };
  function ProcessEmitWarning(warning) {
    if (console && console.warn) console.warn(warning);
  }
  var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
    return value !== value;
  };
  function EventEmitter() {
    EventEmitter.init.call(this);
  }
  module2.exports = EventEmitter;
  module2.exports.once = once;
  EventEmitter.EventEmitter = EventEmitter;
  EventEmitter.prototype._events = void 0;
  EventEmitter.prototype._eventsCount = 0;
  EventEmitter.prototype._maxListeners = void 0;
  var defaultMaxListeners = 10;
  function checkListener(listener) {
    if (typeof listener !== "function") throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
  Object.defineProperty(EventEmitter, "defaultMaxListeners", {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
      defaultMaxListeners = arg;
    }
  });
  EventEmitter.init = function() {
    if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
      this._events = /* @__PURE__ */ Object.create(null);
      this._eventsCount = 0;
    }
    this._maxListeners = this._maxListeners || void 0;
  };
  EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
    if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + ".");
    this._maxListeners = n;
    return this;
  };
  function _getMaxListeners(that) {
    if (that._maxListeners === void 0) return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
  }
  EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
    return _getMaxListeners(this);
  };
  EventEmitter.prototype.emit = function emit(type) {
    var args = [];
    for (var i2 = 1; i2 < arguments.length; i2++) args.push(arguments[i2]);
    var doError = type === "error";
    var events = this._events;
    if (events !== void 0) doError = doError && events.error === void 0;
    else if (!doError) return false;
    if (doError) {
      var er;
      if (args.length > 0) er = args[0];
      if (er instanceof Error) throw er;
      var err2 = /* @__PURE__ */ new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
      err2.context = er;
      throw err2;
    }
    var handler = events[type];
    if (handler === void 0) return false;
    if (typeof handler === "function") ReflectApply(handler, this, args);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i2 = 0; i2 < len; ++i2) ReflectApply(listeners[i2], this, args);
    }
    return true;
  };
  function _addListener(target, type, listener, prepend) {
    var m;
    var events;
    var existing;
    checkListener(listener);
    events = target._events;
    if (events === void 0) {
      events = target._events = /* @__PURE__ */ Object.create(null);
      target._eventsCount = 0;
    } else {
      if (events.newListener !== void 0) {
        target.emit("newListener", type, listener.listener ? listener.listener : listener);
        events = target._events;
      }
      existing = events[type];
    }
    if (existing === void 0) {
      existing = events[type] = listener;
      ++target._eventsCount;
    } else {
      if (typeof existing === "function") existing = events[type] = prepend ? [listener, existing] : [existing, listener];
      else if (prepend) existing.unshift(listener);
      else existing.push(listener);
      m = _getMaxListeners(target);
      if (m > 0 && existing.length > m && !existing.warned) {
        existing.warned = true;
        var w = /* @__PURE__ */ new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
        w.name = "MaxListenersExceededWarning";
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        ProcessEmitWarning(w);
      }
    }
    return target;
  }
  EventEmitter.prototype.addListener = function addListener(type, listener) {
    return _addListener(this, type, listener, false);
  };
  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  EventEmitter.prototype.prependListener = function prependListener(type, listener) {
    return _addListener(this, type, listener, true);
  };
  function onceWrapper() {
    if (!this.fired) {
      this.target.removeListener(this.type, this.wrapFn);
      this.fired = true;
      if (arguments.length === 0) return this.listener.call(this.target);
      return this.listener.apply(this.target, arguments);
    }
  }
  function _onceWrap(target, type, listener) {
    var state = {
      fired: false,
      wrapFn: void 0,
      target,
      type,
      listener
    };
    var wrapped = onceWrapper.bind(state);
    wrapped.listener = listener;
    state.wrapFn = wrapped;
    return wrapped;
  }
  EventEmitter.prototype.once = function once2(type, listener) {
    checkListener(listener);
    this.on(type, _onceWrap(this, type, listener));
    return this;
  };
  EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
    checkListener(listener);
    this.prependListener(type, _onceWrap(this, type, listener));
    return this;
  };
  EventEmitter.prototype.removeListener = function removeListener(type, listener) {
    var list2, events, position, i2, originalListener;
    checkListener(listener);
    events = this._events;
    if (events === void 0) return this;
    list2 = events[type];
    if (list2 === void 0) return this;
    if (list2 === listener || list2.listener === listener) {
      if (--this._eventsCount === 0) this._events = /* @__PURE__ */ Object.create(null);
      else {
        delete events[type];
        if (events.removeListener) this.emit("removeListener", type, list2.listener || listener);
      }
    } else if (typeof list2 !== "function") {
      position = -1;
      for (i2 = list2.length - 1; i2 >= 0; i2--) if (list2[i2] === listener || list2[i2].listener === listener) {
        originalListener = list2[i2].listener;
        position = i2;
        break;
      }
      if (position < 0) return this;
      if (position === 0) list2.shift();
      else spliceOne(list2, position);
      if (list2.length === 1) events[type] = list2[0];
      if (events.removeListener !== void 0) this.emit("removeListener", type, originalListener || listener);
    }
    return this;
  };
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
    var listeners, events = this._events, i2;
    if (events === void 0) return this;
    if (events.removeListener === void 0) {
      if (arguments.length === 0) {
        this._events = /* @__PURE__ */ Object.create(null);
        this._eventsCount = 0;
      } else if (events[type] !== void 0) {
        if (--this._eventsCount === 0) this._events = /* @__PURE__ */ Object.create(null);
        else delete events[type];
      }
      return this;
    }
    if (arguments.length === 0) {
      var keys = Object.keys(events);
      var key;
      for (i2 = 0; i2 < keys.length; ++i2) {
        key = keys[i2];
        if (key === "removeListener") continue;
        this.removeAllListeners(key);
      }
      this.removeAllListeners("removeListener");
      this._events = /* @__PURE__ */ Object.create(null);
      this._eventsCount = 0;
      return this;
    }
    listeners = events[type];
    if (typeof listeners === "function") this.removeListener(type, listeners);
    else if (listeners !== void 0) for (i2 = listeners.length - 1; i2 >= 0; i2--) this.removeListener(type, listeners[i2]);
    return this;
  };
  function _listeners(target, type, unwrap) {
    var events = target._events;
    if (events === void 0) return [];
    var evlistener = events[type];
    if (evlistener === void 0) return [];
    if (typeof evlistener === "function") return unwrap ? [evlistener.listener || evlistener] : [evlistener];
    return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
  }
  EventEmitter.prototype.listeners = function listeners(type) {
    return _listeners(this, type, true);
  };
  EventEmitter.prototype.rawListeners = function rawListeners(type) {
    return _listeners(this, type, false);
  };
  EventEmitter.listenerCount = function(emitter, type) {
    if (typeof emitter.listenerCount === "function") return emitter.listenerCount(type);
    else return listenerCount.call(emitter, type);
  };
  EventEmitter.prototype.listenerCount = listenerCount;
  function listenerCount(type) {
    var events = this._events;
    if (events !== void 0) {
      var evlistener = events[type];
      if (typeof evlistener === "function") return 1;
      else if (evlistener !== void 0) return evlistener.length;
    }
    return 0;
  }
  EventEmitter.prototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
  };
  function arrayClone(arr, n) {
    var copy = new Array(n);
    for (var i2 = 0; i2 < n; ++i2) copy[i2] = arr[i2];
    return copy;
  }
  function spliceOne(list2, index) {
    for (; index + 1 < list2.length; index++) list2[index] = list2[index + 1];
    list2.pop();
  }
  function unwrapListeners(arr) {
    var ret = new Array(arr.length);
    for (var i2 = 0; i2 < ret.length; ++i2) ret[i2] = arr[i2].listener || arr[i2];
    return ret;
  }
  function once(emitter, name) {
    return new Promise(function(resolve2, reject) {
      function errorListener(err2) {
        emitter.removeListener(name, resolver);
        reject(err2);
      }
      function resolver() {
        if (typeof emitter.removeListener === "function") emitter.removeListener("error", errorListener);
        resolve2([].slice.call(arguments));
      }
      eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
      if (name !== "error") addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    });
  }
  function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
    if (typeof emitter.on === "function") eventTargetAgnosticAddListener(emitter, "error", handler, flags);
  }
  function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
    if (typeof emitter.on === "function") {
      if (flags.once) emitter.once(name, listener);
      else emitter.on(name, listener);
    } else if (typeof emitter.addEventListener === "function") emitter.addEventListener(name, function wrapListener(arg) {
      if (flags.once) emitter.removeEventListener(name, wrapListener);
      listener(arg);
    });
    else throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
})))();
var Stream = class extends import_events.EventEmitter {
  pipe(destination, options) {
    const source = this;
    const dest = destination;
    const ondata = (chunk) => {
      if (dest.writable) {
        if (false === dest.write(chunk) && source.pause) source.pause();
      }
    };
    source.on("data", ondata);
    const ondrain = () => {
      if (source.readable && source.resume) source.resume();
    };
    dest.on("drain", ondrain);
    if (!dest._isStdio && (!options || options.end !== false)) {
      source.on("end", onend);
      source.on("close", onclose);
    }
    let didOnEnd = false;
    function onend() {
      if (didOnEnd) return;
      didOnEnd = true;
      dest.end();
    }
    function onclose() {
      if (didOnEnd) return;
      didOnEnd = true;
      if (typeof dest.destroy === "function") dest.destroy();
    }
    function onerror(error) {
      cleanup();
      if (import_events.EventEmitter.listenerCount(this, "error") === 0) throw error;
    }
    source.on("error", onerror);
    dest.on("error", onerror);
    function cleanup() {
      source.removeListener("data", ondata);
      dest.removeListener("drain", ondrain);
      source.removeListener("end", onend);
      source.removeListener("close", onclose);
      source.removeListener("error", onerror);
      dest.removeListener("error", onerror);
      source.removeListener("end", cleanup);
      source.removeListener("close", cleanup);
      dest.removeListener("close", cleanup);
    }
    source.on("end", cleanup);
    source.on("close", cleanup);
    dest.on("close", cleanup);
    dest.emit("pipe", source);
    return dest;
  }
};
function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i2 = n[a](c), u = i2.value;
  } catch (n2) {
    e(n2);
    return;
  }
  i2.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function() {
    var t = this, e = arguments;
    return new Promise(function(r, o) {
      var a = n.apply(t, e);
      function _next(n2) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n2);
      }
      function _throw(n2) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n2);
      }
      _next(void 0);
    });
  };
}
var PrettifyType = {
  /** No prettification (smallest file size) */
  NONE: "",
  /** Indent with 2 spaces */
  WITH_2_BLANKS: "  ",
  /** Indent with 4 spaces */
  WITH_4_BLANKS: "    ",
  /** Indent with tab character */
  WITH_TAB: "	"
};
var convertPrettifyType = (prettify) => prettify === true ? PrettifyType.WITH_2_BLANKS : prettify === false ? void 0 : prettify;
var mimeTypeOf = (file) => file.Macros === void 0 ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/vnd.ms-word.document.macroEnabled.12";
var Packer = class Packer2 {
  /**
  * Exports a document to the specified output format.
  *
  * @param file - The document to export
  * @param type - The output format type (e.g., "nodebuffer", "blob", "string")
  * @param prettify - Whether to prettify the XML output (boolean or PrettifyType)
  * @param overrides - Optional array of file overrides for custom XML content
  * @returns A promise resolving to the exported document in the specified format
  */
  static pack(_x, _x2, _x3) {
    var _this = this;
    return _asyncToGenerator(function* (file, type, prettify, overrides = []) {
      return zipOutput(zipFiles(_this.compiler.compile(file, convertPrettifyType(prettify), overrides)), type, mimeTypeOf(file));
    }).apply(this, arguments);
  }
  /**
  * Exports a document to a string representation.
  *
  * @param file - The document to export
  * @param prettify - Whether to prettify the XML output
  * @param overrides - Optional array of file overrides
  * @returns A promise resolving to the document as a string
  */
  static toString(file, prettify, overrides = []) {
    return Packer2.pack(file, "string", prettify, overrides);
  }
  /**
  * Exports a document to a Node.js Buffer.
  *
  * @param file - The document to export
  * @param prettify - Whether to prettify the XML output
  * @param overrides - Optional array of file overrides
  * @returns A promise resolving to the document as a Buffer
  */
  static toBuffer(file, prettify, overrides = []) {
    return Packer2.pack(file, "nodebuffer", prettify, overrides);
  }
  /**
  * Exports a document to a base64-encoded string.
  *
  * @param file - The document to export
  * @param prettify - Whether to prettify the XML output
  * @param overrides - Optional array of file overrides
  * @returns A promise resolving to the document as a base64 string
  */
  static toBase64String(file, prettify, overrides = []) {
    return Packer2.pack(file, "base64", prettify, overrides);
  }
  /**
  * Exports a document to a Blob (for browser environments).
  *
  * @param file - The document to export
  * @param prettify - Whether to prettify the XML output
  * @param overrides - Optional array of file overrides
  * @returns A promise resolving to the document as a Blob
  */
  static toBlob(file, prettify, overrides = []) {
    return Packer2.pack(file, "blob", prettify, overrides);
  }
  /**
  * Exports a document to an ArrayBuffer.
  *
  * @param file - The document to export
  * @param prettify - Whether to prettify the XML output
  * @param overrides - Optional array of file overrides
  * @returns A promise resolving to the document as an ArrayBuffer
  */
  static toArrayBuffer(file, prettify, overrides = []) {
    return Packer2.pack(file, "arraybuffer", prettify, overrides);
  }
  /**
  * Exports a document to a Node.js Stream.
  *
  * The stream gives the document as one Node.js Buffer, then ends. Where there's no Buffer, as in a browser, it
  * emits an `error` event instead, so use `toBlob` there.
  *
  * @param file - The document to export
  * @param prettify - Whether to prettify the XML output
  * @param overrides - Optional array of file overrides
  * @returns A readable stream containing the document data
  */
  static toStream(file, prettify, overrides = []) {
    const stream = new Stream();
    const files = this.compiler.compile(file, convertPrettifyType(prettify), overrides);
    new Promise((resolve2) => setTimeout(resolve2)).then(() => zipOutput(zipFiles(files), "nodebuffer", mimeTypeOf(file))).then((data) => {
      stream.emit("data", data);
      stream.emit("end");
    }, (error) => stream.emit("error", error));
    return stream;
  }
};
_defineProperty2(Packer, "compiler", new Compiler());
var bookmarkIdOf = (element) => {
  var _element$attributes;
  if (element.name !== "w:bookmarkStart" && element.name !== "w:bookmarkEnd") return;
  const id = Number((_element$attributes = element.attributes) === null || _element$attributes === void 0 ? void 0 : _element$attributes["w:id"]);
  return Number.isInteger(id) ? id : void 0;
};
var findBookmarkIds = (element) => {
  var _element$elements;
  const id = bookmarkIdOf(element);
  return [...id === void 0 ? [] : [id], ...((_element$elements = element.elements) !== null && _element$elements !== void 0 ? _element$elements : []).flatMap(findBookmarkIds)];
};
var renumberBookmarksAvoiding = (idsInDocument) => {
  const usedIds = new Set(idsInDocument);
  const newIds = /* @__PURE__ */ new Map();
  let highestId = idsInDocument.reduce((highest, id) => Math.max(highest, id), 0);
  const newIdFor = (id) => {
    const knownId = newIds.get(id);
    if (knownId !== void 0) return knownId;
    const newId = usedIds.has(id) ? highestId + 1 : id;
    highestId = Math.max(highestId, newId);
    usedIds.add(newId);
    newIds.set(id, newId);
    return newId;
  };
  const renumber = (element) => {
    const id = bookmarkIdOf(element);
    return _objectSpread2(_objectSpread2(_objectSpread2({}, element), id === void 0 ? {} : { attributes: _objectSpread2(_objectSpread2({}, element.attributes), {}, { "w:id": String(newIdFor(id)) }) }), element.elements === void 0 ? {} : { elements: element.elements.map(renumber) });
  };
  return (elements) => elements.map(renumber);
};
var formatter$3 = new Formatter();
var decodeUtf8 = (bytes) => new TextDecoder("utf-8", { ignoreBOM: true }).decode(bytes);
var toJson = (xmlData) => {
  return parseXml(xmlData, { keepWhitespaceText: true });
};
var createTextElementContents = (text2) => {
  var _textJson$elements$0$;
  return (_textJson$elements$0$ = toJson(stringifyXmlable(formatter$3.format(new Text({ text: text2 })))).elements[0].elements) !== null && _textJson$elements$0$ !== void 0 ? _textJson$elements$0$ : [];
};
var patchSpaceAttribute = (element) => _objectSpread2(_objectSpread2({}, element), {}, { attributes: { "xml:space": "preserve" } });
var getFirstLevelElements = (relationships, id) => {
  var _relationships$elemen, _parent$elements;
  const parent = (_relationships$elemen = relationships.elements) === null || _relationships$elemen === void 0 ? void 0 : _relationships$elemen.find((e) => e.name === id);
  if (parent === void 0) return [];
  (_parent$elements = parent.elements) !== null && _parent$elements !== void 0 || (parent.elements = []);
  return parent.elements;
};
var checkPlaceholderDelimiters = (delimiters) => {
  if (!(delimiters === null || delimiters === void 0 ? void 0 : delimiters.start.trim()) || !(delimiters === null || delimiters === void 0 ? void 0 : delimiters.end.trim())) throw new Error("Both start and end delimiters must be non-empty strings.");
};
var appendContentType = (element, contentType, extension) => {
  const relationshipElements = getFirstLevelElements(element, "Types");
  if (relationshipElements.some((el) => {
    var _el$attributes, _el$attributes2;
    return el.type === "element" && el.name === "Default" && (el === null || el === void 0 || (_el$attributes = el.attributes) === null || _el$attributes === void 0 ? void 0 : _el$attributes.ContentType) === contentType && (el === null || el === void 0 || (_el$attributes2 = el.attributes) === null || _el$attributes2 === void 0 ? void 0 : _el$attributes2.Extension) === extension;
  })) return;
  relationshipElements.push({
    attributes: {
      ContentType: contentType,
      Extension: extension
    },
    name: "Default",
    type: "element"
  });
};
var appendContentTypeOverride = (element, contentType, partName) => {
  const contentTypeElements = getFirstLevelElements(element, "Types");
  if (contentTypeElements.some((el) => {
    var _el$attributes3;
    return el.type === "element" && el.name === "Override" && ((_el$attributes3 = el.attributes) === null || _el$attributes3 === void 0 ? void 0 : _el$attributes3.PartName) === partName;
  })) return;
  contentTypeElements.push({
    attributes: {
      ContentType: contentType,
      PartName: partName
    },
    name: "Override",
    type: "element"
  });
};
var removeContentTypeOverride = (element, partName) => {
  var _element$elements;
  const types = (_element$elements = element.elements) === null || _element$elements === void 0 ? void 0 : _element$elements.find((el) => el.name === "Types");
  if ((types === null || types === void 0 ? void 0 : types.elements) === void 0) return;
  types.elements = types.elements.filter((el) => {
    var _el$attributes$PartNa, _el$attributes4;
    return !(el.name === "Override" && String((_el$attributes$PartNa = (_el$attributes4 = el.attributes) === null || _el$attributes4 === void 0 ? void 0 : _el$attributes4.PartName) !== null && _el$attributes$PartNa !== void 0 ? _el$attributes$PartNa : "").toLowerCase() === partName.toLowerCase());
  });
};
var getIdFromRelationshipId = (relationshipId) => {
  const output = parseInt(relationshipId.substring(3), 10);
  return isNaN(output) ? 0 : output;
};
var getNextRelationshipIndex = (relationships) => {
  return getFirstLevelElements(relationships, "Relationships").map((e) => {
    var _e$attributes$Id$toSt, _e$attributes;
    return getIdFromRelationshipId((_e$attributes$Id$toSt = (_e$attributes = e.attributes) === null || _e$attributes === void 0 || (_e$attributes = _e$attributes.Id) === null || _e$attributes === void 0 ? void 0 : _e$attributes.toString()) !== null && _e$attributes$Id$toSt !== void 0 ? _e$attributes$Id$toSt : "");
  }).reduce((acc, curr) => Math.max(acc, curr), 0) + 1;
};
var appendRelationship = (relationships, id, type, target, targetMode) => {
  const relationshipElements = getFirstLevelElements(relationships, "Relationships");
  relationshipElements.push({
    attributes: {
      Id: `rId${id}`,
      Type: type,
      Target: target,
      TargetMode: targetMode
    },
    name: "Relationship",
    type: "element"
  });
  return relationshipElements;
};
var createRelationshipFile = () => ({
  declaration: { attributes: {
    version: "1.0",
    encoding: "UTF-8",
    standalone: "yes"
  } },
  elements: [{
    type: "element",
    name: "Relationships",
    attributes: { xmlns: "http://schemas.openxmlformats.org/package/2006/relationships" },
    elements: []
  }]
});
var CORE_PROPERTIES_RELATIONSHIP_TYPE = "http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties";
var CORE_PROPERTIES_CONTENT_TYPE = "application/vnd.openxmlformats-package.core-properties+xml";
var PACKAGE_RELATIONSHIPS_PATH = "_rels/.rels";
var CORE_PROPERTIES_PATH = "docProps/core.xml";
var NAMESPACES = {
  cp: "http://schemas.openxmlformats.org/package/2006/metadata/core-properties",
  dc: "http://purl.org/dc/elements/1.1/"
};
var ELEMENTS = {
  title: {
    namespace: "dc",
    name: "title"
  },
  subject: {
    namespace: "dc",
    name: "subject"
  },
  creator: {
    namespace: "dc",
    name: "creator"
  },
  keywords: {
    namespace: "cp",
    name: "keywords"
  },
  description: {
    namespace: "dc",
    name: "description"
  },
  lastModifiedBy: {
    namespace: "cp",
    name: "lastModifiedBy"
  },
  revision: {
    namespace: "cp",
    name: "revision"
  }
};
var textOf = (value) => value === "" ? [] : [{
  type: "text",
  text: String(value)
}];
var localName = (element) => {
  var _element$name;
  return (_element$name = element.name) === null || _element$name === void 0 ? void 0 : _element$name.slice(element.name.indexOf(":") + 1);
};
var prefixOf = (root, namespace) => {
  var _Object$entries$find;
  const declaration = (_Object$entries$find = Object.entries(_objectSpread2({}, root.attributes)).find(([name, value]) => (name === "xmlns" || name.startsWith("xmlns:")) && value === NAMESPACES[namespace])) === null || _Object$entries$find === void 0 ? void 0 : _Object$entries$find[0];
  if (declaration === void 0) {
    root.attributes = _objectSpread2(_objectSpread2({}, root.attributes), {}, { [`xmlns:${namespace}`]: NAMESPACES[namespace] });
    return `${namespace}:`;
  }
  return declaration === "xmlns" ? "" : `${declaration.slice(6)}:`;
};
var decode2 = (bytes) => {
  const encoding = bytes[0] === 255 && bytes[1] === 254 ? "utf-16le" : bytes[0] === 254 && bytes[1] === 255 ? "utf-16be" : "utf-8";
  return new TextDecoder(encoding).decode(bytes);
};
var readPart = (parts, binaryParts, path) => {
  var _part$declaration;
  const bytes = binaryParts.get(path);
  if (bytes === void 0) return parts.get(path);
  const part = toJson(decode2(bytes));
  if ((_part$declaration = part.declaration) === null || _part$declaration === void 0 ? void 0 : _part$declaration.attributes) part.declaration.attributes.encoding = "UTF-8";
  binaryParts.delete(path);
  parts.set(path, part);
  return part;
};
var corePropertiesPathOf = (parts) => {
  var _parts$get, _getFirstLevelElement;
  const relationships = (_parts$get = parts.get(PACKAGE_RELATIONSHIPS_PATH)) !== null && _parts$get !== void 0 ? _parts$get : createRelationshipFile();
  const target = (_getFirstLevelElement = getFirstLevelElements(relationships, "Relationships").find((relationship) => {
    var _relationship$attribu;
    return ((_relationship$attribu = relationship.attributes) === null || _relationship$attribu === void 0 ? void 0 : _relationship$attribu.Type) === CORE_PROPERTIES_RELATIONSHIP_TYPE;
  })) === null || _getFirstLevelElement === void 0 || (_getFirstLevelElement = _getFirstLevelElement.attributes) === null || _getFirstLevelElement === void 0 ? void 0 : _getFirstLevelElement.Target;
  if (typeof target === "string") return resolveTarget("", target);
  appendRelationship(relationships, getNextRelationshipIndex(relationships), CORE_PROPERTIES_RELATIONSHIP_TYPE, CORE_PROPERTIES_PATH);
  parts.set(PACKAGE_RELATIONSHIPS_PATH, relationships);
  return CORE_PROPERTIES_PATH;
};
var patchCoreProperties = (parts, binaryParts, properties, { addContentTypeOverride }) => {
  var _part$elements, _root$elements;
  const path = corePropertiesPathOf(parts);
  const existing = readPart(parts, binaryParts, path);
  const part = existing !== null && existing !== void 0 ? existing : {
    declaration: { attributes: {
      version: "1.0",
      encoding: "UTF-8",
      standalone: "yes"
    } },
    elements: [{
      type: "element",
      name: "cp:coreProperties",
      attributes: { "xmlns:cp": NAMESPACES.cp },
      elements: []
    }]
  };
  if (existing === void 0) {
    parts.set(path, part);
    addContentTypeOverride(CORE_PROPERTIES_CONTENT_TYPE, `/${path}`);
  }
  const root = (_part$elements = part.elements) === null || _part$elements === void 0 ? void 0 : _part$elements.find((element) => localName(element) === "coreProperties");
  if (root === void 0) throw new Error(`Could not find the core properties in ${path}`);
  (_root$elements = root.elements) !== null && _root$elements !== void 0 || (root.elements = []);
  for (const [key, { namespace, name }] of Object.entries(ELEMENTS)) {
    const value = properties[key];
    if (value === void 0) continue;
    const element = root.elements.find((item) => localName(item) === name);
    if (element) element.elements = textOf(value);
    else root.elements.push({
      type: "element",
      name: `${prefixOf(root, namespace)}${name}`,
      elements: textOf(value)
    });
  }
};
var DRAWINGS = /* @__PURE__ */ new Set(["wp:inline", "wp:anchor"]);
var ID_ELEMENTS = /* @__PURE__ */ new Set([
  "wp:docPr",
  "wps:cNvPr",
  "wpg:cNvPr"
]);
var REFERENCE_ELEMENTS = /* @__PURE__ */ new Set(["a:stCxn", "a:endCxn"]);
var idOf$1 = (element, names) => {
  var _element$name, _element$attributes;
  if (!names.has((_element$name = element.name) !== null && _element$name !== void 0 ? _element$name : "")) return;
  const id = Number((_element$attributes = element.attributes) === null || _element$attributes === void 0 ? void 0 : _element$attributes.id);
  return Number.isInteger(id) ? id : void 0;
};
var findDrawingIds = (element) => {
  var _element$elements;
  const id = idOf$1(element, ID_ELEMENTS);
  return [...id === void 0 ? [] : [id], ...((_element$elements = element.elements) !== null && _element$elements !== void 0 ? _element$elements : []).flatMap(findDrawingIds)];
};
var ownIdsOf = (drawing) => {
  const idsIn = (element) => {
    var _element$elements2;
    const id = idOf$1(element, ID_ELEMENTS);
    return [...id === void 0 ? [] : [id], ...((_element$elements2 = element.elements) !== null && _element$elements2 !== void 0 ? _element$elements2 : []).flatMap((child2) => {
      var _child$name;
      return DRAWINGS.has((_child$name = child2.name) !== null && _child$name !== void 0 ? _child$name : "") ? [] : idsIn(child2);
    })];
  };
  return idsIn(drawing);
};
var renumberDrawingsAvoiding = (idsInDocument) => {
  const usedIds = new Set(idsInDocument);
  let highestId = idsInDocument.reduce((highest, id) => Math.max(highest, id), 0);
  const newIdFor = (id) => {
    const newId = usedIds.has(id) ? highestId + 1 : id;
    highestId = Math.max(highestId, newId);
    usedIds.add(newId);
    return newId;
  };
  const renumberDrawing = (drawing) => {
    const newIds = new Map([...new Set(ownIdsOf(drawing))].map((id) => [id, newIdFor(id)]));
    const renumberIn = (element) => {
      var _element$name2, _idOf;
      if (element !== drawing && DRAWINGS.has((_element$name2 = element.name) !== null && _element$name2 !== void 0 ? _element$name2 : "")) return renumberDrawing(element);
      const id = (_idOf = idOf$1(element, ID_ELEMENTS)) !== null && _idOf !== void 0 ? _idOf : idOf$1(element, REFERENCE_ELEMENTS);
      const newId = id === void 0 ? void 0 : newIds.get(id);
      return _objectSpread2(_objectSpread2(_objectSpread2({}, element), newId === void 0 ? {} : { attributes: _objectSpread2(_objectSpread2({}, element.attributes), {}, { id: String(newId) }) }), element.elements === void 0 ? {} : { elements: element.elements.map(renumberIn) });
    };
    return renumberIn(drawing);
  };
  const renumber = (element) => {
    var _element$name3;
    return DRAWINGS.has((_element$name3 = element.name) !== null && _element$name3 !== void 0 ? _element$name3 : "") ? renumberDrawing(element) : _objectSpread2(_objectSpread2({}, element), element.elements === void 0 ? {} : { elements: element.elements.map(renumber) });
  };
  return (elements) => elements.map(renumber);
};
var PatchType = {
  /** Replace entire file-level elements (e.g., whole paragraphs) */
  DOCUMENT: "file",
  /** Replace content within paragraphs (inline replacement) */
  PARAGRAPH: "paragraph",
  /**
  * Repeat the rows of a table that hold the placeholder's fields, such as `{{items.name}}`, once for each row of
  * data. See {@link TableRowsPatch}
  */
  TABLE_ROWS: "tableRows",
  /**
  * Change a drawing whose alt text holds the placeholder, and the parts it refers to, such as the data of a chart made
  * in Word. See {@link DrawingPatch}
  */
  DRAWING: "drawing"
};
var DRAWING_PROPERTIES = /* @__PURE__ */ new Map([
  ["wp:inline", "wp:docPr"],
  ["wp:anchor", "wp:docPr"],
  ["wpg:graphicFrame", "wpg:cNvPr"],
  ["wpc:graphicFrame", "wpg:cNvPr"]
]);
var findDrawings = (element) => {
  var _element$elements;
  return ((_element$elements = element.elements) !== null && _element$elements !== void 0 ? _element$elements : []).flatMap((child2) => {
    var _child$elements;
    const name = child2.name === void 0 ? void 0 : DRAWING_PROPERTIES.get(child2.name);
    const properties = name === void 0 ? void 0 : (_child$elements = child2.elements) === null || _child$elements === void 0 ? void 0 : _child$elements.find((e) => e.name === name);
    return [...properties ? [{
      element: child2,
      properties
    }] : [], ...findDrawings(child2)];
  });
};
var altTextOf = (properties) => {
  var _properties$attribute, _properties$attribute2;
  return [(_properties$attribute = properties.attributes) === null || _properties$attribute === void 0 ? void 0 : _properties$attribute.descr, (_properties$attribute2 = properties.attributes) === null || _properties$attribute2 === void 0 ? void 0 : _properties$attribute2.title].flatMap((text2) => text2 === void 0 ? [] : [String(text2)]);
};
var CONTENT_TYPES$1 = "[Content_Types].xml";
var relationshipsIn = (relationships) => {
  var _relationships$elemen;
  if (!((_relationships$elemen = relationships.elements) === null || _relationships$elemen === void 0 ? void 0 : _relationships$elemen.some((element) => element.name === "Relationships"))) {
    var _relationships$elemen2;
    relationships.elements = [...(_relationships$elemen2 = relationships.elements) !== null && _relationships$elemen2 !== void 0 ? _relationships$elemen2 : [], ...createRelationshipFile().elements];
  }
  return getFirstLevelElements(relationships, "Relationships");
};
var RELATIONSHIPS_NAMESPACE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
var relationshipPrefixesIn = (element) => {
  var _element$attributes, _element$elements2;
  return /* @__PURE__ */ new Set([
    "r",
    ...Object.entries((_element$attributes = element.attributes) !== null && _element$attributes !== void 0 ? _element$attributes : {}).flatMap(([name, value]) => name.startsWith("xmlns:") && value === RELATIONSHIPS_NAMESPACE ? [name.slice(6)] : []),
    ...((_element$elements2 = element.elements) !== null && _element$elements2 !== void 0 ? _element$elements2 : []).flatMap((child2) => [...relationshipPrefixesIn(child2)])
  ]);
};
var relationshipIdsIn = (element, prefixes) => {
  var _element$attributes2, _element$elements3;
  return /* @__PURE__ */ new Set([...Object.entries((_element$attributes2 = element.attributes) !== null && _element$attributes2 !== void 0 ? _element$attributes2 : {}).flatMap(([name, value]) => name.includes(":") && prefixes.has(name.slice(0, name.indexOf(":"))) ? [String(value)] : []), ...((_element$elements3 = element.elements) !== null && _element$elements3 !== void 0 ? _element$elements3 : []).flatMap((child2) => [...relationshipIdsIn(child2, prefixes)])]);
};
var contentsOf = (parts, binaryParts) => {
  const has = (path) => parts.has(path) || binaryParts.has(path);
  const findPath = (path) => {
    if (has(path)) return path;
    const decoded = (() => {
      try {
        return decodeURI(path);
      } catch (_unused) {
        return;
      }
    })();
    if (decoded !== void 0 && has(decoded)) return decoded;
    const lower = path.toLowerCase();
    return [...parts.keys(), ...binaryParts.keys()].find((key) => key.toLowerCase() === lower);
  };
  const findRelationship = (from, id) => {
    const relationships = parts.get(relationshipsPathOf(from));
    return relationships === void 0 ? void 0 : getFirstLevelElements(relationships, "Relationships").find((relationship) => {
      var _relationship$attribu;
      return relationship.name === "Relationship" && ((_relationship$attribu = relationship.attributes) === null || _relationship$attribu === void 0 ? void 0 : _relationship$attribu.Id) === id;
    });
  };
  const pathOf = (from, relationship) => {
    var _relationship$attribu2, _relationship$attribu3;
    const target = (_relationship$attribu2 = relationship.attributes) === null || _relationship$attribu2 === void 0 ? void 0 : _relationship$attribu2.Target;
    return ((_relationship$attribu3 = relationship.attributes) === null || _relationship$attribu3 === void 0 ? void 0 : _relationship$attribu3.TargetMode) === "External" || target === void 0 ? void 0 : findPath(resolveTarget(from, String(target)));
  };
  const isReferenced = (path) => [...parts].some(([relationshipsPath, relationships]) => relationshipsPath.endsWith(".rels") && getFirstLevelElements(relationships, "Relationships").some((relationship) => pathOf(sourceOfRelationships(relationshipsPath), relationship) === path));
  const removeIfUnreferenced = (from, path) => {
    if (path === void 0 || path === from || path === CONTENT_TYPES$1 || path.endsWith(".rels") || isReferenced(path)) return;
    const relationships = parts.get(relationshipsPathOf(path));
    parts.delete(path);
    binaryParts.delete(path);
    parts.delete(relationshipsPathOf(path));
    const contentTypes = parts.get(CONTENT_TYPES$1);
    if (contentTypes !== void 0) removeContentTypeOverride(contentTypes, `/${path}`);
    for (const relationship of relationships === void 0 ? [] : getFirstLevelElements(relationships, "Relationships")) removeIfUnreferenced(path, pathOf(path, relationship));
  };
  const removeRelationships = (from, ids) => {
    var _parts$get, _relationships$elemen3;
    const relationships = (_parts$get = parts.get(relationshipsPathOf(from))) === null || _parts$get === void 0 || (_parts$get = _parts$get.elements) === null || _parts$get === void 0 ? void 0 : _parts$get.find((element) => element.name === "Relationships");
    const removed = ((_relationships$elemen3 = relationships === null || relationships === void 0 ? void 0 : relationships.elements) !== null && _relationships$elemen3 !== void 0 ? _relationships$elemen3 : []).filter((relationship) => {
      var _relationship$attribu4;
      return relationship.name === "Relationship" && ids.has(String((_relationship$attribu4 = relationship.attributes) === null || _relationship$attribu4 === void 0 ? void 0 : _relationship$attribu4.Id));
    });
    if (relationships === void 0 || removed.length === 0) return;
    relationships.elements = relationships.elements.filter((element) => !removed.includes(element));
    for (const relationship of removed) removeIfUnreferenced(from, pathOf(from, relationship));
  };
  return {
    findRelationship,
    pathOf,
    removeIfUnreferenced,
    removeRelationships
  };
};
var createTemplatePackage = (parts, { findRelationship, pathOf, removeIfUnreferenced }, file, context) => {
  const formatter2 = new Formatter();
  return {
    getRelatedPart: (from, relationshipId) => {
      const relationship = findRelationship(from.path, relationshipId);
      const path = relationship === void 0 ? void 0 : pathOf(from.path, relationship);
      return path === void 0 ? void 0 : {
        path,
        xml: parts.get(path)
      };
    },
    replaceRelatedPart: (from, relationshipId, part) => {
      const path = `word/${file.PackageParts.add(part)}`;
      const { relationshipType } = part.options;
      const target = relativeTarget(from.path, path);
      const relationship = relationshipId === void 0 ? void 0 : findRelationship(from.path, relationshipId);
      if (relationship === void 0) {
        var _parts$get2;
        const relationshipsPath = relationshipsPathOf(from.path);
        const relationships = (_parts$get2 = parts.get(relationshipsPath)) !== null && _parts$get2 !== void 0 ? _parts$get2 : createRelationshipFile();
        parts.set(relationshipsPath, relationships);
        const id = relationshipId !== null && relationshipId !== void 0 ? relationshipId : `rId${getNextRelationshipIndex(relationships)}`;
        relationshipsIn(relationships).push({
          type: "element",
          name: "Relationship",
          attributes: {
            Id: id,
            Type: relationshipType,
            Target: target
          }
        });
        return id;
      }
      const previous = pathOf(from.path, relationship);
      relationship.attributes = _objectSpread2(_objectSpread2({}, Object.fromEntries(Object.entries(relationship.attributes).filter(([name]) => name !== "TargetMode"))), {}, {
        Type: relationshipType,
        Target: target
      });
      removeIfUnreferenced(from.path, previous);
      return String(relationship.attributes.Id);
    },
    format: (content) => toJson(stringifyXmlable(formatter2.format(content, context))).elements[0]
  };
};
var patchDrawings = ({ parts, binaryParts, file, patches, delimiters }, createContext) => {
  const placeholders = patches.map(([key, patch]) => ({
    placeholder: `${delimiters.start}${key}${delimiters.end}`,
    patch
  }));
  const found = [...parts].filter(([path]) => path.startsWith("word/") && !path.endsWith(".rels")).flatMap(([path, xmlPart]) => findDrawings(xmlPart).flatMap((drawing) => {
    const altText = altTextOf(drawing.properties);
    const matches = placeholders.filter(({ placeholder }) => altText.some((text2) => text2.includes(placeholder)));
    if (matches.length > 1) {
      var _drawing$properties$a, _drawing$properties$a2;
      throw new Error(`The drawing "${(_drawing$properties$a = (_drawing$properties$a2 = drawing.properties.attributes) === null || _drawing$properties$a2 === void 0 ? void 0 : _drawing$properties$a2.name) !== null && _drawing$properties$a !== void 0 ? _drawing$properties$a : ""}" in ${path} has the placeholders ${matches.map(({ placeholder }) => placeholder).join(" and ")} in its alt text. A drawing can only be patched once`);
    }
    return matches.map(({ placeholder, patch }) => ({
      drawing: _objectSpread2(_objectSpread2({ placeholder }, drawing), {}, { part: {
        path,
        xml: xmlPart
      } }),
      patch
    }));
  }));
  const contents = contentsOf(parts, binaryParts);
  for (const { drawing, patch } of found) {
    const referenced = relationshipIdsIn(drawing.element, relationshipPrefixesIn(drawing.part.xml));
    patch.patch(drawing, createTemplatePackage(parts, contents, file, createContext(drawing.part.path)));
    const used = relationshipIdsIn(drawing.part.xml, relationshipPrefixesIn(drawing.part.xml));
    contents.removeRelationships(drawing.part.path, new Set([...referenced].filter((id) => !used.has(id))));
  }
};
var isStream = (data) => typeof data === "object" && data !== null && "on" in data && typeof data.on === "function";
var isZipArchive = (data) => typeof data === "object" && data !== null && "generateAsync" in data && typeof data.generateAsync === "function";
var isBlob = (data) => ["[object Blob]", "[object File]"].includes(Object.prototype.toString.call(data));
var readStream = (stream) => new Promise((resolve2, reject) => {
  const chunks = [];
  stream.on("data", (chunk) => {
    if (ArrayBuffer.isView(chunk)) chunks.push(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength));
    else if (typeof chunk === "number") chunks.push(chunk);
    else reject(/* @__PURE__ */ new TypeError(`A template stream must give bytes, but it gave a ${typeof chunk}. A stream with an encoding set gives text, so do not set one.`));
  });
  stream.on("error", reject);
  stream.on("end", () => {
    const bytes = new Uint8Array(chunks.reduce((length, chunk) => length + (typeof chunk === "number" ? 1 : chunk.length), 0));
    chunks.reduce((offset, chunk) => {
      if (typeof chunk === "number") {
        bytes[offset] = chunk;
        return offset + 1;
      }
      bytes.set(chunk, offset);
      return offset + chunk.length;
    }, 0);
    resolve2(bytes);
  });
});
var bytesOf$1 = (function() {
  var _ref = _asyncToGenerator(function* (data) {
    if (isZipArchive(data)) return data.generateAsync({ type: "uint8array" });
    if (isStream(data)) return readStream(data);
    if (isBlob(data)) return new Uint8Array(yield data.arrayBuffer());
    if (typeof data === "string") return Uint8Array.from({ length: data.length }, (_, index) => data.charCodeAt(index));
    if (Array.isArray(data)) return Uint8Array.from(data);
    return ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : new Uint8Array(data);
  });
  return function bytesOf(_x) {
    return _ref.apply(this, arguments);
  };
})();
var loadZip = (function() {
  var _ref2 = _asyncToGenerator(function* (data, include) {
    return unzipFiles(yield bytesOf$1(data), include);
  });
  return function loadZip2(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();
var formatter$2 = new Formatter();
var DOCUMENT_PATH$1 = "word/document.xml";
var FOOTNOTES = {
  path: "word/footnotes.xml",
  rootName: "w:footnotes",
  noteName: "w:footnote",
  referenceName: "w:footnoteReference",
  contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml",
  relationshipType: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes",
  create: {
    part: () => new FootNotes(),
    mark: () => new FootnoteRefRun(),
    styles: () => [
      new FootnoteText({}),
      new FootnoteTextChar({}),
      new FootnoteReferenceStyle({})
    ]
  }
};
var ENDNOTES = {
  path: "word/endnotes.xml",
  rootName: "w:endnotes",
  noteName: "w:endnote",
  referenceName: "w:endnoteReference",
  contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml",
  relationshipType: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/endnotes",
  create: {
    part: () => new Endnotes(),
    mark: () => new EndnoteRefRun(),
    styles: () => [
      new EndnoteText({}),
      new EndnoteTextChar({}),
      new EndnoteReferenceStyle({})
    ]
  }
};
var formatElement$1 = (component, context) => toJson(stringifyXmlable(formatter$2.format(component, context))).elements[0];
var findIds = (element, names) => {
  var _element$name, _element$attributes, _element$elements;
  const id = names.includes((_element$name = element.name) !== null && _element$name !== void 0 ? _element$name : "") ? Number((_element$attributes = element.attributes) === null || _element$attributes === void 0 ? void 0 : _element$attributes["w:id"]) : NaN;
  return [...Number.isInteger(id) ? [id] : [], ...((_element$elements = element.elements) !== null && _element$elements !== void 0 ? _element$elements : []).flatMap((child2) => findIds(child2, names))];
};
var withMark = (paragraph2, mark) => {
  var _paragraph$elements, _elements$;
  const elements = (_paragraph$elements = paragraph2.elements) !== null && _paragraph$elements !== void 0 ? _paragraph$elements : [];
  const index = ((_elements$ = elements[0]) === null || _elements$ === void 0 ? void 0 : _elements$.name) === "w:pPr" ? 1 : 0;
  return _objectSpread2(_objectSpread2({}, paragraph2), {}, { elements: [
    ...elements.slice(0, index),
    mark,
    ...elements.slice(index)
  ] });
};
var patchNotesOfKind = (kind, notes, parts, { createContext, addContentTypeOverride, renumberBookmarks, renumberDrawings, renumberLists, useStyles }) => {
  const givenNotes = new Map(Object.entries(notes).map(([id, note]) => [Number(id), note]));
  const carriedIds = /* @__PURE__ */ new Map();
  let highestGivenId = [...givenNotes.keys()].filter(Number.isFinite).reduce((highest, id) => Math.max(highest, Math.floor(id)), 0);
  const noteOfId = /* @__PURE__ */ new Map();
  let highestId;
  const renumber = (element) => {
    var _element$attributes2, _highestId;
    const note = element.name === kind.referenceName ? givenNotes.get(Number((_element$attributes2 = element.attributes) === null || _element$attributes2 === void 0 ? void 0 : _element$attributes2["w:id"])) : void 0;
    if (note === void 0) return element.elements === void 0 ? element : _objectSpread2(_objectSpread2({}, element), {}, { elements: element.elements.map(renumber) });
    highestId = ((_highestId = highestId) !== null && _highestId !== void 0 ? _highestId : [...parts.values()].flatMap((part) => findIds(part, [kind.noteName, kind.referenceName])).reduce((highest, id) => Math.max(highest, id), 0)) + 1;
    noteOfId.set(highestId, note);
    return _objectSpread2(_objectSpread2({}, element), {}, { attributes: _objectSpread2(_objectSpread2({}, element.attributes), {}, { "w:id": String(highestId) }) });
  };
  const findOrAddPart = () => {
    var _parts$get;
    const relationship = getFirstLevelElements((_parts$get = parts.get(relationshipsPathOf(DOCUMENT_PATH$1))) !== null && _parts$get !== void 0 ? _parts$get : {}, "Relationships").find((element) => {
      var _element$attributes3;
      return ((_element$attributes3 = element.attributes) === null || _element$attributes3 === void 0 ? void 0 : _element$attributes3.Type) === kind.relationshipType;
    });
    const path = relationship ? resolveTarget(DOCUMENT_PATH$1, String(relationship.attributes.Target)) : kind.path;
    if (!parts.has(path)) {
      parts.set(path, {
        declaration: { attributes: {
          version: "1.0",
          encoding: "UTF-8",
          standalone: "yes"
        } },
        elements: [formatElement$1(kind.create.part(), createContext(path))]
      });
      addContentTypeOverride(kind.contentType, `/${path}`);
    }
    if (!relationship) createContext(DOCUMENT_PATH$1).viewWrapper.Relationships.addRelationship(uniqueId(), kind.relationshipType, relativeTarget(DOCUMENT_PATH$1, path));
    return path;
  };
  const write = () => {
    if (noteOfId.size === 0) return;
    const path = findOrAddPart();
    const context = createContext(path);
    const contentOfNote = new Map([...new Set(noteOfId.values())].map((note) => {
      const mark = formatElement$1(kind.create.mark(), context);
      return [note, useStyles(renumberLists(renumberBookmarks(note.children.map((paragraph2) => formatElement$1(paragraph2, context)).map((paragraph2, index) => index === 0 ? withMark(paragraph2, mark) : paragraph2))))];
    }));
    getFirstLevelElements(parts.get(path), kind.rootName).push(...[...noteOfId].map(([id, note]) => ({
      type: "element",
      name: kind.noteName,
      attributes: { "w:id": String(id) },
      elements: [...renumberDrawings(contentOfNote.get(note))]
    })));
    const stylesPart = parts.get("word/styles.xml");
    if (stylesPart) {
      const styles = getFirstLevelElements(stylesPart, "w:styles");
      const styleIds = new Set(styles.map((style) => {
        var _style$attributes;
        return (_style$attributes = style.attributes) === null || _style$attributes === void 0 ? void 0 : _style$attributes["w:styleId"];
      }));
      styles.push(...kind.create.styles().map((style) => formatElement$1(style, context)).filter((style) => {
        var _style$attributes2;
        return !styleIds.has((_style$attributes2 = style.attributes) === null || _style$attributes2 === void 0 ? void 0 : _style$attributes2["w:styleId"]);
      }));
    }
  };
  const carry = (reference2, note) => {
    const existing = carriedIds.get(reference2);
    if (existing !== void 0) return existing;
    highestGivenId++;
    givenNotes.set(highestGivenId, note);
    carriedIds.set(reference2, highestGivenId);
    return highestGivenId;
  };
  return {
    renumber: (elements) => elements.map(renumber),
    write,
    carry
  };
};
var patchNotes = ({ footnotes = {}, endnotes = {} }, parts, helpers) => {
  const patchers = {
    footnotes: patchNotesOfKind(FOOTNOTES, footnotes, parts, helpers),
    endnotes: patchNotesOfKind(ENDNOTES, endnotes, parts, helpers)
  };
  return {
    carry: (kind, reference2, note) => patchers[kind].carry(reference2, note),
    renumber: (elements) => Object.values(patchers).reduce((renumbered, patcher) => patcher.renumber(renumbered), elements),
    write: () => {
      for (const patcher of Object.values(patchers)) patcher.write();
    }
  };
};
var formatter$1 = new Formatter();
var DOCUMENT_PATH = "word/document.xml";
var NUMBERING_PATH = "word/numbering.xml";
var NUMBERING_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml";
var NUMBERING_RELATIONSHIP = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering";
var BULLET_REFERENCE = "default-bullet-numbering";
var BULLET_NUM_ID = "1";
var formatElement = (component, context) => toJson(stringifyXmlable(formatter$1.format(component, context))).elements[0];
var highestOf = (ids) => ids.reduce((highest, id) => Math.max(highest, id), 0);
var patchNumbering = (numbering, parts, { createContext, addContentTypeOverride }) => {
  const newNumIds = /* @__PURE__ */ new Map();
  let highestNumId;
  const numberingRelationship = () => {
    var _parts$get;
    return getFirstLevelElements((_parts$get = parts.get(relationshipsPathOf(DOCUMENT_PATH))) !== null && _parts$get !== void 0 ? _parts$get : {}, "Relationships").find((element) => {
      var _element$attributes;
      return ((_element$attributes = element.attributes) === null || _element$attributes === void 0 ? void 0 : _element$attributes.Type) === NUMBERING_RELATIONSHIP;
    });
  };
  const numberingPath = (relationship = numberingRelationship()) => relationship ? resolveTarget(DOCUMENT_PATH, String(relationship.attributes.Target)) : NUMBERING_PATH;
  const idsInTemplate = (name, attribute2) => {
    var _parts$get2;
    return getFirstLevelElements((_parts$get2 = parts.get(numberingPath())) !== null && _parts$get2 !== void 0 ? _parts$get2 : {}, "w:numbering").filter((element) => element.name === name).map((element) => Number(element.attributes[attribute2]));
  };
  const listOf = (numId) => {
    if (numId === BULLET_NUM_ID) return numbering.ConcreteNumbering.find(({ reference: reference2 }) => reference2 === BULLET_REFERENCE);
    if (!numId.startsWith("{")) return;
    const list2 = numbering.ConcreteNumbering.find(({ reference: reference2, instance }) => numId === `{${reference2}-${instance}}`);
    if (!list2) {
      const reference2 = numId.slice(1, -1).replace(/-\d+$/, "");
      throw new Error(`A paragraph in a patch uses the numbering "${reference2}", which isn't in the numbering option of patchDocument. Add it there with its levels, as in a Document`);
    }
    return list2;
  };
  const newNumIdOf = (list2) => {
    var _highestNumId;
    const knownId = newNumIds.get(list2.numId);
    if (knownId !== void 0) return knownId;
    highestNumId = ((_highestNumId = highestNumId) !== null && _highestNumId !== void 0 ? _highestNumId : highestOf(idsInTemplate("w:num", "w:numId"))) + 1;
    newNumIds.set(list2.numId, highestNumId);
    return highestNumId;
  };
  const renumber = (element) => {
    const list2 = element.name === "w:numId" ? listOf(String(element.attributes["w:val"])) : void 0;
    if (list2 === void 0) return element.elements === void 0 ? element : _objectSpread2(_objectSpread2({}, element), {}, { elements: element.elements.map(renumber) });
    return _objectSpread2(_objectSpread2({}, element), {}, { attributes: _objectSpread2(_objectSpread2({}, element.attributes), {}, { "w:val": String(newNumIdOf(list2)) }) });
  };
  const findOrAddPart = (written) => {
    const relationship = numberingRelationship();
    const path = numberingPath(relationship);
    if (!parts.has(path)) {
      parts.set(path, {
        declaration: { attributes: {
          version: "1.0",
          encoding: "UTF-8",
          standalone: "yes"
        } },
        elements: [_objectSpread2(_objectSpread2({}, written), {}, { elements: [] })]
      });
      addContentTypeOverride(NUMBERING_CONTENT_TYPE, `/${path}`);
    }
    if (!relationship) createContext(DOCUMENT_PATH).viewWrapper.Relationships.addRelationship(uniqueId(), NUMBERING_RELATIONSHIP, relativeTarget(DOCUMENT_PATH, path));
    return path;
  };
  const write = () => {
    var _root$attributes$mcI, _root$attributes;
    if (newNumIds.size === 0) return;
    const written = formatElement(numbering, createContext(numberingPath()));
    const abstractNumIdOf = (list2) => Number(list2.elements.find((element) => element.name === "w:abstractNumId").attributes["w:val"]);
    const lists = written.elements.filter((element) => element.name === "w:num" && newNumIds.has(Number(element.attributes["w:numId"])));
    const highestAbstractNumId = highestOf(idsInTemplate("w:abstractNum", "w:abstractNumId"));
    const newAbstractNumIds = new Map([...new Set(lists.map(abstractNumIdOf))].map((id, index) => [id, highestAbstractNumId + index + 1]));
    const abstractLists = written.elements.flatMap((element) => {
      const newId = element.name === "w:abstractNum" ? newAbstractNumIds.get(Number(element.attributes["w:abstractNumId"])) : void 0;
      return newId === void 0 ? [] : [_objectSpread2(_objectSpread2({}, element), {}, { attributes: _objectSpread2(_objectSpread2({}, element.attributes), {}, { "w:abstractNumId": String(newId) }) })];
    });
    const path = findOrAddPart(written);
    const root = parts.get(path).elements.find((element) => element.name === "w:numbering");
    root.attributes = _objectSpread2(_objectSpread2(_objectSpread2({}, Object.fromEntries(Object.entries(written.attributes).filter(([name]) => name.startsWith("xmlns:")))), root.attributes), {}, { "mc:Ignorable": [.../* @__PURE__ */ new Set([...String((_root$attributes$mcI = (_root$attributes = root.attributes) === null || _root$attributes === void 0 ? void 0 : _root$attributes["mc:Ignorable"]) !== null && _root$attributes$mcI !== void 0 ? _root$attributes$mcI : "").split(" "), ...String(written.attributes["mc:Ignorable"]).split(" ")])].filter((prefix) => prefix !== "").join(" ") });
    const elements = getFirstLevelElements(parts.get(path), "w:numbering");
    const firstIndexOf = (names) => {
      const index = elements.findIndex((element) => names.includes(element.name));
      return index === -1 ? elements.length : index;
    };
    elements.splice(firstIndexOf(["w:num", "w:numIdMacAtCleanup"]), 0, ...abstractLists);
    elements.splice(firstIndexOf(["w:numIdMacAtCleanup"]), 0, ...lists.map((list2) => _objectSpread2(_objectSpread2({}, list2), {}, {
      attributes: _objectSpread2(_objectSpread2({}, list2.attributes), {}, { "w:numId": String(newNumIds.get(Number(list2.attributes["w:numId"]))) }),
      elements: list2.elements.map((element) => element.name === "w:abstractNumId" ? _objectSpread2(_objectSpread2({}, element), {}, { attributes: { "w:val": String(newAbstractNumIds.get(abstractNumIdOf(list2))) } }) : element)
    })));
  };
  return {
    renumber: (elements) => elements.map(renumber),
    write
  };
};
var PARSED = {
  nameOf: (element) => element.type === "element" ? element.name : void 0,
  contentOf: (element) => element.elements,
  attributeOf: (element, attribute2) => {
    var _element$attributes;
    return (_element$attributes = element.attributes) === null || _element$attributes === void 0 ? void 0 : _element$attributes[attribute2];
  },
  textOf: (element) => {
    var _element$elements;
    return ((_element$elements = element.elements) !== null && _element$elements !== void 0 ? _element$elements : []).filter(({ type }) => type === "text").map(({ text: text2 }) => String(text2)).join("");
  },
  textElement: (text2) => ({
    type: "element",
    name: "w:t",
    attributes: { "xml:space": "preserve" },
    elements: [{
      type: "text",
      text: text2
    }]
  }),
  writeClean: (begin, instruction) => {
    var _begin$attributes;
    if (/^\s*(PAGEREF|TOC)\b/i.test(instruction) && ((_begin$attributes = begin.attributes) === null || _begin$attributes === void 0 ? void 0 : _begin$attributes["w:dirty"]) !== void 0) begin.attributes = Object.fromEntries(Object.entries(begin.attributes).filter(([key]) => key !== "w:dirty"));
  },
  setSimpleFieldResult: (element, text2) => {
    element.elements = [{
      type: "element",
      name: "w:r",
      elements: [PARSED.textElement(text2)]
    }];
  }
};
var DOCUMENT = "word/document.xml";
var IMPORT = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk";
var ZIP = [
  80,
  75,
  3,
  4
];
var readPackage = (function() {
  var _ref = _asyncToGenerator(function* (data) {
    if (!ZIP.every((byte, index) => data[index] === byte)) return;
    try {
      const parts = /* @__PURE__ */ new Map();
      const binaryParts = /* @__PURE__ */ new Map();
      for (const [path, file] of unzipFiles(data)) if (/\.(xml|rels)$/.test(path)) parts.set(path, toJson(decodeUtf8(file)));
      else binaryParts.set(path, file);
      const importedDocuments = yield readImportedDocuments(parts, binaryParts);
      return _objectSpread2({
        parts,
        binaryParts
      }, importedDocuments.size > 0 ? { importedDocuments } : {});
    } catch (_unused) {
      return;
    }
  });
  return function readPackage2(_x) {
    return _ref.apply(this, arguments);
  };
})();
var readImportedDocuments = (function() {
  var _ref2 = _asyncToGenerator(function* (parts, binaryParts) {
    const imported = /* @__PURE__ */ new Map();
    for (const [path, relationships] of parts) {
      var _rootOf$elements, _rootOf;
      if (!path.endsWith(".rels")) continue;
      for (const { attributes = {} } of (_rootOf$elements = (_rootOf = rootOf(relationships)) === null || _rootOf === void 0 ? void 0 : _rootOf.elements) !== null && _rootOf$elements !== void 0 ? _rootOf$elements : []) {
        const target = resolveTarget(sourceOfRelationships(path), String(attributes.Target));
        const data = binaryParts.get(target);
        const read = attributes.Type === IMPORT && attributes.TargetMode !== "External" && data ? yield readPackage(data) : void 0;
        if (read) imported.set(target, read);
      }
    }
    return imported;
  });
  return function readImportedDocuments2(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();
var rootOf = (part) => {
  var _part$elements;
  return part === null || part === void 0 || (_part$elements = part.elements) === null || _part$elements === void 0 ? void 0 : _part$elements.find(({ type }) => type === "element");
};
var fillTemplatePageNumbers = (function() {
  var _ref3 = _asyncToGenerator(function* (parts, estimator, binaryParts = /* @__PURE__ */ new Map()) {
    var _rootOf$elements2, _rootOf2;
    const document2 = rootOf(parts.get(DOCUMENT));
    if (!document2) return;
    const importedDocuments = yield readImportedDocuments(parts, binaryParts);
    const estimate = estimator(_objectSpread2({
      parts,
      binaryParts
    }, importedDocuments.size > 0 ? { importedDocuments } : {}));
    const partPageCounts = fillBodyFields(PARSED, document2, estimate, { blank: true });
    const relationships = (_rootOf$elements2 = (_rootOf2 = rootOf(parts.get(relationshipsPathOf(DOCUMENT)))) === null || _rootOf2 === void 0 ? void 0 : _rootOf2.elements) !== null && _rootOf$elements2 !== void 0 ? _rootOf$elements2 : [];
    for (const { attributes = {} } of relationships) {
      const part = /\/(header|footer)$/.test(String(attributes.Type)) ? rootOf(parts.get(resolveTarget(DOCUMENT, String(attributes.Target)))) : void 0;
      if (part) fillPartFields(PARSED, part, estimate, {
        blank: true,
        sectionPageCount: partPageCounts.get(String(attributes.Id))
      });
    }
  });
  return function fillTemplatePageNumbers2(_x4, _x5) {
    return _ref3.apply(this, arguments);
  };
})();
var RUN_CONTAINERS = /* @__PURE__ */ new Set([
  "w:hyperlink",
  "w:sdt",
  "w:sdtContent",
  "w:ins",
  "w:moveTo",
  "w:smartTag",
  "w:customXml",
  "w:fldSimple",
  "w:dir",
  "w:bdo"
]);
var runsIn = (element, path) => {
  var _element$elements;
  return ((_element$elements = element.elements) !== null && _element$elements !== void 0 ? _element$elements : []).flatMap((child2, i2) => {
    var _child$name;
    if (child2.name === "w:r") return [{
      element: child2,
      path: [...path, i2]
    }];
    return RUN_CONTAINERS.has((_child$name = child2.name) !== null && _child$name !== void 0 ? _child$name : "") ? runsIn(child2, [...path, i2]) : [];
  });
};
var elementAtPath = (element, path) => path.reduce((parent, index) => parent.elements[index], element);
var renderParagraphNode = (node) => {
  if (node.element.name !== "w:p") throw new Error(`Invalid node type: ${node.element.name}`);
  if (!node.element.elements) return {
    text: "",
    runs: [],
    index: -1,
    pathToParagraph: []
  };
  let currentRunStringLength = 0;
  const runs = runsIn(node.element, []).map(({ element, path }) => {
    const renderedRunNode = renderRunNode(element, path, currentRunStringLength);
    currentRunStringLength += renderedRunNode.text.length;
    return renderedRunNode;
  });
  return {
    text: runs.reduce((acc, curr) => acc + curr.text, ""),
    runs,
    index: node.index,
    pathToParagraph: buildNodePath(node)
  };
};
var renderRunNode = (node, path, currentRunStringIndex) => {
  if (!node.elements) return {
    text: "",
    parts: [],
    path,
    start: currentRunStringIndex,
    end: currentRunStringIndex
  };
  let currentTextStringIndex = currentRunStringIndex;
  const parts = node.elements.map((element, i2) => {
    var _element$elements$0$t, _element$elements$0$t2;
    if (element.name !== "w:t" || !element.elements || element.elements.length === 0) return;
    const partText = (_element$elements$0$t = (_element$elements$0$t2 = element.elements[0].text) === null || _element$elements$0$t2 === void 0 ? void 0 : _element$elements$0$t2.toString()) !== null && _element$elements$0$t !== void 0 ? _element$elements$0$t : "";
    const start = currentTextStringIndex;
    currentTextStringIndex += partText.length;
    return {
      text: partText,
      index: i2,
      start,
      end: start + partText.length - 1
    };
  }).filter((e) => !!e).map((e) => e);
  return {
    text: parts.reduce((acc, curr) => acc + curr.text, ""),
    parts,
    path,
    start: currentRunStringIndex,
    end: parts.length > 0 ? parts[parts.length - 1].end : currentRunStringIndex
  };
};
var buildNodePath = (node) => node.parent ? [...buildNodePath(node.parent), node.index] : [node.index];
var TokenNotFoundError = class extends Error {
  constructor(token) {
    super(`Token ${token} not found`);
    this.name = "TokenNotFoundError";
  }
};
var findRunElementPathWithToken = (paragraphElement, token) => {
  const run = renderParagraphNode({
    element: paragraphElement,
    index: 0,
    parent: void 0
  }).runs.find(({ parts }) => parts.some(({ text: text2 }) => text2.includes(token)));
  if (!run) throw new TokenNotFoundError(token);
  return run.path;
};
var splitRunElement = (runElement, token) => {
  var _runElement$elements$, _runElement$elements;
  let splitIndex = -1;
  const splitElements = (_runElement$elements$ = (_runElement$elements = runElement.elements) === null || _runElement$elements === void 0 ? void 0 : _runElement$elements.map((e, i2) => {
    if (splitIndex !== -1) return e;
    if (e.type === "element" && e.name === "w:t") {
      var _e$elements$0$text, _e$elements;
      const splitText = ((_e$elements$0$text = (_e$elements = e.elements) === null || _e$elements === void 0 || (_e$elements = _e$elements[0]) === null || _e$elements === void 0 ? void 0 : _e$elements.text) !== null && _e$elements$0$text !== void 0 ? _e$elements$0$text : "").split(token);
      const newElements = splitText.map((t) => _objectSpread2(_objectSpread2(_objectSpread2({}, e), patchSpaceAttribute(e)), {}, { elements: createTextElementContents(t) }));
      if (splitText.length > 1) splitIndex = i2;
      return newElements;
    } else return e;
  }).flat()) !== null && _runElement$elements$ !== void 0 ? _runElement$elements$ : [];
  return {
    left: _objectSpread2(_objectSpread2({}, JSON.parse(JSON.stringify(runElement))), {}, { elements: splitElements.slice(0, splitIndex + 1) }),
    right: _objectSpread2(_objectSpread2({}, JSON.parse(JSON.stringify(runElement))), {}, { elements: splitElements.slice(splitIndex + 1) })
  };
};
var ReplaceMode = {
  /** Looking for the start of the replacement text */
  START: 0,
  /** Processing runs in the middle of the replacement text */
  MIDDLE: 1,
  /** Reached the end of the replacement text */
  END: 2
};
var replaceTokenInParagraphElement = ({ paragraphElement, renderedParagraph, originalText, replacementText, fromIndex = 0 }) => {
  const startIndex = renderedParagraph.text.indexOf(originalText, fromIndex);
  const endIndex = startIndex + originalText.length - 1;
  let replaceMode = ReplaceMode.START;
  for (const run of renderedParagraph.runs) {
    const runElement = elementAtPath(paragraphElement, run.path);
    for (const { text: text2, index, start, end } of run.parts) switch (replaceMode) {
      case ReplaceMode.START:
        if (startIndex >= start && startIndex <= end) {
          const offsetStartIndex = startIndex - start;
          const offsetEndIndex = Math.min(endIndex, end) - start;
          if (text2.substring(offsetStartIndex, offsetEndIndex + 1) === "") continue;
          const firstPart = text2.substring(0, offsetStartIndex) + replacementText + text2.substring(offsetEndIndex + 1);
          patchTextElement(runElement.elements[index], firstPart);
          replaceMode = ReplaceMode.MIDDLE;
          continue;
        }
        break;
      case ReplaceMode.MIDDLE:
        if (endIndex <= end) {
          const lastPart = text2.substring(endIndex - start + 1);
          patchTextElement(runElement.elements[index], lastPart);
          const currentElement = runElement.elements[index];
          runElement.elements[index] = patchSpaceAttribute(currentElement);
          replaceMode = ReplaceMode.END;
        } else patchTextElement(runElement.elements[index], "");
    }
  }
  return paragraphElement;
};
var patchTextElement = (element, text2) => {
  element.elements = createTextElementContents(text2);
  return element;
};
var elementsToWrapper = (wrapper) => {
  var _wrapper$element$elem, _wrapper$element$elem2;
  return (_wrapper$element$elem = (_wrapper$element$elem2 = wrapper.element.elements) === null || _wrapper$element$elem2 === void 0 ? void 0 : _wrapper$element$elem2.map((e, i2) => ({
    element: e,
    index: i2,
    parent: wrapper
  }))) !== null && _wrapper$element$elem !== void 0 ? _wrapper$element$elem : [];
};
var traverse = (node) => {
  const renderedParagraphs = [];
  const queue = [...elementsToWrapper({
    element: node,
    index: 0,
    parent: void 0
  })];
  for (const currentNode of queue) {
    if (currentNode.element.name === "w:p") renderedParagraphs.push(renderParagraphNode(currentNode));
    for (const child2 of elementsToWrapper(currentNode)) queue.push(child2);
  }
  return renderedParagraphs;
};
var findLocationOfText = (node, text2) => traverse(node).filter((p) => p.text.includes(text2));
var SPLIT_TOKEN = "\uFFFF";
var replacer = ({ json, patch, patchText, context, keepOriginalStyles = true, recursive = true, renumberIds = (elements) => elements }) => {
  const renderedParagraphs = findLocationOfText(json, patchText);
  if (renderedParagraphs.length === 0) return {
    element: json,
    didFindOccurrence: false
  };
  const paragraphsInPatchOrder = [...renderedParagraphs].reverse();
  const paragraphsToPatch = patch.type === PatchType.DOCUMENT ? withoutNestedParagraphs(paragraphsInPatchOrder) : paragraphsInPatchOrder;
  let highestId;
  const newTrackedChangeId = () => {
    var _highestId;
    highestId = ((_highestId = highestId) !== null && _highestId !== void 0 ? _highestId : highestIdIn(json)) + 1;
    return String(highestId);
  };
  for (const renderedParagraph of paragraphsToPatch) switch (patch.type) {
    case PatchType.DOCUMENT: {
      var _children;
      const parentElement = goToParentElementFromPath(json, renderedParagraph.pathToParagraph);
      const elementIndex = getLastElementIndexFromPath(renderedParagraph.pathToParagraph);
      const children = formatChildren(patch, context, renumberIds);
      const endParagraph = parentElement.name === "w:tc" && elementIndex === parentElement.elements.length - 1 && ((_children = children[children.length - 1]) === null || _children === void 0 ? void 0 : _children.name) !== "w:p" ? [{
        type: "element",
        name: "w:p"
      }] : [];
      parentElement.elements.splice(elementIndex, 1, ...children, ...endParagraph);
      break;
    }
    case PatchType.PARAGRAPH:
    default: {
      const paragraphElement = goToElementFromPath(json, renderedParagraph.pathToParagraph);
      let paragraph2 = renderedParagraph;
      let fromIndex = 0;
      do {
        fromIndex = replaceOccurrenceInParagraph({
          paragraphElement,
          renderedParagraph: paragraph2,
          patchText,
          fromIndex,
          children: formatChildren(patch, context, renumberIds),
          keepOriginalStyles,
          newTrackedChangeId
        });
        paragraph2 = renderParagraphNode({
          element: paragraphElement,
          index: renderedParagraph.index,
          parent: void 0
        });
      } while (recursive && paragraph2.text.includes(patchText, fromIndex));
      break;
    }
  }
  return {
    element: json,
    didFindOccurrence: true
  };
};
var formatChildren = (patch, context, renumberIds) => renumberIds(patch.children.flatMap((c) => {
  var _c$writtenAs;
  return (_c$writtenAs = c.writtenAs) !== null && _c$writtenAs !== void 0 ? _c$writtenAs : c;
}).flatMap((c) => {
  const formatted = c.prepForXml(context);
  return formatted ? [toJson(stringifyXmlable(formatted)).elements[0]] : [];
}));
var replaceOccurrenceInParagraph = ({ paragraphElement, renderedParagraph, patchText, fromIndex, children, keepOriginalStyles, newTrackedChangeId }) => {
  const start = renderedParagraph.text.indexOf(patchText, fromIndex);
  replaceTokenInParagraphElement({
    paragraphElement,
    renderedParagraph,
    originalText: patchText,
    replacementText: SPLIT_TOKEN,
    fromIndex
  });
  const runPath = findRunElementPathWithToken(paragraphElement, SPLIT_TOKEN);
  const containerPath = runPath.slice(0, -1);
  const container = elementAtPath(paragraphElement, containerPath);
  const index = runPath[runPath.length - 1];
  const contentControls = containerPath.map((_, depth) => elementAtPath(paragraphElement, containerPath.slice(0, depth + 1))).filter((e) => e.name === "w:sdt");
  const controlShowingPlaceholder = [...contentControls].reverse().find(isShowingPlaceholder);
  const runElementToBeReplaced = container.elements[index];
  const { left, right } = splitRunElement(runElementToBeReplaced, SPLIT_TOKEN);
  const runProperties = runElementToBeReplaced.elements.find((e) => e.type === "element" && e.name === "w:rPr");
  const contentRunProperties = controlShowingPlaceholder ? runPropertiesOfContentControl(controlShowingPlaceholder) : runProperties;
  const newRunElements = keepOriginalStyles && contentRunProperties ? children.map((e) => withRunPropertiesOnRuns(e, contentRunProperties)) : children;
  const patchedRightElement = runProperties ? _objectSpread2(_objectSpread2({}, right), {}, { elements: [runProperties, ...right.elements] }) : right;
  container.elements.splice(index, 1, left, ...newRunElements, patchedRightElement);
  contentControls.forEach((contentControl) => fillContentControl(contentControl, newRunElements));
  liftOutOfContainers(paragraphElement, containerPath, newTrackedChangeId);
  return start + renderParagraphNode({
    element: {
      name: "w:p",
      elements: [...newRunElements]
    },
    index: 0,
    parent: void 0
  }).text.length;
};
var propertiesOfContentControl = (contentControl) => {
  var _contentControl$eleme;
  return (_contentControl$eleme = contentControl.elements) === null || _contentControl$eleme === void 0 ? void 0 : _contentControl$eleme.find((e) => e.name === "w:sdtPr");
};
var isShowingPlaceholder = (contentControl) => {
  var _propertiesOfContentC;
  return !!((_propertiesOfContentC = propertiesOfContentControl(contentControl)) === null || _propertiesOfContentC === void 0 || (_propertiesOfContentC = _propertiesOfContentC.elements) === null || _propertiesOfContentC === void 0 ? void 0 : _propertiesOfContentC.some((e) => e.name === "w:showingPlcHdr"));
};
var runPropertiesOfContentControl = (contentControl) => {
  var _propertiesOfContentC2;
  return (_propertiesOfContentC2 = propertiesOfContentControl(contentControl)) === null || _propertiesOfContentC2 === void 0 || (_propertiesOfContentC2 = _propertiesOfContentC2.elements) === null || _propertiesOfContentC2 === void 0 ? void 0 : _propertiesOfContentC2.find((e) => e.name === "w:rPr");
};
var PLAIN_TEXT_RUN_CONTENT = /* @__PURE__ */ new Set([
  "w:rPr",
  "w:t",
  "w:tab",
  "w:br"
]);
var isPlainText = (element) => element.name === "w:bookmarkStart" || element.name === "w:bookmarkEnd" || element.name === "w:r" && childElementsOf(element).every((e) => PLAIN_TEXT_RUN_CONTENT.has(e.name));
var fillContentControl = (contentControl, insertedElements) => {
  const properties = propertiesOfContentControl(contentControl);
  if (!(properties === null || properties === void 0 ? void 0 : properties.elements)) return;
  const needsRichText = properties.elements.some((e) => e.name === "w:text") && !insertedElements.every(isPlainText);
  properties.elements = properties.elements.filter((e) => e.name !== "w:showingPlcHdr" && e.name !== "w:dataBinding" && !(needsRichText && e.name === "w:text"));
};
var NOT_IN_TRACKED_CHANGES = /* @__PURE__ */ new Set([
  "w:hyperlink",
  "w:fldSimple",
  "w:subDoc"
]);
var NOT_IN_CONTAINER = /* @__PURE__ */ new Map([
  ["w:ins", NOT_IN_TRACKED_CHANGES],
  ["w:moveTo", NOT_IN_TRACKED_CHANGES],
  ["w:hyperlink", /* @__PURE__ */ new Set(["w:hyperlink"])]
]);
var liftOutOfContainers = (paragraphElement, containerPath, newTrackedChangeId) => {
  for (let depth = containerPath.length; depth > 0; depth--) {
    var _container$elements;
    const parent = elementAtPath(paragraphElement, containerPath.slice(0, depth - 1));
    const index = containerPath[depth - 1];
    const container = parent.elements[index];
    const cantHold = NOT_IN_CONTAINER.get(container.name);
    const isLifted = (element) => !!(cantHold === null || cantHold === void 0 ? void 0 : cantHold.has(element.name));
    if (!((_container$elements = container.elements) === null || _container$elements === void 0 ? void 0 : _container$elements.some(isLifted))) continue;
    const { elements } = container;
    const starts = elements.flatMap((element, i2) => i2 === 0 || isLifted(element) || isLifted(elements[i2 - 1]) ? [i2] : []);
    const stretches = starts.map((start, i2) => elements.slice(start, starts[i2 + 1]));
    const isTrackedChange = cantHold === NOT_IN_TRACKED_CHANGES;
    let isFirstCopy = true;
    const pieces = stretches.map((stretch) => {
      if (isLifted(stretch[0])) return stretch[0];
      const attributes = isTrackedChange && !isFirstCopy ? _objectSpread2(_objectSpread2({}, container.attributes), {}, { "w:id": newTrackedChangeId() }) : container.attributes;
      isFirstCopy = false;
      return _objectSpread2(_objectSpread2({}, container), {}, {
        attributes,
        elements: [...stretch]
      });
    });
    parent.elements.splice(index, 1, ...pieces);
  }
};
var withRunPropertiesOnRuns = (element, originalRunProperties) => {
  if (element.name === "w:r") return withRunProperties(element, originalRunProperties);
  return element.elements ? _objectSpread2(_objectSpread2({}, element), {}, { elements: element.elements.map((e) => withRunPropertiesOnRuns(e, originalRunProperties)) }) : element;
};
var withRunProperties = (runElement, originalRunProperties) => {
  const ownRunProperties = childElementsOf(runElement).find((e) => e.type === "element" && e.name === "w:rPr");
  if (!ownRunProperties) return _objectSpread2(_objectSpread2({}, runElement), {}, { elements: [originalRunProperties, ...childElementsOf(runElement)] });
  const ownPropertyNames = new Set(childElementsOf(ownRunProperties).map((e) => e.name));
  const properties = [...childElementsOf(originalRunProperties).filter((e) => !ownPropertyNames.has(e.name)), ...childElementsOf(ownRunProperties)];
  const mergedRunProperties = _objectSpread2(_objectSpread2({}, ownRunProperties), {}, { elements: [...properties].sort((a, b) => runPropertyRank(a) - runPropertyRank(b)) });
  return _objectSpread2(_objectSpread2({}, runElement), {}, { elements: childElementsOf(runElement).map((e) => e === ownRunProperties ? mergedRunProperties : e) });
};
var RUN_PROPERTY_ORDER = [
  "w:rStyle",
  "w:rFonts",
  "w:b",
  "w:bCs",
  "w:i",
  "w:iCs",
  "w:caps",
  "w:smallCaps",
  "w:strike",
  "w:dstrike",
  "w:outline",
  "w:shadow",
  "w:emboss",
  "w:imprint",
  "w:noProof",
  "w:snapToGrid",
  "w:vanish",
  "w:webHidden",
  "w:color",
  "w:spacing",
  "w:w",
  "w:kern",
  "w:position",
  "w:sz",
  "w:szCs",
  "w:highlight",
  "w:u",
  "w:effect",
  "w:bdr",
  "w:shd",
  "w:fitText",
  "w:vertAlign",
  "w:rtl",
  "w:cs",
  "w:em",
  "w:lang",
  "w:eastAsianLayout",
  "w:specVanish",
  "w:oMath",
  "w14:glow",
  "w14:shadow",
  "w14:reflection",
  "w14:textOutline",
  "w14:textFill",
  "w14:scene3d",
  "w14:props3d",
  "w14:ligatures",
  "w14:numForm",
  "w14:numSpacing",
  "w14:stylisticSets",
  "w14:cntxtAlts"
];
var runPropertyRank = (element) => {
  var _element$name;
  if (element.name === "w:rPrChange") return RUN_PROPERTY_ORDER.length + 1;
  const index = RUN_PROPERTY_ORDER.indexOf((_element$name = element.name) !== null && _element$name !== void 0 ? _element$name : "");
  return index === -1 ? RUN_PROPERTY_ORDER.length : index;
};
var childElementsOf = (element) => {
  var _element$elements;
  return (_element$elements = element.elements) !== null && _element$elements !== void 0 ? _element$elements : [];
};
var highestIdIn = (element) => {
  var _element$attributes, _element$elements2;
  const id = Number((_element$attributes = element.attributes) === null || _element$attributes === void 0 ? void 0 : _element$attributes["w:id"]);
  return ((_element$elements2 = element.elements) !== null && _element$elements2 !== void 0 ? _element$elements2 : []).reduce((highest, child2) => Math.max(highest, highestIdIn(child2)), Number.isInteger(id) ? id : 0);
};
var isInsideElementAtPath = (path, ancestorPath) => path.length > ancestorPath.length && ancestorPath.every((index, i2) => path[i2] === index);
var withoutNestedParagraphs = (paragraphs) => paragraphs.filter((paragraph2) => !paragraphs.some((other) => isInsideElementAtPath(paragraph2.pathToParagraph, other.pathToParagraph)));
var goToElementFromPath = (json, path) => {
  let element = json;
  for (let i2 = 1; i2 < path.length; i2++) {
    const index = path[i2];
    element = element.elements[index];
  }
  return element;
};
var goToParentElementFromPath = (json, path) => goToElementFromPath(json, path.slice(0, path.length - 1));
var getLastElementIndexFromPath = (path) => path[path.length - 1];
var formatter = new Formatter();
var STYLES_PATH = "word/styles.xml";
var REFERENCES = /* @__PURE__ */ new Set([
  "w:pStyle",
  "w:rStyle",
  "w:tblStyle",
  "w:basedOn",
  "w:next",
  "w:link"
]);
var idOf = (style) => {
  var _style$attributes;
  return String((_style$attributes = style.attributes) === null || _style$attributes === void 0 ? void 0 : _style$attributes["w:styleId"]);
};
var nameOf = (style) => {
  var _style$elements;
  const name = (_style$elements = style.elements) === null || _style$elements === void 0 || (_style$elements = _style$elements.find((element) => element.name === "w:name")) === null || _style$elements === void 0 || (_style$elements = _style$elements.attributes) === null || _style$elements === void 0 ? void 0 : _style$elements["w:val"];
  return name === void 0 ? void 0 : String(name).toLowerCase();
};
var childOf$1 = (element, name) => {
  var _element$elements;
  return element === null || element === void 0 || (_element$elements = element.elements) === null || _element$elements === void 0 ? void 0 : _element$elements.find((child2) => child2.name === name);
};
var sizeIn = (runProperties) => {
  var _childOf;
  const size = Number((_childOf = childOf$1(runProperties, "w:sz")) === null || _childOf === void 0 || (_childOf = _childOf.attributes) === null || _childOf === void 0 ? void 0 : _childOf["w:val"]);
  return Number.isNaN(size) ? void 0 : size;
};
var normalSizeOf = (elements) => {
  var _styles$find, _sizeIn;
  const styles = elements.filter((element) => element.name === "w:style");
  const normal = (_styles$find = styles.find((style) => idOf(style) === "Normal")) !== null && _styles$find !== void 0 ? _styles$find : styles.find((style) => {
    var _style$attributes2;
    return ((_style$attributes2 = style.attributes) === null || _style$attributes2 === void 0 ? void 0 : _style$attributes2["w:type"]) === "paragraph" && nameOf(style) === "normal";
  });
  const defaults = elements.find((element) => element.name === "w:docDefaults");
  return (_sizeIn = sizeIn(childOf$1(normal, "w:rPr"))) !== null && _sizeIn !== void 0 ? _sizeIn : sizeIn(childOf$1(childOf$1(defaults, "w:rPrDefault"), "w:rPr"));
};
var formatDefaultStyles = (context, normalSize) => new Map(Object.values(createDefaultStyles({ document: { run: { size: normalSize } } })).map((style) => toJson(stringifyXmlable(formatter.format(style, context))).elements[0]).filter((style) => style.name === "w:style").map((style) => [idOf(style), style]));
var patchStyles = (parts, createContext) => {
  var _parts$get;
  const templateElements = getFirstLevelElements((_parts$get = parts.get(STYLES_PATH)) !== null && _parts$get !== void 0 ? _parts$get : {}, "w:styles");
  const templateStyles = templateElements.filter((element) => element.name === "w:style");
  const templateIds = new Set(templateStyles.map(idOf));
  let defaultStyles;
  const defaultStyleOf = (id) => {
    var _defaultStyles;
    (_defaultStyles = defaultStyles) !== null && _defaultStyles !== void 0 || (defaultStyles = formatDefaultStyles(createContext(STYLES_PATH), normalSizeOf(templateElements)));
    return defaultStyles.get(id);
  };
  const missingIds = /* @__PURE__ */ new Set();
  const idsInDocument = /* @__PURE__ */ new Map();
  const findIdInDocument = (id) => {
    const style = templateIds.has(id) ? void 0 : defaultStyleOf(id);
    if (style === void 0) return id;
    const sameStyle = templateStyles.find((templateStyle) => {
      var _templateStyle$attrib, _style$attributes3;
      return ((_templateStyle$attrib = templateStyle.attributes) === null || _templateStyle$attrib === void 0 ? void 0 : _templateStyle$attrib["w:type"]) === ((_style$attributes3 = style.attributes) === null || _style$attributes3 === void 0 ? void 0 : _style$attributes3["w:type"]) && nameOf(templateStyle) === nameOf(style);
    });
    if (sameStyle !== void 0) return idOf(sameStyle);
    missingIds.add(id);
    return id;
  };
  const idInDocument = (id) => {
    if (!idsInDocument.has(id)) idsInDocument.set(id, findIdInDocument(id));
    return idsInDocument.get(id);
  };
  const withIdsInDocument = (element) => {
    var _element$name;
    if (REFERENCES.has((_element$name = element.name) !== null && _element$name !== void 0 ? _element$name : "")) return _objectSpread2(_objectSpread2({}, element), {}, { attributes: _objectSpread2(_objectSpread2({}, element.attributes), {}, { "w:val": idInDocument(String(element.attributes["w:val"])) }) });
    return element.elements === void 0 ? element : _objectSpread2(_objectSpread2({}, element), {}, { elements: element.elements.map(withIdsInDocument) });
  };
  const write = () => {
    const stylesPart = parts.get(STYLES_PATH);
    if (!stylesPart) return;
    const styles = getFirstLevelElements(stylesPart, "w:styles");
    const ids = new Set(styles.map(idOf));
    for (const id of missingIds) if (!ids.has(id)) {
      ids.add(id);
      styles.push(withIdsInDocument(defaultStyleOf(id)));
    }
  };
  return {
    use: (elements) => elements.map(withIdsInDocument),
    write
  };
};
var EMPTY = {
  type: PatchType.PARAGRAPH,
  children: []
};
var patchTableRows = ({ json, key, patch, delimiters: { start, end }, patchPlaceholder, renumberDrawings }) => {
  const fieldStart = `${start}${key}.`;
  for (const rows of findRowsToRepeat(json, fieldStart)) {
    const fields = fieldsIn(rows.elements, fieldStart, end);
    const copies = patch.rows.flatMap((row, index) => {
      const copy = {
        type: "element",
        name: "w:tbl",
        elements: [...index === 0 ? rows.elements.map(copyOf) : renumberDrawings(withoutIds(rows.elements))]
      };
      const fieldPatches = new Map(Object.entries(row).flatMap(([field, p]) => p === void 0 ? [] : [[field, p]]));
      for (const [field, fieldPatch] of fieldPatches) patchPlaceholder(copy, `${key}.${field}`, fieldPatch);
      for (const field of fields.filter((f) => !fieldPatches.has(f))) patchPlaceholder(copy, `${key}.${field}`, EMPTY);
      return copy.elements;
    });
    rows.parent.elements.splice(rows.parent.elements.indexOf(rows.elements[0]), rows.elements.length, ...copies);
    if (rows.table && !hasRows(rows.table.element)) rows.table.parent.elements.splice(rows.table.parent.elements.indexOf(rows.table.element), 1);
  }
};
var findRowsToRepeat = (json, fieldStart) => {
  const found = findLocationOfText(json, fieldStart).flatMap((paragraph2) => {
    const row = rowHolding(json, paragraph2.pathToParagraph);
    return row ? [row] : [];
  });
  const rows = found.filter((row) => !found.some((other) => isInside(row.path, other.path))).filter((row, index, all) => all.findIndex((other) => other.row === row.row) === index);
  return [...new Set(rows.map((row) => row.parent))].flatMap((parent) => {
    const siblingRows = parent.elements.filter((e) => e.name === "w:tr");
    const positions = rows.filter((row) => row.parent === parent).map((row) => siblingRows.indexOf(row.row)).sort((a, b) => a - b);
    const { table: table2 } = rows.find((row) => row.parent === parent);
    return positions.reduce((all, position) => {
      const previous = all[all.length - 1];
      return (previous === null || previous === void 0 ? void 0 : previous[previous.length - 1]) === position - 1 ? [...all.slice(0, -1), [...previous, position]] : [...all, [position]];
    }, []).map((group) => {
      const first = parent.elements.indexOf(siblingRows[group[0]]);
      const last = parent.elements.indexOf(siblingRows[group[group.length - 1]]);
      return {
        parent,
        table: table2,
        elements: parent.elements.slice(first, last + 1)
      };
    });
  });
};
var rowHolding = (json, pathToParagraph) => {
  let element = json;
  let row;
  let table2;
  for (let i2 = 1; i2 < pathToParagraph.length; i2++) {
    const child2 = element.elements[pathToParagraph[i2]];
    if (child2.name === "w:tbl") table2 = {
      element: child2,
      parent: element
    };
    if (child2.name === "w:tr") row = {
      parent: element,
      table: table2,
      row: child2,
      path: pathToParagraph.slice(0, i2 + 1)
    };
    element = child2;
  }
  return row;
};
var isInside = (path, ancestorPath) => path.length > ancestorPath.length && ancestorPath.every((index, i2) => path[i2] === index);
var hasRows = (table2) => {
  var _table$elements;
  return ((_table$elements = table2.elements) !== null && _table$elements !== void 0 ? _table$elements : []).some((e) => e.name === "w:tr" || e.name !== "w:tblPr" && e.name !== "w:tblGrid" && hasRows(e));
};
var fieldsIn = (elements, fieldStart, end) => {
  const fields = findLocationOfText({ elements: [...elements] }, fieldStart).flatMap(({ text: text2 }) => text2.split(fieldStart).slice(1).flatMap((after) => {
    const fieldEnd = after.indexOf(end);
    return fieldEnd > 0 ? [after.slice(0, fieldEnd)] : [];
  }));
  return [...new Set(fields)];
};
var copyOf = (element) => JSON.parse(JSON.stringify(element));
var ATTRIBUTES_TO_REMOVE = ["w14:paraId", "w14:textId"];
var ELEMENTS_TO_REMOVE = ["w:bookmarkStart", "w:bookmarkEnd"];
var withoutIds = (elements, parent) => elements.filter((e) => {
  var _e$name;
  return !ELEMENTS_TO_REMOVE.includes((_e$name = e.name) !== null && _e$name !== void 0 ? _e$name : "") && !((parent === null || parent === void 0 ? void 0 : parent.name) === "w:sdtPr" && e.name === "w:id");
}).map((e) => _objectSpread2(_objectSpread2(_objectSpread2({}, e), e.attributes === void 0 ? {} : { attributes: Object.fromEntries(Object.entries(e.attributes).filter(([name]) => !ATTRIBUTES_TO_REMOVE.includes(name))) }), e.elements === void 0 ? {} : { elements: [...withoutIds(e.elements, e)] }));
var isUtf16 = (bytes) => bytes[0] === 255 && bytes[1] === 254 || bytes[0] === 254 && bytes[1] === 255;
var readThemeColors = (files) => {
  var _find;
  const path = themePathOf(files, "word/document.xml");
  const theme = path === void 0 ? void 0 : (_find = [...files].find(([name]) => isSamePart(name, path))) === null || _find === void 0 ? void 0 : _find[1];
  return theme === void 0 || isUtf16(theme) ? void 0 : themeColorValues(readThemeColorValues(decodeUtf8(theme)));
};
var findSpacedPlaceholder = (text2, from, { start, end }, isKey) => {
  for (let index = text2.indexOf(start, from); index !== -1; index = text2.indexOf(start, index + 1)) {
    const endIndex = text2.indexOf(end, index + start.length);
    if (endIndex === -1) return;
    const content = text2.slice(index + start.length, endIndex);
    const key = content.trim();
    if (key !== content && isKey(key)) return {
      index,
      placeholder: text2.slice(index, endIndex + end.length),
      trimmed: `${start}${key}${end}`
    };
  }
};
var trimInText = (text2, delimiters, isKey) => {
  let trimmed = text2;
  for (let found = findSpacedPlaceholder(trimmed, 0, delimiters, isKey); found !== void 0; found = findSpacedPlaceholder(trimmed, found.index + found.trimmed.length, delimiters, isKey)) trimmed = `${trimmed.slice(0, found.index)}${found.trimmed}${trimmed.slice(found.index + found.placeholder.length)}`;
  return trimmed;
};
var paragraphsIn = (element) => {
  var _element$elements;
  return ((_element$elements = element.elements) !== null && _element$elements !== void 0 ? _element$elements : []).flatMap((child2) => [...child2.name === "w:p" ? [child2] : [], ...paragraphsIn(child2)]);
};
var trimInParagraph = (paragraph2, delimiters, isKey) => {
  const render = () => renderParagraphNode({
    element: paragraph2,
    index: 0,
    parent: void 0
  });
  for (let rendered = render(), found = findSpacedPlaceholder(rendered.text, 0, delimiters, isKey); found !== void 0; rendered = render(), found = findSpacedPlaceholder(rendered.text, found.index + found.trimmed.length, delimiters, isKey)) replaceTokenInParagraphElement({
    paragraphElement: paragraph2,
    renderedParagraph: rendered,
    originalText: found.placeholder,
    replacementText: found.trimmed,
    fromIndex: found.index
  });
};
var trimPlaceholders = (json, { delimiters, textKeys, tableRowsKeys, drawingKeys }) => {
  const isTextKey = (key) => textKeys.has(key) || tableRowsKeys.some((tableRowsKey) => key.startsWith(`${tableRowsKey}.`));
  for (const paragraph2 of paragraphsIn(json)) trimInParagraph(paragraph2, delimiters, isTextKey);
  const isDrawingKey = (key) => drawingKeys.has(key);
  for (const { properties } of findDrawings(json)) for (const name of ["descr", "title"]) {
    var _properties$attribute;
    const text2 = (_properties$attribute = properties.attributes) === null || _properties$attribute === void 0 ? void 0 : _properties$attribute[name];
    if (text2 !== void 0) properties.attributes[name] = trimInText(String(text2), delimiters, isDrawingKey);
  }
};
var shapeTypeIdOf = (element) => {
  var _element$attributes;
  return element.name === "v:shapetype" && ((_element$attributes = element.attributes) === null || _element$attributes === void 0 ? void 0 : _element$attributes.id) !== void 0 ? String(element.attributes.id) : void 0;
};
var findShapeTypeIds = (element) => {
  var _element$elements;
  const id = shapeTypeIdOf(element);
  return [...id === void 0 ? [] : [id], ...((_element$elements = element.elements) !== null && _element$elements !== void 0 ? _element$elements : []).flatMap(findShapeTypeIds)];
};
var removeShapeTypesIn = (part) => {
  const idsInPart = new Set(findShapeTypeIds(part));
  const remove = (element) => {
    const id = shapeTypeIdOf(element);
    if (id !== void 0) {
      if (idsInPart.has(id)) return [];
      idsInPart.add(id);
      return [element];
    }
    return [element.elements === void 0 ? element : _objectSpread2(_objectSpread2({}, element), {}, { elements: element.elements.flatMap(remove) })];
  };
  return (elements) => elements.flatMap(remove);
};
var assertValidPatch = (key, patch, { inTableRow }) => {
  if ((patch === null || patch === void 0 ? void 0 : patch.type) === PatchType.TABLE_ROWS && Array.isArray(patch.rows)) {
    for (const row of patch.rows) {
      if (typeof row !== "object" || row === null) throw new Error(`Invalid patch "${key}". Expected each of its rows to be an object of patches, by the name of their field`);
      for (const [field, fieldPatch] of Object.entries(row)) if (fieldPatch !== void 0) assertValidPatch(`${key}.${field}`, fieldPatch, { inTableRow: true });
    }
    return;
  }
  if (!((patch === null || patch === void 0 ? void 0 : patch.type) === PatchType.DRAWING ? !inTableRow && typeof patch.patch === "function" : (patch === null || patch === void 0 ? void 0 : patch.type) !== PatchType.TABLE_ROWS && Array.isArray(patch === null || patch === void 0 ? void 0 : patch.children))) throw new Error(`Invalid patch "${key}". Expected { type: PatchType.PARAGRAPH or PatchType.DOCUMENT, children: [...] }, ${inTableRow ? "or { type: PatchType.TABLE_ROWS, rows: [...] }" : "{ type: PatchType.TABLE_ROWS, rows: [...] }, or a drawing patch such as ImagePatch, or ChartDataPatch from docx/charts"}`);
};
var imageReplacer = new ImageReplacer();
var UTF16LE = new Uint8Array([255, 254]);
var UTF16BE = new Uint8Array([254, 255]);
var PATCHED_PART_ROOTS = /* @__PURE__ */ new Set([
  "w:document",
  "w:hdr",
  "w:ftr",
  "w:footnotes",
  "w:endnotes",
  "w:comments"
]);
var compareByteArrays = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i2 = 0; i2 < a.length; i2++) if (a[i2] !== b[i2]) return false;
  return true;
};
var patchDocument = (function() {
  var _ref = _asyncToGenerator(function* ({ outputType, data, patches, keepOriginalStyles, placeholderDelimiters = {
    start: "{{",
    end: "}}"
  }, recursive = true, trimPlaceholders: trimPlaceholders$1 = false, footnotes, endnotes, numbering = { config: [] }, pageNumbers, properties }) {
    const zipContent = yield loadZip(data);
    const contexts = /* @__PURE__ */ new Map();
    const themeColors = readThemeColors(zipContent);
    const contentTypeOverrides = [];
    const parts = new PackageParts({ addOverride: (contentType, partName) => contentTypeOverrides.push({
      contentType,
      partName
    }) }, new Set([...zipContent.keys()].filter((path) => path.startsWith("word/")).map((path) => path.slice(5))));
    const file = {
      Media: new Media((extension) => parts.takePath("media", "image", extension)),
      Numbering: new Numbering(numbering),
      Theme: themeColors && { Colors: themeColors },
      FootNotes: { View: { idOf: (reference2, note, context) => carryNote("footnotes", reference2, note, context) } },
      Endnotes: { View: { idOf: (reference2, note, context) => carryNote("endnotes", reference2, note, context) } },
      PackageParts: parts
    };
    const map = /* @__PURE__ */ new Map();
    const imageRelationshipAdditions = [];
    const relationshipAdditions = [];
    let hasMedia = false;
    const binaryContentMap = /* @__PURE__ */ new Map();
    checkPlaceholderDelimiters(placeholderDelimiters);
    const { start, end } = placeholderDelimiters;
    for (const [key, patch] of Object.entries(patches)) assertValidPatch(key, patch, { inTableRow: false });
    for (const [key, binaryValue] of zipContent) {
      var _json$elements;
      const startBytes = binaryValue.slice(0, 2);
      if (compareByteArrays(startBytes, UTF16LE) || compareByteArrays(startBytes, UTF16BE)) {
        binaryContentMap.set(key, binaryValue);
        continue;
      }
      if (!key.endsWith(".xml") && !key.endsWith(".rels")) {
        binaryContentMap.set(key, binaryValue);
        continue;
      }
      const json = toJson(decodeUtf8(binaryValue));
      const root = (_json$elements = json.elements) === null || _json$elements === void 0 ? void 0 : _json$elements.find((i2) => {
        var _i$name;
        return PATCHED_PART_ROOTS.has((_i$name = i2.name) !== null && _i$name !== void 0 ? _i$name : "");
      });
      if (root && root.attributes) {
        for (const ns of [
          "mc",
          "wp",
          "r",
          "w15",
          "m",
          "v",
          "o"
        ]) root.attributes[`xmlns:${ns}`] = DocumentAttributeNamespaces[ns];
        root.attributes["mc:Ignorable"] = `${root.attributes["mc:Ignorable"] || ""} w15`.trim();
      }
      map.set(key, json);
    }
    const renumberBookmarks = renumberBookmarksAvoiding([...map.values()].flatMap(findBookmarkIds));
    const renumberDrawings = renumberDrawingsAvoiding([...map.values()].flatMap(findDrawingIds));
    const viewWrappers = /* @__PURE__ */ new Map();
    const viewWrapperOf = (key) => {
      const existing = viewWrappers.get(key);
      if (existing) return existing;
      const viewWrapper = { Relationships: { addRelationship: (id, type, target, targetMode) => {
        relationshipAdditions.push({
          key,
          id,
          type,
          target,
          targetMode
        });
      } } };
      viewWrappers.set(key, viewWrapper);
      return viewWrapper;
    };
    const createContext = (key) => ({
      file,
      viewWrapper: viewWrapperOf(key),
      stack: []
    });
    const addContentTypeOverride = (contentType, partName) => {
      contentTypeOverrides.push({
        contentType,
        partName
      });
    };
    const styles = patchStyles(map, createContext);
    const lists = patchNumbering(file.Numbering, map, {
      createContext,
      addContentTypeOverride
    });
    const notes = patchNotes({
      footnotes,
      endnotes
    }, map, {
      createContext,
      addContentTypeOverride,
      renumberBookmarks,
      renumberDrawings,
      renumberLists: lists.renumber,
      useStyles: styles.use
    });
    const carryNote = (kind, reference2, note, context) => context.viewWrapper === viewWrapperOf("word/document.xml") ? notes.carry(kind, reference2, note) : void 0;
    if (trimPlaceholders$1) {
      const keysWhere = (test) => Object.entries(patches).flatMap(([key, patch]) => test(patch.type) ? [key] : []);
      const keys = {
        delimiters: {
          start,
          end
        },
        textKeys: new Set(keysWhere((type) => type !== PatchType.TABLE_ROWS && type !== PatchType.DRAWING)),
        tableRowsKeys: keysWhere((type) => type === PatchType.TABLE_ROWS),
        drawingKeys: new Set(keysWhere((type) => type === PatchType.DRAWING))
      };
      for (const [key, json] of map) if (key.startsWith("word/") && !key.endsWith(".rels")) trimPlaceholders(json, keys);
    }
    patchDrawings({
      parts: map,
      binaryParts: binaryContentMap,
      file,
      patches: Object.entries(patches).flatMap(([key, patch]) => patch.type === PatchType.DRAWING ? [[key, patch]] : []),
      delimiters: {
        start,
        end
      }
    }, createContext);
    const textPatches = Object.entries(patches).flatMap(([key, patch]) => patch.type === PatchType.DRAWING ? [] : [[key, patch]]);
    const patchesInOrder = [...textPatches.filter(([, patch]) => patch.type === PatchType.TABLE_ROWS), ...textPatches.filter(([, patch]) => patch.type !== PatchType.TABLE_ROWS)];
    for (const [key, json] of [...map]) {
      if (!key.startsWith("word/") || key.endsWith(".xml.rels")) continue;
      const context = createContext(key);
      contexts.set(key, context);
      const removeShapeTypes = removeShapeTypesIn(json);
      const patchPlaceholder = (element, patchKey, patchValue) => {
        if (patchValue.type === PatchType.TABLE_ROWS) {
          patchTableRows({
            json: element,
            key: patchKey,
            patch: patchValue,
            delimiters: {
              start,
              end
            },
            patchPlaceholder,
            renumberDrawings
          });
          return;
        }
        const hyperlinkRelationships = [];
        const { didFindOccurrence } = replacer({
          json: element,
          patch: _objectSpread2(_objectSpread2({}, patchValue), {}, { children: patchValue.children.flatMap((child2) => child2 instanceof Bookmark ? child2.writtenAs : [child2]).map((child2) => {
            if (child2 instanceof ExternalHyperlink) {
              const { target, anchor } = externalHyperlinkTarget(child2.options.link);
              const concreteHyperlink = new ConcreteHyperlink(child2.options.children, uniqueId(), anchor, child2.options.link);
              hyperlinkRelationships.push({
                key,
                id: concreteHyperlink.linkId,
                type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
                target,
                targetMode: TargetModeType.EXTERNAL
              });
              return concreteHyperlink;
            } else return child2;
          }) }),
          patchText: `${start}${patchKey}${end}`,
          context,
          keepOriginalStyles,
          recursive,
          renumberIds: (elements) => styles.use(lists.renumber(notes.renumber(renumberBookmarks(renumberDrawings(removeShapeTypes(elements))))))
        });
        if (didFindOccurrence) relationshipAdditions.push(...hyperlinkRelationships);
      };
      for (const [patchKey, patchValue] of patchesInOrder) patchPlaceholder(json, patchKey, patchValue);
    }
    notes.write();
    lists.write();
    styles.write();
    for (const [key, json] of map) {
      if (!key.startsWith("word/") || key.endsWith(".xml.rels")) continue;
      const mediaDatas = imageReplacer.getMediaData(JSON.stringify(json), file.Media);
      if (mediaDatas.length > 0) {
        hasMedia = true;
        imageRelationshipAdditions.push({
          key,
          mediaDatas
        });
      }
    }
    for (const { key, mediaDatas } of imageRelationshipAdditions) {
      var _map$get;
      const relationshipKey = relationshipsPathOf(key);
      const relationshipsJson = (_map$get = map.get(relationshipKey)) !== null && _map$get !== void 0 ? _map$get : createRelationshipFile();
      map.set(relationshipKey, relationshipsJson);
      const index = getNextRelationshipIndex(relationshipsJson);
      const newJson = imageReplacer.replace(JSON.stringify(map.get(key)), mediaDatas, index);
      map.set(key, JSON.parse(newJson));
      for (let i2 = 0; i2 < mediaDatas.length; i2++) {
        const { fileName } = mediaDatas[i2];
        appendRelationship(relationshipsJson, index + i2, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", `media/${fileName}`);
      }
    }
    for (const { key, id, type, target, targetMode } of relationshipAdditions) {
      var _map$get2;
      const relationshipKey = relationshipsPathOf(key);
      const relationshipsJson = (_map$get2 = map.get(relationshipKey)) !== null && _map$get2 !== void 0 ? _map$get2 : createRelationshipFile();
      map.set(relationshipKey, relationshipsJson);
      appendRelationship(relationshipsJson, id, type, target, targetMode);
    }
    if (pageNumbers) yield fillTemplatePageNumbers(map, pageNumbers, binaryContentMap);
    if (properties) patchCoreProperties(map, binaryContentMap, properties, { addContentTypeOverride });
    const packageParts = xmlifyPackageParts(file, void 0);
    if (hasMedia || contentTypeOverrides.length > 0) {
      const contentTypesJson = map.get("[Content_Types].xml");
      if (!contentTypesJson) throw new Error("Could not find content types file");
      if (hasMedia) {
        appendContentType(contentTypesJson, "image/png", "png");
        appendContentType(contentTypesJson, "image/jpeg", "jpeg");
        appendContentType(contentTypesJson, "image/jpeg", "jpg");
        appendContentType(contentTypesJson, "image/bmp", "bmp");
        appendContentType(contentTypesJson, "image/gif", "gif");
        appendContentType(contentTypesJson, "image/svg+xml", "svg");
      }
      for (const { contentType, partName } of contentTypeOverrides) appendContentTypeOverride(contentTypesJson, contentType, partName);
    }
    return zipOutput(zipFiles([
      ...[...map].map(([key, value]) => [key, stringifyElement(value)]),
      ...binaryContentMap,
      ...file.Media.Array.map(({ data: media, fileName }) => [`word/media/${fileName}`, media]),
      ...packageParts.map(({ path, data: partData }) => [path, partData])
    ]), outputType, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  });
  return function patchDocument2(_x) {
    return _ref.apply(this, arguments);
  };
})();
var isSearched = (path) => path.startsWith("word/") && /\.(xml|rels)$/.test(path) && !path.endsWith(".xml.rels");
var patchDetector = (function() {
  var _ref = _asyncToGenerator(function* ({ data, placeholderDelimiters = {
    start: "{{",
    end: "}}"
  }, trimPlaceholders: trimPlaceholders2 = false }) {
    checkPlaceholderDelimiters(placeholderDelimiters);
    const pattern = placeholderPattern(placeholderDelimiters);
    const zipContent = yield loadZip(data, isSearched);
    const patches = /* @__PURE__ */ new Set();
    for (const [, value] of zipContent) {
      const json = toJson(decodeUtf8(value));
      [...traverse(json).map((p) => p.text), ...findDrawings(json).flatMap(({ properties }) => altTextOf(properties))].flatMap((text2) => {
        var _text$match;
        return (_text$match = text2.match(pattern)) !== null && _text$match !== void 0 ? _text$match : [];
      }).map((patch) => trimPlaceholders2 ? patch.trim() : patch).filter((patch) => patch !== "").forEach((patch) => patches.add(patch));
    }
    return Array.from(patches);
  });
  return function patchDetector2(_x) {
    return _ref.apply(this, arguments);
  };
})();
var escapeRegExp = (text2) => text2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
var placeholderPattern = ({ start, end }) => new RegExp(`(?<=${escapeRegExp(start)})(?:(?!${escapeRegExp(start)}).)+?(?=${escapeRegExp(end)})`, "gs");

// src/word.ts
async function preparePicture(blob) {
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode().catch(() => {
      throw new Error("\u56FE\u7247\u635F\u574F\u6216\u683C\u5F0F\u65E0\u6CD5\u89E3\u7801");
    });
    const width = img.naturalWidth, height = img.naturalHeight;
    let data = new Uint8Array(await blob.arrayBuffer());
    let type;
    if (data[0] === 255 && data[1] === 216) type = "jpg";
    else if (data[0] === 71 && data[1] === 73) type = "gif";
    else if (data[0] === 137 && data[1] === 80) type = "png";
    else {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      const png = await new Promise((resolve2, reject) => canvas.toBlob(
        (b) => b ? resolve2(b) : reject(new Error("\u65E0\u6CD5\u8F6C\u6362\u4E3A PNG")),
        "image/png"
      ));
      data = new Uint8Array(await png.arrayBuffer());
      type = "png";
    }
    return { data, type, width, height, url };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}
function isElement(node) {
  return node.nodeType === 1;
}
async function wordArticle(body, title, pictures) {
  const numbering = [];
  function inline2(node, style = {}) {
    if (node.nodeType === 3) return [new TextRun({ ...style, text: node.textContent || "" })];
    if (!isElement(node)) return [];
    if (node.tagName === "BR") return [new TextRun({ break: 1 })];
    if (node.tagName === "IMG") {
      const img = node;
      const pic = pictures.get(img.dataset.source);
      const width = Math.min(Number(img.dataset.width) || pic.width, 600);
      return [new ImageRun({ type: pic.type, data: pic.data, transformation: {
        width,
        height: Math.max(1, Math.round(pic.height * width / pic.width))
      } })];
    }
    const next = { ...style };
    if (node.matches("strong,b")) next.bold = true;
    if (node.matches("em,i")) next.italics = true;
    if (node.matches("s,del")) next.strike = true;
    if (node.matches("code")) next.font = "Consolas";
    const children2 = Array.from(node.childNodes).flatMap((n) => inline2(n, next));
    if (node.tagName === "A") return [new ExternalHyperlink({ link: node.getAttribute("href"), children: children2 })];
    return children2;
  }
  function blocks(container, depth = 0, options = {}, first) {
    const out = [];
    let runs = [];
    const flush = () => {
      if (runs.length) out.push(new Paragraph({ ...options, ...!out.length && first, children: runs }));
      runs = [];
    };
    for (const node of container.childNodes) {
      if (!isElement(node)) {
        if (node.textContent?.trim() || runs.length) runs.push(...inline2(node));
        continue;
      }
      if (node.matches("ul,ol")) {
        flush();
        const reference2 = "list-" + numbering.length;
        const level = Math.min(depth, 8);
        const ordered = node.tagName === "OL";
        numbering.push({ reference: reference2, levels: [{
          level,
          format: ordered ? LevelFormat.DECIMAL : LevelFormat.BULLET,
          text: ordered ? "%" + (level + 1) + "." : "\u2022",
          start: Number(node.getAttribute("start") || 1),
          style: { paragraph: { indent: { left: (level + 1) * 360, hanging: 240 } } }
        }] });
        for (const li of node.children) {
          out.push(...blocks(li, depth + 1, options, { numbering: { reference: reference2, level } }));
        }
      } else if (node.tagName === "BLOCKQUOTE") {
        flush();
        out.push(...blocks(node, depth, { ...options, style: "Quote", indent: { left: 360 } }));
      } else if (node.tagName === "TABLE") {
        flush();
        out.push(new Table({ rows: Array.from(node.rows, (row) => new TableRow({ children: Array.from(row.cells, (cell) => new TableCell({ children: blocks(cell) })) })) }));
      } else if (node.matches("p,h1,h2,h3,h4,h5,h6,pre,hr")) {
        flush();
        const heading3 = /^H[1-6]$/.test(node.tagName) ? HeadingLevel["HEADING_" + node.tagName[1]] : void 0;
        out.push(new Paragraph({ ...options, ...!out.length && first, heading: heading3, children: inline2(node) }));
      } else runs.push(...inline2(node));
    }
    flush();
    return out;
  }
  const children = blocks(body);
  return Packer.toBlob(new File({ title, numbering: { config: numbering }, sections: [{ children }] }));
}

// src/output.ts
var import_node_crypto = require("node:crypto");
var import_promises = require("node:fs/promises");
var import_node_path = require("node:path");
async function writePages(parent, title, pages) {
  let name = title.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").replace(/[. ]+$/g, "").trim() || "\u7B14\u8BB0";
  name = Array.from(name).slice(0, 60).join("");
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(name)) name = "_" + name;
  let target;
  for (let n = 1; ; n++) {
    target = (0, import_node_path.join)(parent, n === 1 ? name : name + " (" + n + ")");
    try {
      await (0, import_promises.mkdir)(target);
      break;
    } catch (e) {
      if (e.code !== "EEXIST") throw e;
    }
  }
  const files = [];
  try {
    for (const [i2, blob] of pages.entries()) {
      const path = (0, import_node_path.join)(target, String(i2 + 1).padStart(Math.max(3, String(pages.length).length), "0") + ".png");
      files.push(path);
      await (0, import_promises.writeFile)(path, Buffer.from(await blob.arrayBuffer()), { flag: "wx" });
    }
    return target;
  } catch (error) {
    await Promise.allSettled(files.map((file) => (0, import_promises.unlink)(file)));
    await (0, import_promises.rmdir)(target).catch(() => {
    });
    throw error;
  }
}
async function saveDocument(path, document2) {
  const temp = path + "." + (0, import_node_crypto.randomUUID)() + ".tmp";
  try {
    await (0, import_promises.writeFile)(temp, new Uint8Array(await document2.arrayBuffer()), { flag: "wx" });
    await (0, import_promises.rename)(temp, path);
  } finally {
    await (0, import_promises.unlink)(temp).catch(() => {
    });
  }
}

// src/main.ts
var message = (error) => error instanceof Error ? error.message : String(error);
async function readPicture(app, file, source) {
  let bytes;
  let type = "";
  if (/^https?:\/\//i.test(source)) {
    const response = await (0, import_obsidian.requestUrl)(source);
    bytes = response.arrayBuffer;
    type = response.headers["content-type"]?.split(";")[0] || "";
  } else {
    let path = source;
    try {
      path = decodeURIComponent(path);
    } catch {
    }
    const attachment = app.metadataCache.getFirstLinkpathDest(path, file.path);
    if (!attachment) throw new Error("\u627E\u4E0D\u5230\u672C\u5730\u9644\u4EF6");
    bytes = await app.vault.readBinary(attachment);
    type = attachment.extension.toLowerCase() === "svg" ? "image/svg+xml" : "";
  }
  return new Blob([bytes], { type });
}
async function loadPicture(app, file, source) {
  const blob = await readPicture(app, file, source);
  const url = URL.createObjectURL(blob);
  try {
    const image2 = new Image();
    image2.src = url;
    await image2.decode();
    const { width, height } = pictureBounds(defaultTemplate);
    const scale = Math.min(1, width * exportScale / image2.naturalWidth, height * exportScale / image2.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image2.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image2.naturalHeight * scale));
    canvas.getContext("2d").drawImage(image2, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}
async function chooseFolder() {
  const electron = require("electron");
  const remote = electron.remote ?? require("@electron/remote");
  return remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    title: "\u9009\u62E9\u5BFC\u51FA\u6587\u4EF6\u5939",
    properties: ["openDirectory", "createDirectory"]
  });
}
var Preview = class extends import_obsidian.Modal {
  constructor(app, file, source, dispose) {
    super(app);
    this.file = file;
    this.source = source;
    this.dispose = dispose;
  }
  file;
  source;
  dispose;
  closed = false;
  urls = [];
  blobs = [];
  async onOpen() {
    this.modalEl.addClass("pp-modal");
    this.titleEl.setText("\u957F\u6587\u4E00\u952E\u51FA\u56FE");
    const bar = this.contentEl.createDiv({ cls: "pp-toolbar" });
    const status = bar.createDiv({ cls: "pp-status", text: "\u6B63\u5728\u6392\u7248\u2026" });
    status.setAttribute("role", "status");
    const button = bar.createEl("button", { cls: "mod-cta", text: "\u5BFC\u51FA\u5168\u90E8" });
    const gallery = this.contentEl.createDiv({ cls: "pp-pages" });
    const picker = this.contentEl.createDiv({ cls: "pp-templates", attr: { role: "group", "aria-label": "\u56FE\u7247\u6A21\u677F" } });
    const cards = /* @__PURE__ */ new Map();
    for (const id of Object.keys(pageTemplates)) {
      const template = pageTemplates[id];
      const card = picker.createEl("button", {
        cls: "pp-template",
        attr: { type: "button", "aria-pressed": String(id === defaultTemplate) }
      });
      const sample = card.createSpan({ cls: "pp-template-sample", attr: { "aria-hidden": "true", "data-template": id } });
      sample.style.setProperty("--pp-paper", template.paper);
      sample.style.setProperty("--pp-ink", template.ink);
      sample.style.setProperty("--pp-accent", template.accent);
      card.createSpan({ text: template.label });
      cards.set(id, card);
    }
    const frame = this.contentEl.createEl("iframe", { cls: "pp-measure" });
    frame.tabIndex = -1;
    frame.setAttribute("aria-hidden", "true");
    let busy = false;
    let activeTemplate;
    const setBusy = (value) => {
      busy = value;
      button.disabled = busy || !this.blobs.length;
      for (const card of cards.values()) card.setAttribute("aria-disabled", String(busy));
    };
    const doc = frame.contentDocument;
    const cache = /* @__PURE__ */ new Map();
    setBusy(true);
    try {
      const blocks = article(doc, this.source, this.file.basename);
      const sources = new Set(blocks.flatMap((block2) => Array.from(block2.querySelectorAll("img"), (img) => img.dataset.source)));
      const failures = /* @__PURE__ */ new Map();
      for (const source of sources) {
        try {
          const data = await loadPicture(this.app, this.file, source);
          if (this.closed) return;
          cache.set(source, data);
        } catch (e) {
          failures.set(source, message(e));
        }
        if (this.closed) return;
      }
      if (failures.size) {
        status.setText("\u914D\u56FE\u8BFB\u53D6\u5931\u8D25\uFF0C\u8BF7\u4FEE\u590D\u540E\u91CD\u65B0\u751F\u6210\u3002");
        const list2 = gallery.createEl("ul");
        for (const [src, why] of failures) list2.createEl("li", { text: src + " \xB7 " + why });
        return;
      }
      const render = async (id) => {
        setBusy(true);
        status.setText("\u6B63\u5728\u6392\u7248\u2026");
        const nextUrls = [];
        try {
          const copies = blocks.map((block2) => doc.importNode(block2, true));
          await Promise.all(copies.flatMap((block2) => Array.from(block2.querySelectorAll("img"), async (img) => {
            img.src = cache.get(img.dataset.source);
            await img.decode();
            sizePicture(img, id);
          })));
          await doc.fonts.ready;
          if (this.closed) return;
          const pages = paginate(doc, copies, id);
          const blobs = [];
          for (const page of pages) {
            const blob = await renderPNG(page);
            if (this.closed) return;
            blobs.push(blob);
          }
          const figures = blobs.map((blob, i2) => {
            const url = URL.createObjectURL(blob);
            nextUrls.push(url);
            const figure = gallery.ownerDocument.createElement("figure");
            figure.createEl("img", { attr: { src: url, alt: "\u7B2C " + (i2 + 1) + " \u9875" } });
            figure.createEl("figcaption", { text: i2 + 1 + " / " + blobs.length });
            return figure;
          });
          gallery.replaceChildren(...figures);
          gallery.scrollTop = 0;
          this.urls.forEach((url) => URL.revokeObjectURL(url));
          this.urls = nextUrls;
          this.blobs = blobs;
          activeTemplate = id;
          for (const [key, card] of cards) card.setAttribute("aria-pressed", String(key === id));
          bar.querySelector(".pp-open")?.remove();
          status.setText("\u5171 " + blobs.length + " \u9875");
        } catch (e) {
          nextUrls.forEach((url) => URL.revokeObjectURL(url));
          if (!this.closed) status.setText("\u6392\u7248\u5931\u8D25\uFF1A" + message(e));
        } finally {
          doc.body.replaceChildren();
          if (!this.closed) setBusy(false);
        }
      };
      for (const [id, card] of cards) {
        card.onclick = () => {
          if (!busy && id !== activeTemplate) void render(id);
        };
      }
      button.onclick = async () => {
        setBusy(true);
        try {
          const result = await chooseFolder();
          if (result.canceled || !result.filePaths.length || this.closed) return;
          status.setText("\u6B63\u5728\u5BFC\u51FA\u2026");
          const target = await writePages(result.filePaths[0], this.file.basename, this.blobs);
          if (this.closed) return;
          status.setText("\u5DF2\u5BFC\u51FA " + this.blobs.length + " \u5F20\u56FE\u7247");
          bar.querySelector(".pp-open")?.remove();
          const open = bar.createEl("button", { cls: "pp-open", text: "\u6253\u5F00\u6587\u4EF6\u5939" });
          open.onclick = async () => {
            const reason = await require("electron").shell.openPath(target);
            if (reason) new import_obsidian.Notice(reason);
          };
        } catch (e) {
          if (!this.closed) status.setText("\u5BFC\u51FA\u5931\u8D25\uFF1A" + message(e));
        } finally {
          if (!this.closed) setBusy(false);
        }
      };
      await render(defaultTemplate);
    } catch (e) {
      if (!this.closed) status.setText("\u6392\u7248\u5931\u8D25\uFF1A" + message(e));
    }
  }
  onClose() {
    this.closed = true;
    this.urls.forEach((url) => URL.revokeObjectURL(url));
    this.urls = [];
    this.blobs = [];
    this.contentEl.empty();
    this.dispose();
  }
};
var TextPreview = class extends import_obsidian.Modal {
  constructor(app, file, source, dispose) {
    super(app);
    this.file = file;
    this.source = source;
    this.dispose = dispose;
  }
  file;
  source;
  dispose;
  closed = false;
  pictures = /* @__PURE__ */ new Map();
  async onOpen() {
    this.modalEl.addClass("pp-modal");
    this.titleEl.setText("\u53D1\u9001\u56FE\u6587\u5230\u77E5\u4E4E");
    const { title, body } = textArticle(this.contentEl.ownerDocument, this.source, this.file.basename);
    const bar = this.contentEl.createDiv({ cls: "pp-toolbar" });
    const button = bar.createEl("button", { cls: "mod-cta", text: "\u751F\u6210\u77E5\u4E4E\u5BFC\u5165\u6587\u6863" });
    const copy = bar.createEl("button", { text: "\u590D\u5236\u6807\u9898" });
    copy.onclick = () => {
      try {
        require("electron").clipboard.writeText(title);
        new import_obsidian.Notice("\u5DF2\u590D\u5236\u6807\u9898");
      } catch (e) {
        new import_obsidian.Notice("\u590D\u5236\u5931\u8D25\uFF1A" + message(e));
      }
    };
    const status = this.contentEl.createDiv({ cls: "pp-text-status", attr: { role: "status" } });
    const preview = this.contentEl.createDiv({ cls: "pp-text-preview" });
    preview.createEl("h1", { text: title });
    preview.append(body);
    const images = Array.from(body.querySelectorAll("img"));
    const prepare = async () => {
      button.disabled = true;
      const failures = [];
      for (const [i2, img] of images.entries()) {
        const source = img.dataset.source;
        try {
          let picture = this.pictures.get(source);
          if (!picture) {
            status.setText("\u6B63\u5728\u8BFB\u53D6\u914D\u56FE " + (i2 + 1) + " / " + images.length);
            picture = await preparePicture(await readPicture(this.app, this.file, source));
            if (this.closed) {
              URL.revokeObjectURL(picture.url);
              return;
            }
            this.pictures.set(source, picture);
          }
          img.src = picture.url;
          img.width = Number(img.dataset.width) || picture.width;
        } catch (e) {
          failures.push("\u914D\u56FE " + (i2 + 1) + "\uFF1A" + source + " \xB7 " + message(e));
        }
        if (this.closed) return;
      }
      button.disabled = false;
      if (failures.length) {
        status.setText(failures.join("\n"));
        button.setText("\u91CD\u65B0\u8BFB\u53D6\u914D\u56FE");
        button.onclick = prepare;
        return;
      }
      status.setText("\u5728\u77E5\u4E4E\u7A7A\u767D\u6587\u7AE0\u4E2D\u9009\u62E9\u300C\u5BFC\u5165 \u2192 \u5BFC\u5165\u6587\u6863\u300D\uFF0C\u9009\u53D6\u751F\u6210\u7684 .docx\u3002");
      button.setText("\u751F\u6210\u77E5\u4E4E\u5BFC\u5165\u6587\u6863");
      button.onclick = async () => {
        button.disabled = true;
        try {
          const doc = await wordArticle(body, title, this.pictures);
          if (this.closed) return;
          if (doc.size > 3e7) throw new Error("\u6587\u6863\u8D85\u8FC7\u77E5\u4E4E\u7684 30 MB \u9650\u5236\uFF0C\u8BF7\u7F29\u5C0F\u539F\u7A3F\u4E2D\u7684\u914D\u56FE\u518D\u751F\u6210\u3002");
          const electron = require("electron");
          const remote = electron.remote ?? require("@electron/remote");
          const result = await remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
            title: "\u4FDD\u5B58\u77E5\u4E4E\u5BFC\u5165\u6587\u6863",
            defaultPath: this.file.basename.replace(/[<>:"/\\|?*]/g, "_") + ".docx",
            filters: [{ name: "Word \u6587\u6863", extensions: ["docx"] }]
          });
          if (this.closed || result.canceled || !result.filePath) return;
          await saveDocument(result.filePath, doc);
          status.setText("\u5DF2\u4FDD\u5B58 " + result.filePath + "\u3002\u5728\u77E5\u4E4E\u7A7A\u767D\u6587\u7AE0\u4E2D\u9009\u62E9\u300C\u5BFC\u5165 \u2192 \u5BFC\u5165\u6587\u6863\u300D\u3002");
        } catch (e) {
          status.setText("\u751F\u6210\u5931\u8D25\uFF1A" + message(e));
        } finally {
          button.disabled = false;
        }
      };
    };
    await prepare();
  }
  onClose() {
    this.closed = true;
    for (const picture of this.pictures.values()) URL.revokeObjectURL(picture.url);
    this.pictures.clear();
    this.contentEl.empty();
    this.dispose();
  }
};
var PublishPicture = class extends import_obsidian.Plugin {
  previews = /* @__PURE__ */ new Set();
  onload() {
    const show = async (view, Panel) => {
      const file = view.file;
      if (!file) return;
      try {
        const source = view.getMode() === "source" ? view.editor.getValue() : await this.app.vault.cachedRead(file);
        const modal = new Panel(this.app, file, source.slice((0, import_obsidian.getFrontMatterInfo)(source).contentStart), () => this.previews.delete(modal));
        this.previews.add(modal);
        modal.open();
      } catch (e) {
        new import_obsidian.Notice(message(e));
      }
    };
    const formats = [
      { id: "export-note", name: "\u957F\u6587\u4E00\u952E\u51FA\u56FE", icon: "images", Panel: Preview },
      { id: "copy-zhihu-article", name: "\u53D1\u9001\u56FE\u6587\u5230\u77E5\u4E4E", icon: "file-output", Panel: TextPreview }
    ];
    for (const { id, name, Panel } of formats) {
      this.addCommand({ id, name, checkCallback: (checking) => {
        const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
        if (!view?.file) return false;
        if (!checking) void show(view, Panel);
        return true;
      } });
    }
    this.registerEvent(this.app.workspace.on("file-menu", (menu, file, _source, leaf) => {
      const view = leaf?.view ?? this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
      if (!(view instanceof import_obsidian.MarkdownView) || file !== view.file) return;
      for (const { name, icon, Panel } of formats) {
        menu.addItem((item) => item.setTitle(name).setIcon(icon).onClick(() => void show(view, Panel)));
      }
    }));
  }
  onunload() {
    for (const preview of this.previews) preview.close();
  }
};
/*! Bundled license information:

markdown-it/dist/markdown-it.mjs:
  (*! markdown-it 15.0.3 https://github.com/markdown-it/markdown-it @license MIT *)

docx/dist/index.mjs:
  (**
  * @license MIT
  * Adapted from stream-browserify 3.0.0's base Stream and pipe implementation (MIT).
  * Copyright Joyent, Inc. and other Node contributors.
  * Copyright (c) James Halliday
  *
  * Permission is hereby granted, free of charge, to any person obtaining a
  * copy of this software and associated documentation files (the
  * "Software"), to deal in the Software without restriction, including
  * without limitation the rights to use, copy, modify, merge, publish,
  * distribute, sublicense, and/or sell copies of the Software, and to permit
  * persons to whom the Software is furnished to do so, subject to the
  * following conditions:
  *
  * The above copyright notice and this permission notice shall be included
  * in all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  * USE OR OTHER DEALINGS IN THE SOFTWARE.
  *)
*/
