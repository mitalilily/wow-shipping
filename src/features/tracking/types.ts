export type TrackingStatus='pending'|'picked_up'|'in_transit'|'out_for_delivery'|'delivered'|'exception';
export interface TrackingEvent{status:string;description:string;timestamp:string;location?:string}
export interface TrackingResult{trackingNumber:string;carrier:string;status:TrackingStatus;lastUpdated:string;events:TrackingEvent[];estimatedDelivery?:string}
export type TrackingErrorCode='INVALID_INPUT'|'NOT_CONFIGURED'|'NOT_FOUND'|'CARRIER_REQUIRED'|'PROVIDER_UNAVAILABLE'|'TIMEOUT'|'RATE_LIMITED';
export interface TrackingError{code:TrackingErrorCode;message:string}
