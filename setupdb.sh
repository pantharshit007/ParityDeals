#!/bin/bash

# Prompt the user for a database name
read -p "Enter the database name: " DB_NAME

# Check if the user has entered a name
if [ -z "$DB_NAME" ]; then
  echo "You must provide a database name."
  exit 1
fi

DB_CONTAINER_NAME="${DB_NAME}-db"

if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install docker and try again.\nDocker install guide: https://docs.docker.com/engine/install/"
  exit 1
fi

if ! docker info > /dev/null 2>&1; then
  echo "Docker daemon is not running. Please start Docker and try again."
  exit 1
fi

if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
  echo "> Database container '$DB_CONTAINER_NAME' already running"
  exit 0
fi

if [ "$(docker ps -q -a -f name=$DB_CONTAINER_NAME)" ]; then
  docker start "$DB_CONTAINER_NAME"
  echo "> Existing database container '$DB_CONTAINER_NAME' started"
  exit 0
fi

# Run the PostgreSQL Alpine container with the provided database name
docker run --name $DB_CONTAINER_NAME -e POSTGRES_DB=$DB_NAME -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres:alpine

# Notify the user that the container is running
echo "> PostgreSQL database '$DB_NAME' is now running in container '$DB_CONTAINER_NAME'."
