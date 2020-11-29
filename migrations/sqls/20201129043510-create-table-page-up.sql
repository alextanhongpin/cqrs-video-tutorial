/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS page (
	page_name text,
	page_data jsonb NOT NULL DEFAULT '{}',
	PRIMARY KEY (page_name)
);
