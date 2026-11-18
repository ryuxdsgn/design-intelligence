//! JavaScript semantics the TypeScript checks rely on, so the port returns the same strings and numbers:
//! truthiness, UTF-16 lengths and slices, `trim`, `Math.round`, `toFixed`, and number-to-string.

use serde_json::Value;

/// `!!v` in JavaScript. A missing value is `None` (undefined).
pub fn truthy(v: Option<&Value>) -> bool {
    match v {
        None | Some(Value::Null) => false,
        Some(Value::Bool(b)) => *b,
        Some(Value::Number(n)) => n.as_f64().map_or(false, |x| x != 0.0 && !x.is_nan()),
        Some(Value::String(s)) => !s.is_empty(),
        Some(_) => true,
    }
}

/// A number, or NaN for anything else (undefined arithmetic in JavaScript).
pub fn num(v: Option<&Value>) -> f64 {
    v.and_then(Value::as_f64).unwrap_or(f64::NAN)
}

/// `v ?? d` for a number.
pub fn num_or(v: Option<&Value>, d: f64) -> f64 {
    match v {
        None | Some(Value::Null) => d,
        Some(x) => x.as_f64().unwrap_or(f64::NAN),
    }
}

/// `String(v)` for the values a canvas holds.
pub fn string(v: Option<&Value>) -> String {
    match v {
        None => "undefined".into(),
        Some(Value::Null) => "null".into(),
        Some(Value::String(s)) => s.clone(),
        Some(Value::Number(n)) => num_str(n.as_f64().unwrap_or(f64::NAN)),
        Some(Value::Bool(b)) => b.to_string(),
        Some(Value::Array(_)) | Some(Value::Object(_)) => "[object Object]".into(),
    }
}

/// `figma.mixed`, stored as `{"$mixed": true}` in a recorded canvas.
pub fn mixed(v: Option<&Value>) -> bool {
    matches!(v, Some(Value::Object(o)) if o.get("$mixed") == Some(&Value::Bool(true)))
}

pub fn len16(s: &str) -> usize {
    s.encode_utf16().count()
}

/// `s.slice(from, to)` in UTF-16 code units.
pub fn slice16(s: &str, from: usize, to: Option<usize>) -> String {
    let u: Vec<u16> = s.encode_utf16().collect();
    let end = to.unwrap_or(u.len()).min(u.len());
    if from >= end {
        return String::new();
    }
    String::from_utf16_lossy(&u[from..end])
}

/// The byte offset `n` UTF-16 units before `byte` (or 0), walking only that far. A cut inside a surrogate
/// pair keeps the whole character; the callers test ASCII patterns, which a lone surrogate cannot change.
pub fn back16(s: &str, byte: usize, n: usize) -> usize {
    let mut left = n;
    for (b, ch) in s[..byte].char_indices().rev() {
        if left == 0 {
            return b + ch.len_utf8();
        }
        left = left.saturating_sub(ch.len_utf16());
    }
    0
}

/// The byte offset `n` UTF-16 units after `byte` (or the end).
pub fn fwd16(s: &str, byte: usize, n: usize) -> usize {
    let mut left = n;
    for (b, ch) in s[byte..].char_indices() {
        if left == 0 {
            return byte + b;
        }
        left = left.saturating_sub(ch.len_utf16());
    }
    s.len()
}

/// `s.trim()`: JavaScript also trims the byte-order mark.
pub fn trim(s: &str) -> &str {
    s.trim_matches(|c: char| c.is_whitespace() || c == '\u{feff}')
}

/// `Math.round`: halves go up, toward positive infinity.
pub fn round(x: f64) -> f64 {
    let f = x.floor();
    if x - f >= 0.5 { f + 1.0 } else { f }
}

/// `x.toFixed(digits)`: the nearest decimal, a tie going to the larger value.
pub fn to_fixed(x: f64, digits: usize) -> String {
    if !x.is_finite() {
        return num_str(x);
    }
    let neg = x < 0.0;
    // Exact decimal expansion of the double (enough digits for values in this range), then round half up.
    let exact = format!("{:.80}", x.abs());
    let (int, frac) = exact.split_once('.').unwrap();
    let mut digits_v: Vec<u8> = int.bytes().chain(frac.bytes().take(digits)).map(|b| b - b'0').collect();
    let next = frac.as_bytes().get(digits).map_or(0, |b| b - b'0');
    if next >= 5 {
        let mut i = digits_v.len();
        loop {
            if i == 0 {
                digits_v.insert(0, 1);
                break;
            }
            i -= 1;
            if digits_v[i] == 9 {
                digits_v[i] = 0;
            } else {
                digits_v[i] += 1;
                break;
            }
        }
    }
    let s: String = digits_v.iter().map(|d| (b'0' + d) as char).collect();
    let split = s.len() - digits;
    let body = if digits == 0 { s } else { format!("{}.{}", &s[..split], &s[split..]) };
    let zero = body.bytes().all(|b| b == b'0' || b == b'.');
    if neg && !zero { format!("-{body}") } else { body }
}

/// `String(x)` for a number: integers print without a fraction, and -0 prints as 0.
pub fn num_str(x: f64) -> String {
    if x.is_nan() {
        return "NaN".into();
    }
    if x.is_infinite() {
        return if x > 0.0 { "Infinity".into() } else { "-Infinity".into() };
    }
    if x == x.trunc() && x.abs() < 1e21 {
        return format!("{}", x as i128);
    }
    format!("{x}")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rounding_and_fixed_follow_javascript() {
        assert_eq!(round(2.5), 3.0);
        assert_eq!(round(-2.5), -2.0);
        assert_eq!(to_fixed(2.125, 2), "2.13");
        assert_eq!(to_fixed(3.9349, 2), "3.93");
        assert_eq!(to_fixed(9.995, 2), "9.99"); // 9.995 is stored just under 9.995
        assert_eq!(to_fixed(0.999, 2), "1.00");
        assert_eq!(num_str(-0.0), "0");
        assert_eq!(num_str(11.0), "11");
        assert_eq!(num_str(18.66), "18.66");
    }

    #[test]
    fn strings_count_utf16_units() {
        assert_eq!(len16("a😀"), 3);
        assert_eq!(slice16("Rak Buku", 0, Some(3)), "Rak");
        assert_eq!(trim("\u{feff} x "), "x");
        assert_eq!(&"abcdef"[back16("abcdef", 4, 2)..fwd16("abcdef", 4, 1)], "cde");
        assert_eq!(back16("abc", 2, 9), 0);
    }
}

/// A JSON string literal.
pub fn quote(s: &str) -> String {
    Value::String(s.to_string()).to_string()
}
