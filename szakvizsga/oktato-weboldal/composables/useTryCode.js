import { ref } from 'vue'

const tryCode = ref('')

export function useTryCode() {
  return {
    tryCode
  }
} 