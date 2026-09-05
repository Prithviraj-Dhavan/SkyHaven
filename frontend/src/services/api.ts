const API_BASE = '/api/v1';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('skyhaven_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data?.error?.message || data?.message || `HTTP ${response.status} Error`;
      throw new Error(errorMessage);
    }

    return data;
  }

  // Auth
  async register(body: any) {
    return this.request<{ success: boolean; data: { user: any; token: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async login(body: any) {
    return this.request<{ success: boolean; data: { user: any; token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getMe() {
    return this.request<{ success: boolean; data: any }>('/auth/me');
  }

  // Flights
  async searchFlights(params: Record<string, any>) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return this.request<{ success: boolean; data: { flights: any[]; pagination: any } }>(`/flights/search?${query.toString()}`);
  }

  async getFlightById(id: string) {
    return this.request<{ success: boolean; data: any }>(`/flights/${id}`);
  }

  async getAirports() {
    return this.request<{ success: boolean; data: any[] }>('/flights/airports');
  }

  async getFeaturedDeals() {
    return this.request<{ success: boolean; data: any[] }>('/flights/deals');
  }

  // Bookings
  async createBooking(body: any) {
    return this.request<{ success: boolean; data: any }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getMyBookings() {
    return this.request<{ success: boolean; data: any[] }>('/bookings/my');
  }

  async getBookingByRef(reference: string) {
    return this.request<{ success: boolean; data: any }>(`/bookings/${reference}`);
  }

  async cancelBooking(bookingId: string) {
    return this.request<{ success: boolean; data: any }>(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
    });
  }

  async getTicketView(ticketNumber: string) {
    return this.request<{ success: boolean; data: any }>(`/bookings/tickets/${ticketNumber}`);
  }

  // AI Assistant
  async parseAiQuery(prompt: string) {
    return this.request<{ success: boolean; data: any }>('/ai/parse', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  // Admin
  async getAdminStats() {
    return this.request<{ success: boolean; data: any }>('/admin/stats');
  }

  async getAdminFlights(page = 1, limit = 20) {
    return this.request<{ success: boolean; data: any }>(`/admin/flights?page=${page}&limit=${limit}`);
  }

  async getAdminBookings(page = 1, limit = 20) {
    return this.request<{ success: boolean; data: any }>(`/admin/bookings?page=${page}&limit=${limit}`);
  }

  async createFlight(body: any) {
    return this.request<{ success: boolean; data: any }>('/admin/flights', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async updateFlight(id: string, body: any) {
    return this.request<{ success: boolean; data: any }>(`/admin/flights/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async deleteFlight(id: string) {
    return this.request<{ success: boolean; message: string }>(`/admin/flights/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
