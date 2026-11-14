/** Device categories stored in contact_requests.preferred_device. */
export type DeviceCategory = 'smart_tv' | 'streaming_device' | 'mobile' | 'computer';

/** Precise device choices (most used first) and their category stored in preferred_device. */
export const DEVICE_DETAILS = {
  smart_tv: 'smart_tv',
  android_tv: 'streaming_device',
  fire_tv: 'streaming_device',
  apple_tv: 'streaming_device',
  tv_box: 'streaming_device',
  android_mobile: 'mobile',
  ios_mobile: 'mobile',
  computer: 'computer',
  browser: 'computer',
} as const satisfies Record<string, DeviceCategory>;
export type DeviceDetail = keyof typeof DEVICE_DETAILS;
export const DEVICE_DETAIL_KEYS = Object.keys(DEVICE_DETAILS) as [DeviceDetail, ...DeviceDetail[]];
