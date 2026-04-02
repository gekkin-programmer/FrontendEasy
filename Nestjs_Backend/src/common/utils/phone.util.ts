export class PhoneUtil {
  /**
   * Cleans a phone number to standard Cameroon format (237xxxxxxxxx)
   * Supports Orange (69, 655-659) and MTN (67, 650-654, 68) and Camtel (2, 62)
   */
  static sanitize(phone: string): string | null {
    // 1. Remove spaces, dashes, parentheses
    let clean = phone.replace(/[\s-()+]/g, '');

    // 2. Remove leading '00' if present
    if (clean.startsWith('00')) {
      clean = clean.substring(2);
    }

    // 3. If it starts with '6' or '2' (9 digits), add 237
    if (
      clean.length === 9 &&
      (clean.startsWith('6') || clean.startsWith('2'))
    ) {
      clean = '237' + clean;
    }

    // 4. Validate final format (Must start with 237 and have 12 digits total)
    const cameroonRegex = /^237[26][0-9]{8}$/;

    if (!cameroonRegex.test(clean)) {
      return null;
    }

    return clean;
  }

  /**
   * Detects the operator based on the prefix
   */
  static getOperator(phone: string): 'ORANGE' | 'MTN' | 'CAMTEL' | 'UNKNOWN' {
    const clean = this.sanitize(phone);
    if (!clean) return 'UNKNOWN';

    // Remove 237 to check prefix
    const local = clean.substring(3);

    // Orange prefixes: 69, 655, 656, 657, 658, 659
    if (/^69/.test(local) || /^65[5-9]/.test(local)) return 'ORANGE';

    // MTN prefixes: 67, 650, 651, 652, 653, 654, 68
    if (/^67/.test(local) || /^68/.test(local) || /^65[0-4]/.test(local))
      return 'MTN';

    // Camtel
    if (/^62/.test(local) || /^2/.test(local)) return 'CAMTEL';

    return 'UNKNOWN';
  }
}
