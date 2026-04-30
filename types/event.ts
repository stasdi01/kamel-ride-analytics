export interface Event {
  id: string;
  name: string;
  category: string;
  route: string | null;
  metadata: Record<string, unknown> | null;
  timestamp: string;
}

export interface EventsResponse {
  events: Event[];
  total: number;
}

export interface DashboardStats {
  tripsPostedToday: number;
  seatFillRate: number;
  paymentFailureRate: number;
  peakRequestHour: number | null;
}

export interface SupplyDemandPoint {
  day: string;
  tripsPosted: number;
  seatRequested: number;
}

export interface RouteVolume {
  route: string;
  count: number;
}

export interface CategoryVolume {
  category: string;
  count: number;
}
