/**
 * Chuyển đổi số tiền thành chữ Tiếng Việt chuẩn kế toán
 * Ví dụ: 15500000 -> "Mười lăm triệu năm trăm nghìn đồng chẵn"
 */

const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const UNITS = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

function readThreeDigits(threeDigits: number, showZeroHundred: boolean): string {
  const hundreds = Math.floor(threeDigits / 100);
  const remainder = threeDigits % 100;
  const tens = Math.floor(remainder / 10);
  const ones = remainder % 10;
  const parts: string[] = [];

  if (hundreds > 0 || showZeroHundred) {
    parts.push(DIGITS[hundreds] + ' trăm');
  }

  if (tens > 1) {
    parts.push(DIGITS[tens] + ' mươi');
    if (ones === 1) parts.push('mốt');
    else if (ones === 4) parts.push('tư');
    else if (ones === 5) parts.push('lăm');
    else if (ones > 0) parts.push(DIGITS[ones]);
  } else if (tens === 1) {
    parts.push('mười');
    if (ones === 5) parts.push('lăm');
    else if (ones > 0) parts.push(DIGITS[ones]);
  } else if (showZeroHundred && tens === 0 && ones > 0) {
    parts.push('lẻ ' + DIGITS[ones]);
  } else if (ones > 0) {
    parts.push(DIGITS[ones]);
  }

  return parts.join(' ');
}

export function numberToVietnameseWords(amount: number): string {
  if (!amount || amount === 0) return 'Không đồng chẵn';
  const isNegative = amount < 0;
  let absAmount = Math.abs(Math.round(amount));

  const groups: number[] = [];
  while (absAmount > 0) {
    groups.push(absAmount % 1000);
    absAmount = Math.floor(absAmount / 1000);
  }

  const wordsParts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const groupVal = groups[i];
    if (groupVal > 0) {
      const showZero = i < groups.length - 1;
      const text = readThreeDigits(groupVal, showZero);
      if (text) {
        wordsParts.push(text);
        if (UNITS[i]) {
          wordsParts.push(UNITS[i]);
        }
      }
    }
  }

  const raw = wordsParts.join(' ').trim();
  if (!raw) return 'Không đồng chẵn';

  // Viết hoa chữ cái đầu tiên
  const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1);
  const prefix = isNegative ? 'Âm ' : '';

  return `${prefix}${capitalized} đồng chẵn.`;
}
