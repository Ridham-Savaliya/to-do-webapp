export interface Todo {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  is_html?: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

