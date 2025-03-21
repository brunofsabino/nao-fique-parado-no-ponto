-- db/schema.sql

-- Tabela stops
CREATE TABLE stops (
    stop_id VARCHAR(50) PRIMARY KEY,
    stop_name VARCHAR(255) NOT NULL,
    stop_desc TEXT,
    stop_lat DOUBLE PRECISION NOT NULL,
    stop_lon DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL
);
CREATE INDEX idx_stops_geom ON stops USING GIST (geom);

-- Tabela routes
CREATE TABLE routes (
    route_id VARCHAR(50) PRIMARY KEY,
    route_short_name VARCHAR(50) NOT NULL,
    route_long_name VARCHAR(255) NOT NULL,
    route_color VARCHAR(6),
    route_text_color VARCHAR(6),
    route_type INTEGER
);

-- Tabela trips
CREATE TABLE trips (
    trip_id VARCHAR(100) PRIMARY KEY,
    route_id VARCHAR(50) NOT NULL,
    service_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (route_id) REFERENCES routes(route_id)
);

-- Tabela stop_times
CREATE TABLE stop_times (
    trip_id VARCHAR(100) NOT NULL,
    stop_id VARCHAR(50) NOT NULL,
    stop_sequence INTEGER NOT NULL,
    PRIMARY KEY (trip_id, stop_id),
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id),
    FOREIGN KEY (stop_id) REFERENCES stops(stop_id)
);

-- Tabela users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);