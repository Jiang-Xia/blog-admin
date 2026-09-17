/**
 * 遗留静态 AES / RSA 工具。
 * HTTP 网关请用 utils/gateway-crypto/；本文件 CryptoJS 按需引入。
 */
import AES from 'crypto-js/aes';
import Base64 from 'crypto-js/enc-base64';
import Hex from 'crypto-js/enc-hex';
import Utf8 from 'crypto-js/enc-utf8';
import HexFormat from 'crypto-js/format-hex';
import Pkcs7 from 'crypto-js/pad-pkcs7';
import JSEncrypt from 'jsencrypt';
import { privateKey, serverPublicKey } from '@/config/ssh';

const secretKey = '54050000778e380000fe5a120000b4ce';
const iv = 'jiangxia';

/**
 * AES加密
 * @description 使用加密秘钥，对 需要加密的参数 进行加密
 * @param {string} word - 需要加密的参数
 * @param {string} key - 加密密钥（长度必须是 16 的整数倍）
 * @param {string} offset - 偏移量
 * @return 16进制字符串 256位
 */
export function aesEncrypt(word: string, key = secretKey, offset = iv) {
  const wordUTF8 = Utf8.parse(word);
  const keyUTF8 = Utf8.parse(key);
  const offsetUTF8 = Utf8.parse(offset);

  // mode 默认 CBC
  const encrypted = AES.encrypt(wordUTF8, keyUTF8, {
    iv: offsetUTF8,
    padding: Pkcs7,
  });
  return encrypted.toString(HexFormat).toUpperCase();
}

/**
 * AES解密
 * @description 使用加密秘钥，对 需要解密的参数 进行解密
 * @param {string} encryptedWord - 需要解密的参数
 * @param {string} key - 加密密钥（长度必须是 16 的整数倍）
 * @param {string} offset - 偏移量
 * @return utf8 字符串
 */
export function aesDecrypt(encryptedWord: string, key = secretKey, offset = iv) {
  const keyUTF8 = Utf8.parse(key);
  const offsetUTF8 = Utf8.parse(offset);
  const parsed = HexFormat.parse(encryptedWord);
  const bytes = AES.decrypt(parsed, keyUTF8, {
    iv: offsetUTF8,
    padding: Pkcs7,
  });

  return bytes.toString(Utf8);
}

/**
 * RSA加密
 * @description 使用公钥加密，私钥解密
 * @param {string} word - 需要加密的参数
 * @param {string} pubKey - 加密公钥
 * @return 16进制字符串
 */
export function rsaEncrypt(word = '非对称加解密', pubKey = serverPublicKey) {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(pubKey);
  const encrypted = encrypt.encrypt(word) as string;
  // 网关侧会再规范为小写；工具场景保留大写兼容
  return Hex.stringify(Base64.parse(encrypted)).toUpperCase();
}

/**
 * RSA解密
 * @description 使用公钥加密，私钥解密
 * @param {string} encryptedWord - 需要解密的参数
 * @param {string} priKey - 加密密钥（长度必须是 16 的整数倍）
 * @return utf8 字符串 (解密不出来返回原本字符串)
 */
export function rsaDecrypt(encryptedWord: string, priKey = privateKey) {
  const decrypt = new JSEncrypt();
  decrypt.setPrivateKey(priKey);
  const base64 = Base64.stringify(Hex.parse(encryptedWord));
  const uncrypted = decrypt.decrypt(base64);
  return uncrypted || encryptedWord;
}
