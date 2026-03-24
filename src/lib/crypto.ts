/**
 * クライアントサイド暗号化ユーティリティ
 * Web Crypto API を使用した AES-GCM 暗号化/復号
 * サーバーには暗号文のみが送信され、復号鍵はURLフラグメント(#)に埋め込まれる
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const PBKDF2_ITERATIONS = 600000;
const SALT_LENGTH = 16;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/** ランダムな AES-GCM 鍵を生成 */
async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );
}

/** CryptoKey を Base64 文字列にエクスポート（URLフラグメント用） */
async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(raw);
}

/** Base64 文字列から CryptoKey をインポート */
async function importKey(base64Key: string): Promise<CryptoKey> {
  const raw = base64ToArrayBuffer(base64Key);
  return crypto.subtle.importKey("raw", raw, { name: ALGORITHM }, false, [
    "decrypt",
  ]);
}

/** パスワードから PBKDF2 で鍵を導出 */
async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

export interface EncryptResult {
  /** Base64エンコードされた暗号文（IV + 暗号データ） */
  encryptedData: string;
  /** Base64エンコードされた復号鍵（URLフラグメントに埋め込む） */
  keyBase64: string;
  /** パスワード保護時のBase64エンコードされたソルト */
  salt?: string;
}

/** テキストを暗号化する */
export async function encrypt(
  plaintext: string,
  password?: string
): Promise<EncryptResult> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // メイン暗号化鍵の生成
  const mainKey = await generateKey();
  const keyBase64 = await exportKey(mainKey);

  // メイン鍵で暗号化
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    mainKey,
    data
  );

  // IV + 暗号文を結合
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  let finalData: string;
  let salt: string | undefined;

  if (password) {
    // パスワード保護: 暗号文をさらにパスワードで暗号化（二重暗号化）
    const pwSalt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const pwKey = await deriveKeyFromPassword(password, pwSalt);
    const pwIv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const doubleEncrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv: pwIv },
      pwKey,
      combined
    );

    // pwIV + 二重暗号文を結合
    const doubleCombined = new Uint8Array(
      pwIv.length + doubleEncrypted.byteLength
    );
    doubleCombined.set(pwIv);
    doubleCombined.set(new Uint8Array(doubleEncrypted), pwIv.length);

    finalData = arrayBufferToBase64(doubleCombined.buffer);
    salt = arrayBufferToBase64(pwSalt.buffer);
  } else {
    finalData = arrayBufferToBase64(combined.buffer);
  }

  return { encryptedData: finalData, keyBase64, salt };
}

/** 暗号文を復号する */
export async function decrypt(
  encryptedData: string,
  keyBase64: string,
  password?: string,
  salt?: string
): Promise<string> {
  let combined: Uint8Array;

  if (password && salt) {
    // パスワード保護の外層を復号
    const doubleCombined = new Uint8Array(base64ToArrayBuffer(encryptedData));
    const pwIv = doubleCombined.slice(0, IV_LENGTH);
    const doubleEncrypted = doubleCombined.slice(IV_LENGTH);

    const pwSalt = new Uint8Array(base64ToArrayBuffer(salt));
    const pwKey = await deriveKeyFromPassword(password, pwSalt);

    const decryptedOuter = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: pwIv },
      pwKey,
      doubleEncrypted
    );
    combined = new Uint8Array(decryptedOuter);
  } else {
    combined = new Uint8Array(base64ToArrayBuffer(encryptedData));
  }

  // メイン暗号化の復号
  const iv = combined.slice(0, IV_LENGTH);
  const encrypted = combined.slice(IV_LENGTH);
  const key = await importKey(keyBase64);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
