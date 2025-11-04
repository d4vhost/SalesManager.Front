// src/composables/useValidation.js
// Este archivo contiene todas las funciones de validación reutilizables.

import { ref, computed } from 'vue';

/**
 * Valida si es un email válido.
 */
export function useEmailValidation(email) {
  const isValid = computed(() => {
    if (!email.value) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.value);
  });
  return { isValid };
}

/**
 * Valida la cédula ecuatoriana.
 * (Lógica adaptada de tu validador de C#)
 */
export function useEcuadorianCedulaValidation(cedula) {
  const isValid = computed(() => {
    const value = cedula.value;
    if (!value || value.length !== 10 || !/^\d+$/.test(value)) {
      return false;
    }
    
    try {
      const provincia = parseInt(value.substring(0, 2), 10);
      if (provincia < 1 || provincia > 24) return false;
      
      const tercerDigito = parseInt(value[2], 10);
      if (tercerDigito < 0 || tercerDigito > 5) return false;

      const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
      let suma = 0;
      
      for (let i = 0; i < 9; i++) {
        let producto = parseInt(value[i], 10) * coeficientes[i];
        suma += (producto >= 10) ? producto - 9 : producto;
      }
      
      const residuo = suma % 10;
      const digitoVerificadorCalculado = (residuo === 0) ? 0 : 10 - residuo;
      const digitoVerificadorReal = parseInt(value[9], 10);
      
      return digitoVerificadorCalculado === digitoVerificadorReal;
    } catch (e) {
      return false;
    }
  });
  
  return { isValid };
}

/**
 * Valida la fortaleza de la contraseña según tus reglas.
 * (Mín 6, Max 8, mayús, minús, núm, especial)
 */
export function usePasswordStrength(password) {
  const strength = computed(() => {
    const value = password.value || '';
    let score = 0;
    
    if (!value) return { score: 0, label: '', color: 'danger' };
    
    if (value.length >= 6) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^a-zA-Z0-9]/.test(value)) score++; // Caracter especial

    // Ajuste de score basado en longitud (min 6)
    if (value.length < 6) score = Math.min(score, 2);

    let label = 'Muy Débil';
    let color = 'danger'; // Color de Bootstrap/CSS

    switch (score) {
      case 1:
      case 2:
        label = 'Débil';
        color = 'warning';
        break;
      case 3:
        label = 'Media';
        color = 'info';
        break;
      case 4:
      case 5:
        label = 'Fuerte';
        color = 'success';
        break;
    }
    
    // El requisito es poder guardar con 6 caracteres si es "segura".
    // Definimos "segura" como un score de 3+ (longitud + 2 de: mayus, minus, num, especial)
    // y longitud entre 6 y 8.
    const isSecure = score >= 3 && value.length >= 6 && value.length <= 8;

    return { score, label, color, isSecure };
  });

  return { strength };
}

// --- Helpers de Formato de Inputs ---

/**
 * Filtra un input para que solo acepte letras y espacios.
 */
export function formatOnlyLetters(event, maxLength = 25) {
  let value = event.target.value;
  value = value.replace(/[^a-zA-Z\sñÑáéíóúÁÉÍÓÚ]/g, '');
  if (value.length > maxLength) {
    value = value.substring(0, maxLength);
  }
  event.target.value = value;
  return value; // Devuelve el valor limpio
}

/**
 * Filtra un input para que solo acepte números enteros.
 */
export function formatOnlyInteger(event, maxLength = 6) {
  let value = event.target.value;
  value = value.replace(/[^0-9]/g, '');
  if (value.length > maxLength) {
    value = value.substring(0, maxLength);
  }
  event.target.value = value;
  return value;
}

/**
 * Filtra un input para que acepte decimales (max 6 dígitos, 2 decimales).
 */
export function formatDecimal(event) {
  let value = event.target.value;
  // Elimina caracteres no numéricos excepto el primer punto
  value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  
  const parts = value.split('.');
  // Limita la parte entera a 6 dígitos
  if (parts[0].length > 6) {
    parts[0] = parts[0].substring(0, 6);
  }
  // Limita la parte decimal a 2 dígitos
  if (parts[1] && parts[1].length > 2) {
    parts[1] = parts[1].substring(0, 2);
  }
  
  value = parts.join('.');
  event.target.value = value;
  return value;
}

/**
 * Filtra Cód. Postal (alfanumérico, 3-10 chars).
 */
export function formatPostalCode(event) {
  let value = event.target.value;
  value = value.replace(/[^a-zA-Z0-9]/g, '');
  if (value.length > 10) {
    value = value.substring(0, 10);
  }
  event.target.value = value;
  return value;
}

/**
 * Valida Teléfono (10 dígitos, permite formato).
 */
export function isValidPhone(phone) {
    if (!phone) return true; // Puede ser opcional
    const digits = phone.replace(/[^0-9]/g, '').length;
    return digits === 10;
}

/**
 * Valida Fax (máx 15 dígitos, permite formato).
 */
export function formatFax(event) {
  let value = event.target.value;
  // Permite números y caracteres de formato
  value = value.replace(/[^0-9()-. ]/g, '');
  if (value.length > 15) {
    value = value.substring(0, 15);
  }
  event.target.value = value;
  return value;
}

/**
 * Valida URL.
 */
export function isValidUrl(url) {
    if (!url) return true; // Puede ser opcional
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}
