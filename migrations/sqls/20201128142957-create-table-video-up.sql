/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS video (
	id int GENERATED ALWAYS AS IDENTITY,
	owner_id uuid NOT NULL,
	name text NOT NULL,
	description text NOT NULL DEFAULT '',
	transcoding_status text NOT NULL DEFAULT '',
	view_count int NOT NULL DEFAULT 0,

	PRIMARY KEY (id)
);
