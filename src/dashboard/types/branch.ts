export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  active?: boolean;
  createdAt?: string;
}
export interface BranchResponse {
  status: string;
  data: any[];
}
