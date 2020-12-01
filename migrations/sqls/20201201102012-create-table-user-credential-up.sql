/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS user_credential (
	id uuid DEFAULT gen_random_uuid(),
	email text NOT NULL,
	password_hash text NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (email)
);
