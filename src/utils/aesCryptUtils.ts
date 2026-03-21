/**
 * AES 加密工具类
 * 
 * 与后端 Java AES/CBC/PKCS5Padding 加密保持一致
 * 
 * 后端配置：
 * - Key: a8f5e2c9b4d7f1a3e6c8b2d5f9a4c7e1 (32 字符)
 * - IV: b3d6f9a2c5e8h1k4 (16 字符)
 * - 算法：AES/CBC/PKCS5Padding
 * - 输出：Base64 编码
 */

import CryptoJS from 'crypto-js'

// AES 加密配置（与后端保持一致）
const AES_CONFIG = {
  key: 'a8f5e2c9b4d7f1a3e6c8b2d5f9a4c7e1', // 32 字符
  iv: 'b3d6f9a2c5e8h1k4' // 16 字符
}

/**
 * AES 加密
 * @param word 待加密的字符串
 * @returns Base64 编码的加密结果
 */
export function encryptByAES(word: string): string {
  try {
    const keyHex = CryptoJS.enc.Utf8.parse(AES_CONFIG.key)
    const ivHex = CryptoJS.enc.Utf8.parse(AES_CONFIG.iv)
    
    const encrypted = CryptoJS.AES.encrypt(word, keyHex, {
      iv: ivHex,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    
    return encrypted.toString()
  } catch (error) {
    console.error('AES 加密失败:', error)
    throw new Error('密码加密失败')
  }
}

/**
 * AES 解密（用于测试）
 * @param word 待解密的 Base64 字符串
 * @returns 解密后的明文
 */
export function decryptByAES(word: string): string {
  try {
    const keyHex = CryptoJS.enc.Utf8.parse(AES_CONFIG.key)
    const ivHex = CryptoJS.enc.Utf8.parse(AES_CONFIG.iv)
    
    const decrypted = CryptoJS.AES.decrypt(word, keyHex, {
      iv: ivHex,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('AES 解密失败:', error)
    throw new Error('密码解密失败')
  }
}

/**
 * 加密密码（登录时使用）
 * @param password 明文密码
 * @returns Base64 编码的加密密码
 */
export function encryptPassword(password: string): string {
  return encryptByAES(password)
}
