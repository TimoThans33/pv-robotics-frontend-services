/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@/lib/qb/qb-api'
declare module '@/lib/qb/qb-logic'
declare module '@/lib/qb/qb-storage'
declare module '@/lib/qb/qb-ds'