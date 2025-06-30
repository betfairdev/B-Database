<template>
  <div class="relative inline-block" @mouseenter="show" @mouseleave="hide">
    <slot />
    <div
      v-if="visible"
      :class="[
        'absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg',
        'whitespace-nowrap pointer-events-none',
        positionClasses[position]
      ]"
    >
      {{ content }}
      <div :class="['absolute w-2 h-2 bg-gray-900 transform rotate-45', arrowClasses[position]]"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  delay: 500
})

const visible = ref(false)
let timeout: NodeJS.Timeout

const show = () => {
  timeout = setTimeout(() => {
    visible.value = true
  }, props.delay)
}

const hide = () => {
  clearTimeout(timeout)
  visible.value = false
}

const positionClasses = {
  top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
}

const arrowClasses = {
  top: 'top-full left-1/2 transform -translate-x-1/2',
  bottom: 'bottom-full left-1/2 transform -translate-x-1/2',
  left: 'left-full top-1/2 transform -translate-y-1/2',
  right: 'right-full top-1/2 transform -translate-y-1/2'
}
</script>