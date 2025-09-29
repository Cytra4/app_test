export type Profile = {
	user_id: string;
	username: string;
	role: string;
	phone?: string;
	created_at: string;
};

export type Group = {
	id: string;
	name: string;
	member_count: number;
	join_code?: string;
	created_by?: string | null;
	created_at: Date;
};