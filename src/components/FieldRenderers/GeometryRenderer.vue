<template>
  <div class="geometry-renderer">
    <div v-if="readonly" class="geometry-renderer-display">
      <div v-if="value" class="space-y-2">
        <div class="flex items-center space-x-2">
          <MapPinIcon class="w-4 h-4 text-gray-400" />
          <span class="text-sm text-gray-900 dark:text-white">
            {{ formatCoordinates(value) }}
          </span>
        </div>
        <div v-if="!compact" class="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg border relative overflow-hidden">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <MapPinIcon class="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Map preview would appear here
              </p>
            </div>
          </div>
        </div>
        <div v-if="!compact" class="flex items-center space-x-2">
          <button
            @click="openInMaps"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Open in Maps
          </button>
          <span class="text-xs text-gray-400">•</span>
          <button
            @click="copyCoordinates"
            class="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Copy Coordinates
          </button>
        </div>
      </div>
      <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
    </div>
    <div v-else class="geometry-renderer-input">
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Latitude
            </label>
            <input
              type="number"
              :value="coordinates.lat"
              @input="updateLatitude"
              step="any"
              min="-90"
              max="90"
              placeholder="40.7128"
              class="form-input text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Longitude
            </label>
            <input
              type="number"
              :value="coordinates.lng"
              @input="updateLongitude"
              step="any"
              min="-180"
              max="180"
              placeholder="-74.0060"
              class="form-input text-sm"
            />
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <button
            @click="getCurrentLocation"
            :disabled="!navigator.geolocation"
            class="btn-secondary text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MapPinIcon class="w-4 h-4 mr-1" />
            Current Location
          </button>
          <button
            @click="showAddressInput = !showAddressInput"
            class="btn-secondary text-sm"
          >
            {{ showAddressInput ? 'Hide' : 'Address' }}
          </button>
        </div>
        
        <div v-if="showAddressInput" class="space-y-2">
          <input
            v-model="addressInput"
            type="text"
            placeholder="Enter address to geocode"
            class="form-input text-sm"
            @keyup.enter="geocodeAddress"
          />
          <button
            @click="geocodeAddress"
            :disabled="!addressInput.trim()"
            class="btn-secondary text-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Find Coordinates
          </button>
        </div>
        
        <div v-if="locationError" class="text-xs text-red-600 dark:text-red-400">
          {{ locationError }}
        </div>
        
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Enter coordinates in decimal degrees format (WGS84)
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { Field } from '@/types/database'
import {
  MapPinIcon
} from '@heroicons/vue/24/outline'

interface Props {
  field: Field
  value: { lat: number; lng: number } | null
  readonly?: boolean
  compact?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: { lat: number; lng: number } | null]
}>()

const showAddressInput = ref(false)
const addressInput = ref('')
const locationError = ref('')

const coordinates = reactive({
  lat: props.value?.lat || 0,
  lng: props.value?.lng || 0
})

const updateLatitude = (event: Event) => {
  const target = event.target as HTMLInputElement
  const lat = parseFloat(target.value)
  if (!isNaN(lat)) {
    coordinates.lat = lat
    updateValue()
  }
}

const updateLongitude = (event: Event) => {
  const target = event.target as HTMLInputElement
  const lng = parseFloat(target.value)
  if (!isNaN(lng)) {
    coordinates.lng = lng
    updateValue()
  }
}

const updateValue = () => {
  if (coordinates.lat !== 0 || coordinates.lng !== 0) {
    emit('update:value', { ...coordinates })
  } else {
    emit('update:value', null)
  }
  locationError.value = ''
}

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    locationError.value = 'Geolocation is not supported by this browser'
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      coordinates.lat = position.coords.latitude
      coordinates.lng = position.coords.longitude
      updateValue()
      locationError.value = ''
    },
    (error) => {
      locationError.value = 'Unable to retrieve your location: ' + error.message
    }
  )
}

const geocodeAddress = async () => {
  if (!addressInput.value.trim()) return
  
  try {
    // In a real implementation, this would use a geocoding service
    // For demo purposes, we'll just show a placeholder
    locationError.value = 'Geocoding service would be integrated here'
  } catch (error) {
    locationError.value = 'Failed to geocode address'
  }
}

const formatCoordinates = (value: { lat: number; lng: number }) => {
  if (!value) return '-'
  return `${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}`
}

const openInMaps = () => {
  if (props.value) {
    const url = `https://www.google.com/maps?q=${props.value.lat},${props.value.lng}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

const copyCoordinates = async () => {
  if (props.value) {
    try {
      await navigator.clipboard.writeText(formatCoordinates(props.value))
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy coordinates:', error)
    }
  }
}
</script>