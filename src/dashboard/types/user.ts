export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DashboardUserResponse {
  status: string;
  data: DashboardUser[];
}
